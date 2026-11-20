import { parseNotionMarkdown } from './notion-parser.mjs';

type MdNode = {
  type: string;
  value?: string;
  url?: string;
  alt?: string | null;
  depth?: number;
  ordered?: boolean | null;
  start?: number | null;
  checked?: boolean | null;
  lang?: string | null;
  children?: MdNode[];
  data?: { hName?: string; hProperties?: { className?: string[] } };
};

/** One readable block of a Notion page, without Notion tags or site-only markup. */
export type TextBlock = {
  kind: 'heading' | 'paragraph' | 'item' | 'row' | 'code';
  /** Markdown with absolute links, for llms-full.txt. */
  text: string;
  /** Plain text, for summaries, search and FAQ answers. */
  plain: string;
  quote: number;
  indent: number;
  level?: number;
  marker?: string;
  lang?: string;
};

export type TextOptions = { flavor?: 'notion' | 'markdown'; title?: string; baseUrl?: string };

const entities: Record<string, string> = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&apos;': "'", '&nbsp;': ' ' };
const decode = (value: string) => value.replace(/&(?:amp|lt|gt|quot|#39|apos|nbsp);/g, (entity) => entities[entity] ?? entity);
const stripTags = (value: string) => decode(value.replace(/<[^>]*>/g, ''));
const squash = (value: string) => value.replace(/\s+/g, ' ').trim();
const normalize = (value: string) => squash(value.normalize('NFC'));

function absolute(url: string, baseUrl?: string) {
  return baseUrl && url.startsWith('/') && !url.startsWith('//') ? new URL(url, `${baseUrl}/`).href : url;
}

function inline(nodes: MdNode[] = [], links: boolean, baseUrl?: string): string {
  return nodes.map((node) => {
    switch (node.type) {
      case 'text':
      case 'inlineCode':
      case 'inlineMath':
        return node.value ?? '';
      case 'html':
        return stripTags(node.value ?? '');
      case 'break':
        return ' ';
      case 'image':
        return links && node.url ? `![${node.alt ?? ''}](${absolute(node.url, baseUrl)})` : '';
      case 'link': {
        const label = inline(node.children, false, baseUrl);
        return links && node.url ? `[${label}](${absolute(node.url, baseUrl)})` : label;
      }
      default:
        return inline(node.children, links, baseUrl);
    }
  }).join('');
}

type Context = { quote: number; indent: number };

function walk(nodes: MdNode[] = [], blocks: TextBlock[], context: Context, baseUrl?: string) {
  const push = (block: Omit<TextBlock, 'quote' | 'indent'>) => {
    if (block.text) blocks.push({ ...block, quote: context.quote, indent: context.indent });
  };
  const texts = (children?: MdNode[]) => ({ text: squash(inline(children, true, baseUrl)), plain: squash(inline(children, false, baseUrl)) });

  for (const node of nodes) {
    const tag = node.data?.hName;
    const classes = node.data?.hProperties?.className ?? [];
    // The table of contents, callout icons and empty spacer blocks carry no content of their own.
    if (tag === 'nav' || classes.includes('notion-callout-icon') || classes.includes('notion-empty-block')) continue;

    if (tag === 'tr' || node.type === 'tableRow') {
      const cells = (node.children ?? []).map((cell) => texts(cell.children));
      push({ kind: 'row', text: cells.map((cell) => cell.text).join(' | '), plain: cells.map((cell) => cell.plain).join(' / ') });
      continue;
    }

    switch (node.type) {
      case 'heading':
        push({ kind: 'heading', level: node.depth ?? 2, ...texts(node.children) });
        break;
      case 'paragraph': {
        const value = texts(node.children);
        // A video/audio caption repeats the label of the media link above it.
        if (tag === 'figcaption' && blocks.at(-1)?.plain === value.plain) break;
        push({ kind: 'paragraph', ...value });
        break;
      }
      case 'list':
        (node.children ?? []).forEach((item, index) => {
          const [first, ...rest] = item.children ?? [];
          const check = item.checked === true ? ' [x]' : item.checked === false ? ' [ ]' : '';
          const marker = `${node.ordered ? `${(node.start ?? 1) + index}.` : '-'}${check}`;
          if (first?.type === 'paragraph') push({ kind: 'item', marker, ...texts(first.children) });
          walk(first?.type === 'paragraph' ? rest : item.children, blocks, { ...context, indent: context.indent + 1 }, baseUrl);
        });
        break;
      case 'code':
        push({ kind: 'code', lang: node.lang ?? '', text: node.value ?? '', plain: node.value ?? '' });
        break;
      case 'math':
        push({ kind: 'code', lang: 'math', text: node.value ?? '', plain: node.value ?? '' });
        break;
      case 'thematicBreak':
        break;
      case 'html': {
        const value = squash(stripTags(node.value ?? ''));
        push({ kind: 'paragraph', text: value, plain: value });
        break;
      }
      case 'blockquote':
        // The Notion parser reuses blockquote nodes for callouts, columns, toggles and tables (hName); only real quotes nest.
        walk(node.children, blocks, !tag || tag === 'blockquote' ? { ...context, quote: context.quote + 1 } : context, baseUrl);
        break;
      default:
        walk(node.children, blocks, context, baseUrl);
    }
  }
}

/** Read a Notion (or plain Markdown) body into blocks with the same parser the pages use. */
export function extractBlocks(source: string, { flavor = 'notion', title, baseUrl }: TextOptions = {}): TextBlock[] {
  const blocks: TextBlock[] = [];
  try {
    const root = parseNotionMarkdown(source, { flavor }) as MdNode;
    walk(root.children, blocks, { quote: 0, indent: 0 }, baseUrl);
  } catch {
    // The deployment check rejects unsupported syntax; anything else still yields tag-free paragraphs.
    for (const part of source.split(/\n\s*\n/)) {
      const text = squash(stripTags(part));
      if (text) blocks.push({ kind: 'paragraph', text, plain: text, quote: 0, indent: 0 });
    }
  }
  // Mirror remarkArticleTitle: the page already shows the title, so drop a leading H1 that repeats it.
  const first = blocks[0];
  if (title && first?.kind === 'heading' && first.level === 1 && normalize(first.plain) === normalize(title)) blocks.shift();
  return blocks;
}

export function blocksToMarkdown(blocks: TextBlock[], { headingOffset = 0 }: { headingOffset?: number } = {}): string {
  let output = '';
  blocks.forEach((block, index) => {
    const previous = blocks[index - 1];
    let line: string;
    if (block.kind === 'heading') line = `${'#'.repeat(Math.min((block.level ?? 2) + headingOffset, 6))} ${block.text}`;
    else if (block.kind === 'item') line = `${'  '.repeat(block.indent)}${block.marker ?? '-'} ${block.text}`;
    else if (block.kind === 'code') line = `\`\`\`${block.lang ?? ''}\n${block.text}\n\`\`\``;
    else line = block.text;
    if (block.quote) line = line.split('\n').map((part) => `${'> '.repeat(block.quote)}${part}`).join('\n');
    const tight = previous?.kind === block.kind && (block.kind === 'item' || block.kind === 'row');
    output += index === 0 ? line : `${tight ? '\n' : '\n\n'}${line}`;
  });
  return output;
}

export function blocksToPlainText(blocks: TextBlock[]): string {
  return blocks
    .filter((block) => block.plain)
    .map((block) => (block.kind === 'item' ? `${'  '.repeat(block.indent)}- ${block.plain}` : block.plain))
    .join('\n');
}

/** Cut at a sentence end when one is close to the limit, otherwise at a word boundary. */
export function truncate(text: string, max = 150): string {
  const value = squash(text);
  if (value.length <= max) return value;
  const cut = value.slice(0, max);
  const sentence = [...cut.matchAll(/[.?!。](?=\s)/g)].at(-1)?.index ?? -1;
  if (sentence >= max * 0.6) return cut.slice(0, sentence + 1);
  const space = cut.lastIndexOf(' ');
  return `${(space >= max * 0.6 ? cut.slice(0, space) : cut).trimEnd()}…`;
}

/** The opening paragraphs of a body, for meta descriptions when Notion has no 요약. */
export function summarize(blocks: TextBlock[], max = 150): string {
  const parts: string[] = [];
  let length = 0;
  for (const block of blocks) {
    // Skip headings, tables and code, and the sync script's "이미지를 불러올 수 없습니다" notice.
    if ((block.kind !== 'paragraph' && block.kind !== 'item') || !block.plain || block.plain.startsWith('🖼️')) continue;
    parts.push(block.plain);
    length += block.plain.length + 1;
    if (length > max) break;
  }
  return truncate(parts.join(' '), max);
}

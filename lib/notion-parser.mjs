import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

const markdown = unified().use(remarkParse).use(remarkGfm).use(remarkMath);
const containers = new Set(['callout', 'details', 'columns', 'column', 'synced_block', 'synced_block_reference', 'table']);
const references = new Set(['page', 'database', 'audio', 'video', 'file', 'pdf', 'bookmark', 'embed']);
const htmlTags = new Set('a abbr aside b blockquote br caption code col colgroup dd del details div dl dt em figcaption figure h1 h2 h3 h4 h5 h6 hr i img input kbd li mark ol p pre s section small span strong sub summary sup table tbody td th thead tr u ul video audio source script style iframe'.split(' '));
const attributeSuffix = /\s*(?<!\\)\{(?:(?:color|toggle)="[^"]*"\s*)+\}\s*$/u;
const text = (value) => ({ type: 'text', value });
const box = (tag, children, properties = {}) => ({ type: 'blockquote', data: { hName: tag, hProperties: properties }, children });
const element = (tag, children, properties = {}) => ({ type: 'paragraph', data: { hName: tag, hProperties: properties }, children });
const escape = (value) => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

function attributes(source) {
  return Object.fromEntries([...source.matchAll(/([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map((match) => [match[1], match[2] ?? match[3]]));
}

function inline(source) {
  // A prefix forces inline parsing even when a rich-text cell starts with an HTML tag.
  const root = markdown.parse(`NOTIONINLINE ${source.trim()}`);
  const nodes = root.children[0]?.children ?? [text(source)];
  if (nodes[0]?.type === 'text') nodes[0].value = nodes[0].value.replace(/^NOTIONINLINE /, '');
  return nodes.filter((node) => node.type !== 'text' || node.value);
}

function indentation(line) {
  return (line.match(/^[\t ]*/)?.[0] ?? '').replaceAll('\t', '    ').length;
}

function dedent(lines) {
  const nonempty = lines.filter((line) => line.trim());
  const width = nonempty.length ? Math.min(...nonempty.map(indentation)) : 0;
  return lines.map((line) => {
    let removed = 0;
    let offset = 0;
    while (offset < line.length && removed < width && /[\t ]/.test(line[offset])) {
      removed += line[offset] === '\t' ? 4 : 1;
      offset++;
    }
    return line.slice(offset);
  });
}

function fence(line) {
  return line.trimStart().match(/^(`{3,}|~{3,})(.*)$/);
}

function readFenced(lines, start) {
  const opening = fence(lines[start]);
  let end = start + 1;
  while (end < lines.length) {
    const candidate = fence(lines[end]);
    if (candidate && candidate[1][0] === opening[1][0] && candidate[1].length >= opening[1].length && !candidate[2].trim()) {
      return { lines: lines.slice(start, end + 1), end: end + 1 };
    }
    end++;
  }
  return { lines: lines.slice(start), end: lines.length };
}

function readContainer(lines, start, tag) {
  const opening = lines[start].trim().match(new RegExp(`^<${tag}\\b([^>]*)>(.*)$`));
  const sameLine = opening[2].match(new RegExp(`^(.*)</${tag}>\\s*$`));
  if (sameLine) return { attrs: attributes(opening[1]), body: [sameLine[1]], end: start + 1 };
  const body = opening[2] ? [opening[2]] : [];
  let depth = 1;
  let index = start + 1;
  while (index < lines.length) {
    if (fence(lines[index])) {
      const code = readFenced(lines, index);
      body.push(...code.lines);
      index = code.end;
      continue;
    }
    const line = lines[index];
    for (const match of line.matchAll(new RegExp(`<(/?)${tag}\\b[^>]*>`, 'g'))) depth += match[1] ? -1 : 1;
    if (depth === 0) {
      if (!new RegExp(`^\\s*</${tag}>\\s*$`).test(line)) throw new Error(`닫는 ${tag} 태그는 별도 줄에 있어야 합니다.`);
      return { attrs: attributes(opening[1]), body: dedent(body), end: index + 1 };
    }
    body.push(line);
    index++;
  }
  throw new Error(`닫히지 않은 노션 블록: ${tag}`);
}

function nestedLines(lines, start) {
  let end = start;
  while (end < lines.length && (indentation(lines[end]) > 0 || !lines[end].trim())) end++;
  return { body: dedent(lines.slice(start, end)), end };
}

function tableNode(body, attrs) {
  const source = body.join('\n');
  const rows = [...source.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)];
  if (!rows.length && source.trim()) throw new Error('노션 표에 읽을 수 있는 행이 없습니다.');
  const remainder = source.replace(/<colgroup\b[^>]*>[\s\S]*?<\/colgroup>/gi, '').replace(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi, '').trim();
  if (remainder) throw new Error('노션 표에 지원되지 않는 내용이 있습니다.');
  return box('table', [box('tbody', rows.map((row, rowIndex) => {
    const cells = [...row[1].matchAll(/<(td|th)\b[^>]*>([\s\S]*?)<\/\1>/gi)];
    if (row[1].replace(/<(td|th)\b[^>]*>[\s\S]*?<\/\1>/gi, '').trim()) throw new Error('노션 표의 셀을 완전히 읽지 못했습니다.');
    return box('tr', cells.map((cell, columnIndex) => {
      const header = cell[1].toLowerCase() === 'th' || (attrs['header-row'] === 'true' && rowIndex === 0) || (attrs['header-column'] === 'true' && columnIndex === 0);
      return element(header ? 'th' : 'td', inline(cell[2].replace(/\n[\t ]*/g, ' ')), header ? { scope: rowIndex === 0 && attrs['header-row'] === 'true' ? 'col' : 'row' } : {});
    }));
  }))]);
}

function containerNode(tag, block, flavor) {
  const body = block.body;
  if (tag === 'table') return tableNode(body, block.attrs);
  if (tag === 'callout') return box('aside', [
    element('span', [text(block.attrs.icon ?? '💡')], { className: ['notion-callout-icon'], ariaHidden: 'true' }),
    box('div', parseLines(body, flavor), { className: ['notion-callout-content'] }),
  ], { className: ['notion-callout-block'] });
  if (tag === 'details') {
    const summaryIndex = body.findIndex((line) => line.trim());
    const summary = body[summaryIndex]?.trim().match(/^<summary\b[^>]*>([\s\S]*?)<\/summary>$/i);
    if (!summary) throw new Error('노션 토글의 summary 제목을 읽지 못했습니다.');
    return box('details', [element('summary', inline(summary[1])), ...parseLines(dedent(body.slice(summaryIndex + 1)), flavor)]);
  }
  if (tag === 'synced_block' || tag === 'synced_block_reference') {
    const children = parseLines(body, flavor);
    if (!children.length && block.attrs.url) children.push(element('p', [{ type: 'link', url: block.attrs.url, children: [text('원본 동기화 블록 보기')] }]));
    return box('div', children, { className: ['notion-synced-block'] });
  }
  return box('div', parseLines(body, flavor), { className: [tag === 'columns' ? 'notion-columns' : 'notion-column'] });
}

function referenceNode(tag, source) {
  const match = source.match(new RegExp(`^<${tag}\\b([^>]*?)(?:\\s*/>|>([\\s\\S]*?)</${tag}>)$`, 'i'));
  if (!match) throw new Error(`읽을 수 없는 노션 참조: ${tag}`);
  const attrs = attributes(match[1]);
  const url = attrs.src ?? attrs.url;
  const caption = match[2]?.trim() || ({ page: '원본 페이지', database: '원본 데이터베이스', audio: '오디오', video: '동영상', file: '첨부 파일', pdf: 'PDF', bookmark: '북마크', embed: '임베드 원본' }[tag]);
  if (!url) throw new Error(`노션 ${tag} 블록에 원본 주소가 없습니다.`);
  const link = { type: 'link', url, children: inline(caption) };
  if (tag === 'video' || tag === 'audio') return box('figure', [
    element(tag, [link], { src: url, controls: true, preload: 'metadata' }),
    element('figcaption', inline(caption)),
  ], { className: ['notion-media'] });
  return element('p', [link], { className: ['notion-reference'] });
}

function listMatch(line) {
  return line.match(/^(?:(\d+)[.)]|([-+*]))\s+(?:\[([ xX])\]\s+)?(.*)$/);
}

function parseLines(lines, flavor) {
  const nodes = [];
  let buffered = [];
  const flush = () => {
    if (buffered.length) nodes.push(...markdown.parse(buffered.join('\n')).children);
    buffered = [];
  };
  for (let index = 0; index < lines.length;) {
    const raw = lines[index];
    const line = raw.trim();
    if (fence(raw)) {
      flush();
      const code = readFenced(lines, index);
      nodes.push(...markdown.parse(code.lines.join('\n')).children);
      index = code.end;
      continue;
    }
    if (line === '$$') {
      flush();
      let end = index + 1;
      while (end < lines.length && lines[end].trim() !== '$$') end++;
      if (end === lines.length) throw new Error('닫히지 않은 수식 블록이 있습니다.');
      nodes.push(...markdown.parse(lines.slice(index, end + 1).join('\n')).children);
      index = end + 1;
      continue;
    }
    const tag = line.match(/^<([\w-]+)\b/)?.[1];
    if (containers.has(tag)) {
      flush();
      const block = readContainer(lines, index, tag);
      nodes.push(containerNode(tag, block, flavor));
      index = block.end;
      continue;
    }
    if (references.has(tag)) {
      flush();
      nodes.push(referenceNode(tag, line));
      index++;
      continue;
    }
    if (tag === 'empty-block' || tag === 'table_of_contents') {
      flush();
      nodes.push(box(tag === 'empty-block' ? 'div' : 'nav', [], tag === 'empty-block'
        ? { className: ['notion-empty-block'], ariaHidden: 'true' }
        : { className: ['notion-toc'], ariaLabel: '목차' }));
      index++;
      continue;
    }
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading && /(?<!\\)\{[^}]*toggle="true"[^}]*\}\s*$/.test(heading[2])) {
      flush();
      const nested = nestedLines(lines, index + 1);
      nodes.push(box('details', [box('summary', [{ type: 'heading', depth: Math.min(heading[1].length, 4), children: inline(heading[2].replace(attributeSuffix, '')) }]), ...parseLines(nested.body, flavor)], { className: ['notion-toggle-heading'] }));
      index = nested.end;
      continue;
    }
    if (flavor !== 'notion') {
      buffered.push(indentation(raw) >= 4 ? raw : raw.replace(attributeSuffix, ''));
      index++;
      continue;
    }
    flush();
    if (!line) { index++; continue; }
    if (heading) {
      nodes.push({ type: 'heading', depth: Math.min(heading[1].length, 4), children: inline(heading[2].replace(attributeSuffix, '')) });
      index++;
      continue;
    }
    if (/^(?:---+|\*\*\*+|___+)\s*$/.test(line)) {
      nodes.push({ type: 'thematicBreak' });
      index++;
      continue;
    }
    if (line.includes('|') && /^\s*\|?\s*:?-{3,}/.test(lines[index + 1] ?? '')) {
      let end = index + 2;
      while (end < lines.length && lines[end].trim() && lines[end].includes('|')) end++;
      nodes.push(...markdown.parse(lines.slice(index, end).join('\n')).children);
      index = end;
      continue;
    }
    const item = listMatch(line);
    if (item) {
      const ordered = Boolean(item[1]);
      const children = [];
      const start = ordered ? Number(item[1]) : undefined;
      while (index < lines.length) {
        const current = listMatch(lines[index].trim());
        if (!current || Boolean(current[1]) !== ordered) break;
        const nested = nestedLines(lines, index + 1);
        children.push({ type: 'listItem', spread: false, checked: current[3] === undefined ? null : current[3].toLowerCase() === 'x', children: [{ type: 'paragraph', children: inline(current[4].replace(attributeSuffix, '')) }, ...parseLines(nested.body, flavor)] });
        index = nested.end;
      }
      nodes.push({ type: 'list', ordered, start, spread: false, children });
      continue;
    }
    const nested = nestedLines(lines, index + 1);
    const quote = line.startsWith('> ');
    const paragraph = { type: 'paragraph', children: inline((quote ? line.slice(2) : line).replace(attributeSuffix, '')) };
    if (quote) nodes.push(box('blockquote', [paragraph, ...parseLines(nested.body, flavor)]));
    else {
      nodes.push(paragraph);
      if (nested.body.some((child) => child.trim())) nodes.push(box('div', parseLines(nested.body, flavor), { className: ['notion-nested-blocks'] }));
    }
    index = nested.end;
  }
  flush();
  return nodes;
}

function mapInlineHtml(value) {
  return value.replace(/<\/?([\w-]+)\b[^>]*>/g, (tag, name) => {
    if (name === 'span') {
      if (tag.startsWith('</')) return '</span>';
      const attrs = attributes(tag);
      // Author colors/fonts are not imported; semantic emphasis uses the site's palette.
      return `<span${attrs.underline === 'true' ? ' class="notion-underline"' : attrs.color ? ' class="notion-emphasis"' : ''}>`;
    }
    if (name.startsWith('mention-')) {
      if (tag.startsWith('</')) return '</a>';
      const attrs = attributes(tag);
      if (name === 'mention-date') return escape([attrs.start, attrs.startTime, attrs.end ? `– ${attrs.end}` : '', attrs.endTime, attrs.timeZone].filter(Boolean).join(' '));
      const href = attrs.url ?? '';
      if (tag.endsWith('/>')) return `<a href="${escape(href)}">${escape(href || name)}</a>`;
      return `<a href="${escape(href)}">`;
    }
    if (!htmlTags.has(name.toLowerCase())) throw new Error(`지원되지 않는 문법: <${name}>. 원문을 유지하고 변환기를 보완해야 합니다.`);
    return tag;
  });
}

function cleanTree(node) {
  if (node.type === 'html') node.value = mapInlineHtml(node.value);
  if (!node.children) return;
  for (const child of node.children) cleanTree(child);
  // GFM autolinks can split a Notion citation into text/link/text nodes.
  for (let index = 1; index < node.children.length - 1; index++) {
    const previous = node.children[index - 1];
    const current = node.children[index];
    const next = node.children[index + 1];
    if (current.type === 'link' && /^https?:\/\//.test(current.url) && previous.type === 'text' && previous.value.endsWith('[^') && next.type === 'text' && next.value.startsWith(']')) {
      previous.value = previous.value.slice(0, -2);
      next.value = next.value.slice(1);
      current.data = { hProperties: { className: ['notion-citation'] } };
      current.children = [text('출처')];
    }
  }
  node.children = node.children.flatMap((child) => {
    if (child.type !== 'text') return [child];
    const parts = [];
    let cursor = 0;
    for (const match of child.value.matchAll(/\[\^(https?:\/\/[^\]]+)\]/g)) {
      parts.push(text(child.value.slice(cursor, match.index)), { type: 'link', url: match[1], data: { hProperties: { className: ['notion-citation'] } }, children: [text('출처')] });
      cursor = match.index + match[0].length;
    }
    return cursor ? [...parts, text(child.value.slice(cursor))] : [child];
  });
}

export function parseNotionMarkdown(source, { flavor = 'notion' } = {}) {
  const root = { type: 'root', children: parseLines(source.replace(/^\uFEFF/, '').replaceAll('\r\n', '\n').split('\n'), flavor) };
  cleanTree(root);
  return root;
}

export function remarkNotion(options = {}) {
  return (tree, file) => { tree.children = parseNotionMarkdown(String(file), options).children; };
}

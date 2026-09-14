import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeKatex from 'rehype-katex';
import { remarkArticleTitle } from './remark-article-title.ts';
import { remarkNotion } from './notion-parser.mjs';

const schema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), 'aside', 'nav', 'figure', 'figcaption', 'video', 'audio'],
  attributes: {
    ...defaultSchema.attributes,
    '*': [...(defaultSchema.attributes?.['*'] ?? []), ['className', /^(?:notion-[a-z0-9-]+|language-[a-z0-9-]+|math-inline|math-display|contains-task-list|task-list-item)$/]],
    video: ['src', 'controls', 'preload'],
    audio: ['src', 'controls', 'preload'],
    a: [...(defaultSchema.attributes?.a ?? []).filter((attribute) => (Array.isArray(attribute) ? attribute[0] : attribute) !== 'className'), ['className', 'notion-citation', 'data-footnote-backref']],
    th: [...(defaultSchema.attributes?.th ?? []), 'scope'],
  },
};

const element = (tagName, properties, children = []) => ({ type: 'element', tagName, properties, children });
const text = (value) => ({ type: 'text', value });
const plainText = (node) => node.type === 'text' ? node.value : (node.children ?? []).map(plainText).join('');

function rehypeNotionPresentation() {
  return (tree) => {
    const headings = [];
    const tablesOfContents = [];
    function visit(parent) {
      if (!parent.children) return;
      parent.children = parent.children.map((node) => {
        if (node.type !== 'element') return node;
        visit(node);
        const classes = node.properties?.className ?? [];
        if (/^h[1-6]$/.test(node.tagName)) {
          node.properties.id = `notion-heading-${headings.length + 1}`;
          headings.push({ id: node.properties.id, title: plainText(node), depth: Number(node.tagName[1]) });
        }
        if (node.tagName === 'nav' && classes.includes('notion-toc')) tablesOfContents.push(node);
        if (node.tagName === 'a' && /^https?:\/\//i.test(String(node.properties.href ?? ''))) {
          node.properties.target = '_blank';
          node.properties.rel = ['noopener', 'noreferrer'];
        }
        if (node.tagName === 'table') return element('section', { className: ['notion-table-scroll'], ariaLabel: '표 (가로 스크롤 가능)', tabIndex: 0 }, [node]);
        if (node.tagName === 'p') {
          const meaningful = node.children.filter((child) => child.type !== 'text' || child.value.trim());
          if (meaningful.length === 1 && meaningful[0].tagName === 'img') {
            const image = meaningful[0];
            image.properties.loading = 'lazy';
            const children = image.properties.alt ? [image, element('figcaption', {}, [text(image.properties.alt)])] : [image];
            return element('figure', { className: ['notion-media'] }, children);
          }
        }
        return node;
      });
    }
    visit(tree);
    for (const toc of tablesOfContents) {
      toc.properties.ariaLabel = '목차';
      toc.children = [element('ol', {}, headings.map((heading) => element('li', { className: [`notion-toc-depth-${heading.depth}`] }, [element('a', { href: `#${heading.id}` }, [text(heading.title)])])))];
    }
  };
}

/**
 * Shared by the static page, deployment validation and regression tests.
 * @param {string} content
 * @param {{title?: string, flavor?: 'notion' | 'markdown'}} options
 * @returns {import('react-markdown').Options}
 */
export function notionMarkdownOptions(content, { title, flavor = 'notion' } = {}) {
  return {
    children: content,
    remarkPlugins: [remarkGfm, remarkMath, [remarkNotion, { flavor }], [remarkArticleTitle, { title }]],
    rehypePlugins: [rehypeRaw, [rehypeSanitize, schema], [rehypeKatex, { trust: false }], rehypeNotionPresentation],
  };
}

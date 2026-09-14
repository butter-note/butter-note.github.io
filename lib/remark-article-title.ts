import type { PhrasingContent, Root } from 'mdast';

function headingText(node: PhrasingContent): string {
  if ('children' in node) return node.children.map(headingText).join('');
  if (node.type === 'text' || node.type === 'inlineCode') return node.value;
  if (node.type === 'image' || node.type === 'imageReference') return node.alt ?? '';
  if (node.type === 'break') return ' ';
  return '';
}

function normalizeTitle(title: string) {
  return title.normalize('NFC').replace(/\s+/gu, ' ').trim();
}

// Only remove a leading H1 that repeats the page title; preserve every other heading.
export function remarkArticleTitle({ title }: { title?: string } = {}) {
  return (tree: Root) => {
    const first = tree.children[0];
    if (!title || first?.type !== 'heading' || first.depth !== 1) return;

    if (normalizeTitle(first.children.map(headingText).join('')) === normalizeTitle(title)) {
      tree.children.shift();
    }
  };
}

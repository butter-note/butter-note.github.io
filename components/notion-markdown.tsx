import ReactMarkdown from 'react-markdown';
import { notionMarkdownOptions } from '@/lib/notion-renderer.mjs';

export function NotionMarkdown({ content, title, flavor = 'notion' }: { content: string; title?: string; flavor?: 'notion' | 'markdown' }) {
  return (
    <div className="notion-markdown">
      <ReactMarkdown {...notionMarkdownOptions(content, { title, flavor })} />
    </div>
  );
}

import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

const notionSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    '*': [...(defaultSchema.attributes?.['*'] ?? []), 'className'],
  },
};

function normalizeNotionMarkdown(markdown: string) {
  return markdown
    .replace(/<callout[^>]*icon="([^"]+)"[^>]*>/gi, '<aside class="notion-callout-block"><strong>$1</strong><div>')
    .replace(/<callout[^>]*>/gi, '<aside class="notion-callout-block"><strong>💡</strong><div>')
    .replace(/<\/callout>/gi, '</div></aside>')
    .replace(/<columns[^>]*>/gi, '<div class="notion-columns">')
    .replace(/<\/columns>/gi, '</div>')
    .replace(/<column[^>]*>/gi, '<div class="notion-column">')
    .replace(/<\/column>/gi, '</div>')
    .replace(/<mention-[^>]+>/gi, '')
    .replace(/<\/mention-[^>]+>/gi, '');
}

export function NotionMarkdown({ content }: { content: string }) {
  return (
    <div className="notion-markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, notionSchema]]}
        components={{
          a: ({ href, children, ...props }) => {
            const external = href?.startsWith('http');
            return (
              <a
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noreferrer' : undefined}
                {...props}
              >
                {children}
              </a>
            );
          },
        }}
      >
        {normalizeNotionMarkdown(content)}
      </ReactMarkdown>
    </div>
  );
}

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  readTime: string;
  character: string;
  featured?: boolean;
};

export type Post = PostMeta & { content: string };

const markdownModules = import.meta.glob('../content/posts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const metaModules = import.meta.glob('../content/posts/*.json', {
  import: 'default',
  eager: true,
}) as Record<string, PostMeta>;

export function getPosts(): Post[] {
  return Object.entries(markdownModules)
    .map(([path, content]) => {
      const metaPath = path.replace(/\.md$/, '.json');
      const meta = metaModules[metaPath];

      if (!meta) {
        throw new Error(`게시물 메타데이터가 없습니다: ${metaPath}`);
      }

      return { ...meta, content };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPostBySlug(slug: string): Post | undefined {
  return getPosts().find((post) => post.slug === slug);
}

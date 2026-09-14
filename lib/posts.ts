export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  readTime: string;
  character: string;
  featured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  notionPageId?: string;
  format?: 'notion' | 'markdown';
};

export type Post = PostMeta & { content: string };

const postsDirectory = path.join(process.cwd(), 'content', 'posts');

export function getPosts(): Post[] {
  return fs
    .readdirSync(postsDirectory)
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const content = fs.readFileSync(path.join(postsDirectory, fileName), 'utf8');
      const metaPath = path.join(postsDirectory, `${slug}.json`);

      if (!fs.existsSync(metaPath)) {
        throw new Error(`게시물 메타데이터가 없습니다: ${metaPath}`);
      }

      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8')) as PostMeta;
      return { ...meta, content };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPostBySlug(slug: string): Post | undefined {
  return getPosts().find((post) => post.slug === slug);
}
import fs from 'node:fs';
import path from 'node:path';

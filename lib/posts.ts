import fs from 'node:fs';
import path from 'node:path';
import { extractBlocks, summarize } from './plain-text.ts';

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  /** Last edit in Notion (YYYY-MM-DD). */
  updated?: string;
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

export function getPostStaticParams() {
  const params = getPosts().map((post) => ({ slug: post.slug }));
  // Static export requires a path even for an empty CMS. Both detail routes
  // render notFound() for this unlinked placeholder; it is never a post.
  return params.length ? params : [{ slug: '__empty__' }];
}

export const postFlavor = (post: Pick<PostMeta, 'format' | 'notionPageId'>) => post.format ?? (post.notionPageId ? 'notion' : 'markdown');

const sameText = (a: string, b: string) => {
  const normalize = (value: string) => value.normalize('NFC').replace(/\s+/g, ' ').trim();
  return normalize(a) === normalize(b);
};

/** The sync script fills an empty 요약 with the title; that is not a description. */
export function hasOwnDescription(post: Pick<Post, 'title' | 'description'>) {
  return Boolean(post.description?.trim()) && !sameText(post.description, post.title);
}

/** A written description, or the opening of the body. Used for meta descriptions, cards, RSS and llms.txt. */
export function postSummary(post: Pick<Post, 'title' | 'description' | 'content' | 'format' | 'notionPageId'>) {
  if (hasOwnDescription(post)) return post.description.trim();
  return summarize(extractBlocks(post.content, { flavor: postFlavor(post), title: post.title })) || post.title;
}

/** First localized image in the body, for the share card and structured data. */
export function firstImage(content: string) {
  return content.match(/!\[[^\]]*\]\((\/content\/[^)\s]+)\)/)?.[1];
}

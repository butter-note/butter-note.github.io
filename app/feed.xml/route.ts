import { buildRss } from '@/lib/feed';
import { getPosts, postSummary } from '@/lib/posts';
import { pages } from '@/lib/site';

export const dynamic = 'force-static';

export function GET() {
  const items = getPosts().map((post) => ({
    title: post.title,
    path: `/articles/${post.slug}/`,
    description: postSummary(post),
    date: post.date,
    category: post.category,
  }));
  const body = buildRss(items, { title: pages.articles.title, description: pages.articles.description, path: pages.articles.path });
  return new Response(body, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}

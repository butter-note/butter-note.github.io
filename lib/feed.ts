import { absoluteUrl } from './site.ts';

export type FeedItem = { title: string; path: string; description: string; date: string; category?: string };

const xmlEntities: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' };
const escapeXml = (value: string) => value.replace(/[&<>"']/g, (char) => xmlEntities[char] ?? char);

/** Post dates are Korean calendar days; RSS wants RFC 822. */
export function rssDate(date: string) {
  const value = new Date(`${date}T00:00:00+09:00`);
  return Number.isNaN(value.getTime()) ? '' : value.toUTCString();
}

/** RSS 2.0 for feed readers and search consoles (e.g. 네이버 서치어드바이저 RSS 제출). Items are newest first. */
export function buildRss(items: FeedItem[], { title, description, path }: { title: string; description: string; path: string }) {
  const latest = items.map((item) => rssDate(item.date)).find(Boolean);
  const entries = items.map((item) => {
    const link = escapeXml(absoluteUrl(item.path));
    const pubDate = rssDate(item.date);
    return [
      '    <item>',
      `      <title>${escapeXml(item.title)}</title>`,
      `      <link>${link}</link>`,
      `      <guid isPermaLink="true">${link}</guid>`,
      `      <description>${escapeXml(item.description)}</description>`,
      ...(item.category ? [`      <category>${escapeXml(item.category)}</category>`] : []),
      ...(pubDate ? [`      <pubDate>${pubDate}</pubDate>`] : []),
      '    </item>',
    ].join('\n');
  });
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    `    <title>${escapeXml(title)}</title>`,
    `    <link>${escapeXml(absoluteUrl(path))}</link>`,
    `    <description>${escapeXml(description)}</description>`,
    '    <language>ko</language>',
    `    <atom:link href="${escapeXml(absoluteUrl('/feed.xml'))}" rel="self" type="application/rss+xml"/>`,
    ...(latest ? [`    <lastBuildDate>${latest}</lastBuildDate>`] : []),
    ...entries,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n');
}

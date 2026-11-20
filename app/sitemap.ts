import type { MetadataRoute } from 'next';
import { getCaseStudies, getSchedule } from '@/lib/business-content';
import { getPosts } from '@/lib/posts';
import { absoluteUrl, pages } from '@/lib/site';

export const dynamic = 'force-static';

const latest = (dates: (string | undefined)[]) => dates.filter((date): date is string => Boolean(date)).sort().at(-1);
const withDate = (url: string, lastModified?: string) => (lastModified ? { url, lastModified } : { url });

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getPosts();
  const cases = getCaseStudies();
  const postDates = posts.map((post) => post.updated || post.date);
  const caseDates = cases.map((entry) => entry.updated || entry.date);
  const { upcoming, past } = getSchedule();
  const scheduleDates = [...upcoming, ...past].map((item) => item.updated);
  const listDates: Record<string, string | undefined> = {
    '/': latest([...postDates, ...caseDates, ...scheduleDates]),
    '/articles/': latest(postDates),
    '/cases/': latest(caseDates),
    '/schedule/': latest(scheduleDates),
  };

  // Legacy /guides/ redirects and the empty-catalog __empty__ placeholders are deliberately left out.
  return [
    ...Object.values(pages).map((page) => withDate(absoluteUrl(page.path), listDates[page.path])),
    ...posts.map((post) => withDate(absoluteUrl(`/articles/${post.slug}/`), post.updated || post.date)),
    ...cases.map((entry) => withDate(absoluteUrl(`/cases/${entry.slug}/`), entry.updated || entry.date)),
  ];
}

import { getSchedule } from '@/lib/business-content';
import { buildIcs } from '@/lib/schedule';
import { absoluteUrl, pages, site } from '@/lib/site';

export const dynamic = 'force-static';

/** /schedule.ics: calendar apps subscribe to this and pick up new events on their own. */
export function GET() {
  const { upcoming, past } = getSchedule();
  const body = buildIcs([...upcoming, ...past], {
    name: `${site.name} 일정`,
    url: absoluteUrl(pages.schedule.path),
    host: new URL(site.url).host,
    itemUrl: (item) => absoluteUrl(item.casePath ?? `${pages.schedule.path}#event-${item.slug}`),
  });
  return new Response(body, { headers: { 'Content-Type': 'text/calendar; charset=utf-8' } });
}

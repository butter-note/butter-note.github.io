/**
 * Schedule built from the 구축 사례 DB: every dated entry is an event. It is "upcoming" until its last day
 * passes in Korea, then it moves to the past list and, if it has a written story, becomes a case page.
 * Pure functions only, so the page, the .ics feed and the tests share one source of truth.
 */

export type ScheduleSource = {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  content: string;
  date: string;
  updated?: string;
  schedule?: { start: string; end?: string; timeZone?: string };
  mode?: string;
  location?: string;
  audience?: string;
  registrationUrl?: string;
};

export type ScheduleItem = {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  /** Raw Notion values with a Korean offset added when Notion omitted one. */
  start: string;
  end?: string;
  /** Calendar days in Korea (YYYY-MM-DD). endDate equals startDate for one-day events. */
  startDate: string;
  endDate: string;
  /** HH:mm in Korea, only when Notion has a time. */
  startTime?: string;
  endTime?: string;
  mode: string;
  location: string;
  audience: string;
  registrationUrl: string;
  /** Case page of a past entry with a written story. */
  casePath?: string;
  upcoming: boolean;
  updated?: string;
};

const timeZone = 'Asia/Seoul';
const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
const dateOnly = /^\d{4}-\d{2}-\d{2}$/;
const hasOffset = /(?:Z|[+-]\d{2}:?\d{2})$/i;

const kstFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});

/** Notion leaves the offset off when a time zone is chosen; the business runs in Korea, so read those as KST. */
export function withKoreanOffset(value: string) {
  return dateOnly.test(value) || hasOffset.test(value) ? value : `${value}+09:00`;
}

function kstParts(value: string): { date: string; time?: string } {
  if (dateOnly.test(value)) return { date: value };
  const parts = Object.fromEntries(kstFormat.formatToParts(new Date(withKoreanOffset(value))).map((part) => [part.type, part.value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
}

/** Today's date in Korea (YYYY-MM-DD). The site rebuilds every hour, so build time is "now" to within an hour. */
export function todayInKorea(now = new Date()) {
  return kstParts(now.toISOString()).date;
}

function lastDay(entry: ScheduleSource) {
  if (!entry.schedule) return '';
  return kstParts(entry.schedule.end || entry.schedule.start).date;
}

/** A case page needs a written story and must not be an event that has not happened yet. */
export function isCasePage(entry: ScheduleSource, today: string) {
  if (!entry.content.trim()) return false;
  return !entry.schedule || lastDay(entry) < today;
}

export function toScheduleItems(entries: ScheduleSource[], today: string): ScheduleItem[] {
  return entries
    .filter((entry): entry is ScheduleSource & { schedule: NonNullable<ScheduleSource['schedule']> } => Boolean(entry.schedule?.start))
    .map((entry) => {
      const start = withKoreanOffset(entry.schedule.start);
      const end = entry.schedule.end ? withKoreanOffset(entry.schedule.end) : undefined;
      const first = kstParts(start);
      const last = end ? kstParts(end) : first;
      return {
        id: entry.id,
        slug: entry.slug,
        title: entry.title,
        category: entry.category,
        description: entry.description,
        start,
        ...(end ? { end } : {}),
        startDate: first.date,
        endDate: last.date,
        ...(first.time ? { startTime: first.time } : {}),
        ...(end && last.time ? { endTime: last.time } : {}),
        mode: entry.mode ?? '',
        location: entry.location ?? '',
        audience: entry.audience ?? '',
        registrationUrl: entry.registrationUrl ?? '',
        ...(isCasePage(entry, today) ? { casePath: `/cases/${entry.slug}/` } : {}),
        upcoming: last.date >= today,
        ...(entry.updated ? { updated: entry.updated } : {}),
      };
    })
    // Compare Korean calendar values, not raw strings that may carry different offsets.
    .sort((a, b) => a.startDate.localeCompare(b.startDate) || (a.startTime ?? '').localeCompare(b.startTime ?? '') || a.title.localeCompare(b.title, 'ko'));
}

/** Upcoming soonest first; past most recent first. */
export function splitSchedule(items: ScheduleItem[]) {
  return {
    upcoming: items.filter((item) => item.upcoming),
    past: items.filter((item) => !item.upcoming).reverse(),
  };
}

const weekday = (date: string) => weekdays[new Date(`${date}T12:00:00Z`).getUTCDay()];
const monthDay = (date: string) => `${Number(date.slice(5, 7))}월 ${Number(date.slice(8, 10))}일`;

export function dateBadge(item: ScheduleItem) {
  return { month: `${Number(item.startDate.slice(5, 7))}월`, day: String(Number(item.startDate.slice(8, 10))), weekday: weekday(item.startDate) };
}

/** "12월 5일 (금) 14:00~16:00", "12월 5일 (금) ~ 12월 6일 (토)" */
export function whenLabel(item: ScheduleItem) {
  const first = `${monthDay(item.startDate)} (${weekday(item.startDate)})`;
  if (item.endDate !== item.startDate) {
    const last = `${monthDay(item.endDate)} (${weekday(item.endDate)})`;
    return `${first}${item.startTime ? ` ${item.startTime}` : ''} ~ ${last}${item.endTime ? ` ${item.endTime}` : ''}`;
  }
  if (!item.startTime) return first;
  return `${first} ${item.startTime}${item.endTime ? `~${item.endTime}` : ''}`;
}

/** "09.07" for the past list, which is already grouped by year. */
export const shortDate = (item: ScheduleItem) => `${item.startDate.slice(5, 7)}.${item.startDate.slice(8, 10)}`;

export function groupByYear(items: ScheduleItem[]) {
  const groups = new Map<string, ScheduleItem[]>();
  for (const item of items) groups.set(item.startDate.slice(0, 4), [...(groups.get(item.startDate.slice(0, 4)) ?? []), item]);
  return [...groups.entries()].map(([year, entries]) => ({ year, entries }));
}

/** Twelve months of one year with how many events start in each and whether any is still ahead. */
export function yearStrip(items: ScheduleItem[], year: string) {
  return Array.from({ length: 12 }, (_, index) => {
    const month = String(index + 1).padStart(2, '0');
    const inMonth = items.filter((item) => item.startDate.startsWith(`${year}-${month}`));
    return { month: index + 1, count: inMonth.length, upcoming: inMonth.some((item) => item.upcoming) };
  });
}

export function calendarLinks(feedUrl: string) {
  const webcal = feedUrl.replace(/^https?:\/\//i, 'webcal://');
  return { webcal, google: `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcal)}`, feed: feedUrl };
}

const icsText = (value: string) => value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
const icsUtc = (value: string) => new Date(withKoreanOffset(value)).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const icsDate = (date: string) => date.replaceAll('-', '');
const nextDay = (date: string) => new Date(Date.parse(`${date}T00:00:00Z`) + 86_400_000).toISOString().slice(0, 10);
const encoder = new TextEncoder();

/** RFC 5545 folding: lines over 75 octets continue with a leading space, never splitting a character. */
export function foldIcsLine(line: string) {
  const lines: string[] = [];
  let current = '';
  let size = 0;
  for (const char of line) {
    const bytes = encoder.encode(char).length;
    // Continuation lines start with a space, which counts toward their 75 octets.
    if (size + bytes > (lines.length ? 74 : 75)) {
      lines.push(current);
      current = '';
      size = 0;
    }
    current += char;
    size += bytes;
  }
  lines.push(current);
  return lines.join('\r\n ');
}

/** iCalendar feed that calendar apps can subscribe to. */
export function buildIcs(items: ScheduleItem[], options: { name: string; url: string; host: string; now?: Date; itemUrl: (item: ScheduleItem) => string }) {
  const stamp = icsUtc((options.now ?? new Date()).toISOString());
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${options.host}//Schedule//KO`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${icsText(options.name)}`,
    `X-WR-TIMEZONE:${timeZone}`,
    `URL:${options.url}`,
    'REFRESH-INTERVAL;VALUE=DURATION:PT12H',
    'X-PUBLISHED-TTL:PT12H',
  ];
  for (const item of items) {
    const timed = Boolean(item.startTime);
    const details = [item.description, item.audience && `대상: ${item.audience}`, item.registrationUrl && `신청: ${item.registrationUrl}`, options.itemUrl(item)].filter(Boolean).join('\n');
    lines.push(
      'BEGIN:VEVENT',
      `UID:${item.id}@${options.host}`,
      `DTSTAMP:${stamp}`,
      timed ? `DTSTART:${icsUtc(item.start)}` : `DTSTART;VALUE=DATE:${icsDate(item.startDate)}`,
      // All-day DTEND is exclusive; a timed event without an end time keeps only its start.
      ...(timed ? (item.end && item.endTime ? [`DTEND:${icsUtc(item.end)}`] : []) : [`DTEND;VALUE=DATE:${icsDate(nextDay(item.endDate))}`]),
      `SUMMARY:${icsText(item.title)}`,
      ...(details ? [`DESCRIPTION:${icsText(details)}`] : []),
      ...(item.location || item.mode ? [`LOCATION:${icsText(item.location || item.mode)}`] : []),
      `URL:${options.itemUrl(item)}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return `${lines.map(foldIcsLine).join('\r\n')}\r\n`;
}

import assert from 'node:assert/strict';
import test from 'node:test';
import { buildIcs, calendarLinks, foldIcsLine, isCasePage, splitSchedule, todayInKorea, toScheduleItems, whenLabel, yearStrip } from '../lib/schedule.ts';

const entry = (id, schedule, overrides = {}) => ({
  id, slug: id, title: `일정 ${id}`, category: '교육', description: '', content: '', date: schedule?.start?.slice(0, 10) ?? '', ...(schedule ? { schedule } : {}), ...overrides,
});

test('today follows the Korean calendar, not UTC', () => {
  assert.equal(todayInKorea(new Date('2026-12-04T15:30:00Z')), '2026-12-05');
  assert.equal(todayInKorea(new Date('2026-12-04T14:59:00Z')), '2026-12-04');
});

test('events stay upcoming through their last day, then move to the past list', () => {
  const items = toScheduleItems([
    entry('past', { start: '2026-09-07' }, { content: '## 결과' }),
    entry('today', { start: '2026-12-05T14:00:00.000+09:00', end: '2026-12-05T16:00:00.000+09:00' }),
    entry('range', { start: '2026-12-03', end: '2026-12-05' }),
    entry('next', { start: '2026-12-20' }, { content: '행사 안내' }),
    entry('undated', undefined, { content: '본문' }),
  ], '2026-12-05');
  const { upcoming, past } = splitSchedule(items);
  assert.deepEqual(upcoming.map((item) => item.id), ['range', 'today', 'next']);
  assert.deepEqual(past.map((item) => item.id), ['past']);
  assert.equal(past[0].casePath, '/cases/past/');
  assert.equal(upcoming.find((item) => item.id === 'next').casePath, undefined, 'an upcoming story is not a case yet');
});

test('case pages need a written story and a date that has passed', () => {
  const today = '2026-12-05';
  assert.equal(isCasePage(entry('story', { start: '2026-12-04' }, { content: '본문' }), today), true);
  assert.equal(isCasePage(entry('empty', { start: '2026-12-04' }), today), false);
  assert.equal(isCasePage(entry('soon', { start: '2026-12-05' }, { content: '본문' }), today), false);
  assert.equal(isCasePage(entry('legacy', undefined, { content: '본문' }), today), true, 'undated cases keep their page');
});

test('times are read in Korea even when Notion sends UTC or no offset', () => {
  const [utc] = toScheduleItems([entry('utc', { start: '2026-12-04T23:30:00.000Z' })], '2026-12-01');
  assert.equal(utc.startDate, '2026-12-05');
  assert.equal(utc.startTime, '08:30');
  const [naive] = toScheduleItems([entry('naive', { start: '2026-12-05T14:00:00', timeZone: 'Asia/Seoul' })], '2026-12-01');
  assert.equal(naive.startTime, '14:00');
  assert.equal(naive.start, '2026-12-05T14:00:00+09:00');
});

test('labels show the weekday, the time and multi-day ranges', () => {
  const [timed, range] = toScheduleItems([
    entry('a', { start: '2026-12-05T14:00:00+09:00', end: '2026-12-05T16:00:00+09:00' }),
    entry('b', { start: '2026-12-07', end: '2026-12-08' }),
  ], '2026-12-01');
  assert.equal(whenLabel(timed), '12월 5일 (토) 14:00~16:00');
  assert.equal(whenLabel(range), '12월 7일 (월) ~ 12월 8일 (화)');
  const strip = yearStrip([timed, range], '2026');
  assert.equal(strip[11].count, 2);
  assert.equal(strip[11].upcoming, true);
  assert.equal(strip[0].count, 0);
});

test('the .ics feed is valid iCalendar text', () => {
  const items = toScheduleItems([
    entry('allday', { start: '2026-12-07', end: '2026-12-08' }, { title: '연수, 1회차; 기초\\과정', location: '춘천' }),
    entry('timed', { start: '2026-12-05T14:00:00+09:00', end: '2026-12-05T16:00:00+09:00' }, { description: '긴 설명 '.repeat(30), mode: '온라인' }),
  ], '2026-12-01');
  const ics = buildIcs(items, {
    name: '버터노트 일정', url: 'https://butter-note.github.io/schedule/', host: 'butter-note.github.io', now: new Date('2026-12-01T00:00:00Z'),
    itemUrl: (item) => `https://butter-note.github.io/schedule/#event-${item.slug}`,
  });
  assert.ok(ics.startsWith('BEGIN:VCALENDAR\r\n'));
  assert.ok(ics.endsWith('END:VCALENDAR\r\n'));
  assert.match(ics, /DTSTART;VALUE=DATE:20261207\r\nDTEND;VALUE=DATE:20261209\r\n/, 'all-day DTEND is the day after the last day');
  assert.match(ics, /DTSTART:20261205T050000Z\r\nDTEND:20261205T070000Z\r\n/, 'times are converted to UTC');
  assert.match(ics, /SUMMARY:연수\\, 1회차\\; 기초\\\\과정\r\n/);
  assert.match(ics, /LOCATION:온라인\r\n/);
  assert.match(ics, /UID:timed@butter-note\.github\.io\r\n/);
  for (const line of ics.split('\r\n')) assert.ok(new TextEncoder().encode(line).length <= 75, `line over 75 octets: ${line}`);
  assert.match(ics.replace(/\r\n /g, ''), /DESCRIPTION:(긴 설명 ){30}\\n/, 'unfolding restores the text without broken characters');
});

test('folding never splits a multi-byte character', () => {
  const folded = foldIcsLine(`DESCRIPTION:${'가'.repeat(100)}`);
  const lines = folded.split('\r\n');
  assert.ok(lines.length > 1);
  for (const line of lines) {
    assert.ok(new TextEncoder().encode(line).length <= 75);
    assert.ok(!line.includes('�'));
  }
  assert.equal(folded.replace(/\r\n /g, ''), `DESCRIPTION:${'가'.repeat(100)}`);
});

test('subscribe links point calendar apps at the feed', () => {
  const links = calendarLinks('https://butter-note.github.io/schedule.ics');
  assert.equal(links.webcal, 'webcal://butter-note.github.io/schedule.ics');
  assert.equal(links.google, 'https://calendar.google.com/calendar/r?cid=webcal%3A%2F%2Fbutter-note.github.io%2Fschedule.ics');
});

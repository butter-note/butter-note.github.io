'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { calendarYears, eventsInMonth, monthKey, neighbourMonths, whenLabel, yearStrip, type ScheduleItem } from '@/lib/schedule';

type Selection = { year: number; month: number };

const monthParam = /^(\d{4})-(0[1-9]|1[0-2])$/;
const parseKey = (key: string): Selection => ({ year: Number(key.slice(0, 4)), month: Number(key.slice(5, 7)) });
const keyLabel = (key: string) => `${Number(key.slice(0, 4))}년 ${Number(key.slice(5, 7))}월`;

// ?month=YYYY-MM from the address. The server snapshot is null, so hydration matches the prerendered HTML.
const subscribe = (onChange: () => void) => {
  window.addEventListener('popstate', onChange);
  return () => window.removeEventListener('popstate', onChange);
};
const readMonthParam = () => new URLSearchParams(window.location.search).get('month');
const noMonthParam = () => null;

/**
 * Month-by-month browser for the schedule. The static HTML shows the current month; with JavaScript,
 * any year and month can be opened, and ?month=YYYY-MM keeps the choice in the address for sharing.
 */
export function ScheduleCalendar({ items, today }: { items: ScheduleItem[]; today: string }) {
  const current = useMemo(() => parseKey(today.slice(0, 7)), [today]);
  const range = useMemo(() => calendarYears(items, today), [items, today]);
  const urlMonth = useSyncExternalStore(subscribe, readMonthParam, noMonthParam);
  const [chosen, setChosen] = useState<Selection | null>(null);

  const match = monthParam.exec(urlMonth ?? '');
  const fromUrl = match && Number(match[1]) >= range.min && Number(match[1]) <= range.max ? parseKey(match[0]) : null;
  const selected = chosen ?? fromUrl ?? current;

  const select = (next: Selection) => {
    setChosen(next);
    const url = new URL(window.location.href);
    url.searchParams.set('month', monthKey(next.year, next.month));
    window.history.replaceState(window.history.state, '', url);
  };

  // Moving to another year keeps the month when it has events, otherwise opens that year's first month with events.
  const changeYear = (year: number) => {
    const months = yearStrip(items, year);
    const keep = months[selected.month - 1].count > 0;
    select({ year, month: keep ? selected.month : (months.find((month) => month.count > 0)?.month ?? selected.month) });
  };

  const months = yearStrip(items, selected.year);
  const events = eventsInMonth(items, selected.year, selected.month);
  const { previous, next } = neighbourMonths(items, selected.year, selected.month);

  return (
    <div className="schedule-calendar">
      <div className="calendar-head">
        <button className="calendar-nav" type="button" onClick={() => changeYear(selected.year - 1)} disabled={selected.year <= range.min} aria-label="이전 해">
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <h2 className="schedule-heading">{selected.year}년</h2>
        <button className="calendar-nav" type="button" onClick={() => changeYear(selected.year + 1)} disabled={selected.year >= range.max} aria-label="다음 해">
          <ChevronRight size={18} aria-hidden="true" />
        </button>
        <p className="calendar-hint">달을 누르면 그 달의 일정을 볼 수 있어요. 점이 있는 달에 일정이 있어요.</p>
      </div>

      <ol className="year-strip">
        {months.map((month) => {
          const isCurrent = selected.year === current.year && month.month === current.month;
          return (
            <li key={month.month}>
              <button
                type="button"
                aria-pressed={month.month === selected.month}
                className={[month.count ? 'has-event' : '', month.upcoming ? 'is-upcoming' : '', isCurrent ? 'is-current' : ''].filter(Boolean).join(' ')}
                onClick={() => select({ year: selected.year, month: month.month })}
              >
                <span>{month.month}월</span>
                <span className="sr-only">{month.count ? `일정 ${month.count}개` : '일정 없음'}{isCurrent ? ', 이번 달' : ''}</span>
                {month.count > 0 && <i aria-hidden="true" />}
              </button>
            </li>
          );
        })}
      </ol>

      <div className="month-panel">
        <h3 aria-live="polite">
          {selected.year}년 {selected.month}월 일정{events.length ? ` ${events.length}개` : ''}
        </h3>
        {events.length ? (
          <ul className="month-events">
            {events.map((item) => (
              <li className="month-event" key={item.id}>
                <div className="month-event-main">
                  <p className="month-event-when"><time dateTime={item.start}>{whenLabel(item)}</time></p>
                  <p className="month-event-title">{item.title}</p>
                  <p className="month-event-meta">{[item.category, item.mode, item.location].filter(Boolean).join(' · ')}</p>
                </div>
                <div className="month-event-side">
                  <span className={`status-pill ${item.upcoming ? 'is-upcoming' : 'is-past'}`}>{item.upcoming ? '예정' : '지난 일정'}</span>
                  {item.casePath ? (
                    <Link className="past-link" href={item.casePath}>사례 보기 <ArrowRight size={15} aria-hidden="true" /></Link>
                  ) : item.upcoming ? (
                    <a className="past-link" href={`#event-${item.slug}`}>신청·문의 <ArrowRight size={15} aria-hidden="true" /></a>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="month-empty">이 달에는 일정이 없어요.</p>
        )}
        {(previous || next) && (
          <div className="month-jump">
            {previous ? (
              <button type="button" onClick={() => select(parseKey(previous))}>
                <ChevronLeft size={16} aria-hidden="true" /> {keyLabel(previous)} 일정
              </button>
            ) : <span />}
            {next && (
              <button type="button" onClick={() => select(parseKey(next))}>
                {keyLabel(next)} 일정 <ChevronRight size={16} aria-hidden="true" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

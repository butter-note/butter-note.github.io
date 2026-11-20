import Link from 'next/link';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { getSchedule } from '@/lib/business-content';
import { whenLabel } from '@/lib/schedule';

/** The nearest upcoming event on the home page. Renders nothing when no event is scheduled. */
export function NextEvent() {
  const { upcoming } = getSchedule();
  const next = upcoming[0];
  if (!next) return null;
  const place = [next.mode, next.location].filter(Boolean).join(' · ');
  return (
    <section className="next-event" aria-label="다가오는 일정">
      <div className="site-container next-event-inner">
        <span className="next-event-label"><CalendarDays size={16} aria-hidden="true" /> 다가오는 일정</span>
        <Link className="next-event-main" href={`/schedule/#event-${next.slug}`}>
          <time dateTime={next.start}>{whenLabel(next)}</time>
          <strong>{next.title}</strong>
          {place && <span>{place}</span>}
        </Link>
        <Link className="arrow-link" href="/schedule/">
          {upcoming.length > 1 ? `일정 ${upcoming.length}개 모두 보기` : '전체 일정'} <ArrowRight aria-hidden="true" size={16} />
        </Link>
      </div>
    </section>
  );
}

import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CalendarPlus, Clock, MapPin, Users } from 'lucide-react';
import { BlogNav } from '@/components/blog-nav';
import { BusinessContact } from '@/components/business-contact';
import { JsonLd } from '@/components/json-ld';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { getSchedule } from '@/lib/business-content';
import { calendarLinks, dateBadge, groupByYear, shortDate, todayInKorea, whenLabel, yearStrip, type ScheduleItem } from '@/lib/schedule';
import { pageMetadata } from '@/lib/seo';
import { absoluteUrl, pages, site } from '@/lib/site';
import { eventSchema } from '@/lib/structured-data';

export const metadata: Metadata = pageMetadata(pages.schedule);

const inquiryLink = (title?: string) => `mailto:${site.email}${title ? `?subject=${encodeURIComponent(`[일정 문의] ${title}`)}` : ''}`;

function UpcomingCard({ item }: { item: ScheduleItem }) {
  const badge = dateBadge(item);
  return (
    <article className="event-card" id={`event-${item.slug}`}>
      <div className="event-date" aria-hidden="true">
        <span>{badge.month}</span>
        <strong>{badge.day}</strong>
        <span>{badge.weekday}</span>
      </div>
      <div className="event-body">
        <div className="event-tags">
          <span className="category-pill">{item.category}</span>
          {item.mode && <span className="category-pill">{item.mode}</span>}
        </div>
        <h3>{item.title}</h3>
        <ul className="event-meta">
          <li><Clock size={15} aria-hidden="true" /><time dateTime={item.start}>{whenLabel(item)}</time></li>
          {item.location && <li><MapPin size={15} aria-hidden="true" />{item.location}</li>}
          {item.audience && <li><Users size={15} aria-hidden="true" />{item.audience}</li>}
        </ul>
        {item.description && <p className="event-description">{item.description}</p>}
      </div>
      <div className="event-actions">
        {item.registrationUrl ? (
          <a className="button" href={item.registrationUrl} target="_blank" rel="noopener noreferrer">신청하기</a>
        ) : (
          <a className="button button-secondary" href={inquiryLink(item.title)}>문의하기</a>
        )}
      </div>
    </article>
  );
}

export default function SchedulePage() {
  const { upcoming, past } = getSchedule();
  const year = todayInKorea().slice(0, 4);
  const months = yearStrip([...upcoming, ...past], year);
  const currentMonth = Number(todayInKorea().slice(5, 7));
  const links = calendarLinks(absoluteUrl('/schedule.ics'));
  const events = upcoming.map((item) => eventSchema(item, pages.schedule.path)).filter((event) => event !== null);

  return (
    <main>
      <SiteHeader />
      {events.length > 0 && <JsonLd data={events} />}
      <section className="guides-hero business-hero">
        <div className="site-container guides-hero-grid">
          <div>
            <p className="eyebrow"><span /> SCHEDULE</p>
            <h1>일정</h1>
            <p>버터노트가 준비한 교육·강연·워크숍 일정이에요. 지난 일정은 구축 사례로 이어집니다.</p>
          </div>
          <Image src="/brand/characters/cheerful.png" width={250} height={250} alt="신나게 웃는 버터노트 캐릭터" />
        </div>
      </section>
      <BlogNav current="schedule" />

      <section className="schedule-section">
        <div className="site-container schedule-inner">
          <div className="schedule-subscribe">
            <p><CalendarPlus size={18} aria-hidden="true" /> 새 일정을 내 캘린더에서 바로 받아보세요.</p>
            <div className="schedule-subscribe-links">
              <a className="button button-small" href={links.google} target="_blank" rel="noopener noreferrer">구글 캘린더에 추가</a>
              <a className="button button-secondary button-small" href={links.webcal}>다른 캘린더 앱에서 구독</a>
            </div>
            <p className="schedule-feed">캘린더 주소로 직접 추가: <a href={links.feed}>{links.feed}</a></p>
          </div>

          {months.some((month) => month.count > 0) && (
            <div className="schedule-year">
              <h2 className="schedule-heading">{year}년 한눈에 보기</h2>
              <ol className="year-strip">
                {months.map((month) => (
                  <li
                    key={month.month}
                    className={[month.count ? 'has-event' : '', month.upcoming ? 'is-upcoming' : '', month.month === currentMonth ? 'is-current' : ''].filter(Boolean).join(' ')}
                  >
                    <span>{month.month}월</span>
                    <span className="sr-only">{month.count ? `일정 ${month.count}개` : '일정 없음'}</span>
                    {month.count > 0 && <i aria-hidden="true" />}
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="schedule-block">
            <h2 className="schedule-heading">다가오는 일정</h2>
            {upcoming.length ? (
              <div className="event-list">{upcoming.map((item) => <UpcomingCard item={item} key={item.id} />)}</div>
            ) : (
              <div className="catalog-empty schedule-empty">
                <h3>지금은 예정된 공개 일정이 없어요</h3>
                <p>팀이나 기관에 맞춘 교육 날짜는 따로 잡을 수 있어요. 원하는 시기와 인원을 알려주세요.</p>
                <div className="schedule-empty-actions">
                  <a className="button" href={inquiryLink()}>교육 문의하기</a>
                  <Link className="button button-secondary" href="/services/">교육·구축 안내 보기</Link>
                </div>
              </div>
            )}
          </div>

          {past.length > 0 && (
            <div className="schedule-block">
              <h2 className="schedule-heading">지난 일정</h2>
              {groupByYear(past).map(({ year: pastYear, entries }) => (
                <div className="past-year" key={pastYear}>
                  <h3>{pastYear}</h3>
                  <ol className="past-list">
                    {entries.map((item) => (
                      <li key={item.id} id={`event-${item.slug}`}>
                        <time dateTime={item.startDate}>{shortDate(item)}</time>
                        <span className="past-title">{item.title}</span>
                        <span className="category-pill">{item.category}</span>
                        {item.casePath ? (
                          <Link className="past-link" href={item.casePath}>사례 보기 <ArrowRight size={15} aria-hidden="true" /></Link>
                        ) : <span className="past-link" aria-hidden="true" />}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <BusinessContact />
      <SiteFooter />
    </main>
  );
}

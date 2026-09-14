import type { Metadata } from 'next';
import { ArrowUpRight, PlaySquare } from 'lucide-react';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { VideoPlayer } from '@/components/video-player';
import { getVideos } from '@/lib/videos';
import { CatalogBrowser } from '@/components/catalog-browser';

export const metadata: Metadata = {
  title: '무료 강의 | 버터노트',
  description: '노션이 처음이라면 영상으로 차근차근 따라 해보세요. 버터노트의 무료 노션 강의를 모았습니다.',
  alternates: { canonical: '/lectures/' },
};

export default function LecturesPage() {
  const lessons = getVideos();
  const hasPlayableVideo = lessons.some((lesson) => ['iframe', 'video'].includes(lesson.embed.kind));
  const hasOriginalLink = lessons.some((lesson) => lesson.embed.sourceUrl);
  return (
    <main>
      <SiteHeader />
      <section className="templates-hero">
        <div className="site-container templates-hero-grid">
          <div>
            <p className="eyebrow"><span /> FREE NOTION CLASS</p>
            <h1>눈으로 보고,<br />하나씩 따라 해봐요.</h1>
            <p>낯선 노션도 직접 따라 하면 조금 더 쉬워져요.<br />버터노트의 무료 강의로 차근차근 시작해보세요.</p>
          </div>
          <img src="/brand/characters/sparkle.png" alt="반짝이는 버터노트 캐릭터" />
        </div>
      </section>
      <section className="lessons-section" aria-labelledby="lessons-title">
        <div className="site-container">
          <div className="lessons-toolbar">
            <h2 id="lessons-title"><PlaySquare size={20} aria-hidden="true" /> 무료 강의 <span>{lessons.length}개</span></h2>
            {hasPlayableVideo && <p>영상을 누르면 큰 화면으로 볼 수 있어요.</p>}
          </div>
          {lessons.length ? (
            <CatalogBrowser
              label="무료 강의"
              listClassName="lessons-grid"
              pageSize={6}
              items={lessons.map((lesson) => ({ id: lesson.id, title: lesson.title, description: lesson.description, category: lesson.category }))}
            >
              {lessons.map((lesson) => (
                <article className="lesson-card" key={lesson.id} id={`lesson-${lesson.id}`}>
                  <VideoPlayer url={lesson.url} title={lesson.title} />
                  <div className="lesson-copy">
                    <div className="lesson-meta"><span className="category-pill">{lesson.category}</span><span>{lesson.embed.provider || '영상 준비 중'}</span></div>
                    <h3>{lesson.title}</h3>
                    {lesson.description && <p>{lesson.description}</p>}
                    <div className="lesson-bottom">
                      {lesson.date && <time dateTime={lesson.date}>{lesson.date.replaceAll('-', '. ')}</time>}
                      {lesson.embed.sourceUrl && <a href={lesson.embed.sourceUrl} target="_blank" rel="noopener noreferrer" aria-label={`${lesson.title} 원본 영상 보기 (새 탭)`}>원본 영상 보기 <ArrowUpRight size={16} aria-hidden="true" /></a>}
                    </div>
                  </div>
                </article>
              ))}
            </CatalogBrowser>
          ) : (
            <div className="template-empty-state">
              <img src="/brand/characters/paper.png" alt="강의를 준비하는 버터노트 캐릭터" />
              <h3>첫 무료 강의를 준비하고 있어요.</h3>
              <p>강의가 공개되면 이곳에서 바로 볼 수 있어요.</p>
              <a className="button button-secondary" href="/articles/">노션 가이드 먼저 읽기</a>
            </div>
          )}
          {hasOriginalLink && <p className="lessons-help">재생이 되지 않으면 ‘원본 영상 보기’를 눌러주세요. 영상은 각 제공 서비스의 플레이어에서 재생됩니다.</p>}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

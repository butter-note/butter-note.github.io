import {
  ArrowRight,
  BookOpen,
  Check,
  Mail,
} from 'lucide-react';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { getPosts } from '@/lib/posts';

export default function Home() {
  const articles = getPosts().slice(0, 3);

  return (
    <main>
      <SiteHeader />

      <section className="hero" id="top">
        <div className="site-container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow"><span /> NOTION ONBOARDING STUDIO</p>
            <h1>
              낯선 노션을,
              <br />
              우리 팀의 <mark>일하는 방식</mark>으로.
            </h1>
            <p className="hero-description">
              배우기 쉬운 교육과 우리 팀에 꼭 맞는 시스템으로,
              <br className="desktop-only" /> 노션이 실제 업무에 자연스럽게 스며들도록 돕습니다.
            </p>
            <p className="hand-note">처음이어도 괜찮아요. 버터노트가 함께할게요!</p>
            <div className="hero-actions">
              <a className="button" href="/articles">
                노션 가이드 보기 <ArrowRight aria-hidden="true" size={18} />
              </a>
              <a className="button button-secondary" href="/services">
                교육·구축 상담하기
              </a>
            </div>
          </div>

          <div className="notion-scene" aria-label="버터노트의 노션 교육 페이지 예시">
            <div className="notion-page">
              <div className="notion-topbar">
                <span className="window-dot" />
                <span className="window-dot" />
                <span className="window-dot" />
                <span className="notion-path">버터노트 / 팀 온보딩</span>
              </div>
              <div className="notion-content">
                <span className="notion-icon">🧈</span>
                <p className="notion-label">TEAM WORKSPACE</p>
                <h2>우리 팀 노션 시작하기</h2>
                <p className="notion-muted">모두가 같은 곳에서 찾고, 기록하고, 이어서 일해요.</p>
                <div className="notion-callout">
                  <BookOpen aria-hidden="true" size={19} />
                  <span>처음 사용하는 팀원을 위한 10분 가이드</span>
                </div>
                <ul className="notion-checklist">
                  <li><span><Check aria-hidden="true" size={14} /></span> 내 업무 페이지 찾기</li>
                  <li><span><Check aria-hidden="true" size={14} /></span> 오늘 할 일 업데이트하기</li>
                  <li><span><Check aria-hidden="true" size={14} /></span> 팀원에게 공유하기</li>
                </ul>
              </div>
            </div>
            <img
              className="hero-character"
              src="/brand/characters/sparkle.png"
              alt="반짝이는 표정의 버터노트 캐릭터"
            />
            <span className="sticker sticker-one">✦</span>
            <span className="sticker sticker-two">✦</span>
          </div>
        </div>
      </section>

      <section className="guide-section" id="guides">
        <div className="site-container">
          <div className="section-heading">
            <div>
              <p className="eyebrow"><span /> START HERE</p>
              <h2>처음이라면, 여기부터</h2>
              <p>노션의 낯선 기능을 실제 업무의 언어로 설명합니다.</p>
            </div>
            <a className="arrow-link" href="/articles">
              모든 글 보기 <ArrowRight aria-hidden="true" size={17} />
            </a>
          </div>

          <div className="article-grid">
            {articles.map((article) => (
              <a className="article-card" href={`/articles/${article.slug}`} key={article.title}>
                <div className="article-topline">
                  <span className="category-pill">{article.category}</span>
                  <img src={article.character} alt="" aria-hidden="true" />
                </div>
                <h3>{article.title}</h3>
                <p>{article.description}</p>
                <div className="article-meta">
                  <span>{article.readTime} 읽기</span>
                  <ArrowRight aria-hidden="true" size={18} />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="about-strip" id="about">
        <div className="site-container about-grid">
          <img src="/brand/characters/smile.png" alt="웃고 있는 버터노트 캐릭터" />
          <div>
            <p className="eyebrow eyebrow-dark"><span /> BUTTER NOTE</p>
            <h2>잘 만든 시스템보다,<br />계속 쓰이는 시스템.</h2>
          </div>
          <p>
            버터노트는 도구만 알려주지 않습니다. 팀의 업무 흐름을 이해하고,
            누구나 쉽게 배우며 오래 사용할 수 있는 노션 시스템을 함께 만듭니다.
          </p>
        </div>
      </section>

      <section className="process-section" id="process">
        <div className="site-container process-grid">
          <div className="process-heading">
            <p className="eyebrow"><span /> HOW WE WORK</p>
            <h2>버터노트가<br />함께하는 방식</h2>
            <p className="hand-note">복잡한 시스템도 한 단계씩, 부드럽게.</p>
          </div>
          <ol className="process-list">
            <li><span>01</span><div><h3>업무 흐름 이해하기</h3><p>인터뷰를 통해 팀의 일과 정보가 움직이는 방식을 살펴봐요.</p></div></li>
            <li><span>02</span><div><h3>노션 시스템 설계·구축하기</h3><p>필요한 데이터베이스와 페이지를 알기 쉽게 연결해요.</p></div></li>
            <li><span>03</span><div><h3>교육하고 함께 정착하기</h3><p>실제 업무로 연습하고 운영 규칙과 개선 방법까지 남겨드려요.</p></div></li>
          </ol>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div className="site-container contact-card">
          <img src="/brand/characters/heart.png" alt="하트를 보내는 버터노트 캐릭터" />
          <div className="contact-copy">
            <p className="eyebrow"><span /> LET&apos;S TALK</p>
            <h2>우리 팀에 맞는 노션,<br />함께 만들어볼까요?</h2>
            <p>교육부터 시스템 구축까지 편하게 이야기해 주세요.</p>
          </div>
          <div className="contact-actions">
            <a className="button" href="mailto:butternote.notion@gmail.com">
              <Mail aria-hidden="true" size={18} /> 이메일 문의
            </a>
            <a className="social-link" href="https://www.instagram.com/butternote.notion/" target="_blank" rel="noreferrer">
              Instagram · @butternote.notion
            </a>
            <a className="social-link" href="https://www.threads.net/@butternote.notion" target="_blank" rel="noreferrer">
              Threads · @butternote.notion
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

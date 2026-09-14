import { Menu } from 'lucide-react';

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-container header-inner">
        <a className="brand-logo" href="/" aria-label="버터노트 홈">
          <span className="logo-crop"><img src="/brand/logo.png" alt="버터노트" /></span>
        </a>
        <nav className="desktop-nav" aria-label="주요 메뉴">
          <a href="/articles">노션 가이드(아티클)</a>
          <a href="/lectures/">무료 강의</a>
          <a href="/about">버터노트 소개</a>
          <a href="/services">교육·구축</a>
          <a href="/templates">템플릿</a>
        </nav>
        <div className="header-actions">
          <a className="text-link desktop-only" href="mailto:butternote.notion@gmail.com">이메일 문의</a>
          <a className="button button-small" href="/#contact">상담하기</a>
          <details className="mobile-menu">
            <summary aria-label="메뉴 열기"><Menu aria-hidden="true" size={21} /></summary>
            <nav aria-label="모바일 메뉴">
              <a href="/articles">노션 가이드(아티클)</a>
              <a href="/lectures/">무료 강의</a>
              <a href="/about">버터노트 소개</a>
              <a href="/services">교육·구축</a>
              <a href="/templates">템플릿</a>
              <a href="mailto:butternote.notion@gmail.com">이메일 문의</a>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}

import { Menu } from 'lucide-react';

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-container header-inner">
        <a className="brand-logo" href="/" aria-label="버터노트 홈">
          <span className="logo-crop"><img src="/brand/logo.png" alt="버터노트" /></span>
        </a>
        <nav className="desktop-nav" aria-label="주요 메뉴">
          <a href="/#about">버터노트 소개</a>
          <a href="/guides">노션 가이드</a>
          <a href="/#process">교육·구축</a>
        </nav>
        <div className="header-actions">
          <a className="text-link desktop-only" href="mailto:butternote.notion@gmail.com">이메일 문의</a>
          <a className="button button-small" href="/#contact">상담하기</a>
          <details className="mobile-menu">
            <summary aria-label="메뉴 열기"><Menu aria-hidden="true" size={21} /></summary>
            <nav aria-label="모바일 메뉴">
              <a href="/#about">버터노트 소개</a>
              <a href="/guides">노션 가이드</a>
              <a href="/#process">교육·구축</a>
              <a href="mailto:butternote.notion@gmail.com">이메일 문의</a>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}

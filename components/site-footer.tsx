export function SiteFooter() {
  return (
    <footer>
      <div className="site-container footer-inner">
        <span>© BUTTER NOTE</span>
        <nav className="footer-links" aria-label="콘텐츠 바로가기"><a href="/articles/">노션 블로그</a><a href="/cases/">구축 사례</a><a href="/faq/">FAQ</a></nav>
        <span>노션을 배우고, 팀의 시스템을 만듭니다.</span>
      </div>
    </footer>
  );
}

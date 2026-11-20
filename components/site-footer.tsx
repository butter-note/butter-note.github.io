import Link from 'next/link';
import { site } from '@/lib/site';

export function SiteFooter() {
  // 정적 빌드 시점의 연도입니다. 배포가 주기적으로 실행되므로 해마다 자동 갱신됩니다.
  const year = new Date().getFullYear();
  const business = [
    site.representative && `대표 ${site.representative}`,
    site.businessNumber && `사업자등록번호 ${site.businessNumber}`,
    site.address,
  ].filter(Boolean);

  return (
    <footer>
      <div className="site-container footer-inner">
        <div className="footer-row">
          <nav className="footer-links" aria-label="콘텐츠 바로가기">
            <Link href="/articles/">노션 블로그</Link>
            <Link href="/cases/">구축 사례</Link>
            <Link href="/schedule/">일정</Link>
            <Link href="/faq/">FAQ</Link>
            <Link href="/lectures/">무료 강의</Link>
            <Link href="/templates/">템플릿</Link>
          </nav>
          <nav className="footer-links" aria-label="법적 안내">
            <Link href="/privacy/"><strong>개인정보처리방침</strong></Link>
            <Link href="/terms/">이용약관·저작권 안내</Link>
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </nav>
        </div>
        {business.length > 0 && (
          <p className="footer-business">
            {business.map((item) => <span key={item}>{item}</span>)}
          </p>
        )}
        <div className="footer-row">
          <small>© {year} {site.name} ({site.englishName}). All rights reserved.</small>
          <span>노션을 배우고, 팀의 시스템을 만듭니다.</span>
        </div>
      </div>
    </footer>
  );
}

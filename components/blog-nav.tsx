import Link from 'next/link';

const sections = [
  { id: 'articles', href: '/articles/', label: '노션 블로그' },
  { id: 'cases', href: '/cases/', label: '구축 사례' },
  { id: 'faq', href: '/faq/', label: 'FAQ' },
] as const;

export function BlogNav({ current }: { current: typeof sections[number]['id'] }) {
  return (
    <nav className="blog-nav" aria-label="블로그 메뉴">
      <div className="site-container blog-nav-inner">
        {sections.map(({ id, href, label }) => <Link key={id} href={href} aria-current={current === id ? 'page' : undefined}>{label}</Link>)}
      </div>
    </nav>
  );
}

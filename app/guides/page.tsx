import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: '노션 블로그 | 버터노트',
  alternates: { canonical: '/articles/' },
};

export default function GuidesPage() {
  return (
    <main>
      <meta httpEquiv="refresh" content="0;url=/articles/" />
      <section className="legacy-redirect">
        <p>노션 블로그로 이동합니다.</p>
        <a className="button" href="/articles/">노션 블로그로 이동</a>
      </section>
    </main>
  );
}

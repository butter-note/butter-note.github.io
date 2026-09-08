import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: '노션 가이드(아티클) | 버터노트',
  alternates: { canonical: '/articles/' },
};

export default function GuidesPage() {
  return (
    <main>
      <meta httpEquiv="refresh" content="0;url=/articles/" />
      <section className="legacy-redirect">
        <p>노션 가이드와 아티클을 한곳으로 옮겼습니다.</p>
        <a className="button" href="/articles/">통합 페이지로 이동</a>
      </section>
    </main>
  );
}

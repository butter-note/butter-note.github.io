import type { Metadata } from 'next';
import { getPosts } from '@/lib/posts';

export const dynamicParams = false;

export function generateStaticParams() {
  return getPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: '노션 가이드(아티클) | 버터노트',
    alternates: { canonical: `/articles/${slug}/` },
  };
}

export default async function GuidePostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const target = `/articles/${slug}/`;

  return (
    <main>
      <meta httpEquiv="refresh" content={`0;url=${target}`} />
      <section className="legacy-redirect">
        <p>이 글은 통합된 노션 가이드(아티클)에서 이어집니다.</p>
        <a className="button" href={target}>글로 이동</a>
      </section>
    </main>
  );
}

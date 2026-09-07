import type { Metadata } from 'next';
import { ArrowLeft, Mail } from 'lucide-react';
import { notFound } from 'next/navigation';
import { NotionMarkdown } from '@/components/notion-markdown';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { getPostBySlug, getPosts } from '@/lib/posts';

export function generateStaticParams() {
  return getPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} | 버터노트`,
    description: post.description,
    openGraph: { title: post.title, description: post.description, images: [] },
    twitter: { card: 'summary', title: post.title, description: post.description, images: [] },
  };
}

export default async function GuidePostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <main>
      <SiteHeader />
      <article className="post-page">
        <header className="post-header site-container">
          <a className="back-link" href="/guides"><ArrowLeft aria-hidden="true" size={16} /> 노션 가이드</a>
          <span className="category-pill">{post.category}</span>
          <h1>{post.title}</h1>
          <p>{post.description}</p>
          <div className="post-meta"><span>{post.date.replaceAll('-', '. ')}</span><span>{post.readTime} 읽기</span></div>
          <img src={post.character} alt="버터노트 캐릭터" />
        </header>
        <div className="post-layout site-container">
          <aside className="post-aside">
            <span>이 글의 안내자</span>
            <img src="/brand/characters/neutral.png" alt="버터노트 캐릭터" />
            <p>막히는 부분이 있다면 천천히 따라와 주세요.</p>
          </aside>
          <NotionMarkdown content={post.content} />
        </div>
      </article>
      <section className="article-contact">
        <div className="site-container article-contact-inner">
          <img src="/brand/characters/heart.png" alt="하트를 보내는 버터노트 캐릭터" />
          <div><h2>우리 팀의 노션도 바꿔보고 싶나요?</h2><p>교육과 시스템 구축 방법을 함께 찾아드릴게요.</p></div>
          <a className="button" href="mailto:butternote.notion@gmail.com"><Mail aria-hidden="true" size={18} /> 상담 문의</a>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

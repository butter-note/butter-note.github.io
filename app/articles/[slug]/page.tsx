import type { Metadata } from 'next';
import { ArrowLeft, Mail } from 'lucide-react';
import { notFound } from 'next/navigation';
import { NotionMarkdown } from '@/components/notion-markdown';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { getPostBySlug, getPosts } from '@/lib/posts';

export const dynamicParams = false;

export function generateStaticParams() {
  return getPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return { title: '아티클을 찾을 수 없습니다 | 버터노트' };
  }

  return {
    title: `${post.title} | 버터노트`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      images: [],
    },
    twitter: {
      title: post.title,
      description: post.description,
      images: [],
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <main>
      <SiteHeader />
      <article className="article-page">
        <header className="article-header site-container">
          <a className="article-back" href="/articles"><ArrowLeft aria-hidden="true" size={17} /> 노션 가이드(아티클)로 돌아가기</a>
          <span className="category-pill active">{post.category}</span>
          <h1>{post.title}</h1>
          <p>{post.description}</p>
          <div className="article-meta">{post.date.replaceAll('-', '. ')} · {post.readTime} 읽기</div>
        </header>
        <div className="article-body site-container">
          <NotionMarkdown content={post.content} />
        </div>
      </article>
      <section className="article-contact">
        <div className="site-container article-contact-inner">
          <div>
            <p className="eyebrow"><span /> NEED A HAND?</p>
            <h2>우리 팀의 노션도<br />함께 정리해볼까요?</h2>
          </div>
          <a className="button" href="mailto:butternote.notion@gmail.com"><Mail aria-hidden="true" size={18} /> 상담 문의</a>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

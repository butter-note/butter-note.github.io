import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';
import { notFound } from 'next/navigation';
import { NotionMarkdown } from '@/components/notion-markdown';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { getPostBySlug, getPostStaticParams } from '@/lib/posts';

export const dynamicParams = false;

export function generateStaticParams() {
  return getPostStaticParams();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return { title: '게시글을 찾을 수 없습니다 | 버터노트' };
  }

  return {
    title: post.seoTitle || `${post.title} | 버터노트`,
    description: post.seoDescription || post.description,
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.description,
      type: 'article',
      images: [],
    },
    twitter: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.description,
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
          <Link className="article-back" href="/articles"><ArrowLeft aria-hidden="true" size={17} /> 노션 블로그로 돌아가기</Link>
          <span className="category-pill active">{post.category}</span>
          <h1>{post.title}</h1>
          <p>{post.description}</p>
          <div className="article-detail-meta">{post.date.replaceAll('-', '. ')} · {post.readTime} 읽기</div>
        </header>
        <div className="article-body site-container">
          <NotionMarkdown content={post.content} title={post.title} flavor={post.format ?? (post.notionPageId ? 'notion' : 'markdown')} />
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

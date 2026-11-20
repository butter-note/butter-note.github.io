import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/json-ld';
import { NotionMarkdown } from '@/components/notion-markdown';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { firstImage, getPostBySlug, getPostStaticParams, hasOwnDescription, postFlavor, postSummary } from '@/lib/posts';
import { pageMetadata } from '@/lib/seo';
import { articleSchema, breadcrumbSchema } from '@/lib/structured-data';

export const dynamicParams = false;

export function generateStaticParams() {
  return getPostStaticParams();
}

const dotDate = (date: string) => date.replaceAll('-', '. ');

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return { title: '게시글을 찾을 수 없습니다 | 버터노트' };
  }

  const image = firstImage(post.content);
  return pageMetadata({
    title: post.seoTitle || `${post.title} | 버터노트`,
    socialTitle: post.seoTitle || post.title,
    description: post.seoDescription || postSummary(post),
    path: `/articles/${post.slug}/`,
    image: image ? { url: image, alt: post.title } : undefined,
    article: { publishedTime: post.date, modifiedTime: post.updated, section: post.category, tags: [post.category, '노션', 'Notion'] },
  });
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const path = `/articles/${post.slug}/`;
  const minutes = Number.parseInt(post.readTime, 10);
  const updated = post.updated && post.updated > post.date ? post.updated : undefined;

  return (
    <main>
      <SiteHeader />
      <JsonLd
        data={[
          articleSchema({
            title: post.title,
            description: post.seoDescription || postSummary(post),
            path,
            datePublished: post.date,
            dateModified: post.updated,
            section: post.category,
            keywords: [post.category, '노션', 'Notion'],
            image: firstImage(post.content),
            minutes: Number.isFinite(minutes) ? minutes : undefined,
          }),
          breadcrumbSchema([{ name: '홈', path: '/' }, { name: '노션 블로그', path: '/articles/' }, { name: post.title, path }]),
        ]}
      />
      <article className="article-page">
        <header className="article-header site-container">
          <Link className="article-back" href="/articles/"><ArrowLeft aria-hidden="true" size={17} /> 노션 블로그로 돌아가기</Link>
          <span className="category-pill active">{post.category}</span>
          <h1>{post.title}</h1>
          {hasOwnDescription(post) && <p>{post.description}</p>}
          <div className="article-detail-meta">
            <time dateTime={post.date}>{dotDate(post.date)}</time> · {post.readTime} 읽기 · 글 <Link href="/about/">버터노트</Link>
            {updated && <> · 수정 <time dateTime={updated}>{dotDate(updated)}</time></>}
          </div>
        </header>
        <div className="article-body site-container">
          <NotionMarkdown content={post.content} title={post.title} flavor={postFlavor(post)} />
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

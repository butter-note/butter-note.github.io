import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { BusinessContact } from '@/components/business-contact';
import { JsonLd } from '@/components/json-ld';
import { NotionMarkdown } from '@/components/notion-markdown';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { caseSummary, getCaseStudyBySlug, getCaseStudyStaticParams } from '@/lib/business-content';
import { firstImage } from '@/lib/posts';
import { pageMetadata } from '@/lib/seo';
import { articleSchema, breadcrumbSchema } from '@/lib/structured-data';

export const dynamicParams = false;
export const generateStaticParams = getCaseStudyStaticParams;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const entry = getCaseStudyBySlug(slug);
  if (!entry) return { title: '구축 사례를 찾을 수 없습니다 | 버터노트' };
  const image = firstImage(entry.content);
  return pageMetadata({
    title: `${entry.title} | 버터노트 구축 사례`,
    socialTitle: entry.title,
    description: caseSummary(entry),
    path: `/cases/${entry.slug}/`,
    image: image ? { url: image, alt: entry.title } : undefined,
    article: { publishedTime: entry.date || undefined, modifiedTime: entry.updated, section: '구축 사례', tags: [entry.category, entry.industry].filter(Boolean) },
  });
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = getCaseStudyBySlug(slug);
  if (!entry) notFound();
  const path = `/cases/${entry.slug}/`;
  return (
    <main>
      <SiteHeader />
      <JsonLd
        data={[
          articleSchema({
            type: 'Article',
            title: entry.title,
            description: caseSummary(entry),
            path,
            datePublished: entry.date || undefined,
            dateModified: entry.updated,
            section: '구축 사례',
            keywords: [entry.category, entry.industry, '노션 구축'],
            image: firstImage(entry.content),
          }),
          breadcrumbSchema([{ name: '홈', path: '/' }, { name: '구축 사례', path: '/cases/' }, { name: entry.title, path }]),
        ]}
      />
      <article className="article-page">
        <header className="article-header site-container">
          <Link className="article-back" href="/cases/"><ArrowLeft size={17} aria-hidden="true" /> 구축 사례로 돌아가기</Link>
          <span className="category-pill active">{entry.category}</span>
          <h1>{entry.title}</h1>
          {entry.description && <p>{entry.description}</p>}
          {(entry.industry || entry.date) && (
            <div className="article-detail-meta">
              {entry.industry}
              {entry.industry && entry.date && ' · '}
              {entry.date && <time dateTime={entry.date}>{entry.date.replaceAll('-', '. ')}</time>}
            </div>
          )}
        </header>
        <div className="article-body site-container"><NotionMarkdown content={entry.content} title={entry.title} /></div>
      </article>
      <BusinessContact />
      <SiteFooter />
    </main>
  );
}

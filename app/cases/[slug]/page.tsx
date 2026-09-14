import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { NotionMarkdown } from '@/components/notion-markdown';
import { BusinessContact } from '@/components/business-contact';
import { getCaseStudyBySlug, getCaseStudyStaticParams } from '@/lib/business-content';

export const dynamicParams = false;
export const generateStaticParams = getCaseStudyStaticParams;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const entry = getCaseStudyBySlug(slug);
  return entry ? {
    title: `${entry.title} | 버터노트 구축 사례`,
    description: entry.description,
    openGraph: { title: entry.title, description: entry.description, type: 'article', images: [] },
  } : { title: '구축 사례를 찾을 수 없습니다 | 버터노트' };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = getCaseStudyBySlug(slug);
  if (!entry) notFound();
  return (
    <main>
      <SiteHeader />
      <article className="article-page">
        <header className="article-header site-container">
          <Link className="article-back" href="/cases/"><ArrowLeft size={17} aria-hidden="true" /> 구축 사례로 돌아가기</Link>
          <span className="category-pill active">{entry.category}</span>
          <h1>{entry.title}</h1>
          {entry.description && <p>{entry.description}</p>}
          {(entry.industry || entry.date) && <div className="article-detail-meta">{[entry.industry, entry.date.replaceAll('-', '. ')].filter(Boolean).join(' · ')}</div>}
        </header>
        <div className="article-body site-container"><NotionMarkdown content={entry.content} title={entry.title} /></div>
      </article>
      <BusinessContact />
      <SiteFooter />
    </main>
  );
}

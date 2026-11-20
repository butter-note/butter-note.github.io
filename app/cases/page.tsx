import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { BlogNav } from '@/components/blog-nav';
import { BusinessContact } from '@/components/business-contact';
import { CatalogBrowser } from '@/components/catalog-browser';
import { JsonLd } from '@/components/json-ld';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { getCaseStudies } from '@/lib/business-content';
import { pageMetadata } from '@/lib/seo';
import { pages } from '@/lib/site';
import { collectionSchema } from '@/lib/structured-data';

export const metadata: Metadata = pageMetadata(pages.cases);

export default function CasesPage() {
  const cases = getCaseStudies();
  return (
    <main>
      <SiteHeader />
      <JsonLd
        data={collectionSchema({
          name: pages.cases.label,
          description: pages.cases.description,
          path: pages.cases.path,
          items: cases.map((entry) => ({ name: entry.title, path: `/cases/${entry.slug}/` })),
        })}
      />
      <section className="guides-hero business-hero">
        <div className="site-container guides-hero-grid">
          <div>
            <p className="eyebrow"><span /> CASE STUDIES</p>
            <h1>구축 사례</h1>
            <p>어떤 고민에서 시작해, 어떻게 일하는 방식을 바꿨을까요? 팀에 맞는 노션을 함께 만든 과정을 담습니다.</p>
          </div>
          <Image src="/brand/characters/sparkle.png" width={250} height={250} alt="자신 있게 웃는 버터노트 캐릭터" />
        </div>
      </section>
      <BlogNav current="cases" />
      <section className="guides-list-section">
        <div className="site-container">
          <CatalogBrowser label="구축 사례" listClassName="case-grid" pageSize={6}
            emptyTitle="구축 이야기를 준비하고 있어요."
            emptyDescription="공개된 구축 사례가 등록되면 이곳에서 만나볼 수 있어요."
            items={cases.map((entry) => ({ id: entry.id, title: entry.title, description: `${entry.description} ${entry.industry}`, category: entry.category }))}>
            {cases.map((entry) => (
              <Link className="case-card" href={`/cases/${entry.slug}/`} key={entry.id}>
                <div className="case-card-top"><span className="category-pill">{entry.category}</span><Image src="/brand/characters/paper.png" width={90} height={80} alt="" /></div>
                {entry.industry && <p className="case-industry">{entry.industry}</p>}
                <h2>{entry.title}</h2>
                {entry.description && <p className="case-description">{entry.description}</p>}
                <span className="case-card-bottom">사례 자세히 보기 <ArrowRight size={19} aria-hidden="true" /></span>
              </Link>
            ))}
          </CatalogBrowser>
        </div>
      </section>
      <BusinessContact />
      <SiteFooter />
    </main>
  );
}

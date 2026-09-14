import type { Metadata } from 'next';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { BlogNav } from '@/components/blog-nav';
import { BusinessContact } from '@/components/business-contact';
import { CatalogBrowser } from '@/components/catalog-browser';
import { NotionMarkdown } from '@/components/notion-markdown';
import { getFaqs } from '@/lib/business-content';

export const metadata: Metadata = {
  title: '자주 묻는 질문 | 버터노트',
  description: '노션 사용과 버터노트의 교육·시스템 구축에 대해 자주 묻는 질문을 확인해보세요.',
};

export default function FaqPage() {
  const faqs = getFaqs();
  return (
    <main>
      <SiteHeader />
      <section className="guides-hero business-hero">
        <div className="site-container guides-hero-grid">
          <div>
            <p className="eyebrow"><span /> FREQUENTLY ASKED</p>
            <h1>자주 묻는 질문</h1>
            <p>노션 사용부터 교육과 구축까지, 궁금한 점을 모았어요. 질문을 누르면 답변을 볼 수 있습니다.</p>
          </div>
          <Image src="/brand/characters/question.png" width={250} height={250} alt="궁금한 표정의 버터노트 캐릭터" />
        </div>
      </section>
      <BlogNav current="faq" />
      <section className="guides-list-section">
        <div className="site-container">
          <CatalogBrowser label="질문" listClassName="faq-list" pageSize={8}
            searchPlaceholder="질문, 답변, 카테고리 검색"
            emptyTitle="궁금한 점이 있으신가요?"
            emptyDescription="자주 묻는 질문을 준비하고 있어요. 먼저 궁금한 점은 이메일로 편하게 문의해주세요."
            items={faqs.map((entry) => ({ id: entry.id, title: entry.title, description: `${entry.description} ${entry.content}`, category: entry.category }))}>
            {faqs.map((entry) => (
              <details className="faq-item" key={entry.id}>
                <summary>
                  <span className="faq-question-mark" aria-hidden="true">Q.</span>
                  <span className="faq-question"><span className="category-pill">{entry.category}</span><span>{entry.title}</span></span>
                  <ChevronDown className="faq-chevron" size={20} aria-hidden="true" />
                </summary>
                <div className="faq-answer"><NotionMarkdown content={entry.content} title={entry.title} idPrefix={`faq-${entry.id}`} /></div>
              </details>
            ))}
          </CatalogBrowser>
        </div>
      </section>
      <BusinessContact />
      <SiteFooter />
    </main>
  );
}

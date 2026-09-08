import type { Metadata } from 'next';
import { ArrowUpRight, Database, ExternalLink } from 'lucide-react';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { getTemplates } from '@/lib/templates';

export const metadata: Metadata = {
  title: '노션 템플릿 | 버터노트',
  description: '버터노트의 노션 템플릿과 판매처를 갤러리에서 한눈에 확인하세요.',
};

export default function TemplatesPage() {
  const templates = getTemplates();

  return (
    <main>
      <SiteHeader />
      <section className="templates-hero">
        <div className="site-container templates-hero-grid">
          <div><p className="eyebrow"><span /> BUTTER NOTE TEMPLATE</p><h1>바로 써보고,<br />우리 방식으로 다듬어요.</h1><p>버터노트가 만든 노션 템플릿과 구매할 수 있는 판매처를 한곳에 모았습니다.</p></div>
          <img src="/brand/characters/wink.png" alt="윙크하는 버터노트 캐릭터" />
        </div>
      </section>

      <section className="template-database-section">
        <div className="site-container">
          <div className="database-toolbar">
            <div><Database aria-hidden="true" size={18} /><strong>템플릿 데이터베이스</strong><span>{templates.length}개</span></div>
            <div className="database-view-tabs" aria-label="판매처"><span className="active">전체</span><a href="https://www.notion.com/templates" target="_blank" rel="noreferrer">Notion Marketplace</a><a href="https://ctee.kr/" target="_blank" rel="noreferrer">CTEE</a></div>
          </div>
          {templates.length ? (
            <div className="template-gallery">
              {templates.map((item) => (
                <article className="template-card" key={item.id}>
                  <div className="template-cover"><img src={item.cover} alt="" aria-hidden="true" />{item.featured && <span>추천</span>}</div>
                  <div className="template-card-body">
                    <div className="template-card-meta"><span>{item.category}</span><span className={`status status-${item.status.includes('준비') || item.status === '기획' ? 'soon' : 'live'}`}>{item.status}</span></div>
                    <h2>{item.name}</h2><p>{item.description}</p>
                    {item.version && <span className="template-version">v{item.version}{item.updatedAt ? ` · ${item.updatedAt.replaceAll('-', '. ')}` : ''}</span>}
                    <div className="template-listings">
                      {item.listings.length ? item.listings.map((listing) => (
                        listing.url ? (
                          <a href={listing.url} target={listing.url.startsWith('http') ? '_blank' : undefined} rel={listing.url.startsWith('http') ? 'noreferrer' : undefined} key={listing.id}>
                            <span><strong>{listing.marketplace}</strong><small>{listing.priceLabel}</small></span>
                            <span>{listing.buttonLabel}<ArrowUpRight aria-hidden="true" size={16} /></span>
                          </a>
                        ) : (
                          <div className="template-listing-soon" key={listing.id}>
                            <span><strong>{listing.marketplace}</strong><small>{listing.priceLabel}</small></span>
                            <span>{listing.buttonLabel}</span>
                          </div>
                        )
                      )) : <div className="template-listing-empty">판매 링크 준비 중</div>}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="template-empty-state">
              <img src="/brand/characters/sleep.png" alt="잠든 버터노트 캐릭터" />
              <h2>첫 템플릿을 준비하고 있어요.</h2>
              <p>노션 데이터베이스에 템플릿을 추가하면 이곳에 자동으로 나타납니다.</p>
            </div>
          )}
          <aside className="marketplace-note"><div><ExternalLink aria-hidden="true" size={20} /><strong>판매는 각 마켓에서 진행됩니다.</strong><p>새 템플릿을 노션 데이터베이스에 추가하면 이 갤러리에도 이어서 반영할 수 있도록 구성했습니다.</p></div><img src="/brand/characters/neutral.png" alt="버터노트 캐릭터" /></aside>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

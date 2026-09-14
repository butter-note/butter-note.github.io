'use client';

import { Fragment, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { RotateCcw, Search, X } from 'lucide-react';
import { filterCatalog, getCatalogFacets, type CatalogItem } from '@/lib/catalog-search';

type CatalogBrowserProps = {
  items: CatalogItem[];
  children: ReactNode[];
  label: string;
  listClassName: string;
  showMarketplaceFilter?: boolean;
};

/** Cards stay server-rendered; only public search metadata is sent to this control. */
export function CatalogBrowser({ items, children, label, listClassName, showMarketplaceFilter = false }: CatalogBrowserProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [marketplace, setMarketplace] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const id = useId();
  const resultsId = `${id}-results`;
  const categories = useMemo(() => getCatalogFacets(items, 'category'), [items]);
  const marketplaces = useMemo(() => getCatalogFacets(items, 'marketplace'), [items]);
  const visibleIds = useMemo(() => new Set(filterCatalog(items, { query, category, marketplace }).map((item) => item.id)), [items, query, category, marketplace]);
  const hasFilters = Boolean(query || category || marketplace);

  function resetFilters() {
    setQuery('');
    setCategory('');
    setMarketplace('');
    searchRef.current?.focus();
  }

  return (
    <div className="catalog-browser">
      <div className="catalog-controls">
        <search aria-label={`${label} 검색`}>
          <label className="catalog-search-label" htmlFor={`${id}-search`}>{label} 검색</label>
          <div className="catalog-search-field">
            <Search size={20} aria-hidden="true" />
            <input
              ref={searchRef}
              id={`${id}-search`}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={showMarketplaceFilter ? '제목, 설명, 카테고리, 판매처 검색' : '제목, 설명, 카테고리 검색'}
              maxLength={200}
              autoComplete="off"
              spellCheck={false}
              aria-controls={resultsId}
            />
            {query && <button className="catalog-search-clear" type="button" aria-label="검색어 지우기" onClick={() => { setQuery(''); searchRef.current?.focus(); }}><X size={18} aria-hidden="true" /></button>}
          </div>
        </search>
        {categories.length > 0 && (
          <fieldset className="catalog-filters">
            <legend>카테고리</legend>
            <div className="catalog-filter-options">
              {['', ...categories].map((value) => <button className="catalog-filter" type="button" key={value} aria-pressed={category === value} aria-controls={resultsId} onClick={() => setCategory(value)}>{value || '전체'}</button>)}
            </div>
          </fieldset>
        )}
        {showMarketplaceFilter && marketplaces.length > 0 && (
          <fieldset className="catalog-filters">
            <legend>판매처</legend>
            <div className="catalog-filter-options">
              {['', ...marketplaces].map((value) => <button className="catalog-filter" type="button" key={value} aria-pressed={marketplace === value} aria-controls={resultsId} onClick={() => setMarketplace(value)}>{value || '전체'}</button>)}
            </div>
          </fieldset>
        )}
        <div className="catalog-results-bar">
          <output aria-live="polite" aria-atomic="true">{label} <strong>{visibleIds.size}개</strong><span> · 전체 {items.length}개</span></output>
          <button className="catalog-reset" type="button" disabled={!hasFilters} onClick={resetFilters}><RotateCcw size={14} aria-hidden="true" /> 초기화</button>
        </div>
        <noscript><p>검색과 필터를 사용하려면 JavaScript를 켜주세요. 전체 콘텐츠는 아래에서 볼 수 있어요.</p></noscript>
      </div>
      <div id={resultsId}>
        {visibleIds.size ? (
          <div className={listClassName}>
            {items.map((item, index) => visibleIds.has(item.id) ? <Fragment key={item.id}>{children[index]}</Fragment> : null)}
          </div>
        ) : (
          <div className="catalog-empty">
            <Search size={32} aria-hidden="true" />
            <h2>{items.length ? '조건에 맞는 콘텐츠가 없어요.' : '등록된 콘텐츠가 없어요.'}</h2>
            <p>{items.length ? '검색어를 짧게 바꾸거나 다른 카테고리를 선택해 보세요.' : '새 콘텐츠가 공개되면 이곳에서 볼 수 있어요.'}</p>
            {hasFilters && <button className="button button-secondary" type="button" onClick={resetFilters}>전체 콘텐츠 보기</button>}
          </div>
        )}
      </div>
    </div>
  );
}

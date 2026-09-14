export type CatalogItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  marketplaces?: string[];
};

export type CatalogFilters = {
  query?: string;
  category?: string;
  marketplace?: string;
};

export function normalizeSearch(value: string): string {
  return value.normalize('NFKC').toLocaleLowerCase('ko').trim().replace(/\s+/gu, ' ');
}

export function getCatalogFacets(items: readonly CatalogItem[], field: 'category' | 'marketplace'): string[] {
  const values = items.flatMap((item) => field === 'category' ? [item.category] : item.marketplaces ?? []);
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'ko'));
}

/** Match all search terms and every selected facet, preserving the source order. */
export function filterCatalog<T extends CatalogItem>(items: readonly T[], filters: CatalogFilters): T[] {
  const terms = normalizeSearch(filters.query ?? '').split(' ').filter(Boolean);
  return items.filter((item) => {
    if (filters.category && item.category.trim() !== filters.category) return false;
    if (filters.marketplace && !item.marketplaces?.some((value) => value.trim() === filters.marketplace)) return false;
    const text = normalizeSearch([item.title, item.description, item.category, ...(item.marketplaces ?? [])].join(' '));
    return terms.every((term) => text.includes(term));
  });
}

import assert from 'node:assert/strict';
import test from 'node:test';
import { paginateCatalog, getPaginationTokens } from '../lib/catalog-pagination.ts';
import { filterCatalog } from '../lib/catalog-search.ts';

const entries = Array.from({ length: 25 }, (_, index) => ({ id: `${index + 1}`, title: `노션 ${index + 1}`, description: '', category: index % 2 ? '입문' : '협업', marketplaces: index % 2 ? ['CTEE'] : ['Notion Marketplace'] }));

test('article and video pages contain six items and keep original order without duplicates', () => {
  const pages = Array.from({ length: 5 }, (_, index) => paginateCatalog(entries, index + 1, 6));
  assert.deepEqual(pages.map((page) => page.items.length), [6, 6, 6, 6, 1]);
  assert.deepEqual(pages.flatMap((page) => page.items), entries);
  assert.deepEqual(pages.map((page) => [page.start, page.end]), [[1, 6], [7, 12], [13, 18], [19, 24], [25, 25]]);
});

test('template pages contain nine items and do not create a trailing empty page', () => {
  assert.equal(paginateCatalog(entries, 1, 9).items.length, 9);
  assert.equal(paginateCatalog(entries, 3, 9).items.length, 7);
  assert.equal(paginateCatalog(entries.slice(0, 18), 2, 9).totalPages, 2);
  assert.equal(paginateCatalog(entries.slice(0, 6), 1, 6).totalPages, 1);
});

test('empty results expose no pages and no misleading item range', () => {
  assert.deepEqual(paginateCatalog([], 3, 6), { items: [], totalItems: 0, totalPages: 0, currentPage: 1, start: 0, end: 0 });
  assert.deepEqual(getPaginationTokens(1, 0), []);
});

test('out-of-range and invalid page requests clamp safely', () => {
  assert.equal(paginateCatalog(entries, 999, 6).currentPage, 5);
  for (const page of [0, -1, NaN, Infinity]) assert.equal(paginateCatalog(entries, page, 6).currentPage, 1);
  assert.equal(paginateCatalog(entries, 2.9, 6).currentPage, 2);
  for (const size of [0, -1, 1.5, NaN, Infinity]) assert.throws(() => paginateCatalog(entries, 1, size), RangeError);
});

test('search and every filter apply before pagination, not just to the current page', () => {
  const filtered = filterCatalog(entries, { query: '노션', category: '입문', marketplace: 'CTEE' });
  const first = paginateCatalog(filtered, 1, 6);
  const second = paginateCatalog(filtered, 2, 6);
  assert.equal(first.totalItems, 12);
  assert.equal(first.totalPages, 2);
  assert.deepEqual(first.items.map((item) => item.id), ['2', '4', '6', '8', '10', '12']);
  assert.deepEqual(second.items.map((item) => item.id), ['14', '16', '18', '20', '22', '24']);
  assert.equal(paginateCatalog(filterCatalog(entries, { query: '25' }), 1, 6).items[0].id, '25');
});

test('bounded page controls always include first, current and last pages', () => {
  assert.deepEqual(getPaginationTokens(2, 4), [1, 2, 3, 4]);
  assert.deepEqual(getPaginationTokens(1, 10), [1, 2, 3, 'end-gap', 10]);
  assert.deepEqual(getPaginationTokens(5, 10), [1, 'start-gap', 5, 'end-gap', 10]);
  assert.deepEqual(getPaginationTokens(10, 10), [1, 'start-gap', 8, 9, 10]);
  for (const total of [1, 5, 6, 10, 1000]) {
    for (let page = 1; page <= total; page++) {
      const tokens = getPaginationTokens(page, total);
      const numbers = tokens.filter((value) => typeof value === 'number');
      assert.ok(tokens.length <= 5);
      assert.ok(numbers.includes(1) && numbers.includes(page) && numbers.includes(total));
      assert.equal(new Set(numbers).size, numbers.length);
      assert.deepEqual([...numbers].sort((a, b) => a - b), numbers);
    }
  }
});

test('pagination never mutates the source list', () => {
  const before = structuredClone(entries);
  paginateCatalog(entries, 3, 6);
  assert.deepEqual(entries, before);
});

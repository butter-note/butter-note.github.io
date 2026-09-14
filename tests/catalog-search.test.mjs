import assert from 'node:assert/strict';
import test from 'node:test';
import { filterCatalog, getCatalogFacets, normalizeSearch } from '../lib/catalog-search.ts';

const items = [
  { id: 'wiki', title: '팀 위키 만들기', description: 'Notion 협업 실습', category: '팀 협업', marketplaces: ['CTEE', 'Notion Marketplace'] },
  { id: 'first', title: '노션 첫걸음', description: '처음 켰을 때 설정하기', category: '입문', marketplaces: ['버터노트'] },
  { id: 'video', title: 'Notion 데이터베이스 영상', description: '필터와 정렬 배우기', category: '팀 협업' },
];
const ids = (filters) => filterCatalog(items, filters).map((item) => item.id);

test('empty and whitespace searches preserve every item and its source order', () => {
  assert.deepEqual(ids({}), ['wiki', 'first', 'video']);
  assert.deepEqual(ids({ query: '  \t\n ' }), ['wiki', 'first', 'video']);
  assert.deepEqual(filterCatalog([], { query: '노션' }), []);
});

test('search matches Korean, description, category and marketplace without case sensitivity', () => {
  assert.deepEqual(ids({ query: '노션' }), ['first']);
  assert.deepEqual(ids({ query: '설정' }), ['first']);
  assert.deepEqual(ids({ query: '입문' }), ['first']);
  assert.deepEqual(ids({ query: 'ctee' }), ['wiki']);
  assert.deepEqual(ids({ query: 'NOTION' }), ['wiki', 'video']);
});

test('all words must match, in any order and across searchable fields', () => {
  assert.deepEqual(ids({ query: '  협업  NOTION  위키 ' }), ['wiki']);
  assert.deepEqual(ids({ query: '정렬 데이터베이스' }), ['video']);
  assert.deepEqual(ids({ query: '위키 입문' }), []);
});

test('Unicode normalization handles decomposed Korean and full-width Latin input', () => {
  assert.equal(normalizeSearch(' ＮＯＴＩＯＮ '), 'notion');
  assert.deepEqual(ids({ query: '노션'.normalize('NFD') }), ['first']);
});

test('query, category and marketplace combine with AND, including multiple sellers', () => {
  assert.deepEqual(ids({ category: '팀 협업' }), ['wiki', 'video']);
  assert.deepEqual(ids({ query: 'notion', category: '팀 협업', marketplace: 'CTEE' }), ['wiki']);
  assert.deepEqual(ids({ marketplace: 'Notion Marketplace' }), ['wiki']);
  assert.deepEqual(ids({ category: '입문', marketplace: 'CTEE' }), []);
});

test('unknown filters, no matches and literal punctuation are safe', () => {
  assert.deepEqual(ids({ category: '없는 분류' }), []);
  assert.deepEqual(ids({ marketplace: '없는 판매처' }), []);
  assert.deepEqual(ids({ query: '<script>.*[' }), []);
});

test('facets are derived from data, trimmed, deduplicated, sorted, and not narrowed by search', () => {
  const input = [...items, { id: 'new', title: '새 글', description: '', category: ' 자동화 ', marketplaces: ['CTEE', ' ', '새 마켓'] }, { id: 'empty', title: '', description: '', category: '' }];
  assert.deepEqual(getCatalogFacets(input, 'category'), ['입문', '자동화', '팀 협업']);
  assert.equal(getCatalogFacets(input, 'marketplace').filter((value) => value === 'CTEE').length, 1);
  assert.ok(getCatalogFacets(input, 'marketplace').includes('새 마켓'));
  assert.ok(!getCatalogFacets(input, 'marketplace').includes(''));
  assert.deepEqual(filterCatalog(input, { category: '자동화' }).map((item) => item.id), ['new']);
});

test('filtering never mutates source items or nested marketplaces', () => {
  const original = structuredClone(items);
  filterCatalog(items, { query: 'Notion', marketplace: 'CTEE' });
  getCatalogFacets(items, 'marketplace');
  assert.deepEqual(items, original);
});

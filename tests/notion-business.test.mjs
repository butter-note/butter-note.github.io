import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { answerMarkdown, collectBusinessContent, isPublicPage, publicationRules, queryAllPages, resolveDataSource } from '../scripts/notion-business.mjs';
import { createNotionRequest, syncBusinessContent } from '../scripts/sync-notion-business.mjs';

const rich = (value) => ({ type: 'rich_text', rich_text: [{ plain_text: value }] });
const schema = { 제목: { type: 'title' }, 상태: { type: 'status' }, 공개: { type: 'checkbox' } };
const config = { cases: { name: '노션 구축 사례 관리', databaseId: 'case-db' }, faqs: { name: '노션 FAQ 관리', databaseId: 'faq-db' } };
const page = (id, overrides = {}) => ({
  id, properties: {
    제목: { type: 'title', title: [{ plain_text: `제목 ${id}` }] },
    상태: { type: 'status', status: { name: '발행' } }, 공개: { type: 'checkbox', checkbox: true },
    요약: rich('공개 설명'), 내부메모: rich('절대 노출하면 안 되는 값'), 담당자연락처: rich('비공개 연락처'),
    ...overrides,
  },
});

function fixture({ cases = [page('case-1')], faqs = [page('faq-1')], body = '## 과정\n본문 **내용**', broken = false } = {}) {
  const calls = [];
  const request = async (endpoint, options) => {
    calls.push({ endpoint, options });
    if (endpoint.startsWith('/v1/databases/')) return { data_sources: [{ id: `${endpoint.split('/').pop()}-source` }] };
    if (endpoint.endsWith('/query')) return { results: endpoint.includes('case-db') ? cases : faqs, has_more: false };
    if (endpoint.startsWith('/v1/data_sources/')) return { properties: schema };
    if (endpoint.endsWith('/markdown')) return { markdown: body, truncated: broken && endpoint.includes('faq'), unknown_block_ids: [] };
    throw new Error(`Unexpected endpoint ${endpoint}`);
  };
  return { calls, request };
}

test('provided database IDs are stored without confusing the view IDs for data source IDs', async () => {
  const configured = JSON.parse(await readFile(new URL('../config/notion-business.json', import.meta.url), 'utf8'));
  assert.equal(configured.cases.databaseId.replaceAll('-', ''), '53c6f0ccb4bd836cb7ba81ce9dcf9112');
  assert.equal(configured.faqs.databaseId.replaceAll('-', ''), '6f66f0ccb4bd8283b9f181cfb443f798');
});

test('publication is fail-closed and all status/checkbox controls must agree', () => {
  const rules = publicationRules(schema);
  assert.equal(isPublicPage(page('yes'), rules), true);
  assert.equal(isPublicPage(page('no', { 공개: { type: 'checkbox', checkbox: false } }), rules), false);
  assert.equal(isPublicPage(page('draft', { 상태: { type: 'status', status: { name: '초안' } } }), rules), false);
  assert.equal(isPublicPage({ ...page('deleted'), in_trash: true }, rules), false);
  assert.equal(isPublicPage({ ...page('archived'), archived: true }, rules), false);
  assert.equal(isPublicPage(page('yes'), []), false);
  assert.throws(() => publicationRules({ 제목: { type: 'title' } }), /공개 기준/);
  assert.throws(() => publicationRules({ 공개: { type: 'rich_text' } }), /공개 기준/);
  assert.equal(isPublicPage(page('checkbox', { 상태: undefined }), rules), false);
  assert.deepEqual(publicationRules({ '홈페이지 공개': { type: 'checkbox' } }), [{ name: '홈페이지 공개', type: 'checkbox' }]);
});

test('only published pages are read and only allowlisted fields are saved', async () => {
  const hidden = page('private', { 공개: { type: 'checkbox', checkbox: false } });
  const { request, calls } = fixture({ cases: [page('visible'), hidden] });
  const result = await collectBusinessContent({ request, config });
  assert.equal(result.cases.length, 1);
  assert.equal(result.faqs.length, 1);
  assert.equal(result.cases[0].content, '## 과정\n본문 **내용**');
  assert.equal(result.cases[0].slug, 'visible');
  assert.ok(!JSON.stringify(result).includes('비공개'));
  assert.ok(!JSON.stringify(result).includes('내부메모'));
  assert.ok(!calls.some(({ endpoint }) => endpoint.includes('/private/markdown')));
});

test('all pages are queried with opaque cursors and malformed cursors fail', async () => {
  const cursors = [];
  const pages = await queryAllPages(async (_, { body }) => {
    cursors.push(body);
    return body.start_cursor ? { results: [page('second')], has_more: false } : { results: [page('first')], has_more: true, next_cursor: 'opaque+cursor/==' };
  }, 'source');
  assert.equal(pages.length, 2);
  assert.deepEqual(cursors[1], { page_size: 100, start_cursor: 'opaque+cursor/==' });
  await assert.rejects(queryAllPages(async () => ({ results: [], has_more: true, next_cursor: 'same' }), 'source'), /페이지네이션/);
});

test('single source is resolved; ambiguous sources fail without guessing', async () => {
  assert.equal(await resolveDataSource(async () => ({ data_sources: [{ id: 'actual-source' }] }), config.cases), 'actual-source');
  for (const sources of [[], [{ id: 'a' }, { id: 'b' }]]) {
    await assert.rejects(resolveDataSource(async () => ({ data_sources: sources }), config.cases), /DATA_SOURCE_ID/);
  }
  assert.equal(await resolveDataSource(() => { throw new Error('should not read DB'); }, { ...config.cases, dataSourceId: 'override' }), 'override');
});

test('FAQ page body takes priority; empty pages can use the 답변 property', async () => {
  const faq = page('question', { 답변: rich('속성 답변') });
  const filled = await collectBusinessContent({ request: fixture({ cases: [], faqs: [faq] }).request, config });
  assert.match(filled.faqs[0].content, /본문/);
  const fallback = await collectBusinessContent({ request: fixture({ cases: [], faqs: [faq], body: '' }).request, config });
  assert.equal(fallback.faqs[0].content, '속성 답변');
  await assert.rejects(collectBusinessContent({ request: fixture({ cases: [], body: '' }).request, config }), /본문\/답변/);
  assert.match(answerMarkdown(rich('<script>alert(1)</script>')), /&lt;script&gt;/);
});

test('custom slugs are safe and case insensitive duplicates stop publication', async () => {
  const valid = page('custom', { Slug: rich('소규모-업체') });
  const result = await collectBusinessContent({ request: fixture({ cases: [valid] }).request, config });
  assert.equal(result.cases[0].slug, '소규모-업체');
  for (const slug of ['../private', '__empty__', 'https://example.com', 'bad/slash']) {
    await assert.rejects(collectBusinessContent({ request: fixture({ cases: [page('bad', { Slug: rich(slug) })] }).request, config }), /Slug/);
  }
  const duplicates = [page('one', { Slug: rich('Same') }), page('two', { Slug: rich('same') })];
  await assert.rejects(collectBusinessContent({ request: fixture({ cases: duplicates }).request, config }), /중복 Slug/);
});

test('order sorts before dates; images go through the shared localizer', async () => {
  const calls = [];
  const cases = [page('late', { 정렬: { type: 'number', number: 2 } }), page('early', { 정렬: { type: 'number', number: 1 } })];
  const result = await collectBusinessContent({ request: fixture({ cases, faqs: [] }).request, config, localize: async (body, slug) => { calls.push(slug); return `${body}\nlocalized`; } });
  assert.equal(result.cases[0].id, 'early');
  assert.match(result.cases[0].content, /localized/);
  assert.deepEqual(calls, ['cases-late', 'cases-early']);
});

test('partial failures preserve previous snapshot; unpublished/deleted entries disappear after a successful sync', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'butternote-business-test-'));
  try {
    const file = path.join(directory, 'content.json');
    await writeFile(file, 'previous-snapshot');
    await assert.rejects(syncBusinessContent({ request: fixture({ broken: true }).request, config, directory, localize: async (body) => body }), /불완전/);
    assert.equal(await readFile(file, 'utf8'), 'previous-snapshot');
    await syncBusinessContent({ request: fixture().request, config, directory, localize: async (body) => body });
    assert.equal(JSON.parse(await readFile(file, 'utf8')).cases.length, 1);
    await syncBusinessContent({ request: fixture({ cases: [], faqs: [] }).request, config, directory, localize: async (body) => body });
    assert.deepEqual(JSON.parse(await readFile(file, 'utf8')), { cases: [], faqs: [] });
  } finally {
    assert.equal(path.dirname(directory), os.tmpdir());
    assert.ok(path.basename(directory).startsWith('butternote-business-test-'));
    await rm(directory, { recursive: true, force: true });
  }
});

test('HTTP client retries rate limits, sets version and never returns sensitive error bodies', async () => {
  const requests = [];
  let count = 0;
  const request = createNotionRequest('test-placeholder', { sleep: async () => {}, fetchApi: async (url, options) => {
    requests.push({ url, options });
    return ++count === 1 ? new Response('', { status: 429, headers: { 'Retry-After': '1' } }) : Response.json({ results: [] });
  } });
  await request('/v1/data_sources/test/query', { method: 'POST', body: { page_size: 100 } });
  assert.equal(requests.length, 2);
  assert.equal(requests[0].options.headers['Notion-Version'], '2026-03-11');
  const forbidden = createNotionRequest('test-placeholder', { sleep: async () => {}, fetchApi: async () => new Response('sensitive-response', { status: 403 }) });
  await assert.rejects(forbidden('/test'), (error) => error.message.includes('Integration') && !error.message.includes('sensitive-response'));
});

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

function envValue(name) {
  const value = (process.env[name] ?? '').trim().replace(/^\uFEFF/, '');
  const quote = value[0];
  return (quote === '"' || quote === "'") && value.at(-1) === quote
    ? value.slice(1, -1).trim()
    : value;
}

const API_KEY = envValue('NOTION_API_KEY');
const TEMPLATES_DATA_SOURCE_ID = envValue('NOTION_TEMPLATES_DATA_SOURCE_ID');
const SALES_DATA_SOURCE_ID = envValue('NOTION_SALES_DATA_SOURCE_ID');
const NOTION_VERSION = '2026-03-11';

if (!API_KEY || !TEMPLATES_DATA_SOURCE_ID || !SALES_DATA_SOURCE_ID) {
  console.error('NOTION_API_KEY, NOTION_TEMPLATES_DATA_SOURCE_ID, NOTION_SALES_DATA_SOURCE_ID가 필요합니다.');
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  'Notion-Version': NOTION_VERSION,
  'Content-Type': 'application/json',
};

async function notionRequest(url, options = {}) {
  const response = await fetch(`https://api.notion.com${url}`, { ...options, headers });
  if (!response.ok) throw new Error(`Notion API ${response.status}: ${await response.text()}`);
  return response.json();
}

function textValue(property) {
  const values = property?.title ?? property?.rich_text ?? [];
  return values.map((item) => item.plain_text ?? '').join('').trim();
}

function selectValue(property) {
  return property?.status?.name ?? property?.select?.name ?? '';
}

function relationIds(property) {
  return (property?.relation ?? []).map((item) => item.id);
}

function fileUrl(property) {
  const file = property?.files?.[0];
  return file?.file?.url ?? file?.external?.url ?? '';
}

function pageCover(page) {
  return page.cover?.file?.url ?? page.cover?.external?.url ?? '';
}

function slugify(value, fallback) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-|-$/g, '');
  return slug || fallback.replaceAll('-', '').slice(0, 12);
}

function priceLabel(properties) {
  const custom = textValue(properties['가격 문구'] ?? properties.PriceLabel);
  if (custom) return custom;
  const price = properties.가격?.number ?? properties.Price?.number;
  return typeof price === 'number' ? `${price.toLocaleString('ko-KR')}원` : '판매처에서 확인';
}

async function localizeCover(url, id) {
  if (!url?.startsWith('http')) return url;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`템플릿 커버를 내려받지 못했습니다: ${url}`);
  const type = response.headers.get('content-type') ?? 'image/jpeg';
  const extension = type.includes('png') ? 'png' : type.includes('webp') ? 'webp' : type.includes('gif') ? 'gif' : 'jpg';
  const publicDir = path.resolve('public', 'content', 'templates');
  await mkdir(publicDir, { recursive: true });
  const fileName = `${id.replaceAll('-', '')}.${extension}`;
  await writeFile(path.join(publicDir, fileName), Buffer.from(await response.arrayBuffer()));
  return `/content/templates/${fileName}`;
}

async function queryPages(dataSourceId) {
  const pages = [];
  let startCursor;

  do {
    const body = { page_size: 100, result_type: 'page', ...(startCursor ? { start_cursor: startCursor } : {}) };
    const result = await notionRequest(`/v1/data_sources/${dataSourceId}/query`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    pages.push(...result.results.filter((item) => item.object === 'page'));
    startCursor = result.has_more ? result.next_cursor : undefined;
  } while (startCursor);

  return pages;
}

const fallbackCovers = [
  '/brand/characters/paper.png',
  '/brand/characters/sparkle.png',
  '/brand/characters/wink.png',
];

const [templatePages, salesPages] = await Promise.all([
  queryPages(TEMPLATES_DATA_SOURCE_ID),
  queryPages(SALES_DATA_SOURCE_ID),
]);

const listingsByTemplate = new Map();
for (const page of salesPages) {
  const properties = page.properties ?? {};
  const status = selectValue(properties['판매 상태'] ?? properties.Status) || '준비 중';
  if (['숨김', '판매 중지', 'Hidden', 'Archived'].includes(status)) continue;

  const listing = {
    id: page.id,
    marketplace: selectValue(properties.판매처 ?? properties.Marketplace) || '버터노트',
    url: properties.URL?.url ?? '',
    status,
    price: properties.가격?.number ?? properties.Price?.number ?? null,
    priceLabel: priceLabel(properties),
    buttonLabel: textValue(properties['버튼 문구'] ?? properties.ButtonLabel) || (status === '판매 중' ? '구매하기' : '출시 준비 중'),
    order: properties.순서?.number ?? properties.Order?.number ?? 999,
  };

  for (const templateId of relationIds(properties.템플릿 ?? properties.Template)) {
    const current = listingsByTemplate.get(templateId) ?? [];
    current.push(listing);
    listingsByTemplate.set(templateId, current);
  }
}

const templates = (await Promise.all(templatePages.map(async (page, index) => {
  const properties = page.properties ?? {};
  const status = selectValue(properties.상태 ?? properties.Status) || '기획';
  const remoteCover = fileUrl(properties.파일 ?? properties.커버 ?? properties.Cover) || pageCover(page);
  const listings = (listingsByTemplate.get(page.id) ?? []).sort((a, b) => a.order - b.order);

  return {
    id: page.id,
    slug: slugify(textValue(properties.주소 ?? properties.Slug), page.id),
    name: textValue(properties.이름 ?? properties.Name ?? properties.제목 ?? properties.Title) || '이름 없는 템플릿',
    description: textValue(properties.설명 ?? properties.Description) || '버터노트 노션 템플릿',
    cover: remoteCover ? await localizeCover(remoteCover, page.id) : fallbackCovers[index % fallbackCovers.length],
    status,
    category: selectValue(properties.카테고리 ?? properties.Category) || '노션 템플릿',
    version: selectValue(properties.버전 ?? properties.Version),
    updatedAt: properties.업데이트일?.date?.start?.slice(0, 10) ?? '',
    order: properties.순서?.number ?? properties.Order?.number ?? index + 1,
    featured: Boolean(properties.추천?.checkbox ?? properties.Featured?.checkbox),
    listings,
  };
})))
  .filter((item) => !['숨김', '판매 종료', 'Hidden', 'Archived'].includes(item.status))
  .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, 'ko'));

const contentDir = path.resolve('content', 'templates');
await mkdir(contentDir, { recursive: true });
await writeFile(path.join(contentDir, 'templates.json'), `${JSON.stringify(templates, null, 2)}\n`, 'utf8');
console.log(`템플릿 ${templates.length}개와 판매 링크 ${salesPages.length}개를 동기화했습니다.`);

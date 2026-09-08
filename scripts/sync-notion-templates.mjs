import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const API_KEY = process.env.NOTION_API_KEY;
const DATA_SOURCE_ID = process.env.NOTION_TEMPLATES_DATA_SOURCE_ID;
const NOTION_VERSION = '2026-03-11';

if (!API_KEY || !DATA_SOURCE_ID) {
  console.error('NOTION_API_KEY와 NOTION_TEMPLATES_DATA_SOURCE_ID가 필요합니다.');
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

function fileUrl(property) {
  const file = property?.files?.[0];
  return file?.file?.url ?? file?.external?.url ?? '';
}

function pageCover(page) {
  return page.cover?.file?.url ?? page.cover?.external?.url ?? '';
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

async function queryTemplates() {
  const pages = [];
  let startCursor;

  do {
    const body = { page_size: 100, result_type: 'page', ...(startCursor ? { start_cursor: startCursor } : {}) };
    const result = await notionRequest(`/v1/data_sources/${DATA_SOURCE_ID}/query`, {
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

const pages = await queryTemplates();
const templates = (await Promise.all(pages.map(async (page, index) => {
    const properties = page.properties ?? {};
    const status = selectValue(properties.상태 ?? properties.Status) || '공개';
    const remoteCover = fileUrl(properties.커버 ?? properties.Cover) || pageCover(page);

    return {
      id: page.id,
      name: textValue(properties.이름 ?? properties.Name ?? properties.제목 ?? properties.Title) || '이름 없는 템플릿',
      description: textValue(properties.설명 ?? properties.Description) || '버터노트 노션 템플릿',
      marketplace: selectValue(properties.판매처 ?? properties.Marketplace) || '버터노트',
      url: properties.URL?.url ?? properties.링크?.url ?? '',
      cover: remoteCover ? await localizeCover(remoteCover, page.id) : fallbackCovers[index % fallbackCovers.length],
      price: textValue(properties.가격 ?? properties.Price) || '판매처에서 확인',
      status,
      order: properties.순서?.number ?? properties.Order?.number ?? index + 1,
      featured: Boolean(properties.추천?.checkbox ?? properties.Featured?.checkbox),
    };
  })))
  .filter((item) => !['숨김', '비공개', 'Hidden', 'Draft'].includes(item.status))
  .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, 'ko'));

const contentDir = path.resolve('content', 'templates');
await mkdir(contentDir, { recursive: true });
await writeFile(path.join(contentDir, 'templates.json'), `${JSON.stringify(templates, null, 2)}\n`, 'utf8');
console.log(`총 ${templates.length}개의 템플릿을 동기화했습니다.`);

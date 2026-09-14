import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { localizeImages } from './article-images.mjs';

function envValue(name) {
  const value = (process.env[name] ?? '').trim().replace(/^\uFEFF/, '');
  const quote = value[0];
  return (quote === '"' || quote === "'") && value.at(-1) === quote
    ? value.slice(1, -1).trim()
    : value;
}

function dataSourceId(name) {
  const value = envValue(name);
  return value.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)?.[0] ?? value;
}

const API_KEY = envValue('NOTION_API_KEY');
const DATA_SOURCE_ID = dataSourceId('NOTION_DATA_SOURCE_ID');
const NOTION_VERSION = '2026-03-11';

if (!API_KEY || !DATA_SOURCE_ID) {
  console.error('NOTION_API_KEY와 NOTION_DATA_SOURCE_ID가 필요합니다.');
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

function richText(property) {
  const values = property?.title ?? property?.rich_text ?? [];
  return values.map((item) => item.plain_text ?? '').join('').trim();
}

function selectName(property) {
  return property?.status?.name ?? property?.select?.name ?? '';
}

function dateValue(property, fallback) {
  return property?.date?.start?.slice(0, 10) ?? fallback.slice(0, 10);
}

function slugify(value, fallback) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-|-$/g, '');
  return slug || fallback.replaceAll('-', '').slice(0, 12);
}

function slugFromValue(value, fallback) {
  if (!value) return slugify('', fallback);
  try {
    const url = new URL(value);
    const pathSlug = url.pathname.split('/').filter(Boolean).at(-1) ?? '';
    return slugify(pathSlug, fallback);
  } catch {
    return slugify(value, fallback);
  }
}

function characterFor(category) {
  if (category.includes('협업')) return '/brand/characters/cheerful.png';
  if (category.includes('템플릿')) return '/brand/characters/paper.png';
  if (category.includes('자동화')) return '/brand/characters/sparkle.png';
  return '/brand/characters/question.png';
}

async function queryPublishedPages() {
  const pages = [];
  let startCursor;

  do {
    const body = { page_size: 100, ...(startCursor ? { start_cursor: startCursor } : {}) };
    const result = await notionRequest(`/v1/data_sources/${DATA_SOURCE_ID}/query`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    pages.push(...result.results.filter((item) => item.object === 'page'));
    startCursor = result.has_more ? result.next_cursor : undefined;
  } while (startCursor);

  return pages.filter((page) => {
    const status = selectName(page.properties?.상태 ?? page.properties?.Status);
    return ['발행', 'Published'].includes(status);
  });
}

const pages = await queryPublishedPages();
const contentDir = path.resolve('content', 'posts');
await mkdir(contentDir, { recursive: true });

for (const page of pages) {
  const markdownResult = await notionRequest(`/v1/pages/${page.id}/markdown`);
  if (markdownResult.truncated || markdownResult.unknown_block_ids?.length) {
    throw new Error(`완전히 읽지 못한 노션 블록이 있습니다: ${page.url}`);
  }

  const properties = page.properties ?? {};
  const title = richText(properties.이름 ?? properties.Name ?? properties.제목 ?? properties.Title) || '제목 없는 글';
  const slugValue = richText(properties.Slug ?? properties.slug) || properties.URL?.url || '';
  const slug = slugFromValue(slugValue, page.id);
  const category = selectName(properties.카테고리 ?? properties.Category) || '노션 가이드';
  const description = richText(properties.요약 ?? properties.Description) || title;
  const date = dateValue(properties.발행일 ?? properties.Date, page.created_time);
  const content = await localizeImages(markdownResult.markdown, slug);
  const words = content.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;

  const meta = {
    slug,
    title,
    description,
    category,
    date,
    readTime: `${Math.max(1, Math.ceil(words / 350))}분`,
    character: characterFor(category),
    featured: Boolean(properties.추천?.checkbox ?? properties.Featured?.checkbox),
    notionPageId: page.id,
    notionUrl: page.url,
    seoTitle: richText(properties['SEO 제목'] ?? properties.SeoTitle) || undefined,
    seoDescription: richText(properties['SEO 설명'] ?? properties.SeoDescription) || undefined,
  };

  await writeFile(path.join(contentDir, `${slug}.md`), `${content.trim()}\n`, 'utf8');
  await writeFile(path.join(contentDir, `${slug}.json`), `${JSON.stringify(meta, null, 2)}\n`, 'utf8');
  console.log(`동기화 완료: ${title}`);
}

console.log(`총 ${pages.length}개의 글을 동기화했습니다.`);

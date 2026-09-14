import { mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { localizeImages } from './article-images.mjs';
import { partitionPublishedContent, richText, selectName, videoFromPage, videoUrlsInMarkdown } from './notion-content.mjs';
import { getVideoEmbed } from '../lib/video-embed.mjs';

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

async function queryContentPages() {
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

  return pages;
}

const { articles: pages, videos: videoPages } = partitionPublishedContent(await queryContentPages());
const contentDir = path.resolve('content', 'posts');
await mkdir(contentDir, { recursive: true });
const originalsDir = path.resolve('content', 'notion-originals');
await mkdir(originalsDir, { recursive: true });
const articleFiles = new Set();

for (const page of pages) {
  const markdownResult = await notionRequest(`/v1/pages/${page.id}/markdown`);
  if (markdownResult.truncated || markdownResult.unknown_block_ids?.length) {
    throw new Error(`완전히 읽지 못한 노션 블록이 있습니다: ${page.url}`);
  }
  // Keep the exact response, separate from presentation-only asset URL localization.
  await writeFile(path.join(originalsDir, `${page.id.replaceAll('-', '')}.md`), markdownResult.markdown, 'utf8');

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
    format: 'notion',
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
  articleFiles.add(`${slug}.json`);
  console.log(`동기화 완료: ${title}`);
}

// Only remove generated Notion copies after every current article was fetched successfully.
// This also handles an article changing its format to video, or becoming unpublished.
for (const file of (await readdir(contentDir)).filter((name) => name.endsWith('.json'))) {
  if (articleFiles.has(file)) continue;
  const meta = JSON.parse(await readFile(path.join(contentDir, file), 'utf8'));
  if (!meta.notionPageId) continue; // Hand-written repository posts belong to the author.
  for (const name of [file, file.replace(/\.json$/, '.md')]) {
    const target = path.resolve(contentDir, name);
    if (path.dirname(target) !== contentDir) throw new Error('생성 파일 정리 경로가 올바르지 않습니다.');
    await unlink(target).catch((error) => { if (error.code !== 'ENOENT') throw error; });
  }
}

const videos = videoPages.map(videoFromPage);
for (const video of videos) {
  if (!video.url) {
    const body = await notionRequest(`/v1/pages/${video.id}/markdown`);
    if (body.truncated || body.unknown_block_ids?.length) throw new Error(`영상 본문을 완전히 읽지 못했습니다: ${video.id}`);
    const bodyUrls = videoUrlsInMarkdown(body.markdown);
    if (bodyUrls.length === 1) {
      video.url = bodyUrls[0];
      console.log(`영상 URL 연결: ${video.id} (노션 본문에서 확인)`);
    } else if (bodyUrls.length > 1) {
      console.warn(`영상 URL을 지정해주세요: ${video.id} (본문에 영상 ${bodyUrls.length}개)`);
    }
  }
  const embed = getVideoEmbed(video.url);
  if (embed.kind === 'missing' || embed.kind === 'link') {
    console.warn(`영상 임베드 확인 필요: ${video.id} (${video.url ? embed.kind : 'URL 비어 있음'})`);
    if (!video.url) {
      const properties = videoPages.find((page) => page.id === video.id)?.properties ?? {};
      // Limit diagnostics to URL fields; never log values or signed URL parameters.
      console.warn(`영상 URL 속성 유형: ${JSON.stringify(['URL', '영상 URL', 'VideoURL'].filter((name) => properties[name]).map((name) => ({ name, type: properties[name].type })))}`);
    }
  }
}
const videosDir = path.resolve('content', 'videos');
await mkdir(videosDir, { recursive: true });
// Replace the complete list so unpublished or removed videos do not linger on the site.
await writeFile(path.join(videosDir, 'videos.json'), `${JSON.stringify(videos, null, 2)}\n`, 'utf8');
console.log(`총 ${pages.length}개의 글과 ${videos.length}개의 무료 강의를 동기화했습니다.`);

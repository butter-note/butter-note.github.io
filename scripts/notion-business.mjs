import { richText, selectName } from './notion-content.mjs';

const publicationNames = ['공개', '홈페이지 공개', '웹 공개', '게시', '상태', '발행 상태', '공개 상태', 'Published', 'Publish', 'Status'];
const publishedValues = new Set(['발행', '공개', '게시', 'published']);
const normalize = (name) => name.normalize('NFKC').replace(/\s/g, '').toLowerCase();
const property = (properties, names) => names.map((name) => Object.entries(properties).find(([key]) => normalize(key) === normalize(name))?.[1]).find(Boolean);

export function publicationRules(schema) {
  const rules = Object.entries(schema).filter(([name]) => publicationNames.some((alias) => normalize(alias) === normalize(name)));
  if (!rules.length || rules.some(([, value]) => !['checkbox', 'status', 'select'].includes(value.type))) {
    throw new Error('공개 기준을 확인할 수 없습니다. 「공개」 체크박스 또는 「상태」(발행/초안)를 설정해주세요.');
  }
  return rules.map(([name, value]) => ({ name, type: value.type }));
}

export function isPublicPage(page, rules) {
  if (page.archived || page.in_trash || !rules.length) return false;
  // All publication controls must agree. An unchecked checkbox always blocks publication.
  return rules.every(({ name, type }) => {
    const value = page.properties?.[name];
    if (value?.type !== type) return false;
    return type === 'checkbox' ? value.checkbox === true : publishedValues.has(selectName(value).toLowerCase());
  });
}

export async function resolveDataSource(request, config) {
  if (config.dataSourceId) return config.dataSourceId;
  const database = await request(`/v1/databases/${config.databaseId}`);
  if (database.archived || database.in_trash) throw new Error(`${config.name}: 삭제된 데이터베이스입니다.`);
  const sources = database.data_sources ?? [];
  if (sources.length !== 1) throw new Error(`${config.name}: 원본 데이터 소스가 ${sources.length}개입니다. DATA_SOURCE_ID를 직접 지정해주세요.`);
  return sources[0].id;
}

export async function queryAllPages(request, sourceId) {
  const pages = [];
  let cursor;
  const seen = new Set();
  do {
    const result = await request(`/v1/data_sources/${sourceId}/query`, {
      method: 'POST', body: { page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) },
    });
    if (!Array.isArray(result.results)) throw new Error('노션 목록 응답이 올바르지 않습니다.');
    pages.push(...result.results);
    if (!result.has_more) break;
    if (!result.next_cursor || seen.has(result.next_cursor)) throw new Error('노션 목록 페이지네이션이 중단되었습니다.');
    cursor = result.next_cursor;
    seen.add(cursor);
  } while (cursor);
  return pages;
}

function pageMetadata(page, kind) {
  const properties = page.properties ?? {};
  const titleProperty = Object.values(properties).find((value) => value.type === 'title');
  if (!titleProperty) throw new Error(`${kind}: ${page.id}의 제목 속성을 읽지 못했습니다.`);
  const title = richText(titleProperty);
  if (!title) return null;
  const compactId = page.id.replaceAll('-', '');
  const customSlug = richText(property(properties, ['Slug', '슬러그'])).normalize('NFKC').trim();
  if (customSlug && !/^[\p{L}\p{N}]+(?:[-_][\p{L}\p{N}]+)*$/u.test(customSlug)) {
    throw new Error(`${kind}: ${page.id}의 Slug에는 문자, 숫자, 하이픈, 밑줄만 사용할 수 있습니다.`);
  }
  const category = selectName(property(properties, ['카테고리', '분류', 'Category'])) || (kind === 'cases' ? '구축 사례' : '일반');
  const order = property(properties, ['정렬', '순서', '노출 순서', 'Order'])?.number;
  return {
    id: page.id,
    slug: customSlug || compactId,
    title,
    category,
    order: Number.isFinite(order) ? order : 9999,
    description: richText(property(properties, ['요약', '설명', 'Description'])),
    ...(kind === 'cases' ? {
      industry: selectName(property(properties, ['업종', 'Industry'])),
      date: property(properties, ['발행일', '공개일', 'Date'])?.date?.start?.slice(0, 10) || '',
    } : {}),
  };
}

// A rich-text answer is an optional alternative to the page body. Escape text so
// property values are never treated as raw HTML; preserve supported annotations.
export function answerMarkdown(answer) {
  return (answer?.rich_text ?? []).map((part) => {
    let value = (part.plain_text ?? part.text?.content ?? '').replace(/[&<>]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[char]).replace(/([\\`*_[\]])/g, '\\$1');
    const annotations = part.annotations ?? {};
    if (annotations.bold) value = `**${value}**`;
    if (annotations.italic) value = `*${value}*`;
    if (annotations.strikethrough) value = `~~${value}~~`;
    const href = part.href ?? part.text?.link?.url;
    if (href && /^(https?:\/\/|mailto:)/i.test(href)) value = `[${value}](${href.replace(/[\s()<>]/g, (char) => encodeURIComponent(char))})`;
    return value;
  }).join('').trim();
}

export async function collectBusinessContent({ request, config, localize = async (body) => body, warn = console.warn }) {
  const bundle = { cases: [], faqs: [] };
  for (const kind of ['cases', 'faqs']) {
    try {
      const sourceId = await resolveDataSource(request, config[kind]);
      const source = await request(`/v1/data_sources/${sourceId}`);
      if (source.archived || source.in_trash) throw new Error('삭제된 데이터 소스입니다.');
      const rules = publicationRules(source.properties ?? {});
      const pages = await queryAllPages(request, sourceId);
      const slugs = new Set();
      for (const page of pages) {
        if (!isPublicPage(page, rules)) continue;
        const meta = pageMetadata(page, kind);
        if (!meta) {
          warn(`${config[kind].name}: 공개 제외 — 제목이 비어 있습니다 (${page.id}). 노션 원본은 유지됩니다.`);
          continue;
        }
        const result = await request(`/v1/pages/${page.id}/markdown`);
        if (result.truncated || result.unknown_block_ids?.length || typeof result.markdown !== 'string') {
          throw new Error(`본문이 불완전합니다 (${page.id}). 본문 길이와 하위 페이지 접근 권한을 확인해주세요.`);
        }
        let body = result.markdown;
        if (kind === 'faqs' && !body.trim()) body = answerMarkdown(property(page.properties, ['답변', 'Answer']));
        if (!body.trim()) {
          warn(`${config[kind].name}: 공개 제외 — 본문${kind === 'faqs' ? '/답변' : ''}이 비어 있습니다 (${page.id}). 노션 원본은 유지됩니다.`);
          continue;
        }
        const slugKey = meta.slug.toLowerCase();
        if (slugs.has(slugKey)) throw new Error(`중복 Slug: ${meta.slug}`);
        slugs.add(slugKey);
        const content = await localize(body, `${kind}-${page.id.replaceAll('-', '')}`);
        // Deliberate allowlist: never serialize customers, contacts, internal notes or all page properties.
        bundle[kind].push({ ...meta, content, format: 'notion' });
      }
      bundle[kind].sort((a, b) => a.order - b.order || (b.date ?? '').localeCompare(a.date ?? '') || a.title.localeCompare(b.title, 'ko') || a.id.localeCompare(b.id));
    } catch (error) {
      throw new Error(`${config[kind].name}: ${error.message}`, { cause: error });
    }
  }
  return bundle;
}

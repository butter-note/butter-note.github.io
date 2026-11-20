import { faqAnswerText, getCaseStudies, getFaqs, getSchedule } from './business-content.ts';
import { whenLabel } from './schedule.ts';
import { blocksToMarkdown, extractBlocks, truncate } from './plain-text.ts';
import { getPosts, postFlavor, postSummary } from './posts.ts';
import { services } from './services.ts';
import { absoluteUrl, pages, site, type SitePage } from './site.ts';
import { getTemplates } from './templates.ts';
import { getVideos } from './videos.ts';

export type LlmsLink = { title: string; path: string; description?: string };
export type LlmsSection = { title: string; items: LlmsLink[] };
export type LlmsDocument = { title: string; path: string; meta: string[]; body: string };
export type LlmsDocumentSection = { title: string; documents: LlmsDocument[] };

const oneLine = (value = '') => value.replace(/\s+/g, ' ').trim();
const linkText = (value: string) => oneLine(value).replace(/([[\]])/g, '\\$1');

function intro(purpose: string) {
  return [
    `# ${site.name} (${site.englishName})`,
    '',
    `> ${oneLine(site.description)}`,
    '',
    purpose,
    '',
    `- 웹사이트: ${absoluteUrl('/')}`,
    `- 문의: ${site.email}`,
    '- 언어: 한국어',
    `- 사이트맵: ${absoluteUrl('/sitemap.xml')}`,
    `- RSS: ${absoluteUrl('/feed.xml')}`,
    `- 이용 조건: ${absoluteUrl(pages.terms.path)}`,
  ];
}

/** /llms.txt (https://llmstxt.org): what the site is and where each public page lives. */
export function buildLlmsTxt(sections: LlmsSection[]): string {
  const lines = intro(`이 문서는 AI 검색·답변 서비스가 ${site.name} 사이트를 이해하고 정확한 출처와 함께 인용할 수 있도록 공개 페이지를 정리한 안내입니다. 각 항목의 URL이 원문이며, 공개 글 전체는 ${absoluteUrl('/llms-full.txt')}에서 볼 수 있습니다.`);
  for (const section of sections) {
    if (!section.items.length) continue;
    lines.push('', `## ${section.title}`, '');
    for (const item of section.items) {
      const description = oneLine(item.description);
      lines.push(`- [${linkText(item.title)}](${absoluteUrl(item.path)})${description ? `: ${description}` : ''}`);
    }
  }
  return `${lines.join('\n')}\n`;
}

/** /llms-full.txt: the public bodies as tag-free Markdown, each with its source URL. */
export function buildLlmsFullTxt(sections: LlmsDocumentSection[]): string {
  const lines = intro(`이 문서는 ${site.name} 사이트에 공개된 서비스·글·사례·질문의 본문을 AI 도구가 읽기 쉬운 Markdown으로 모은 것입니다. 인용할 때는 각 문서의 URL을 출처로 밝혀 주세요. 사이트 안내는 ${absoluteUrl('/llms.txt')}에 있습니다.`);
  for (const section of sections) {
    if (!section.documents.length) continue;
    lines.push('', `## ${section.title}`);
    for (const entry of section.documents) {
      lines.push('', `### ${oneLine(entry.title)}`, '', `- URL: ${absoluteUrl(entry.path)}`, ...entry.meta.filter(Boolean).map((item) => `- ${item}`));
      if (entry.body.trim()) lines.push('', entry.body.trim());
    }
  }
  return `${lines.join('\n')}\n`;
}

const pageLink = (page: SitePage): LlmsLink => ({ title: page.label, path: page.path, description: page.description });
const serviceDescription = (service: (typeof services)[number]) => `${service.description} ${service.items.join(', ')}.`;

export function collectLlmsSections(): LlmsSection[] {
  return [
    { title: '주요 페이지', items: [pages.about, pages.services, pages.articles, pages.lectures, pages.templates, pages.cases, pages.schedule, pages.faq].map(pageLink) },
    {
      title: '다가오는 일정',
      items: getSchedule().upcoming.map((item) => ({
        title: item.title,
        path: `${pages.schedule.path}#event-${item.slug}`,
        description: [`${item.startDate.slice(0, 4)}년 ${whenLabel(item)}`, item.mode, item.location, item.audience && `대상 ${item.audience}`, item.description].filter(Boolean).join(' · '),
      })),
    },
    { title: '교육·구축 서비스', items: services.map((service) => ({ title: service.title, path: `/services/#service-${service.number}`, description: serviceDescription(service) })) },
    { title: '노션 블로그', items: getPosts().map((post) => ({ title: post.title, path: `/articles/${post.slug}/`, description: `${postSummary(post)} (${post.category}, ${post.date})` })) },
    {
      title: '무료 강의',
      items: getVideos()
        .filter((lesson) => lesson.embed.kind !== 'missing')
        .map((lesson) => ({ title: lesson.title, path: `/lectures/#lesson-${lesson.id}`, description: [lesson.description, lesson.category].filter(Boolean).join(' · ') })),
    },
    {
      title: '노션 템플릿',
      items: getTemplates().map((template) => ({
        title: template.name,
        path: `/templates/#template-${template.slug}`,
        description: [template.description, template.listings.map((listing) => `${listing.marketplace} ${listing.priceLabel}`).join(', ')].filter(Boolean).join(' — '),
      })),
    },
    { title: '구축 사례', items: getCaseStudies().map((entry) => ({ title: entry.title, path: `/cases/${entry.slug}/`, description: [entry.industry, entry.description].filter(Boolean).join(' — ') })) },
    { title: '자주 묻는 질문', items: getFaqs().map((entry) => ({ title: entry.title, path: `/faq/#faq-${entry.slug}`, description: truncate(faqAnswerText(entry), 160) })) },
    // "Optional" marks secondary links in the llms.txt convention.
    { title: 'Optional', items: [pages.privacy, pages.terms].map(pageLink) },
  ];
}

export function collectLlmsDocuments(): LlmsDocumentSection[] {
  const markdown = (content: string, title: string, flavor: 'notion' | 'markdown' = 'notion') =>
    blocksToMarkdown(extractBlocks(content, { flavor, title, baseUrl: site.url }), { headingOffset: 3 });
  return [
    {
      title: '교육·구축 서비스',
      documents: services.map((service) => ({
        title: service.title,
        path: `/services/#service-${service.number}`,
        meta: [],
        body: `${service.description}\n\n${service.items.map((item) => `- ${item}`).join('\n')}`,
      })),
    },
    {
      title: '노션 블로그',
      documents: getPosts().map((post) => ({
        title: post.title,
        path: `/articles/${post.slug}/`,
        meta: [`발행일: ${post.date}`, post.updated && post.updated > post.date ? `수정일: ${post.updated}` : '', `카테고리: ${post.category}`, `요약: ${postSummary(post)}`],
        body: markdown(post.content, post.title, postFlavor(post)),
      })),
    },
    {
      title: '구축 사례',
      documents: getCaseStudies().map((entry) => ({
        title: entry.title,
        path: `/cases/${entry.slug}/`,
        meta: [entry.date ? `발행일: ${entry.date}` : '', entry.industry ? `업종: ${entry.industry}` : '', `분류: ${entry.category}`, entry.description ? `요약: ${entry.description}` : ''],
        body: markdown(entry.content, entry.title),
      })),
    },
    {
      title: '자주 묻는 질문',
      documents: getFaqs().map((entry) => ({ title: entry.title, path: `/faq/#faq-${entry.slug}`, meta: [`분류: ${entry.category}`], body: markdown(entry.content, entry.title) })),
    },
    {
      title: '무료 강의',
      documents: getVideos()
        .filter((lesson) => lesson.embed.kind !== 'missing')
        .map((lesson) => ({
          title: lesson.title,
          path: `/lectures/#lesson-${lesson.id}`,
          meta: [lesson.date ? `게시일: ${lesson.date}` : '', `분류: ${lesson.category}`, lesson.embed.sourceUrl ? `영상: ${lesson.embed.sourceUrl}` : ''],
          body: lesson.description,
        })),
    },
  ];
}

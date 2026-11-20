import fs from 'node:fs';
import path from 'node:path';
import { blocksToPlainText, extractBlocks, summarize } from './plain-text.ts';
import { isCasePage, splitSchedule, todayInKorea, toScheduleItems } from './schedule.ts';

export type BusinessEntry = {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  content: string;
  order: number;
  format: 'notion';
  /** Last edit in Notion (YYYY-MM-DD). */
  updated?: string;
};
export type CaseStudy = BusinessEntry & {
  industry: string;
  date: string;
  /** Notion date of the work or event; entries without a written story are schedule-only. */
  schedule?: { start: string; end?: string; timeZone?: string };
  mode?: string;
  location?: string;
  audience?: string;
  registrationUrl?: string;
};
type BusinessContent = { cases: CaseStudy[]; faqs: BusinessEntry[] };

function getBusinessContent(): BusinessContent {
  const content = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'content/business/content.json'), 'utf8')) as BusinessContent;
  if (!Array.isArray(content.cases) || !Array.isArray(content.faqs)) throw new Error('구축 사례·FAQ 데이터 형식이 잘못되었습니다.');
  return content;
}

/** Case pages: entries with a written story whose date has passed (or that have no date). */
export const getCaseStudies = () => {
  const today = todayInKorea();
  return getBusinessContent().cases.filter((entry) => isCasePage(entry, today));
};
/** Every dated entry of the case DB, split into upcoming and past events. */
export const getSchedule = () => splitSchedule(toScheduleItems(getBusinessContent().cases, todayInKorea()));
export const getFaqs = () => getBusinessContent().faqs;
export const getCaseStudyBySlug = (slug: string) => getCaseStudies().find((entry) => entry.slug === slug);
export function getCaseStudyStaticParams() {
  const params = getCaseStudies().map(({ slug }) => ({ slug }));
  return params.length ? params : [{ slug: '__empty__' }];
}

/** FAQ answer as plain text, for search and FAQPage structured data. */
export const faqAnswerText = (entry: Pick<BusinessEntry, 'title' | 'content'>) => blocksToPlainText(extractBlocks(entry.content, { title: entry.title }));

/** A written case description, or the opening of the story when 요약 is empty. */
export const caseSummary = (entry: Pick<CaseStudy, 'title' | 'description' | 'content'>) =>
  entry.description.trim() || summarize(extractBlocks(entry.content, { title: entry.title })) || entry.title;

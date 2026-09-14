import fs from 'node:fs';
import path from 'node:path';

export type BusinessEntry = {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  content: string;
  order: number;
  format: 'notion';
};
export type CaseStudy = BusinessEntry & { industry: string; date: string };
type BusinessContent = { cases: CaseStudy[]; faqs: BusinessEntry[] };

function getBusinessContent(): BusinessContent {
  const content = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'content/business/content.json'), 'utf8')) as BusinessContent;
  if (!Array.isArray(content.cases) || !Array.isArray(content.faqs)) throw new Error('구축 사례·FAQ 데이터 형식이 잘못되었습니다.');
  return content;
}

export const getCaseStudies = () => getBusinessContent().cases;
export const getFaqs = () => getBusinessContent().faqs;
export const getCaseStudyBySlug = (slug: string) => getCaseStudies().find((entry) => entry.slug === slug);
export function getCaseStudyStaticParams() {
  const params = getCaseStudies().map(({ slug }) => ({ slug }));
  return params.length ? params : [{ slug: '__empty__' }];
}

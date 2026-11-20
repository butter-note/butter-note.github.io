import { site } from './site.ts';

export type AnalyticsConfig = { googleAnalyticsId: string; clarityProjectId: string };

const googleAnalyticsPattern = /^G-[A-Z0-9]{4,20}$/;
const clarityPattern = /^[a-z0-9]{6,32}$/;

/**
 * Validates the analytics IDs from lib/site.ts. Empty values turn a tool off.
 * A malformed value fails the build instead of shipping a tag that silently records nothing.
 */
export function resolveAnalytics(config: AnalyticsConfig) {
  const googleAnalyticsId = config.googleAnalyticsId.trim();
  const clarityProjectId = config.clarityProjectId.trim();
  if (googleAnalyticsId && !googleAnalyticsPattern.test(googleAnalyticsId)) {
    throw new Error(`lib/site.ts analytics.googleAnalyticsId "${googleAnalyticsId}"는 Google Analytics 4 측정 ID 형식(G-로 시작)이 아닙니다.`);
  }
  if (clarityProjectId && !clarityPattern.test(clarityProjectId)) {
    throw new Error(`lib/site.ts analytics.clarityProjectId "${clarityProjectId}"는 Clarity 프로젝트 ID 형식(영문 소문자와 숫자)이 아닙니다.`);
  }
  return { googleAnalyticsId, clarityProjectId };
}

export const analytics = resolveAnalytics(site.analytics);

export function googleAnalyticsSnippet(id: string) {
  return `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}');`;
}

export function claritySnippet(id: string) {
  return `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${id}");`;
}

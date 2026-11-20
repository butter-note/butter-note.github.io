import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/site';

export const dynamic = 'force-static';

// Everything public may be crawled. Search and AI answer engines are also named explicitly so the
// intent is clear (GEO). To opt out of AI training only, change GPTBot, ClaudeBot, Google-Extended
// and Applebot-Extended to `disallow: '/'` and keep the search/answer crawlers allowed.
const searchAndAnswerEngines = [
  'Googlebot',
  'Bingbot',
  'Yeti', // 네이버
  'Daumoa', // 다음·카카오
  'OAI-SearchBot',
  'ChatGPT-User',
  'GPTBot',
  'Claude-SearchBot',
  'Claude-User',
  'ClaudeBot',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot',
  'Applebot-Extended',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: searchAndAnswerEngines, allow: '/' },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}

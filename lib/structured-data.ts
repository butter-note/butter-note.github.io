import { absoluteUrl, site } from './site.ts';
import { getVideoPlayerAssets } from './video-embed.mjs';
import type { Service } from './services.ts';
import type { TemplateItem } from './templates.ts';

export type Json = Record<string, unknown>;

const context = 'https://schema.org';
const inLanguage = 'ko-KR';
const korea = { '@type': 'Country', name: '대한민국' };
export const organizationId = absoluteUrl('/#organization');
export const websiteId = absoluteUrl('/#website');

/** JSON for `<script type="application/ld+json">`; `<` is escaped so content cannot close the script element. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

const organization = (): Json => ({
  '@type': 'Organization',
  '@id': organizationId,
  name: site.name,
  url: absoluteUrl('/'),
  logo: { '@type': 'ImageObject', url: absoluteUrl(site.logo) },
});

/** Who runs the site: rendered once in the root layout so every page links back to the same entity. */
export function siteGraph(): Json {
  return {
    '@context': context,
    '@graph': [
      {
        ...organization(),
        alternateName: site.englishName,
        description: site.description,
        image: absoluteUrl('/og.png'),
        email: site.email,
        sameAs: site.sameAs,
        knowsAbout: site.knowsAbout,
        areaServed: korea,
        contactPoint: { '@type': 'ContactPoint', contactType: 'customer support', email: site.email, availableLanguage: ['Korean'] },
      },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        name: site.name,
        alternateName: site.englishName,
        url: absoluteUrl('/'),
        description: site.description,
        inLanguage,
        publisher: { '@id': organizationId },
      },
    ],
  };
}

type EventInput = { slug: string; title: string; description: string; start: string; end?: string; mode: string; location: string; audience: string; registrationUrl: string };

/**
 * Event for an upcoming schedule item. Search engines need a place, so an in-person event without
 * 장소 is skipped rather than published with a made-up location.
 */
export function eventSchema(item: EventInput, pagePath: string): Json | null {
  const online = /온라인|online|zoom|줌/i.test(item.mode);
  const inPerson = /오프라인|offline|대면|현장/i.test(item.mode) || (!online && Boolean(item.location));
  const hybrid = /혼합|병행|hybrid/i.test(item.mode) || (online && inPerson);
  const url = `${absoluteUrl(pagePath)}#event-${item.slug}`;
  const place = item.location ? { '@type': 'Place', name: item.location, address: item.location } : null;
  const virtual = { '@type': 'VirtualLocation', url: item.registrationUrl || url };
  if ((inPerson || hybrid) && !place) return null;
  if (!online && !inPerson && !hybrid) return null;
  return {
    '@context': context,
    '@type': 'Event',
    name: item.title,
    ...(item.description ? { description: item.description } : {}),
    startDate: item.start,
    ...(item.end ? { endDate: item.end } : {}),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: `https://schema.org/${hybrid ? 'Mixed' : online ? 'Online' : 'Offline'}EventAttendanceMode`,
    location: hybrid ? [place, virtual] : online ? virtual : place,
    organizer: organization(),
    url,
    inLanguage,
    ...(item.audience ? { audience: { '@type': 'Audience', audienceType: item.audience } } : {}),
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]): Json {
  return {
    '@context': context,
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, item: absoluteUrl(item.path) })),
  };
}

export function collectionSchema({ name, description, path, items }: { name: string; description: string; path: string; items: { name: string; path: string }[] }): Json {
  const url = absoluteUrl(path);
  return {
    '@context': context,
    '@type': 'CollectionPage',
    '@id': url,
    url,
    name,
    description,
    inLanguage,
    isPartOf: { '@id': websiteId },
    publisher: { '@id': organizationId },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, url: absoluteUrl(item.path) })),
    },
  };
}

export type ArticleInput = {
  type?: 'BlogPosting' | 'Article';
  title: string;
  description: string;
  path: string;
  datePublished?: string;
  dateModified?: string;
  section?: string;
  keywords?: string[];
  image?: string;
  minutes?: number;
};

export function articleSchema({ type = 'BlogPosting', title, description, path, datePublished, dateModified, section, keywords = [], image, minutes }: ArticleInput): Json {
  const url = absoluteUrl(path);
  const dates = datePublished
    ? { datePublished, dateModified: dateModified && dateModified > datePublished ? dateModified : datePublished }
    : dateModified ? { dateModified } : {};
  return {
    '@context': context,
    '@type': type,
    '@id': `${url}#article`,
    headline: title.length > 110 ? `${title.slice(0, 109)}…` : title,
    description,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    isPartOf: { '@id': websiteId },
    inLanguage,
    ...dates,
    author: organization(),
    publisher: organization(),
    image: [absoluteUrl(image ?? '/og.png')],
    ...(section ? { articleSection: section } : {}),
    ...(keywords.filter(Boolean).length ? { keywords: keywords.filter(Boolean).join(', ') } : {}),
    ...(minutes && minutes > 0 ? { timeRequired: `PT${minutes}M` } : {}),
  };
}

export function faqSchema(entries: { question: string; answer: string; path: string }[]): Json | null {
  const items = entries.filter((entry) => entry.question.trim() && entry.answer.trim());
  if (!items.length) return null;
  return {
    '@context': context,
    '@type': 'FAQPage',
    '@id': absoluteUrl('/faq/'),
    inLanguage,
    mainEntity: items.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      url: absoluteUrl(entry.path),
      acceptedAnswer: { '@type': 'Answer', text: entry.answer },
    })),
  };
}

/** Only playable lessons with a date; a missing or unsupported URL is not described as a video. */
export function videoListSchema(lessons: { id: string; title: string; description: string; url: string; date: string }[]): Json | null {
  const videos = lessons.flatMap((lesson) => {
    const media = getVideoPlayerAssets(lesson.url);
    if ((media.kind !== 'iframe' && media.kind !== 'video') || !media.src || !lesson.date) return [];
    return [{
      '@type': 'VideoObject',
      name: lesson.title,
      description: lesson.description || lesson.title,
      thumbnailUrl: [media.poster ?? absoluteUrl('/og.png')],
      uploadDate: lesson.date,
      ...(media.kind === 'iframe' ? { embedUrl: media.src } : { contentUrl: media.src }),
      url: absoluteUrl(`/lectures/#lesson-${lesson.id}`),
      inLanguage,
      publisher: organization(),
    }];
  });
  if (!videos.length) return null;
  return {
    '@context': context,
    '@type': 'ItemList',
    name: `${site.name} 무료 노션 강의`,
    itemListElement: videos.map((video, index) => ({ '@type': 'ListItem', position: index + 1, item: video })),
  };
}

/** Templates with a real sales link are Products with offers; the rest are described as creative works. */
export function templateListSchema(templates: TemplateItem[]): Json | null {
  if (!templates.length) return null;
  return {
    '@context': context,
    '@type': 'ItemList',
    name: `${site.name} 노션 템플릿`,
    url: absoluteUrl('/templates/'),
    itemListElement: templates.map((template, index) => {
      const offers = template.listings
        .filter((listing) => /^https:\/\//i.test(listing.url))
        .map((listing) => ({
          '@type': 'Offer',
          url: listing.url,
          ...(typeof listing.price === 'number' ? { price: listing.price, priceCurrency: 'KRW' } : {}),
          availability: listing.status === '판매 중' ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder',
          seller: { '@type': 'Organization', name: listing.marketplace },
        }));
      const base = { name: template.name, description: template.description, image: absoluteUrl(template.cover), url: absoluteUrl(`/templates/#template-${template.slug}`) };
      const item = offers.length
        ? { '@type': 'Product', ...base, category: template.category, brand: { '@type': 'Brand', name: site.name }, offers }
        : { '@type': 'CreativeWork', ...base, genre: template.category, creator: organization(), inLanguage };
      return { '@type': 'ListItem', position: index + 1, item };
    }),
  };
}

export function servicesSchema(services: Service[]): Json {
  return {
    '@context': context,
    '@graph': services.map((service) => ({
      '@type': 'Service',
      '@id': absoluteUrl(`/services/#service-${service.number}`),
      name: service.title,
      serviceType: service.title,
      description: `${service.description} ${service.items.join(', ')}.`,
      provider: organization(),
      areaServed: korea,
      audience: { '@type': 'Audience', audienceType: '노션을 도입하거나 처음 사용하는 팀' },
      url: absoluteUrl('/services/'),
    })),
  };
}

export function aboutSchema(): Json {
  const url = absoluteUrl('/about/');
  return {
    '@context': context,
    '@type': 'AboutPage',
    '@id': url,
    url,
    name: `${site.name} 소개`,
    inLanguage,
    isPartOf: { '@id': websiteId },
    mainEntity: { '@id': organizationId },
  };
}

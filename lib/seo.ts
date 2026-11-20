import type { Metadata } from 'next';
import { site } from './site.ts';

export const defaultShareImage = { url: '/og.png', width: 1200, height: 630, alt: '버터노트 — 노션 교육과 시스템 구축' };
export const feedAlternates = { 'application/rss+xml': [{ url: '/feed.xml', title: '버터노트 노션 블로그 RSS' }] };

export type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  /** Open Graph/Twitter title without the site suffix; defaults to `title`. */
  socialTitle?: string;
  image?: { url: string; alt?: string };
  article?: { publishedTime?: string; modifiedTime?: string; section?: string; tags?: string[] };
};

/**
 * Canonical URL, Open Graph and Twitter card for one page. Next.js replaces a nested
 * `openGraph` object instead of merging it, so every page sets the whole object here.
 */
export function pageMetadata({ title, description, path, socialTitle = title, image, article }: PageMetadataInput): Metadata {
  const images = [image ?? defaultShareImage];
  const shared = { title: socialTitle, description, url: path, siteName: site.name, locale: 'ko_KR', images };
  return {
    title,
    description,
    alternates: { canonical: path, types: feedAlternates },
    openGraph: article
      ? { ...shared, type: 'article', authors: [site.name], ...article }
      : { ...shared, type: 'website' },
    twitter: { card: 'summary_large_image', title: socialTitle, description, images: images.map((item) => item.url) },
  };
}

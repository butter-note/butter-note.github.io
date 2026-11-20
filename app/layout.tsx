import type { Metadata } from 'next';
import { JsonLd } from '@/components/json-ld';
import { analytics, claritySnippet, googleAnalyticsSnippet } from '@/lib/analytics';
import { feedAlternates, pageMetadata } from '@/lib/seo';
import { absoluteUrl, pages, site } from '@/lib/site';
import { siteGraph } from '@/lib/structured-data';
import './globals.css';

const googleTagManagerId = 'GTM-TV4D6VBX';

const verification = {
  ...(site.verification.google ? { google: site.verification.google } : {}),
  ...(site.verification.naver ? { other: { 'naver-site-verification': site.verification.naver } } : {}),
};

// Defaults for every page; pages replace title, description, canonical and share cards via pageMetadata().
export const metadata: Metadata = {
  ...pageMetadata(pages.home),
  metadataBase: new URL(site.url),
  applicationName: site.name,
  authors: [{ name: site.name, url: absoluteUrl('/about/') }],
  creator: site.name,
  publisher: site.name,
  keywords: site.keywords,
  // No canonical here: it would be inherited by pages that do not set their own.
  alternates: { types: feedAlternates },
  // Allow full-length snippets and large previews so answer engines and search results can quote the content.
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large', 'max-video-preview': -1 },
  },
  ...(Object.keys(verification).length ? { verification } : {}),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${googleTagManagerId}');`,
          }}
        />
        {/* End Google Tag Manager */}
        {analytics.googleAnalyticsId ? (
          <>
            {/* Google Analytics 4 */}
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${analytics.googleAnalyticsId}`} />
            <script dangerouslySetInnerHTML={{ __html: googleAnalyticsSnippet(analytics.googleAnalyticsId) }} />
          </>
        ) : null}
        {analytics.clarityProjectId ? (
          /* Microsoft Clarity */
          <script dangerouslySetInnerHTML={{ __html: claritySnippet(analytics.clarityProjectId) }} />
        ) : null}
      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${googleTagManagerId}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
            title="Google Tag Manager"
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <JsonLd data={siteGraph()} />
        {children}
      </body>
    </html>
  );
}

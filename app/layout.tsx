import type { Metadata } from 'next';
import './globals.css';

const googleTagManagerId = 'GTM-TV4D6VBX';

export const metadata: Metadata = {
  metadataBase: new URL('https://butter-note.github.io'),
  title: '버터노트 | 노션 교육과 시스템 구축',
  description: '노션이 처음인 팀도 부드럽게 적응하도록 돕는 교육과 시스템 구축 스튜디오, 버터노트입니다.',
  openGraph: {
    title: '버터노트 | 노션 교육과 시스템 구축',
    description: '낯선 노션을, 우리 팀의 일하는 방식으로.',
    type: 'website',
    locale: 'ko_KR',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: '버터노트' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '버터노트 | 노션 교육과 시스템 구축',
    description: '낯선 노션을, 우리 팀의 일하는 방식으로.',
    images: ['/og.png'],
  },
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
        {children}
      </body>
    </html>
  );
}

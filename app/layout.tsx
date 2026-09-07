import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://butter-note.workspace-991214.chatgpt.site'),
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
      <body>{children}</body>
    </html>
  );
}

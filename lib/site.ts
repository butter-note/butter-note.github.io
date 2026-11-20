/**
 * 사이트 공통 정보. 푸터, 법적 안내 페이지, 메타데이터·구조화 데이터·llms.txt가 함께 사용합니다.
 * 비어 있는 선택 항목은 화면과 메타데이터에 표시하지 않습니다.
 */
export const site = {
  name: '버터노트',
  englishName: 'Butter Note',
  url: 'https://butter-note.github.io',
  email: 'butternote.notion@gmail.com',
  description: '버터노트(Butter Note)는 노션(Notion)이 처음인 사람과 팀이 노션을 실제 업무에 정착시키도록 돕는 노션 교육·업무 시스템 구축 스튜디오입니다. 노션 온보딩 교육, 팀 워크스페이스 설계·구축, 노션 템플릿, 무료 노션 강의와 노션 사용법 블로그를 운영합니다.',
  logo: '/brand/logo.png',
  sameAs: ['https://www.instagram.com/butternote.notion/', 'https://www.threads.net/@butternote.notion'],
  keywords: ['노션', 'Notion', '노션 교육', '노션 강의', '노션 사용법', '노션 시스템 구축', '노션 데이터베이스', '노션 템플릿', '노션 협업', '버터노트'],
  knowsAbout: ['Notion', '노션 교육', '노션 온보딩', '노션 워크스페이스 설계', '노션 데이터베이스', '노션 템플릿', '업무 시스템 구축', '협업 도구 도입'],

  // 검색엔진 소유 확인 값(발급받은 HTML 태그의 content 값). 비워 두면 출력하지 않습니다.
  verification: { google: 'YE4n1lySvix3aU49oB8xq-bq91zN25SKA5F6AdAGBlE', naver: 'c4829111c0e2a2475ecbd2b01f09bb15cc993b6b' },

  // 방문자 분석 도구. ID를 넣으면 모든 페이지에 설치되고 개인정보처리방침에도 자동으로 표시됩니다. 비워 두면 설치하지 않습니다.
  // 처음 넣거나 지울 때는 아래 privacyEffectiveDate도 그날 날짜로 바꿔 주세요.
  analytics: {
    googleAnalyticsId: 'G-PRBMH3VWYM', // Google Analytics 4 측정 ID (예: G-XXXXXXXXXX)
    clarityProjectId: 'zggjkunvtv', // Microsoft Clarity 프로젝트 ID (Settings → Overview의 Project ID)
  },

  // 선택 항목: 값을 채우면 푸터에 사업자 정보로 표시됩니다.
  representative: '',
  businessNumber: '',
  address: '',

  // 개인정보처리방침
  privacyEffectiveDate: '2026-11-20',
  privacyOfficer: '버터노트 운영자',
  analyticsRetention: '14개월', // Google Analytics 데이터 보존 설정과 같게 유지합니다.
  clarityRetention: '화면 이용 기록은 30일, 히트맵과 표본·즐겨찾기로 지정된 기록은 최대 9개월', // Microsoft Clarity의 보관 정책
  inquiryRetention: '1년', // 문의 처리 완료 후 이메일을 보관하는 기간입니다.

  // 이용약관·저작권 안내
  termsEffectiveDate: '2026-11-16',
};

export type SitePage = { path: string; label: string; title: string; description: string };

/** 고정 페이지의 주소·제목·설명. 페이지 메타데이터, sitemap.xml, llms.txt가 같은 값을 씁니다. */
export const pages = {
  home: {
    path: '/',
    label: '홈',
    title: '버터노트 | 노션 교육과 시스템 구축',
    description: '버터노트는 노션(Notion)이 처음인 팀을 위한 노션 교육·업무 시스템 구축 스튜디오입니다. 온보딩 교육, 워크스페이스 설계·구축, 노션 템플릿과 무료 강의를 제공합니다.',
  },
  about: {
    path: '/about/',
    label: '버터노트 소개',
    title: '버터노트 소개 | 노션이 팀의 습관이 되도록',
    description: '노션을 처음 쓰는 사람도 자연스럽게 적응할 수 있도록 교육하고 시스템을 만드는 버터노트를 소개합니다.',
  },
  services: {
    path: '/services/',
    label: '교육·구축',
    title: '노션 교육·시스템 구축 | 버터노트',
    description: '노션 입문 교육부터 팀에 맞는 업무 시스템 설계와 구축, 정착 지원까지 버터노트와 함께하세요.',
  },
  articles: {
    path: '/articles/',
    label: '노션 블로그',
    title: '노션 블로그 | 버터노트',
    description: '노션을 처음 쓰는 팀을 위한 사용법과 일하는 방식을 버터노트의 노션 블로그에서 만나보세요.',
  },
  lectures: {
    path: '/lectures/',
    label: '무료 강의',
    title: '무료 강의 | 버터노트',
    description: '노션이 처음이라면 영상으로 차근차근 따라 해보세요. 버터노트의 무료 노션 강의를 모았습니다.',
  },
  templates: {
    path: '/templates/',
    label: '노션 템플릿',
    title: '노션 템플릿 | 버터노트',
    description: '버터노트의 노션 템플릿과 판매처를 갤러리에서 한눈에 확인하세요.',
  },
  cases: {
    path: '/cases/',
    label: '구축 사례',
    title: '노션 구축 사례 | 버터노트',
    description: '팀의 업무를 살펴보고 노션 시스템으로 정리한 과정을 소개합니다.',
  },
  schedule: {
    path: '/schedule/',
    label: '일정',
    title: '교육·강연 일정 | 버터노트',
    description: '버터노트의 다가오는 노션 교육·강연·워크숍 일정과 지금까지 진행한 일정을 확인하고, 내 캘린더에서 구독하세요.',
  },
  faq: {
    path: '/faq/',
    label: '자주 묻는 질문',
    title: '자주 묻는 질문 | 버터노트',
    description: '노션 사용과 버터노트의 교육·시스템 구축에 대해 자주 묻는 질문을 확인해보세요.',
  },
  privacy: {
    path: '/privacy/',
    label: '개인정보처리방침',
    title: '개인정보처리방침 | 버터노트',
    description: '버터노트 홈페이지가 수집·이용하는 정보와 쿠키, 외부 서비스, 이용자의 권리에 대해 안내합니다.',
  },
  terms: {
    path: '/terms/',
    label: '이용약관·저작권 안내',
    title: '이용약관·저작권 안내 | 버터노트',
    description: '버터노트 홈페이지 콘텐츠의 저작권과 이용 범위, 검색·AI 서비스의 인용, 템플릿·강의 이용, 책임의 한계를 안내합니다.',
  },
} satisfies Record<string, SitePage>;

/** '/articles/a/' → 'https://butter-note.github.io/articles/a/' */
export const absoluteUrl = (path: string) => new URL(path, `${site.url}/`).href;

/** 2026-11-06 → 2026. 11. 06. */
export const formatDate = (value: string) => `${value.replaceAll('-', '. ')}.`;

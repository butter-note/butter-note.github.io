export type Service = {
  number: string;
  title: string;
  description: string;
  items: string[];
  character: string;
};

/** 교육·구축 페이지의 서비스 카드. 구조화 데이터와 llms.txt도 같은 내용을 사용합니다. */
export const services: Service[] = [
  {
    number: '01',
    title: '노션 온보딩 교육',
    description: '노션을 처음 접하는 구성원이 핵심 기능을 익히고 실제 업무를 시작할 수 있도록 돕습니다.',
    items: ['우리 팀 업무 예시 중심 실습', '기초 기능과 데이터베이스 이해', '공유·협업 규칙 함께 정리'],
    character: '/brand/characters/sparkle.png',
  },
  {
    number: '02',
    title: '업무 시스템 설계·구축',
    description: '흩어진 정보와 반복되는 업무를 살펴보고, 팀에 맞는 노션 워크스페이스로 연결합니다.',
    items: ['업무 흐름 및 요구사항 인터뷰', '페이지·데이터베이스 구조 설계', '템플릿과 운영 가이드 제공'],
    character: '/brand/characters/paper.png',
  },
];

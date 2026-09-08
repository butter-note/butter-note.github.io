import type { Metadata } from 'next';
import { ArrowRight, Check, Mail } from 'lucide-react';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export const metadata: Metadata = {
  title: '노션 교육·시스템 구축 | 버터노트',
  description: '노션 입문 교육부터 팀에 맞는 업무 시스템 설계와 구축, 정착 지원까지 버터노트와 함께하세요.',
};

const services = [
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

export default function ServicesPage() {
  return (
    <main>
      <SiteHeader />
      <section className="subpage-hero service-hero">
        <div className="site-container subpage-hero-grid">
          <div>
            <p className="eyebrow"><span /> EDUCATION &amp; SYSTEM</p>
            <h1>배우기 쉽게,<br />일하기 편하게.</h1>
            <p>교육과 시스템 구축을 따로 떼어놓지 않고, 팀이 실제로 사용하고 정착하는 과정까지 함께 설계합니다.</p>
          </div>
          <div className="subpage-character-card"><img src="/brand/characters/cheerful.png" alt="신나게 웃는 버터노트 캐릭터" /></div>
        </div>
      </section>

      <section className="service-list-section">
        <div className="site-container service-card-grid">
          {services.map((service) => (
            <article className="service-card" key={service.number}>
              <div className="service-card-top"><span>{service.number}</span><img src={service.character} alt="" aria-hidden="true" /></div>
              <h2>{service.title}</h2>
              <p>{service.description}</p>
              <ul>{service.items.map((item) => <li key={item}><Check aria-hidden="true" size={15} /> {item}</li>)}</ul>
            </article>
          ))}
        </div>
      </section>

      <section className="process-section service-process">
        <div className="site-container process-grid">
          <div className="process-heading"><p className="eyebrow"><span /> PROCESS</p><h2>상담부터 정착까지</h2><p className="hand-note">필요한 지점부터 함께 시작해요.</p></div>
          <ol className="process-list">
            <li><span>01</span><div><h3>상담 신청</h3><p>팀 규모, 현재 업무 방식, 해결하고 싶은 문제를 편하게 들려주세요.</p></div></li>
            <li><span>02</span><div><h3>범위와 방식 제안</h3><p>교육 또는 구축 범위와 진행 일정을 팀 상황에 맞게 제안합니다.</p></div></li>
            <li><span>03</span><div><h3>교육·구축 진행</h3><p>실제 업무를 기준으로 배우고 사용해보며 함께 다듬습니다.</p></div></li>
            <li><span>04</span><div><h3>운영 가이드 전달</h3><p>팀이 스스로 유지하고 개선할 수 있는 기준을 남깁니다.</p></div></li>
          </ol>
        </div>
      </section>

      <section className="page-cta">
        <div className="site-container page-cta-inner">
          <img src="/brand/characters/heart.png" alt="하트를 보내는 버터노트 캐릭터" />
          <div><p className="eyebrow"><span /> LET&apos;S TALK</p><h2>우리 팀에 필요한 방식부터 이야기해보세요.</h2><p>이메일과 인스타그램 DM으로 상담할 수 있습니다.</p></div>
          <div className="page-cta-actions"><a className="button" href="mailto:butternote.notion@gmail.com"><Mail aria-hidden="true" size={18} /> 이메일 문의</a><a className="arrow-link" href="https://www.instagram.com/butternote.notion/" target="_blank" rel="noreferrer">Instagram DM <ArrowRight aria-hidden="true" size={17} /></a></div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

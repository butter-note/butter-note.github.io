import type { Metadata } from 'next';
import { ArrowRight, HeartHandshake, Layers3, Sparkles } from 'lucide-react';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export const metadata: Metadata = {
  title: '버터노트 소개 | 노션이 팀의 습관이 되도록',
  description: '노션을 처음 쓰는 사람도 자연스럽게 적응할 수 있도록 교육하고 시스템을 만드는 버터노트를 소개합니다.',
};

export default function AboutPage() {
  return (
    <main>
      <SiteHeader />
      <section className="subpage-hero">
        <div className="site-container subpage-hero-grid">
          <div>
            <p className="eyebrow"><span /> ABOUT BUTTER NOTE</p>
            <h1>도구를 넘어,<br />팀의 좋은 습관을 만듭니다.</h1>
            <p>버터노트는 노션이 낯선 사람과 팀을 위해 쉬운 교육과 오래 쓰이는 업무 시스템을 설계합니다.</p>
          </div>
          <div className="subpage-character-card">
            <img src="/brand/characters/smile.png" alt="웃고 있는 버터노트 캐릭터" />
            <span className="hand-note">천천히 익히고, 함께 오래 써요.</span>
          </div>
        </div>
      </section>

      <section className="story-section">
        <div className="site-container story-grid">
          <div>
            <p className="eyebrow"><span /> WHY WE EXIST</p>
            <h2>잘 만든 시스템보다<br />계속 쓰이는 시스템.</h2>
          </div>
          <div className="story-copy">
            <p>새로운 도구는 기능이 많아서보다, 우리 팀의 방식과 연결되지 않을 때 더 어렵습니다.</p>
            <p>그래서 버터노트는 먼저 일의 흐름을 듣습니다. 필요한 만큼만 설계하고, 누구나 이해할 수 있는 말로 설명해 노션이 실제 업무에 자연스럽게 스며들도록 돕습니다.</p>
          </div>
        </div>
      </section>

      <section className="values-section">
        <div className="site-container">
          <div className="section-heading">
            <div><p className="eyebrow"><span /> OUR PRINCIPLES</p><h2>버터노트가 지키는 세 가지</h2></div>
          </div>
          <div className="value-grid">
            <article><Sparkles aria-hidden="true" /><span>01</span><h3>쉽게 설명하기</h3><p>전문 용어보다 실제 업무의 언어로, 처음 쓰는 사람도 이해할 수 있게 설명합니다.</p></article>
            <article><Layers3 aria-hidden="true" /><span>02</span><h3>필요한 만큼 설계하기</h3><p>기능을 채우기보다 팀이 정말 사용할 흐름과 규칙에 집중합니다.</p></article>
            <article><HeartHandshake aria-hidden="true" /><span>03</span><h3>정착까지 함께하기</h3><p>만들어 드리는 데서 끝내지 않고, 팀이 스스로 운영할 수 있도록 돕습니다.</p></article>
          </div>
        </div>
      </section>

      <section className="page-cta">
        <div className="site-container page-cta-inner">
          <img src="/brand/characters/heart.png" alt="하트를 보내는 버터노트 캐릭터" />
          <div><p className="eyebrow"><span /> WORK WITH US</p><h2>우리 팀의 노션도 부드럽게 시작해볼까요?</h2></div>
          <a className="button" href="/services">교육·구축 살펴보기 <ArrowRight aria-hidden="true" size={18} /></a>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

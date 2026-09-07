import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { getPosts } from '@/lib/posts';

export const metadata: Metadata = {
  title: '노션 가이드 | 버터노트',
  description: '노션이 처음인 팀을 위한 쉬운 가이드와 업무 시스템 설계 방법을 확인하세요.',
};

export default function GuidesPage() {
  const posts = getPosts();

  return (
    <main>
      <SiteHeader />
      <section className="guides-hero">
        <div className="site-container guides-hero-grid">
          <div>
            <p className="eyebrow"><span /> NOTION GUIDE</p>
            <h1>노션을 일의 언어로<br />쉽게 설명합니다.</h1>
            <p>처음 시작하는 방법부터 팀 전체가 함께 쓰는 시스템까지 차근차근 알려드려요.</p>
          </div>
          <img src="/brand/characters/paper.png" alt="문서를 읽고 있는 버터노트 캐릭터" />
        </div>
      </section>
      <section className="guides-list-section">
        <div className="site-container">
          <div className="category-row" aria-label="글 카테고리">
            <span className="category-pill active">전체</span>
            <span className="category-pill">노션 첫걸음</span>
            <span className="category-pill">팀 협업</span>
            <span className="category-pill">템플릿</span>
          </div>
          <div className="guide-list">
            {posts.map((post) => (
              <a className="guide-list-item" href={`/guides/${post.slug}`} key={post.slug}>
                <div className="guide-list-visual"><img src={post.character} alt="" aria-hidden="true" /></div>
                <div className="guide-list-copy">
                  <span className="category-pill">{post.category}</span>
                  <h2>{post.title}</h2>
                  <p>{post.description}</p>
                  <span className="guide-date">{post.date.replaceAll('-', '. ')} · {post.readTime} 읽기</span>
                </div>
                <ArrowRight className="guide-arrow" aria-hidden="true" size={22} />
              </a>
            ))}
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

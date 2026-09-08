import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { getPosts } from '@/lib/posts';

export const metadata: Metadata = {
  title: '노션 가이드(아티클) | 버터노트',
  description: '노션을 처음 쓰는 팀을 위한 가이드와 일하는 방식에 관한 버터노트의 아티클을 만나보세요.',
};

export default function ArticlesPage() {
  const posts = getPosts();

  return (
    <main>
      <SiteHeader />
      <section className="guides-hero">
        <div className="site-container guides-hero-grid">
          <div>
            <p className="eyebrow"><span /> NOTION GUIDE &amp; ARTICLE</p>
            <h1>노션 가이드와 아티클을<br />한곳에서 만나보세요.</h1>
            <p>처음 시작하는 사용법부터 팀의 기록과 협업을 설계하는 방법까지, 버터노트의 언어로 쉽게 전합니다.</p>
          </div>
          <img src="/brand/characters/paper.png" alt="문서를 읽고 있는 버터노트 캐릭터" />
        </div>
      </section>
      <section className="guides-list-section">
        <div className="site-container">
          <div className="category-row" aria-label="아티클 카테고리">
            <span className="category-pill active">전체</span>
            <span className="category-pill">노션 첫걸음</span>
            <span className="category-pill">팀 협업</span>
            <span className="category-pill">템플릿</span>
          </div>
          <div className="guide-list">
            {posts.map((post) => (
              <a className="guide-list-item" href={`/articles/${post.slug}`} key={post.slug}>
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

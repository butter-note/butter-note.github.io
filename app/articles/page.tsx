import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { BlogNav } from '@/components/blog-nav';
import { CatalogBrowser } from '@/components/catalog-browser';
import { JsonLd } from '@/components/json-ld';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { getPosts, postSummary } from '@/lib/posts';
import { pageMetadata } from '@/lib/seo';
import { pages } from '@/lib/site';
import { collectionSchema } from '@/lib/structured-data';

export const metadata: Metadata = pageMetadata(pages.articles);

export default function ArticlesPage() {
  const posts = getPosts();
  const summaries = posts.map((post) => postSummary(post));

  return (
    <main>
      <SiteHeader />
      <JsonLd
        data={collectionSchema({
          name: pages.articles.label,
          description: pages.articles.description,
          path: pages.articles.path,
          items: posts.map((post) => ({ name: post.title, path: `/articles/${post.slug}/` })),
        })}
      />
      <section className="guides-hero">
        <div className="site-container guides-hero-grid">
          <div>
            <p className="eyebrow"><span /> NOTION BLOG</p>
            <h1>노션 블로그</h1>
            <p>처음 시작하는 사용법부터 팀의 기록과 협업을 설계하는 방법까지, 버터노트의 언어로 쉽게 전합니다.</p>
          </div>
          <img src="/brand/characters/paper.png" alt="문서를 읽고 있는 버터노트 캐릭터" />
        </div>
      </section>
      <BlogNav current="articles" />
      <section className="guides-list-section">
        <div className="site-container">
          <CatalogBrowser
            label="게시글"
            listClassName="guide-list"
            pageSize={6}
            items={posts.map((post, index) => ({ id: post.slug, title: post.title, description: summaries[index], category: post.category }))}
          >
            {posts.map((post, index) => (
              <a className="guide-list-item" href={`/articles/${post.slug}/`} key={post.slug}>
                <div className="guide-list-visual"><img src={post.character} alt="" aria-hidden="true" /></div>
                <div className="guide-list-copy">
                  <span className="category-pill">{post.category}</span>
                  <h2>{post.title}</h2>
                  <p>{summaries[index]}</p>
                  <span className="guide-date"><time dateTime={post.date}>{post.date.replaceAll('-', '. ')}</time> · {post.readTime} 읽기</span>
                </div>
                <ArrowRight className="guide-arrow" aria-hidden="true" size={22} />
              </a>
            ))}
          </CatalogBrowser>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

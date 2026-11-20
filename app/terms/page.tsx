import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { pageMetadata } from '@/lib/seo';
import { formatDate, pages, site } from '@/lib/site';

export const metadata: Metadata = pageMetadata(pages.terms);

export default function TermsPage() {
  return (
    <main>
      <SiteHeader />
      <article className="article-page">
        <header className="article-header site-container">
          <p className="eyebrow"><span /> TERMS &amp; COPYRIGHT</p>
          <h1>이용약관·저작권 안내</h1>
          <p>{site.name} 홈페이지의 글·이미지·캐릭터를 어디까지 쓸 수 있는지, 템플릿과 강의는 어떻게 이용하는지 안내합니다.</p>
          <div className="article-detail-meta">시행일 {formatDate(site.termsEffectiveDate)}</div>
        </header>
        <div className="article-body site-container">
          <div className="notion-markdown legal-content">
            <h2>제1조 (목적과 적용)</h2>
            <p>이 안내는 {site.name}(이하 “{site.name}”)가 운영하는 홈페이지 {site.url}(이하 “사이트”)와 사이트에 게시된 콘텐츠의 이용 조건을 정합니다. 사이트를 이용하는 것은 이 안내에 동의하는 것으로 봅니다.</p>

            <h2>제2조 (저작권)</h2>
            <ol>
              <li>사이트에 게시된 글, 이미지, 캐릭터, 로고, 디자인 등 모든 콘텐츠의 저작권은 {site.name}에 있으며 「저작권법」으로 보호됩니다.</li>
              <li>이용자는 콘텐츠를 개인적·비상업적 목적으로 열람할 수 있습니다. 제5조 제1항의 경우를 제외하고, {site.name}의 사전 동의 없이 콘텐츠를 복제·배포·전송·전시·2차적 저작물로 작성하거나 상업적으로 이용할 수 없습니다.</li>
              <li>글의 일부를 인용할 때에는 출처(“{site.name}”)와 해당 페이지 링크를 함께 표기해 주세요.</li>
              <li>노션(Notion)과 관련 로고는 Notion Labs, Inc.의 상표입니다. 사이트에 언급된 그 밖의 상표는 각 권리자에게 속합니다.</li>
            </ol>

            <h2>제3조 (템플릿과 무료 강의)</h2>
            <ul>
              <li>템플릿은 Notion Marketplace, CTEE 등 외부 마켓에서 판매·제공됩니다. 구매, 환불, 라이선스 범위는 해당 마켓과 각 상품 안내에 따릅니다.</li>
              <li>무료 강의 영상은 YouTube, Vimeo 등 영상 제공 서비스에서 재생되며, 재생과 관련된 사항은 해당 서비스의 약관을 따릅니다.</li>
            </ul>

            <h2>제4조 (정보의 성격과 책임의 한계)</h2>
            <ul>
              <li>사이트의 글과 강의는 노션 사용법과 업무 시스템에 대한 교육·정보 제공을 목적으로 합니다. 노션의 기능과 요금은 Notion Labs, Inc.의 정책에 따라 바뀔 수 있으며, 게시 시점 이후의 변경을 반영하지 못할 수 있습니다.</li>
              <li>{site.name}는 콘텐츠의 정확성을 위해 노력하지만, 콘텐츠를 적용해 얻는 결과를 보증하지 않습니다.</li>
              <li>사이트에서 연결되는 외부 사이트의 내용과 운영에 대해서는 책임을 지지 않습니다.</li>
            </ul>

            <h2>제5조 (검색·AI 서비스의 이용과 금지 행위)</h2>
            <ol>
              <li>검색엔진과 AI 검색·답변 서비스가 <a href="/robots.txt">robots.txt</a>에 따라 사이트를 수집·색인하고, 콘텐츠를 요약하거나 일부를 인용하면서 출처(해당 페이지 URL)를 밝히는 것은 허용합니다. AI 도구를 위한 사이트 안내는 <a href="/llms.txt">llms.txt</a>에서 볼 수 있습니다.</li>
              <li>
                다음 행위는 금지합니다.
                <ul>
                  <li>출처를 밝히지 않고 콘텐츠를 그대로 또는 대부분 다른 매체·서비스에 게재하는 행위</li>
                  <li>수집한 콘텐츠를 판매하거나 유료 데이터셋으로 제공하는 행위</li>
                  <li>사이트의 정상적인 운영을 방해하거나 콘텐츠를 변조하는 행위</li>
                </ul>
              </li>
            </ol>

            <h2>제6조 (문의)</h2>
            <p>콘텐츠 이용 허락, 교육·구축 상담 등 문의는 <a href={`mailto:${site.email}`}>{site.email}</a>로 보내주세요. 개인정보 처리에 관한 내용은 <Link href="/privacy/">개인정보처리방침</Link>에서 확인할 수 있습니다.</p>

            <h2>제7조 (안내의 변경)</h2>
            <p>이 안내는 {formatDate(site.termsEffectiveDate)}부터 시행하며, 변경되는 경우 사이트에 게시합니다.</p>
          </div>
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}

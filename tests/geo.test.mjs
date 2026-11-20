import assert from 'node:assert/strict';
import test from 'node:test';
import { blocksToMarkdown, blocksToPlainText, extractBlocks, summarize, truncate } from '../lib/plain-text.ts';
import { buildLlmsFullTxt, buildLlmsTxt } from '../lib/llms.ts';
import { buildRss } from '../lib/feed.ts';
import { pageMetadata } from '../lib/seo.ts';
import { articleSchema, faqSchema, serializeJsonLd, templateListSchema, videoListSchema } from '../lib/structured-data.ts';
import { hasOwnDescription, postSummary } from '../lib/posts.ts';

const base = 'https://butter-note.github.io';

test('Notion bodies become tag-free Markdown with absolute links for llms-full.txt', () => {
  const source = [
    '# 글 제목',
    '<callout icon="💡" color="yellow_bg">',
    '\t**중요** 안내 문장입니다.',
    '</callout>',
    '## 첫째 {color="blue"}',
    '- 항목 [링크](https://example.com)',
    '- [x] 완료',
    '<table header-row="true">',
    '\t<tr><td>이름</td><td>설명</td></tr>',
    '\t<tr><td>노션</td><td>도구</td></tr>',
    '</table>',
    '![캡션](/content/a/image-1.png)',
    '문단 [^https://example.com/source]',
  ].join('\n');
  const blocks = extractBlocks(source, { title: '글 제목', baseUrl: base });
  const markdown = blocksToMarkdown(blocks);
  assert.ok(!markdown.includes('글 제목'), 'the duplicate page title is dropped');
  assert.ok(markdown.includes('중요 안내 문장입니다.') && !markdown.includes('💡'));
  assert.ok(markdown.includes('## 첫째') && !markdown.includes('{color'));
  assert.ok(markdown.includes('- 항목 [링크](https://example.com)\n- [x] 완료'));
  assert.ok(markdown.includes('이름 | 설명\n노션 | 도구'));
  assert.ok(markdown.includes(`![캡션](${base}/content/a/image-1.png)`));
  assert.ok(markdown.includes('[출처](https://example.com/source)'));
  assert.ok(!/<callout|<table|<td|<tr/.test(markdown));
  assert.ok(blocksToMarkdown(blocks, { headingOffset: 3 }).includes('##### 첫째'));
  const plain = blocksToPlainText(blocks);
  assert.ok(plain.includes('- 항목 링크') && !plain.includes('https://'));
});

test('summaries skip headings and image notices and stop at a sentence or word boundary', () => {
  const blocks = extractBlocks(['# 제목', '## 소제목', '첫 문장입니다. 두 번째 문장도 있습니다.', '> 🖼️ 이미지를 불러올 수 없습니다.', '가'.repeat(300)].join('\n'), { title: '제목' });
  const summary = summarize(blocks, 60);
  assert.ok(summary.startsWith('첫 문장입니다. 두 번째 문장도 있습니다.'));
  assert.ok(summary.length <= 61 && summary.endsWith('…'));
  assert.ok(!summary.includes('소제목') && !summary.includes('이미지를'));
  assert.equal(truncate(`${'a'.repeat(20)}. ${'b'.repeat(20)}`, 30), `${'a'.repeat(20)}.`);
  assert.equal(truncate('짧은 문장', 30), '짧은 문장');
  assert.equal(summarize(extractBlocks('')), '');
});

test('posts whose 요약 repeats the title get a summary from the body', () => {
  const post = { title: '노션 데이터베이스', description: '노션 데이터베이스', content: '# 노션 데이터베이스\n데이터베이스는 정보를 모으는 표입니다.', format: 'notion' };
  assert.equal(hasOwnDescription(post), false);
  assert.equal(postSummary(post), '데이터베이스는 정보를 모으는 표입니다.');
  assert.equal(postSummary({ ...post, description: '직접 쓴 요약' }), '직접 쓴 요약');
  assert.equal(postSummary({ ...post, content: '' }), '노션 데이터베이스');
});

test('every page gets its own canonical URL and share card, with the site image as fallback', () => {
  const page = pageMetadata({ title: '노션 블로그 | 버터노트', description: '설명', path: '/articles/' });
  assert.equal(page.alternates.canonical, '/articles/');
  assert.ok(page.alternates.types['application/rss+xml']);
  assert.equal(page.openGraph.type, 'website');
  assert.equal(page.openGraph.title, '노션 블로그 | 버터노트');
  assert.equal(page.openGraph.images[0].url, '/og.png');
  const article = pageMetadata({ title: '글 | 버터노트', socialTitle: '글', description: '설명', path: '/articles/a/', image: { url: '/content/a/image-1.png' }, article: { publishedTime: '2026-09-14', section: '협업' } });
  assert.equal(article.openGraph.type, 'article');
  assert.equal(article.openGraph.title, '글');
  assert.equal(article.openGraph.publishedTime, '2026-09-14');
  assert.deepEqual(article.twitter.images, ['/content/a/image-1.png']);
});

test('article and FAQ structured data use absolute URLs and cannot break out of the script tag', () => {
  const article = articleSchema({ title: '글', description: '요약', path: '/articles/a/', datePublished: '2026-09-14', image: '/content/a/image-1.png', minutes: 3 });
  assert.equal(article['@type'], 'BlogPosting');
  assert.equal(article.url, `${base}/articles/a/`);
  assert.equal(article.dateModified, '2026-09-14');
  assert.deepEqual(article.image, [`${base}/content/a/image-1.png`]);
  assert.equal(article.timeRequired, 'PT3M');
  assert.equal(articleSchema({ title: '글', description: '', path: '/a/', datePublished: '2026-09-14', dateModified: '2026-10-01' }).dateModified, '2026-10-01');
  assert.ok(!serializeJsonLd({ text: '</script><script>alert(1)</script>' }).includes('</script>'));

  const faq = faqSchema([{ question: '노션은 무료인가요?', answer: '개인 요금제는 무료입니다.', path: '/faq/#faq-free' }, { question: '빈 답변', answer: '', path: '/faq/#faq-empty' }]);
  assert.equal(faq['@type'], 'FAQPage');
  assert.equal(faq.mainEntity.length, 1);
  assert.equal(faq.mainEntity[0].acceptedAnswer.text, '개인 요금제는 무료입니다.');
  assert.equal(faq.mainEntity[0].url, `${base}/faq/#faq-free`);
  assert.equal(faqSchema([]), null);
});

test('video and template lists only describe playable or purchasable items as such', () => {
  const videos = videoListSchema([
    { id: 'yt', title: '첫 강의', description: '', url: 'https://youtu.be/M7lc1UVf-VE', date: '2026-09-14' },
    { id: 'nodate', title: '날짜 없음', description: '', url: 'https://youtu.be/M7lc1UVf-VE', date: '' },
    { id: 'broken', title: '링크 없음', description: '', url: '', date: '2026-09-14' },
  ]);
  assert.equal(videos.itemListElement.length, 1);
  const video = videos.itemListElement[0].item;
  assert.equal(video.thumbnailUrl[0], 'https://i.ytimg.com/vi/M7lc1UVf-VE/hqdefault.jpg');
  assert.equal(video.embedUrl, 'https://www.youtube-nocookie.com/embed/M7lc1UVf-VE?playsinline=1');
  assert.equal(video.description, '첫 강의');
  assert.equal(videoListSchema([]), null);

  const listing = (url, price) => ({ id: url || 'soon', marketplace: 'CTEE', url, status: '판매 중', price, priceLabel: '', buttonLabel: '', order: 1 });
  const template = (slug, listings) => ({ id: slug, slug, name: slug, description: '설명', cover: '/brand/characters/paper.png', status: '판매 중', category: '팀 위키', version: '', updatedAt: '', order: 1, featured: false, listings });
  const list = templateListSchema([template('sold', [listing('https://ctee.kr/a', 9900)]), template('soon', [listing('', null)])]);
  const [sold, soon] = list.itemListElement.map((entry) => entry.item);
  assert.equal(sold['@type'], 'Product');
  assert.deepEqual([sold.offers[0].price, sold.offers[0].priceCurrency], [9900, 'KRW']);
  assert.equal(soon['@type'], 'CreativeWork');
  assert.equal(soon.image, `${base}/brand/characters/paper.png`);
  assert.equal(templateListSchema([]), null);
});

test('llms.txt lists sections with absolute links and skips empty sections', () => {
  const text = buildLlmsTxt([
    { title: '노션 블로그', items: [{ title: '대괄호 [예시]', path: '/articles/a/', description: '첫 줄\n둘째 줄' }] },
    { title: '빈 섹션', items: [] },
  ]);
  assert.ok(text.startsWith('# 버터노트 (Butter Note)\n\n> '));
  assert.ok(text.includes('## 노션 블로그\n\n- [대괄호 \\[예시\\]](https://butter-note.github.io/articles/a/): 첫 줄 둘째 줄'));
  assert.ok(!text.includes('빈 섹션'));
  const full = buildLlmsFullTxt([{ title: '노션 블로그', documents: [{ title: '글', path: '/articles/a/', meta: ['발행일: 2026-09-14', ''], body: '#### 소제목\n본문' }] }]);
  assert.ok(full.includes('### 글\n\n- URL: https://butter-note.github.io/articles/a/\n- 발행일: 2026-09-14\n\n#### 소제목\n본문'));
});

test('the RSS feed escapes text and uses RFC 822 dates in Korean time', () => {
  const rss = buildRss([{ title: 'A & B <노션>', path: '/articles/a/', description: '설명', date: '2026-09-14', category: '협업' }], { title: '노션 블로그', description: '설명', path: '/articles/' });
  assert.ok(rss.includes('<title>A &amp; B &lt;노션&gt;</title>'));
  assert.ok(rss.includes('<link>https://butter-note.github.io/articles/a/</link>'));
  assert.ok(rss.includes('<pubDate>Sun, 13 Sep 2026 15:00:00 GMT</pubDate>'));
  assert.ok(rss.includes('<language>ko</language>'));
});

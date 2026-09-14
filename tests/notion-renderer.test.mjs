import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import { notionMarkdownOptions } from '../lib/notion-renderer.mjs';

const render = (source, options) => renderToStaticMarkup(createElement(ReactMarkdown, notionMarkdownOptions(source, options)));

test('regression: all ten shortcut sections after a Notion callout render as headings', () => {
  const sections = Array.from({ length: 10 }, (_, index) => `---\n## ${index + 1}) 단축키\n**어떤 상황에서 좋나?**\n- 설명 ${index + 1}\n**팁**\n- 단축키를 사용해요.`).join('\n');
  const source = `## 핵심 단축키\n소개입니다.\n<callout icon="💡" color="yellow_bg">\n\t**Windows 기준(Ctrl)** 으로 설명합니다.\n</callout>\n${sections}`;
  const html = render(source);
  assert.equal((html.match(/<h2\b/g) ?? []).length, 11);
  assert.equal((html.match(/<hr\/>/g) ?? []).length, 10);
  assert.equal((html.match(/<li>/g) ?? []).length, 20);
  assert.ok(html.includes('<strong>Windows 기준(Ctrl)</strong>'));
  assert.ok(!html.includes('## ') && !html.includes('**어떤'));
  assert.equal(source.includes('\t**Windows'), true, 'original input is not rewritten');
});

test('nested callouts, columns and toggles preserve nesting and later paragraphs', () => {
  const html = render('<columns>\n\t<column>\n\t\t<callout icon="🧈">\n\t\t\t**안내**\n\t\t\t<callout icon="💡">\n\t\t\t\t두 번째 안내\n\t\t\t</callout>\n\t\t</callout>\n\t</column>\n\t<column>\n\t\t<details>\n\t\t<summary>**자세히**</summary>\n\t\t\t## 내부 제목\n\t\t\t- 첫째\n\t\t</details>\n\t</column>\n</columns>\n## 다음 제목\n끝 문단');
  assert.equal((html.match(/class="notion-callout-block"/g) ?? []).length, 2);
  assert.equal((html.match(/class="notion-column"/g) ?? []).length, 2);
  assert.ok(html.includes('<summary><strong>자세히</strong></summary>'));
  assert.match(html, /<h2[^>]*>내부 제목<\/h2>/);
  assert.match(html, /<h2[^>]*>다음 제목<\/h2>/);
  assert.ok(html.endsWith('<p>끝 문단</p>'));
});

test('code fences and inline code are never interpreted as Notion syntax', () => {
  const html = render('<callout>\n\t```xml\n\t</callout>\n\t<unknown>**literal**</unknown>\n\t{color="red"}\n\t```\n</callout>\n`<unknown>`와 `{color="blue"}`는 코드입니다.');
  assert.ok(html.includes('&lt;/callout&gt;'));
  assert.ok(html.includes('&lt;unknown&gt;**literal**&lt;/unknown&gt;'));
  assert.ok(html.includes('<code>&lt;unknown&gt;</code>'));
  assert.ok(html.includes('<code>{color=&quot;blue&quot;}</code>'));
});

test('Notion HTML tables preserve rich text and opt-in row/column headers', () => {
  const html = render('<table header-row="true" header-column="true">\n\t<colgroup>\n\t\t<col color="red">\n\t</colgroup>\n\t<tr><td>이름</td><td>설명</td></tr>\n\t<tr><td>노션</td><td>**굵게**와 <span underline="true" color="blue">밑줄</span></td></tr>\n</table>\n끝');
  assert.equal((html.match(/<th\b/g) ?? []).length, 3);
  assert.ok(html.includes('<strong>굵게</strong>'));
  assert.ok(html.includes('class="notion-underline"'));
  assert.ok(html.includes('class="notion-table-scroll"'));
  assert.ok(!html.includes('color="red"') && !html.includes('color="blue"'));
  const plain = render('<table>\n<tr><td>A</td><td>B</td></tr>\n</table>');
  assert.equal((plain.match(/<th\b/g) ?? []).length, 0);
});

test('nested lists, task states and following paragraphs remain distinct', () => {
  const html = render('1. 첫째\n\t- 하위 목록\n\t\t- [x] 완료\n2. 둘째\n별도 문단\n- [ ] 미완료');
  assert.ok(html.includes('<ol>'));
  assert.ok(html.includes('checked=""'));
  assert.ok(html.includes('<p>별도 문단</p>'));
  assert.equal((html.match(/type="checkbox"/g) ?? []).length, 2);
});

test('toggle headings and table of contents link to real rendered headings', () => {
  const html = render('<table_of_contents/>\n# 제목 {color="red"}\n## 토글 제목 {toggle="true" color="blue"}\n\t**본문**\n### 다음 제목');
  assert.ok(html.includes('class="notion-toc"'));
  assert.ok(html.includes('href="#notion-heading-1"'));
  assert.ok(html.includes('id="notion-heading-1"'));
  assert.ok(html.includes('class="notion-toggle-heading"'));
  assert.ok(html.includes('<strong>본문</strong>'));
  assert.ok(!html.includes('{color=') && !html.includes('{toggle='));
});

test('page and database references keep labels and destinations, without live embeds', () => {
  const html = render('<page url="https://notion.so/example">**원본 페이지**</page>\n<database url="https://notion.so/database" inline="true">템플릿 DB</database>\n<synced_block_reference url="https://notion.so/block">\n\t동기화 본문\n</synced_block_reference>');
  assert.ok(html.includes('href="https://notion.so/example"'));
  assert.ok(html.includes('<strong>원본 페이지</strong>'));
  assert.ok(html.includes('템플릿 DB') && html.includes('동기화 본문'));
  assert.ok(!html.includes('<iframe'));
});

test('mentions, dates, line breaks, citations and author colors map to site styles', () => {
  const html = render('<span color="red">**강조**</span><br><mention-page url="https://notion.so/page">페이지</mention-page> <mention-date start="2026-09-14" startTime="10:00" timeZone="Asia/Seoul"/> [^https://example.com/source]\n일반 문단 {color="yellow_bg"}\n<empty-block/>');
  assert.ok(html.includes('class="notion-emphasis"'));
  assert.ok(html.includes('<strong>강조</strong>'));
  assert.ok(html.includes('href="https://notion.so/page"'));
  assert.ok(html.includes('2026-09-14 10:00 Asia/Seoul'));
  assert.ok(html.includes('class="notion-citation"'));
  assert.ok(html.includes('class="notion-empty-block"'));
  assert.ok(!html.includes('yellow_bg') && !html.includes('color="red"'));
});

test('media preserves captions and file links, and equations render safely', () => {
  const html = render('![원본 설명](https://example.com/image.png)\n<video src="https://example.com/video.mp4">동영상 설명</video>\n<audio src="https://example.com/audio.mp3">오디오 설명</audio>\n<pdf src="https://example.com/file.pdf">자료</pdf>\n수식 $x^2$\n$$\nx = 1\n$$');
  assert.ok(html.includes('<figcaption>원본 설명</figcaption>'));
  assert.ok(html.includes('<video') && html.includes('controls=""'));
  assert.ok(html.includes('<audio'));
  assert.ok(html.includes('href="https://example.com/file.pdf"'));
  assert.ok(html.includes('class="katex"'));
});

test('only the leading duplicate title is removed; all original sections stay intact', () => {
  const html = render('# 글 제목\n## 첫째\n본문\n# 큰 제목\n끝', { title: '글 제목' });
  assert.ok(!html.includes('>글 제목<'));
  assert.match(html, /<h1[^>]*>큰 제목<\/h1>/);
  assert.ok(html.includes('본문') && html.includes('끝'));
});

test('ordinary Markdown retains paragraph flow, setext headings and GFM tables', () => {
  const html = render('제목\n===\n\n첫 줄\n다음 줄\n\n| A | B |\n| --- | --- |\n| 1 | 2 |', { flavor: 'markdown' });
  assert.match(html, /<h1[^>]*>제목<\/h1>/);
  assert.ok(html.includes('<p>첫 줄\n다음 줄</p>'));
  assert.ok(html.includes('<table>'));
});

test('unsafe author HTML, scripts, styles and URLs never become active page content', () => {
  const html = render('<span style="color:red" class="hidden" onclick="alert(1)">본문</span>\n[나쁜 링크](javascript:alert%281%29)\n<script>alert(1)</script>\n<iframe src="https://example.com"></iframe>');
  assert.ok(html.includes('본문'));
  assert.ok(!/onclick|style="color|class="hidden"|javascript:|<script|<iframe/.test(html));
});

test('unsupported or unclosed Notion blocks fail instead of silently losing content', () => {
  assert.throws(() => render('<new-block>중요한 내용</new-block>'), /지원되지 않는 문법/);
  assert.throws(() => render('<callout>\n내용'), /닫히지 않은 노션 블록/);
});

test('escaped attributes and indented Markdown code remain literal', () => {
  assert.ok(render('설명 \\{color="red"}').includes('{color=&quot;red&quot;}'));
  assert.ok(render('    {color="red"}', { flavor: 'markdown' }).includes('{color=&quot;red&quot;}'));
});

test('the existing five-things sample is styled without writing extra sections', () => {
  const source = readFileSync(new URL('../content/posts/notion-first-steps.md', import.meta.url), 'utf8');
  const html = render(source, { title: '노션을 처음 켰을 때 가장 먼저 알아야 할 5가지', flavor: 'markdown' });
  assert.equal((html.match(/<h2[^>]*>[1-5]\. /g) ?? []).length, 3);
  assert.ok(html.includes('오늘 바로 해볼 일') && html.includes('다음 단계'));
});

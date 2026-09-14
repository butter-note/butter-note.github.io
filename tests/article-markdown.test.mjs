import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import { remarkArticleTitle } from '../lib/remark-article-title.ts';

function render(content, title) {
  return renderToStaticMarkup(createElement(ReactMarkdown, {
    remarkPlugins: [[remarkArticleTitle, { title }]],
  }, content));
}

test('removes only the leading duplicate title and preserves later H1 content', () => {
  const html = render('# 노션 첫걸음\n\n본문입니다.\n\n# 본문 큰 제목\n\n# 노션 첫걸음', '노션 첫걸음');
  assert.equal(html, '<p>본문입니다.</p>\n<h1>본문 큰 제목</h1>\n<h1>노션 첫걸음</h1>');
});

test('matches formatted headings, links and whitespace by visible text', () => {
  assert.equal(render('\n# **노션** [첫걸음](https://example.com)\n\n본문', ' 노션  첫걸음 '), '<p>본문</p>');
});

test('supports Setext titles without hiding a different first heading', () => {
  assert.equal(render('노션 첫걸음\n===\n\n본문', '노션 첫걸음'), '<p>본문</p>');
  assert.equal(render('# 다른 제목', '노션 첫걸음'), '<h1>다른 제목</h1>');
});

test('preserves headings after an introductory paragraph and H2 headings', () => {
  assert.equal(render('소개\n\n# 노션 첫걸음', '노션 첫걸음'), '<p>소개</p>\n<h1>노션 첫걸음</h1>');
  assert.equal(render('## 노션 첫걸음', '노션 첫걸음'), '<h2>노션 첫걸음</h2>');
});

test('preserves content when no page title exists and handles empty content', () => {
  assert.equal(render('# 제목'), '<h1>제목</h1>');
  assert.equal(render('', '제목'), '');
});

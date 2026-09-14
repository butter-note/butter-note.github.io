import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import { notionMarkdownOptions } from '../lib/notion-renderer.mjs';

const directory = path.resolve('content', 'posts');
const files = (await readdir(directory)).filter((file) => file.endsWith('.md'));
const failures = [];
for (const file of files) {
  try {
    const slug = file.slice(0, -3);
    const meta = JSON.parse(await readFile(path.join(directory, `${slug}.json`), 'utf8'));
    const source = await readFile(path.join(directory, file), 'utf8');
    const options = { title: meta.title, flavor: meta.format ?? (meta.notionPageId ? 'notion' : 'markdown') };
    const html = renderToStaticMarkup(createElement(ReactMarkdown, notionMarkdownOptions(source, options)));
    if (source.trim() && !html.trim()) throw new Error('본문이 비어 있는 화면으로 변환되었습니다.');
    if (meta.notionPageId) {
      const original = await readFile(path.resolve('content', 'notion-originals', `${meta.notionPageId.replaceAll('-', '')}.md`), 'utf8');
      // Validate the untouched Notion response as well as the website's localized images.
      renderToStaticMarkup(createElement(ReactMarkdown, notionMarkdownOptions(original, options)));
    }
    console.log(`본문 변환 확인: ${slug}`);
  } catch (error) {
    failures.push(`${file}: ${error.message}`);
  }
}
if (failures.length) {
  console.error(`본문 변환 실패 — 기존 배포를 유지합니다.\n${failures.join('\n')}`);
  process.exitCode = 1;
} else {
  console.log(`총 ${files.length}개 게시글의 원문/웹 본문 변환을 확인했습니다.`);
}

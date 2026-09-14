import assert from 'node:assert/strict';
import test from 'node:test';
import { getVideoEmbed } from '../lib/video-embed.mjs';
import { partitionPublishedContent, videoFromPage, videoUrlsInMarkdown } from '../scripts/notion-content.mjs';

const select = (name) => ({ select: { name } });
const text = (value) => ({ rich_text: [{ plain_text: value }] });
const page = (id, properties, extra = {}) => ({ object: 'page', id, created_time: '2026-09-14T09:00:00Z', properties, ...extra });

test('YouTube standard, sharing, mobile, Shorts, Live and embed links use a canonical player', () => {
  for (const url of ['https://www.youtube.com/watch?v=M7lc1UVf-VE', 'https://youtu.be/M7lc1UVf-VE?si=tracking', 'https://m.youtube.com/watch?v=M7lc1UVf-VE', 'https://youtube.com/shorts/M7lc1UVf-VE', 'https://youtube.com/live/M7lc1UVf-VE', 'https://www.youtube-nocookie.com/embed/M7lc1UVf-VE?autoplay=1']) {
    const embed = getVideoEmbed(url);
    assert.equal(embed.kind, 'iframe');
    assert.equal(embed.src, 'https://www.youtube-nocookie.com/embed/M7lc1UVf-VE?playsinline=1');
    assert.equal(embed.sourceUrl, url);
  }
});

test('YouTube timestamps are preserved without arbitrary query parameters or autoplay', () => {
  const embed = getVideoEmbed('https://youtu.be/M7lc1UVf-VE?t=1m30s&autoplay=1&origin=https://evil.example');
  assert.equal(new URL(embed.src).searchParams.get('start'), '90');
  assert.ok(!embed.src.includes('autoplay') && !embed.src.includes('evil'));
});

test('Vimeo preserves unlisted privacy hashes', () => {
  for (const url of ['https://vimeo.com/123456789/abcdef1234', 'https://player.vimeo.com/video/123456789?h=abcdef1234&autoplay=1']) {
    const embed = getVideoEmbed(url);
    assert.equal(embed.kind, 'iframe');
    assert.equal(embed.src, 'https://player.vimeo.com/video/123456789?h=abcdef1234&dnt=1');
  }
});

test('direct video files keep signed query strings and use native video, not iframe', () => {
  for (const ext of ['mp4', 'webm', 'ogv', 'ogg']) {
    const url = `https://cdn.example.com/lesson.${ext}?token=example`;
    const embed = getVideoEmbed(url);
    assert.equal(embed.kind, 'video');
    assert.equal(embed.src, url);
  }
});

test('untrusted hosts, malformed IDs and unsafe protocols never become iframe sources', () => {
  for (const url of ['https://youtube.com.evil.example/watch?v=M7lc1UVf-VE', 'https://youtu.be.evil.example/M7lc1UVf-VE', 'https://youtube.com/watch?v=invalid', 'https://vimeo.com/not-a-video', 'https://example.com/watch']) {
    assert.equal(getVideoEmbed(url).kind, 'link');
    assert.equal(getVideoEmbed(url).src, undefined);
  }
  for (const url of ['', 'not a URL', 'javascript:alert(1)', 'data:text/html,test', 'http://example.com/video.mp4', 'https://username:password@youtube.com/watch?v=M7lc1UVf-VE', '<iframe src="https://youtube.com"></iframe>']) {
    assert.equal(getVideoEmbed(url).kind, 'missing');
    assert.equal(getVideoEmbed(url).sourceUrl, undefined);
  }
});

test('only published video-format pages enter lectures, never articles', () => {
  const data = [
    page('video', { 상태: select('발행'), 형식: select('영상') }),
    page('article', { 상태: select('발행'), 형식: select('아티클') }),
    page('legacy', { 상태: select('발행') }),
    page('draft', { 상태: select('초안'), 형식: select('영상') }),
    page('english', { Status: { status: { name: 'Published' } }, Format: select('Video') }),
    page('archived', { 상태: select('발행'), 형식: select('영상') }, { archived: true }),
    page('trash', { 상태: select('발행'), 형식: select('영상') }, { in_trash: true }),
  ];
  const { videos, articles } = partitionPublishedContent(data);
  assert.deepEqual(videos.map((item) => item.id), ['video', 'english']);
  assert.deepEqual(articles.map((item) => item.id), ['article', 'legacy']);
});

test('Notion video metadata uses URL as the player source, not an article slug', () => {
  const item = videoFromPage(page('lesson-id', { 제목: { title: [{ plain_text: '첫 노션 강의' }] }, 요약: text('설명'), URL: { url: 'https://youtu.be/M7lc1UVf-VE' }, 카테고리: select('노션 첫걸음'), 순서: { number: 0 } }));
  assert.equal(item.title, '첫 노션 강의');
  assert.equal(item.description, '설명');
  assert.equal(item.url, 'https://youtu.be/M7lc1UVf-VE');
  assert.equal(item.order, 0);
  assert.equal(item.date, '2026-09-14');
  assert.equal(item.category, '노션 첫걸음');
});

test('missing URLs stay visible as unavailable instead of inventing a video', () => {
  const item = videoFromPage(page('missing', { 이름: { title: [{ plain_text: '영상 준비 중' }] } }));
  assert.equal(item.url, '');
  assert.equal(getVideoEmbed(item.url).kind, 'missing');
});

test('an empty URL property does not hide a populated video URL alias', () => {
  const item = videoFromPage(page('video', { URL: { url: null }, '영상 URL': { url: 'https://youtu.be/M7lc1UVf-VE' } }));
  assert.equal(item.url, 'https://youtu.be/M7lc1UVf-VE');
});

test('video links and native Notion video blocks in the body are recognized and deduplicated', () => {
  const url = 'https://youtu.be/GVBXtqWP4E4?si=5AnWOBCDQXydUONa';
  assert.deepEqual(videoUrlsInMarkdown(`[${url}](${url})\n<video src="${url}">강의</video>`), [url]);
  assert.deepEqual(videoUrlsInMarkdown(`https://www.notion.so/page\n${url}\nhttps://youtu.be/M7lc1UVf-VE`), [url, 'https://youtu.be/M7lc1UVf-VE']);
  assert.deepEqual(videoUrlsInMarkdown('설명만 있는 영상 페이지\nhttps://example.com/'), []);
});

test('the actual Notion URL Files & media property reads an embedded external YouTube link', () => {
  const url = 'https://youtu.be/GVBXtqWP4E4?si=5AnWOBCDQXydUONa';
  const item = videoFromPage(page('actual-format', { URL: { type: 'files', files: [{ name: url, type: 'external', external: { url } }] } }));
  assert.equal(item.url, url);
  assert.equal(getVideoEmbed(item.url).src, 'https://www.youtube-nocookie.com/embed/GVBXtqWP4E4?playsinline=1');
});

test('Files & media supports uploaded video and does not choose between multiple videos', () => {
  const file = (url) => ({ type: 'file', file: { url } });
  assert.equal(videoFromPage(page('upload', { URL: { files: [file('https://cdn.example.com/lesson.mp4?token=example')] } })).url, 'https://cdn.example.com/lesson.mp4?token=example');
  assert.equal(videoFromPage(page('ambiguous', { URL: { files: [file('https://cdn.example.com/one.mp4'), file('https://cdn.example.com/two.mp4')] } })).url, '');
});

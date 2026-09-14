import assert from 'node:assert/strict';
import test from 'node:test';
import { localizeImages } from '../scripts/article-images.mjs';

test('downloads an image without changing an earlier link to the same URL', async () => {
  const saved = [];
  const source = '[출처](https://example.com/a.png)\n\n![설명](https://example.com/a.png)';
  const html = await localizeImages(source, 'test', {
    fetchImage: async () => new Response('image bytes', { headers: { 'content-type': 'image/png' } }),
    save: async (...args) => saved.push(args),
  });
  assert.equal(html, '[출처](https://example.com/a.png)\n\n![설명](/content/test/image-1.png)');
  assert.equal(saved[0][0], 'test');
  assert.equal(saved[0][1], 'image-1.png');
  assert.equal(saved[0][2].toString(), 'image bytes');
});

test('keeps article text and an original link when an image expires, without logging signatures', async () => {
  const warnings = [];
  const url = 'https://example.com/expired.png?signature=private-value';
  const result = await localizeImages(`앞 문단\n\n![설명](${url})\n\n뒤 문단`, 'test', {
    fetchImage: async () => new Response(null, { status: 403 }),
    save: async () => assert.fail('Unavailable images must not be saved'),
    warn: (message) => warnings.push(message),
  });
  assert.ok(result.includes('앞 문단') && result.includes('뒤 문단'));
  assert.ok(result.includes('이미지를 불러올 수 없습니다. (설명)'));
  assert.ok(result.includes(`[원본 이미지 보기](${url})`));
  assert.ok(warnings[0].includes('HTTP 403'));
  assert.ok(!warnings[0].includes('private-value'));
});

test('continues to download later images after a network failure', async () => {
  const saved = [];
  const result = await localizeImages('![첫째](https://example.com/bad)\n\n![둘째](https://example.com/good)', 'test', {
    fetchImage: async (url) => {
      if (url.endsWith('/bad')) throw new Error('network failure');
      return new Response('bytes', { headers: { 'content-type': 'image/webp' } });
    },
    save: async (...args) => saved.push(args),
    warn: () => {},
  });
  assert.ok(result.includes('이미지를 불러올 수 없습니다.'));
  assert.ok(result.includes('![둘째](/content/test/image-2.webp)'));
  assert.equal(saved.length, 1);
});

test('does not save HTML error pages as images', async () => {
  const result = await localizeImages('![오류](https://example.com/error)', 'test', {
    fetchImage: async () => new Response('<html>Error</html>', { headers: { 'content-type': 'text/html' } }),
    save: async () => assert.fail('HTML must not be saved as an image'),
    warn: () => {},
  });
  assert.ok(result.includes('이미지를 불러올 수 없습니다.'));
});

test('still fails on local storage errors', async () => {
  await assert.rejects(localizeImages('![사진](https://example.com/a.png)', 'test', {
    fetchImage: async () => new Response('image', { headers: { 'content-type': 'image/png' } }),
    save: async () => { throw new Error('disk full'); },
  }), /disk full/);
});

import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

test('an empty catalog exports only a not-found placeholder, and Notion posts keep their real paths', async () => {
  const originalCwd = process.cwd();
  const temporary = mkdtempSync(path.join(os.tmpdir(), 'butternote-posts-'));
  const directory = path.join(temporary, 'content', 'posts');
  mkdirSync(directory, { recursive: true });
  try {
    process.chdir(temporary);
    const posts = await import(pathToFileURL(path.join(originalCwd, 'lib', 'posts.ts')).href);
    assert.deepEqual(posts.getPosts(), []);
    assert.deepEqual(posts.getPostStaticParams(), [{ slug: '__empty__' }]);
    assert.equal(posts.getPostBySlug('__empty__'), undefined);

    const meta = { slug: 'notion-linked-post', title: '노션을 처음 켰을 때 가장 먼저 알아야 할 5가지', date: '2026-09-14', notionPageId: 'linked-page', format: 'notion' };
    writeFileSync(path.join(directory, `${meta.slug}.json`), JSON.stringify(meta));
    writeFileSync(path.join(directory, `${meta.slug}.md`), '# 노션 원본\n\n원본 내용');
    assert.deepEqual(posts.getPostStaticParams(), [{ slug: meta.slug }]);
    assert.equal(posts.getPostBySlug(meta.slug).notionPageId, meta.notionPageId);
    assert.equal(posts.getPostBySlug(meta.slug).content, '# 노션 원본\n\n원본 내용');
    assert.equal(posts.getPostBySlug('notion-first-steps'), undefined);
  } finally {
    process.chdir(originalCwd);
    assert.equal(path.dirname(path.resolve(temporary)), path.resolve(os.tmpdir()));
    assert.ok(path.basename(temporary).startsWith('butternote-posts-'));
    rmSync(temporary, { recursive: true, force: true });
  }
});

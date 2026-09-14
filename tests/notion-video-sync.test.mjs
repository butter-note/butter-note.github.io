import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, mkdir, writeFile, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execFile);
test('real sync paginates, separates videos, replaces the video list and preserves hand-written posts', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'butternote-video-test-'));
  try {
    const posts = path.join(directory, 'content', 'posts');
    await mkdir(posts, { recursive: true });
    await writeFile(path.join(posts, 'converted-video.json'), JSON.stringify({ notionPageId: 'converted-video' }));
    await writeFile(path.join(posts, 'converted-video.md'), '이전에 아티클로 동기화된 영상');
    await writeFile(path.join(posts, 'manual.json'), JSON.stringify({ title: '직접 작성한 글' }));
    await writeFile(path.join(posts, 'manual.md'), '수정하지 않는 사용자 원문');
    const run = (draft = false) => exec(process.execPath, [
      '--import', new URL('./fixtures/notion-video-api.mjs', import.meta.url).href,
      fileURLToPath(new URL('../scripts/sync-notion.mjs', import.meta.url)),
    ], { cwd: directory, env: { ...process.env, NOTION_API_KEY: 'test-only', NOTION_DATA_SOURCE_ID: 'test-source', NOTION_FIXTURE_DRAFT: draft ? '1' : '0' } });

    const first = await run();
    assert.match(first.stdout, /1개의 글과 1개의 무료 강의/);
    assert.deepEqual((await readdir(posts)).sort(), ['manual.json', 'manual.md', 'new-article.json', 'new-article.md']);
    const videosFile = path.join(directory, 'content', 'videos', 'videos.json');
    const videos = JSON.parse(await readFile(videosFile, 'utf8'));
    assert.equal(videos.length, 1);
    assert.equal(videos[0].id, 'converted-video');
    assert.equal(videos[0].url, 'https://youtu.be/M7lc1UVf-VE');
    assert.equal(await readFile(path.join(directory, 'content', 'notion-originals', 'newarticle.md'), 'utf8'), '# 원문\n내용 유지');

    await run(true);
    assert.deepEqual(JSON.parse(await readFile(videosFile, 'utf8')), []);
    assert.deepEqual((await readdir(posts)).sort(), ['manual.json', 'manual.md']);
    assert.equal(await readFile(path.join(posts, 'manual.md'), 'utf8'), '수정하지 않는 사용자 원문');
  } finally {
    const resolved = path.resolve(directory);
    assert.equal(path.dirname(resolved), path.resolve(tmpdir()));
    assert.ok(path.basename(resolved).startsWith('butternote-video-test-'));
    await rm(resolved, { recursive: true, force: true });
  }
});

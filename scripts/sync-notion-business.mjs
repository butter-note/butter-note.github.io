import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { setTimeout } from 'node:timers/promises';
import { collectBusinessContent } from './notion-business.mjs';
import { localizeImages } from './article-images.mjs';

const clean = (value) => (value ?? '').replace(/^\uFEFF/, '').trim().replace(/^['"]|['"]$/g, '');

export function createNotionRequest(apiKey, { fetchApi = fetch, sleep = setTimeout } = {}) {
  return async (endpoint, { method = 'GET', body } = {}) => {
    for (let attempt = 0; attempt < 4; attempt++) {
      await sleep(350);
      const response = await fetchApi(`https://api.notion.com${endpoint}`, {
        method,
        headers: { Authorization: `Bearer ${apiKey}`, 'Notion-Version': '2026-03-11', 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(30000),
      });
      if (response.ok) return response.json();
      if ((response.status === 429 || response.status >= 500) && attempt < 3) {
        const retry = Number(response.headers.get('retry-after')) || 2 ** attempt;
        await sleep(Math.min(Math.max(retry, 1), 30) * 1000);
        continue;
      }
      // Do not log API response bodies, authorization headers or private data.
      throw new Error(`Notion HTTP ${response.status}. ${[403, 404].includes(response.status) ? '두 원본 DB를 기존 홈페이지 Integration에 연결하고 읽기 권한을 확인해주세요.' : '잠시 후 다시 동기화해주세요.'}`);
    }
    throw new Error('Notion 요청 재시도 횟수를 초과했습니다.');
  };
}

export async function syncBusinessContent({ request, config, directory = path.resolve('content/business'), localize = localizeImages }) {
  const bundle = await collectBusinessContent({ request, config, localize });
  await mkdir(directory, { recursive: true });
  const temporaryPath = path.join(directory, 'content.json.tmp');
  await writeFile(temporaryPath, `${JSON.stringify(bundle, null, 2)}\n`, 'utf8');
  // Both DBs must finish successfully before replacing the prior public snapshot.
  await rename(temporaryPath, path.join(directory, 'content.json'));
  return bundle;
}

async function main() {
  const apiKey = clean(process.env.NOTION_API_KEY);
  if (!apiKey) throw new Error('NOTION_API_KEY가 필요합니다. 키를 코드나 공개 저장소에 넣지 마세요.');
  const config = JSON.parse(await readFile(new URL('../config/notion-business.json', import.meta.url), 'utf8'));
  config.cases.dataSourceId = clean(process.env.NOTION_CASES_DATA_SOURCE_ID);
  config.faqs.dataSourceId = clean(process.env.NOTION_FAQ_DATA_SOURCE_ID);
  const bundle = await syncBusinessContent({ request: createNotionRequest(apiKey), config });
  console.log(`노션 동기화 완료: 구축 사례 ${bundle.cases.length}개, FAQ ${bundle.faqs.length}개 (공개 항목만)`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}

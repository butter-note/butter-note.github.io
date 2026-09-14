import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const imageExtensions = {
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/jpeg': 'jpg',
  'image/avif': 'avif',
  'image/svg+xml': 'svg',
};

async function saveImage(slug, fileName, bytes) {
  const directory = path.resolve('public', 'content', slug);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, fileName), bytes);
}

export async function localizeImages(markdown, slug, {
  fetchImage = fetch,
  save = saveImage,
  warn = console.warn,
} = {}) {
  const matches = [...markdown.matchAll(/!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g)];
  let localized = markdown;

  for (const [index, match] of matches.entries()) {
    let bytes;
    let extension;
    let failureReason = '네트워크 또는 이미지 형식 오류';
    try {
      const response = await fetchImage(match[2], { signal: AbortSignal.timeout(15000) });
      if (!response.ok) {
        failureReason = `HTTP ${response.status}`;
        throw new Error(failureReason);
      }
      const type = response.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
      extension = imageExtensions[type];
      if (!extension) throw new Error('이미지 응답이 아닙니다.');
      bytes = Buffer.from(await response.arrayBuffer());
    } catch {
      // Keep the article readable without exposing signed URL parameters in build logs.
      warn(`이미지 표시 불가: ${slug} #${index + 1} (${new URL(match[2]).hostname}, ${failureReason}). 노션에서 이미지를 다시 첨부해주세요.`);
      const alt = match[1].replace(/[\r\n]+/g, ' ').replace(/([\\`*_[\]<>])/g, '\\$1');
      const notice = `\n\n> 🖼️ 이미지를 불러올 수 없습니다.${alt ? ` (${alt})` : ''} [원본 이미지 보기](${match[2]})\n\n`;
      localized = localized.replace(match[0], notice);
      continue;
    }

    // File-system failures still stop deployment instead of silently losing downloaded files.
    const fileName = `image-${index + 1}.${extension}`;
    await save(slug, fileName, bytes);
    localized = localized.replace(match[0], `![${match[1]}](/content/${slug}/${fileName})`);
  }

  return localized;
}

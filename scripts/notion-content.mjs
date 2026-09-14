export function richText(property) {
  return (property?.title ?? property?.rich_text ?? []).map((item) => item.plain_text ?? item.text?.content ?? '').join('').trim();
}

export function selectName(property) {
  return (property?.status?.name ?? property?.select?.name ?? '').trim();
}

export function partitionPublishedContent(pages) {
  const articles = [];
  const videos = [];
  for (const page of pages) {
    if (page.object !== 'page' || page.archived || page.in_trash) continue;
    const properties = page.properties ?? {};
    if (!['발행', 'Published'].includes(selectName(properties.상태 ?? properties.Status))) continue;
    const format = selectName(properties.형식 ?? properties.Format).toLowerCase();
    (['영상', 'video'].includes(format) ? videos : articles).push(page);
  }
  return { articles, videos };
}

export function videoFromPage(page) {
  const p = page.properties ?? {};
  const urlProperty = p.URL ?? p['영상 URL'] ?? p.VideoURL;
  return {
    id: page.id,
    title: richText(p.이름 ?? p.Name ?? p.제목 ?? p.Title) || '제목 없는 강의',
    description: richText(p.요약 ?? p.Description),
    url: (urlProperty?.url ?? richText(urlProperty)).trim(),
    category: selectName(p.카테고리 ?? p.Category) || '노션 기초',
    date: (p.발행일?.date?.start ?? p.Date?.date?.start ?? page.created_time ?? '').slice(0, 10),
    order: p.순서?.number ?? p.Order?.number ?? 9999,
  };
}

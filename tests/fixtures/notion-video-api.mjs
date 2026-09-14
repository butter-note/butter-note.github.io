const select = (name) => ({ select: { name } });
const text = (value) => ({ rich_text: [{ plain_text: value }] });
const page = (id, format, status) => ({
  object: 'page', id, created_time: '2026-09-14T09:00:00Z', url: `https://www.notion.so/${id}`,
  properties: {
    이름: { title: [{ plain_text: id }] }, 상태: select(status), 형식: select(format),
    Slug: text(id), URL: { url: process.env.NOTION_FIXTURE_BODY === '1' && format === '영상' ? null : 'https://youtu.be/M7lc1UVf-VE' },
  },
});

// Scoped to the child process that runs the real sync script; no network is used.
globalThis.fetch = async (input, options = {}) => {
  const url = new URL(input);
  if (url.hostname !== 'api.notion.com') throw new Error('Unexpected network request in sync test');
  if (url.pathname.endsWith('/query')) {
    const body = JSON.parse(options.body);
    const published = process.env.NOTION_FIXTURE_DRAFT === '1' ? '초안' : '발행';
    return Response.json(body.start_cursor ? {
      results: [page('new-article', '아티클', published), page('draft-video', '영상', '초안')], has_more: false,
    } : {
      results: [page('converted-video', '영상', published)], has_more: true, next_cursor: 'second-page',
    });
  }
  if (url.pathname === '/v1/pages/new-article/markdown') return Response.json({ markdown: '# 원문\n내용 유지', truncated: false, unknown_block_ids: [] });
  if (url.pathname === '/v1/pages/converted-video/markdown' && process.env.NOTION_FIXTURE_BODY === '1') return Response.json({ markdown: '<video src="https://youtu.be/GVBXtqWP4E4?si=5AnWOBCDQXydUONa"/>', truncated: false, unknown_block_ids: [] });
  throw new Error(`Video or draft body should never be fetched: ${url.pathname}`);
};

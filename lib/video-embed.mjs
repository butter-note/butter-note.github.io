/** @typedef {{kind: 'iframe' | 'video' | 'link' | 'missing', provider: string, src?: string, sourceUrl?: string}} VideoEmbed */

function timestamp(value) {
  if (/^\d+$/.test(value)) return Math.min(Number(value), 86400);
  const parts = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  return parts ? Math.min(Number(parts[1] ?? 0) * 3600 + Number(parts[2] ?? 0) * 60 + Number(parts[3] ?? 0), 86400) : 0;
}

/** Convert known video URLs, never arbitrary HTML or arbitrary iframe hosts.
 * @param {string} value
 * @returns {VideoEmbed}
 */
export function getVideoEmbed(value) {
  let url;
  try { url = new URL(value.trim()); } catch { return { kind: 'missing', provider: '' }; }
  if (url.protocol !== 'https:' || url.username || url.password || url.port) return { kind: 'missing', provider: '' };
  const host = url.hostname.toLowerCase();
  const segments = url.pathname.split('/').filter(Boolean);
  const fallback = { kind: /** @type {const} */ ('link'), provider: '외부 영상', sourceUrl: url.href };

  if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtu.be', 'youtube-nocookie.com', 'www.youtube-nocookie.com'].includes(host)) {
    const id = host.endsWith('youtu.be') ? segments[0]
      : segments[0] === 'watch' ? url.searchParams.get('v')
      : ['embed', 'shorts', 'live'].includes(segments[0]) ? segments[1] : '';
    if (!id || !/^[\w-]{11}$/.test(id)) return fallback;
    const embed = new URL(`https://www.youtube-nocookie.com/embed/${id}`);
    embed.searchParams.set('playsinline', '1');
    const start = timestamp(url.searchParams.get('start') ?? url.searchParams.get('t') ?? '');
    if (start) embed.searchParams.set('start', String(start));
    return { kind: 'iframe', provider: 'YouTube', src: embed.href, sourceUrl: url.href };
  }

  if (['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'].includes(host)) {
    const id = host === 'player.vimeo.com' && segments[0] === 'video' ? segments[1] : segments[0];
    if (!id || !/^\d+$/.test(id)) return fallback;
    const embed = new URL(`https://player.vimeo.com/video/${id}`);
    const hash = url.searchParams.get('h') ?? (host !== 'player.vimeo.com' ? segments[1] : '');
    if (hash && /^[a-z0-9]+$/i.test(hash)) embed.searchParams.set('h', hash);
    embed.searchParams.set('dnt', '1');
    return { kind: 'iframe', provider: 'Vimeo', src: embed.href, sourceUrl: url.href };
  }

  if (/\.(mp4|webm|ogv|ogg)$/i.test(url.pathname)) return { kind: 'video', provider: '동영상', src: url.href, sourceUrl: url.href };
  return fallback;
}

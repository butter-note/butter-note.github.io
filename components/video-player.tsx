import { CirclePlay } from 'lucide-react';
import { getVideoEmbed } from '@/lib/video-embed.mjs';

export function VideoPlayer({ url, title }: { url: string; title: string }) {
  const embed = getVideoEmbed(url);
  return (
    <div className="lesson-player">
      {embed.kind === 'iframe' ? (
        <iframe
          src={embed.src}
          title={`${title} — ${embed.provider} 영상`}
          width="640"
          height="360"
          loading="lazy"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : embed.kind === 'video' ? (
        // Caption files are not supplied by the content DB; do not invent an empty caption track.
        // oxlint-disable-next-line jsx-a11y/media-has-caption
        <video src={embed.src} controls playsInline preload="none" aria-label={`${title} 영상`}>
          <a href={embed.sourceUrl}>원본 영상 보기</a>
        </video>
      ) : (
        <div className="lesson-player-message">
          <CirclePlay size={36} aria-hidden="true" />
          <p>{embed.kind === 'link' ? '이 영상은 원본 페이지에서 볼 수 있어요.' : '영상 링크를 준비하고 있어요.'}</p>
        </div>
      )}
    </div>
  );
}

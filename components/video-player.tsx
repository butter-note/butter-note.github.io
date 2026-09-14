'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Dialog } from '@base-ui/react/dialog';
import { ArrowUpRight, CirclePlay, Maximize2, X } from 'lucide-react';
import { getVideoPlayerAssets } from '@/lib/video-embed.mjs';

export function VideoPlayer({ url, title }: { url: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);
  const embed = getVideoPlayerAssets(url);
  const playable = embed.kind === 'iframe' || embed.kind === 'video';

  if (!playable) return (
    <div className="lesson-player">
      <div className="lesson-player-message">
        <CirclePlay size={36} aria-hidden="true" />
        <p>{embed.kind === 'link' ? '이 영상은 원본 페이지에서 볼 수 있어요.' : '영상 링크를 준비하고 있어요.'}</p>
      </div>
    </div>
  );

  return (
    <div className="lesson-player">
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger className="lesson-play-trigger" aria-label={`${title} 크게 재생`}>
          {embed.poster && !posterFailed ? (
            <Image className="lesson-video-thumbnail" src={embed.poster} width={640} height={360} alt="" unoptimized onError={() => setPosterFailed(true)} />
          ) : <span className="lesson-video-placeholder" aria-hidden="true">{embed.provider}</span>}
          <span className="lesson-enlarge-label"><Maximize2 size={15} aria-hidden="true" /> 크게 재생</span>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Backdrop className="video-dialog-backdrop" />
          <Dialog.Popup className="video-dialog" aria-modal="true">
            <div className="video-dialog-header">
              <Dialog.Title className="video-dialog-title">{title}</Dialog.Title>
              <Dialog.Close className="video-dialog-close" aria-label="영상 닫기"><X size={24} aria-hidden="true" /></Dialog.Close>
            </div>
            <div className="video-dialog-player">
              {/* Unmount on every close path so hidden videos cannot keep playing. */}
              {open && (embed.kind === 'iframe' ? (
                <iframe
                  src={embed.playbackSrc}
                  title={`${title} — ${embed.provider} 영상`}
                  width="1100"
                  height="619"
                  allow="autoplay; accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              ) : (
                // The DB does not supply caption files; do not invent an empty caption track.
                // oxlint-disable-next-line jsx-a11y/media-has-caption
                <video src={embed.playbackSrc} controls playsInline autoPlay aria-label={`${title} 영상`}>
                  <a href={embed.sourceUrl}>원본 영상 보기</a>
                </video>
              ))}
            </div>
            <div className="video-dialog-footer">
              <Dialog.Description>무료 강의 · {embed.provider}</Dialog.Description>
              <a href={embed.sourceUrl} target="_blank" rel="noopener noreferrer">원본 영상 보기 <ArrowUpRight size={16} aria-hidden="true" /></a>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

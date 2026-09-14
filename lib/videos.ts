import fs from 'node:fs';
import path from 'node:path';
import { getVideoEmbed } from './video-embed.mjs';

export type VideoLesson = {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  date: string;
  order: number;
};

export function getVideos() {
  const items = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'content', 'videos', 'videos.json'), 'utf8')) as VideoLesson[];
  return items
    .sort((a, b) => a.order - b.order || b.date.localeCompare(a.date) || a.title.localeCompare(b.title, 'ko'))
    .map((item) => ({ ...item, embed: getVideoEmbed(item.url) }));
}

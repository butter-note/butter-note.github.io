import fs from 'node:fs';
import path from 'node:path';

export type TemplateItem = {
  id: string;
  name: string;
  description: string;
  marketplace: string;
  url: string;
  cover: string;
  price: string;
  status: string;
  order: number;
  featured: boolean;
};

export function getTemplates(): TemplateItem[] {
  const filePath = path.join(process.cwd(), 'content', 'templates', 'templates.json');
  const items = JSON.parse(fs.readFileSync(filePath, 'utf8')) as TemplateItem[];
  return items.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, 'ko'));
}

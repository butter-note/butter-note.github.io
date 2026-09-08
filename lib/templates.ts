import fs from 'node:fs';
import path from 'node:path';

export type SalesListing = {
  id: string;
  marketplace: string;
  url: string;
  status: string;
  price: number | null;
  priceLabel: string;
  buttonLabel: string;
  order: number;
};

export type TemplateItem = {
  id: string;
  slug: string;
  name: string;
  description: string;
  cover: string;
  status: string;
  category: string;
  version: string;
  updatedAt: string;
  order: number;
  featured: boolean;
  listings: SalesListing[];
};

export function getTemplates(): TemplateItem[] {
  const filePath = path.join(process.cwd(), 'content', 'templates', 'templates.json');
  const items = JSON.parse(fs.readFileSync(filePath, 'utf8')) as TemplateItem[];
  return items.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, 'ko'));
}

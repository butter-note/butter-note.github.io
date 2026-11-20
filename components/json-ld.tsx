import { serializeJsonLd, type Json } from '@/lib/structured-data';

/** Structured data for search and AI answer engines, rendered into the static HTML. Empty entries render nothing. */
export function JsonLd({ data }: { data: Json | null | (Json | null)[] }) {
  const items = (Array.isArray(data) ? data : [data]).filter((item): item is Json => Boolean(item));
  if (!items.length) return null;
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(items.length === 1 ? items[0] : items) }} />;
}

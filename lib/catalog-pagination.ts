export function paginateCatalog<T>(items: readonly T[], requestedPage: number, pageSize: number) {
  if (!Number.isInteger(pageSize) || pageSize < 1) throw new RangeError('pageSize must be a positive integer');
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const page = Number.isFinite(requestedPage) ? Math.floor(requestedPage) : 1;
  const currentPage = Math.min(Math.max(page, 1), Math.max(totalPages, 1));
  const offset = (currentPage - 1) * pageSize;
  return {
    items: items.slice(offset, offset + pageSize),
    totalItems,
    totalPages,
    currentPage,
    start: totalItems ? offset + 1 : 0,
    end: Math.min(offset + pageSize, totalItems),
  };
}

/** Keep at most five tokens so the controls also fit a narrow phone. */
export function getPaginationTokens(currentPage: number, totalPages: number): (number | 'start-gap' | 'end-gap')[] {
  if (!Number.isInteger(totalPages) || totalPages < 1) return [];
  const page = Math.min(Math.max(Number.isFinite(currentPage) ? Math.floor(currentPage) : 1, 1), totalPages);
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1);
  if (page <= 3) return [1, 2, 3, 'end-gap', totalPages];
  if (page >= totalPages - 2) return [1, 'start-gap', totalPages - 2, totalPages - 1, totalPages];
  return [1, 'start-gap', page, 'end-gap', totalPages];
}

// Shared pagination helpers for list pages.
// Server Components parse `?page=` from searchParams, domain services use
// { skip, take } against Prisma, and the Pager component renders the controls.

export const DEFAULT_PAGE_SIZE = 20;

export type PageParams = {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
};

export function parsePage(
  value: string | undefined,
  pageSize: number = DEFAULT_PAGE_SIZE
): PageParams {
  const parsed = Number.parseInt(value ?? "1", 10);
  const page = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}

export type Paginated<T> = {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export function buildPaginated<T>(
  rows: T[],
  total: number,
  { page, pageSize }: PageParams
): Paginated<T> {
  return {
    rows,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

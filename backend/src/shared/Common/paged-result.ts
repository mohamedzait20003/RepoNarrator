/**
 * Standard envelope for paginated list endpoints. Wrapped by ResponseInterceptor
 * into `{ Message, Data: PagedResult<T> }`.
 */
export interface PagedResult<T> {
  Items: T[];
  Page: number;
  PageSize: number;
  Total: number;
  TotalPages: number;
  HasNext: boolean;
  HasPrev: boolean;
}

/** Builds a PagedResult from a full in-memory list (server-side pagination). */
export function paginate<T>(
  all: T[],
  page: number,
  pageSize: number,
): PagedResult<T> {
  const total = all.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(page, 1), totalPages);
  const start = (current - 1) * pageSize;

  return {
    Items: all.slice(start, start + pageSize),
    Page: current,
    PageSize: pageSize,
    Total: total,
    TotalPages: totalPages,
    HasNext: current < totalPages,
    HasPrev: current > 1,
  };
}

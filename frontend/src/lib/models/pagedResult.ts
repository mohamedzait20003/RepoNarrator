/** Shared envelope for paginated list responses (mirrors the backend). */
export interface PagedResult<T> {
  Items: T[];
  Page: number;
  PageSize: number;
  Total: number;
  TotalPages: number;
  HasNext: boolean;
  HasPrev: boolean;
}

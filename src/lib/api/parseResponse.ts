/**
 * Parse the standard API response envelope.
 * Handles both { data: T[] , total } and plain T[] shapes.
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
}

export function parseApiData<T>(responseData: unknown): T {
  const outer = responseData as { data?: unknown } | undefined;
  if (outer && typeof outer === 'object' && 'data' in outer) {
    return outer.data as T;
  }
  return responseData as T;
}

export function parsePaginatedData<T>(responseData: unknown): PaginatedResult<T> {
  const inner = parseApiData<PaginatedResult<T> | T[]>(responseData);
  if (Array.isArray(inner)) {
    return { data: inner, total: inner.length };
  }
  if (inner && typeof inner === 'object' && 'data' in inner) {
    const obj = inner as PaginatedResult<T>;
    return { data: obj.data ?? [], total: obj.total ?? (obj.data?.length ?? 0) };
  }
  return { data: [], total: 0 };
}

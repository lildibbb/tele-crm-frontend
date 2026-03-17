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
  if (outer && typeof outer === "object" && "data" in outer) {
    return outer.data as T;
  }
  return responseData as T;
}

export function parsePaginatedData<T>(
  responseData: unknown,
): PaginatedResult<T> {
  const outer = responseData as
    | { data?: unknown; meta?: { total?: number } }
    | undefined;

  // If the raw response has an array 'data' and a 'meta.total'
  if (outer && typeof outer === "object" && "data" in outer) {
    if (Array.isArray(outer.data)) {
      if (typeof outer.meta?.total === "number") {
        return { data: outer.data as T[], total: outer.meta.total };
      }
    }
  }

  const inner = parseApiData<PaginatedResult<T> | T[]>(responseData);
  if (Array.isArray(inner)) {
    return { data: inner, total: inner.length };
  }
  if (inner && typeof inner === "object" && "data" in inner) {
    const obj = inner as PaginatedResult<T> & { meta?: { total?: number } };
    return {
      data: obj.data ?? [],
      total: obj.total ?? obj.meta?.total ?? obj.data?.length ?? 0,
    };
  }
  return { data: [], total: 0 };
}

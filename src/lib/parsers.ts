import {
  createParser,
  parseAsArrayOf,
  parseAsString,
  parseAsStringEnum,
} from "nuqs";
import { z } from "zod";
import { FILTER_OPERATORS, type FilterOperatorValue } from "@/config/data-table";
import type { DataTableConfig } from "@/config/data-table";
import type { ExtendedColumnFilter, ExtendedColumnSort } from "@/types/data-table";

type FilterVariant = DataTableConfig["filterVariants"][number];

// ── Sorting parser ────────────────────────────────────────────────────────────

/**
 * Parses sorting state from URL search params.
 * Format: `field.asc,other.desc`
 */
export function getSortingStateParser<TData>(columnIds?: Set<string>) {
  return createParser<ExtendedColumnSort<TData>[]>({
    parse(value: string): ExtendedColumnSort<TData>[] {
      return value
        .split(",")
        .map((item) => {
          const lastDot = item.lastIndexOf(".");
          if (lastDot === -1) return null;
          const id = item.slice(0, lastDot) as Extract<keyof TData, string>;
          const dir = item.slice(lastDot + 1);
          if (dir !== "asc" && dir !== "desc") return null;
          if (columnIds && !columnIds.has(id)) return null;
          return { id, desc: dir === "desc" };
        })
        .filter((x): x is ExtendedColumnSort<TData> => x !== null);
    },
    serialize(value: ExtendedColumnSort<TData>[]): string {
      return value
        .map((s) => `${String(s.id)}.${s.desc ? "desc" : "asc"}`)
        .join(",");
    },
    eq(a, b) {
      return JSON.stringify(a) === JSON.stringify(b);
    },
  });
}

// ── Filter item schema ────────────────────────────────────────────────────────

export const FilterItemSchema = z.object({
  id: z.string(),
  filterId: z.string(),
  value: z.union([z.string(), z.array(z.string())]),
  operator: z.enum(FILTER_OPERATORS).default("iLike"),
  variant: z.enum(["text", "number", "range", "date", "dateRange", "select", "multiSelect", "boolean"] as const).optional(),
});

export type FilterItemSchema = z.infer<typeof FilterItemSchema>;

// ── Filters state parser ──────────────────────────────────────────────────────

/**
 * Parses advanced filters array from a URL param.
 * Stored as JSON string. Casts `id` to Extract<keyof TData, string> for type safety.
 */
export function getFiltersStateParser<TData>(_columnIds?: string[]) {
  return createParser<ExtendedColumnFilter<TData>[]>({
    parse(value: string): ExtendedColumnFilter<TData>[] {
      try {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed)) return [];
        return parsed.flatMap((item) => {
          const result = FilterItemSchema.safeParse(item);
          if (!result.success) return [];
          return [result.data as unknown as ExtendedColumnFilter<TData>];
        });
      } catch {
        return [];
      }
    },
    serialize(value: ExtendedColumnFilter<TData>[]): string {
      return JSON.stringify(value);
    },
    eq(a, b) {
      return JSON.stringify(a) === JSON.stringify(b);
    },
  });
}

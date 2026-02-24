import type { Column } from "@tanstack/react-table";
import type { CSSProperties } from "react";
import { FILTER_OPERATORS, type FilterOperatorValue } from "@/config/data-table";
import type { DataTableConfig } from "@/config/data-table";

type FilterVariant = DataTableConfig["filterVariants"][number];

const OPERATOR_DISPLAY_LABELS: Record<FilterOperatorValue, string> = {
  iLike: "contains",
  notILike: "does not contain",
  eq: "is",
  notEq: "is not",
  isNull: "is empty",
  isNotNull: "is not empty",
  isEmpty: "is empty",
  isNotEmpty: "is not empty",
  isBetween: "is between",
  gt: "is greater than",
  gte: "is greater than or equal to",
  lt: "is less than",
  lte: "is less than or equal to",
  inArray: "is in",
  notInArray: "is not in",
  between: "is between",
  notBetween: "is not between",
};

/**
 * Operator values (strings) per filter variant.
 */
const VARIANT_OPERATORS: Record<FilterVariant, FilterOperatorValue[]> = {
  text: ["iLike", "notILike", "eq", "notEq", "isNull", "isNotNull"],
  number: ["eq", "notEq", "gt", "gte", "lt", "lte", "isNull", "isNotNull"],
  range: ["between", "notBetween", "gt", "gte", "lt", "lte"],
  date: ["eq", "notEq", "isBetween", "gt", "gte", "lt", "lte", "isNull", "isNotNull"],
  dateRange: ["isBetween", "between", "notBetween"],
  select: ["eq", "notEq", "isNull", "isNotNull"],
  multiSelect: ["inArray", "notInArray", "isNull", "isNotNull"],
  boolean: ["eq", "notEq", "isNull", "isNotNull"],
};

export function getFilterOperators(variant?: FilterVariant): { value: FilterOperatorValue; label: string }[] {
  const values: FilterOperatorValue[] = variant
    ? (VARIANT_OPERATORS[variant] ?? ["eq", "notEq"])
    : ["eq", "notEq", "iLike", "notILike"];
  return values.map((v) => ({ value: v, label: OPERATOR_DISPLAY_LABELS[v] }));
}

export function getDefaultFilterOperator(variant?: FilterVariant): FilterOperatorValue {
  const ops = VARIANT_OPERATORS[variant ?? "text"];
  return ops?.[0] ?? "eq";
}

/**
 * Returns inline CSS for a pinned column (sticky positioning).
 */
export function getColumnPinningStyle<TData>({
  column,
}: {
  column: Column<TData, unknown>;
}): CSSProperties {
  const isPinned = column.getIsPinned();
  if (!isPinned) return {};
  return {
    position: "sticky",
    left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
    right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
    zIndex: 1,
    background: "inherit",
  };
}

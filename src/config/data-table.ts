export const FILTER_OPERATORS = [
  "iLike", "notILike", "eq", "notEq", "isNull", "isNotNull",
  "isEmpty", "isNotEmpty", "isBetween",
  "gt", "gte", "lt", "lte",
  "inArray", "notInArray", "between", "notBetween",
] as const;

export type FilterOperatorValue = (typeof FILTER_OPERATORS)[number];

const OPERATOR_LABELS: Record<FilterOperatorValue, string> = {
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

export const dataTableConfig = {
  operators: FILTER_OPERATORS.map((v) => ({
    value: v,
    label: OPERATOR_LABELS[v],
  })),
  filterVariants: ["text", "number", "range", "date", "dateRange", "select", "multiSelect", "boolean"] as const,
  joinOperators: ["and", "or"] as const,
  sortOrders: [
    { value: "asc" as const, label: "Ascending" },
    { value: "desc" as const, label: "Descending" },
  ],
} as const;

export type DataTableConfig = typeof dataTableConfig;

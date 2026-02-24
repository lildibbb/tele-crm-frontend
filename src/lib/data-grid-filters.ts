import type { FilterOperator } from "@/types/data-grid";

interface OperatorOption {
  value: FilterOperator;
  label: string;
}

const toOptions = (ops: FilterOperator[]): OperatorOption[] =>
  ops.map((op) => ({ value: op, label: op }));

const TEXT_OPERATORS = toOptions([
  "contains",
  "notContains",
  "equals",
  "notEquals",
  "startsWith",
  "endsWith",
  "isEmpty",
  "isNotEmpty",
]);

const NUMBER_OPERATORS = toOptions([
  "equals",
  "notEquals",
  "lessThan",
  "lessThanOrEqual",
  "greaterThan",
  "greaterThanOrEqual",
  "isBetween",
  "isEmpty",
  "isNotEmpty",
]);

const DATE_OPERATORS = toOptions([
  "equals",
  "notEquals",
  "before",
  "after",
  "onOrBefore",
  "onOrAfter",
  "isBetween",
  "isEmpty",
  "isNotEmpty",
]);

const SELECT_OPERATORS = toOptions([
  "is",
  "isNot",
  "isAnyOf",
  "isNoneOf",
  "isEmpty",
  "isNotEmpty",
]);

const BOOLEAN_OPERATORS = toOptions(["isTrue", "isFalse"]);

export function getOperatorsForVariant(variant: string): OperatorOption[] {
  switch (variant) {
    case "short-text":
    case "long-text":
    case "url":
      return TEXT_OPERATORS;
    case "number":
      return NUMBER_OPERATORS;
    case "date":
      return DATE_OPERATORS;
    case "select":
    case "multi-select":
      return SELECT_OPERATORS;
    case "checkbox":
      return BOOLEAN_OPERATORS;
    default:
      return TEXT_OPERATORS;
  }
}

export function getDefaultOperator(variant: string): FilterOperator {
  return getOperatorsForVariant(variant)[0]?.value ?? "contains";
}


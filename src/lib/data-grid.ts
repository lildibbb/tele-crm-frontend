import type { Column } from "@tanstack/react-table";
import {
  AlignLeftIcon,
  CalendarIcon,
  CheckSquareIcon,
  FileIcon as FileIconLucide,
  FileTextIcon,
  FileVideoIcon,
  HashIcon,
  ImageIcon,
  LinkIcon,
  ListIcon,
  MusicIcon,
  TagsIcon,
  TextIcon,
} from "lucide-react";
import type { CellOpts, CellSelectOption, FileCellData, RowHeightValue } from "@/types/data-grid";

// Re-export flexRender from tanstack
export { flexRender } from "@tanstack/react-table";

// Cell key utilities
export function getCellKey(rowIndex: number, columnId: string): string {
  return `${rowIndex}:${columnId}`;
}

export function parseCellKey(key: string): { rowIndex: number; columnId: string } {
  const colonIdx = key.indexOf(":");
  return {
    rowIndex: parseInt(key.slice(0, colonIdx), 10),
    columnId: key.slice(colonIdx + 1),
  };
}

// Column variant metadata
interface ColumnVariantMeta {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const COLUMN_VARIANTS: Record<string, ColumnVariantMeta> = {
  "short-text": { icon: TextIcon, label: "Short text" },
  "long-text": { icon: AlignLeftIcon, label: "Long text" },
  number: { icon: HashIcon, label: "Number" },
  select: { icon: ListIcon, label: "Select" },
  "multi-select": { icon: TagsIcon, label: "Multi-select" },
  checkbox: { icon: CheckSquareIcon, label: "Checkbox" },
  date: { icon: CalendarIcon, label: "Date" },
  url: { icon: LinkIcon, label: "URL" },
  file: { icon: FileIconLucide, label: "File" },
};

export function getColumnVariant(variant: string | undefined): ColumnVariantMeta | undefined {
  if (!variant) return undefined;
  return COLUMN_VARIANTS[variant];
}

// Column pinning utilities
interface GetColumnPinningStyleArgs<TData> {
  column: Column<TData>;
  dir?: "ltr" | "rtl";
}

export function getColumnPinningStyle<TData>({
  column,
  dir = "ltr",
}: GetColumnPinningStyleArgs<TData>): React.CSSProperties {
  const isPinned = column.getIsPinned();
  const isLastLeft = isPinned === "left" && column.getIsLastColumn("left");
  const isFirstRight = isPinned === "right" && column.getIsFirstColumn("right");

  return {
    boxShadow: isLastLeft
      ? dir === "rtl"
        ? "-4px 0 4px -4px hsl(var(--border)) inset"
        : "4px 0 4px -4px hsl(var(--border)) inset"
      : isFirstRight
        ? dir === "rtl"
          ? "4px 0 4px -4px hsl(var(--border)) inset"
          : "-4px 0 4px -4px hsl(var(--border)) inset"
        : undefined,
    left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
    right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
    opacity: isPinned ? 0.97 : 1,
    position: isPinned ? "sticky" : "relative",
    width: `${column.getSize()}px`,
    zIndex: isPinned ? 1 : 0,
  };
}

interface GetColumnBorderVisibilityArgs<TData> {
  column: Column<TData>;
  nextColumn?: Column<TData>;
  isLastColumn: boolean;
}

export function getColumnBorderVisibility<TData>({
  column,
  nextColumn,
  isLastColumn,
}: GetColumnBorderVisibilityArgs<TData>): { showEndBorder: boolean; showStartBorder: boolean } {
  const isPinned = column.getIsPinned();
  const nextIsPinned = nextColumn?.getIsPinned();

  return {
    showEndBorder:
      (isPinned === "left" && column.getIsLastColumn("left")) ||
      (!isPinned && nextIsPinned === "right"),
    showStartBorder:
      (isPinned === "right" && column.getIsFirstColumn("right")) ||
      (!isPinned && !isLastColumn && nextIsPinned === undefined && false),
  };
}

export function getColumnVariantFromColumn<TData>(column: Column<TData>): ColumnVariantMeta | undefined {
  return getColumnVariant((column.columnDef.meta?.cell as CellOpts | undefined)?.variant);
}

// Row height
const ROW_HEIGHT_MAP: Record<RowHeightValue, number> = {
  short: 32,
  medium: 48,
  tall: 64,
  "extra-tall": 96,
};

export function getRowHeightValue(rowHeight: RowHeightValue): number {
  return ROW_HEIGHT_MAP[rowHeight] ?? 32;
}

// Date formatting
export function formatDateForDisplay(date: string | Date | null | undefined): string {
  if (!date) return "";
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
      typeof date === "string" ? new Date(date) : date,
    );
  } catch {
    return String(date);
  }
}

export function formatDateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year!, (month ?? 1) - 1, day);
}

// File utilities
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

type FileIconComponent = React.ComponentType<{ className?: string }>;

export function getFileIcon(type: string): FileIconComponent | null {
  if (type.startsWith("image/")) return ImageIcon;
  if (type.startsWith("video/")) return FileVideoIcon;
  if (type.startsWith("audio/")) return MusicIcon;
  if (type === "application/pdf") return FileTextIcon;
  if (type.includes("spreadsheet") || type.includes("excel")) return FileTextIcon;
  if (type.includes("word") || type.includes("document")) return FileTextIcon;
  return FileIconLucide;
}

export function getIsFileCellData(value: unknown): value is FileCellData {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as FileCellData).id === "string" &&
    typeof (value as FileCellData).name === "string"
  );
}

// Text utilities
export function getLineCount(text: string): number {
  if (!text) return 0;
  return text.split("\n").length;
}

export function getUrlHref(url: string): string {
  if (!url) return "";
  return url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
}

// Cell value utilities
export function getEmptyCellValue(variant: string | undefined): unknown {
  switch (variant) {
    case "multi-select":
    case "file":
      return [];
    case "checkbox":
      return false;
    case "number":
      return null;
    default:
      return "";
  }
}

export function matchSelectOption(value: string, options: CellSelectOption[]): string | undefined {
  const matched = options.find((opt) => opt.value === value || opt.label === value);
  return matched?.value;
}

// DOM utilities
export function getIsInPopover(element: EventTarget | null): boolean {
  if (!element) return false;
  const el = element as Element;
  return (
    el.closest?.("[data-radix-popper-content-wrapper]") !== null ||
    el.closest?.("[role='dialog']") !== null ||
    el.closest?.("[role='listbox']") !== null
  );
}

interface ScrollCellIntoViewArgs {
  container: HTMLElement;
  targetCell: HTMLElement;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tableRef?: React.RefObject<any>;
  viewportOffset?: number;
  direction?: string;
  isRtl?: boolean;
}

export function scrollCellIntoView({
  container,
  targetCell,
  viewportOffset = 0,
  isRtl = false,
}: ScrollCellIntoViewArgs): void {
  const containerRect = container.getBoundingClientRect();
  const cellRect = targetCell.getBoundingClientRect();

  const topOffset = containerRect.top + viewportOffset;
  if (cellRect.top < topOffset) {
    container.scrollTop -= topOffset - cellRect.top;
  } else if (cellRect.bottom > containerRect.bottom) {
    container.scrollTop += cellRect.bottom - containerRect.bottom;
  }

  if (isRtl) {
    if (cellRect.right > containerRect.right) {
      container.scrollLeft += cellRect.right - containerRect.right;
    } else if (cellRect.left < containerRect.left) {
      container.scrollLeft -= containerRect.left - cellRect.left;
    }
  } else {
    if (cellRect.left < containerRect.left) {
      container.scrollLeft -= containerRect.left - cellRect.left;
    } else if (cellRect.right > containerRect.right) {
      container.scrollLeft += cellRect.right - containerRect.right;
    }
  }
}

export function getScrollDirection(direction: string): string {
  switch (direction) {
    case "left":
    case "right":
    case "pageleft":
    case "pageright":
    case "home":
    case "end":
      return direction;
    case "up":
    case "down":
    case "pageup":
    case "pagedown":
    case "ctrl+up":
    case "ctrl+down":
    case "ctrl+home":
    case "ctrl+end":
      return direction;
    default:
      return direction;
  }
}


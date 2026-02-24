/**
 * Format a date value to a localized string.
 */
export function formatDate(
  date: Date | string | number | undefined | null,
  opts?: Intl.DateTimeFormatOptions,
): string {
  if (date == null) return "";
  const d = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...opts,
  }).format(d);
}

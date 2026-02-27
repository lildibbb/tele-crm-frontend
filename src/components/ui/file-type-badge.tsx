/**
 * FileTypeBadge — coloured SVG document icon for any MIME type.
 * FileTypeChip  — compact inline pill variant for message bubbles.
 *
 * Used across: leads/[id] chat, verification proofs, KB file list.
 */

export interface FileBadgeConfig {
  bg: string;
  fg: string;
  label: string;
}

export function getFileBadgeConfig(
  mimeType: string | null | undefined,
): FileBadgeConfig {
  if (!mimeType) return { bg: "#64748B", fg: "#fff", label: "FILE" };
  if (mimeType === "application/pdf")
    return { bg: "#DC2626", fg: "#fff", label: "PDF" };
  if (mimeType === "text/csv")
    return { bg: "#16A34A", fg: "#fff", label: "CSV" };
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel"))
    return { bg: "#15803D", fg: "#fff", label: "XLS" };
  if (mimeType.includes("wordprocessing") || mimeType.includes("msword"))
    return { bg: "#1D4ED8", fg: "#fff", label: "DOC" };
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))
    return { bg: "#C2410C", fg: "#fff", label: "PPT" };
  if (mimeType.startsWith("image/"))
    return { bg: "#0284C7", fg: "#fff", label: "IMG" };
  if (mimeType.startsWith("video/"))
    return { bg: "#7C3AED", fg: "#fff", label: "VID" };
  if (mimeType.startsWith("audio/"))
    return { bg: "#0891B2", fg: "#fff", label: "AUD" };
  if (
    mimeType.includes("zip") ||
    mimeType.includes("tar") ||
    mimeType.includes("rar")
  )
    return { bg: "#B45309", fg: "#fff", label: "ZIP" };
  if (mimeType === "text/plain") return { bg: "#6B7280", fg: "#fff", label: "TXT" };
  return { bg: "#64748B", fg: "#fff", label: "FILE" };
}

/**
 * A visually realistic SVG file-icon with folded corner, coloured by MIME type.
 * Default size 40×50.
 */
export function FileTypeBadge({
  mimeType,
  size = 40,
}: {
  mimeType: string | null | undefined;
  size?: number;
}) {
  const { bg, fg, label } = getFileBadgeConfig(mimeType);
  const w = size;
  const h = Math.round(size * 1.25);
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 40 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Page body */}
      <path
        d="M0 4C0 1.8 1.8 0 4 0H27L40 13V46C40 48.2 38.2 50 36 50H4C1.8 50 0 48.2 0 46V4Z"
        fill={bg}
      />
      {/* Folded corner */}
      <path
        d="M27 0L40 13H30C28.3 13 27 11.7 27 10V0Z"
        fill="rgba(0,0,0,0.25)"
      />
      {/* Extension label */}
      <text
        x="20"
        y="36"
        fontSize={label.length > 3 ? "8" : "9"}
        fontWeight="800"
        fill={fg}
        textAnchor="middle"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif"
        letterSpacing="0.5"
      >
        {label}
      </text>
    </svg>
  );
}

/**
 * Compact pill-style inline badge for tight spaces (e.g. message bubbles).
 */
export function FileTypeChip({
  mimeType,
  size = 16,
}: {
  mimeType: string | null | undefined;
  size?: number;
}) {
  const { bg, fg, label } = getFileBadgeConfig(mimeType);
  return (
    <span
      style={{
        background: bg,
        color: fg,
        fontSize: 8,
        lineHeight: 1,
        padding: "2px 4px",
        borderRadius: 3,
        fontWeight: 800,
        letterSpacing: "0.3px",
        flexShrink: 0,
        display: "inline-flex",
        alignItems: "center",
        width: size + 4,
        justifyContent: "center",
      }}
    >
      {label.slice(0, 3)}
    </span>
  );
}

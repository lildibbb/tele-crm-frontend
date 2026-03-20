"use client";

import type { ElementType } from "react";
import {
  FileText,
  Link2,
  FileCode2,
  FileVideo,
  Image as ImageIcon,
} from "lucide-react";
import { KbType, KbFileType } from "@/types/enums";

// ── Type configuration for KB entry display ──────────────────────────────────

export interface KbTypeDisplayConfig {
  label: string;
  icon: ElementType;
  badgeCls: string;
  iconBg: string;
  iconColor: string;
}

export const TYPE_CONFIG: Record<string, KbTypeDisplayConfig> = {
  TEMPLATE: {
    label: "Template",
    icon: FileCode2,
    badgeCls: "badge badge-registered",
    iconBg: "color-mix(in srgb, #a855f7 14%, transparent)",
    iconColor: "#a855f7",
  },
  LINK: {
    label: "Link",
    icon: Link2,
    badgeCls: "badge badge-admin",
    iconBg: "color-mix(in srgb, #60a5fa 14%, transparent)",
    iconColor: "#60a5fa",
  },
  TEXT: {
    label: "Text",
    icon: FileText,
    badgeCls: "badge badge-staff",
    iconBg: "color-mix(in srgb, #8888aa 14%, transparent)",
    iconColor: "#8888aa",
  },
  PDF: {
    label: "PDF",
    icon: FileText,
    badgeCls: "badge badge-pending",
    iconBg: "color-mix(in srgb, #f59e0b 14%, transparent)",
    iconColor: "#f59e0b",
  },
  DOCX: {
    label: "Word",
    icon: FileText,
    badgeCls: "badge badge-admin",
    iconBg: "color-mix(in srgb, #3b82f6 14%, transparent)",
    iconColor: "#3b82f6",
  },
  IMAGE: {
    label: "Image",
    icon: ImageIcon,
    badgeCls: "badge badge-registered",
    iconBg: "color-mix(in srgb, #0ea5e9 14%, transparent)",
    iconColor: "#0ea5e9",
  },
  VIDEO: {
    label: "Video",
    icon: FileVideo,
    badgeCls: "badge badge-confirmed",
    iconBg: "color-mix(in srgb, var(--color-success) 14%, transparent)",
    iconColor: "var(--color-success)",
  },
  VIDEO_LINK: {
    label: "Video",
    icon: FileVideo,
    badgeCls: "badge badge-confirmed",
    iconBg: "color-mix(in srgb, var(--color-success) 14%, transparent)",
    iconColor: "var(--color-success)",
  },
} as const;

// ── Status configuration for KB entry display ────────────────────────────────

export interface KbStatusDisplayConfig {
  label: string;
  cls: string;
}

export const STATUS_CONFIG: Record<string, KbStatusDisplayConfig> = {
  READY: { label: "Ready", cls: "badge-confirmed" },
  PROCESSING: { label: "Processing", cls: "badge-warning" },
  FAILED: { label: "Failed", cls: "badge-failed" },
  PENDING: { label: "Accepted", cls: "badge-pending" },
} as const;

// ── MIME → FileTypeBadge mapping ─────────────────────────────────────────────

export const KB_TYPE_MIME: Record<string, string> = {
  PDF: "application/pdf",
  DOCX: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  IMAGE: "image/png",
  VIDEO: "video/mp4",
  VIDEO_LINK: "video/mp4",
  TEXT: "text/plain",
} as const;

// ── Filter chips ─────────────────────────────────────────────────────────────

export interface KbFilterChip {
  label: string;
  type?: string;
}

export const FILTER_CHIPS: readonly KbFilterChip[] = [
  { label: "All" },
  { label: "Text", type: KbType.TEXT },
  { label: "Link", type: KbType.LINK },
  { label: "Template", type: KbType.TEMPLATE },
  { label: "PDF" },
  { label: "DOCX" },
  { label: "Image" },
  { label: "Video" },
] as const;

// ── Upload constraints ───────────────────────────────────────────────────────

/** File extensions accepted by the upload zone */
export const ACCEPTED_FILE_EXTENSIONS =
  ".pdf,.docx,.txt,.png,.jpg,.jpeg,.webp,.gif,.mp4,.mov,.m4v";

/** Human-readable label for the upload zone */
export const ACCEPTED_FILE_TYPES_LABEL = "PDF, DOCX, Images, or Videos";

/** Max upload size in bytes (50 MB — matches backend video limit) */
export const MAX_UPLOAD_SIZE_BYTES = 50 * 1024 * 1024;

/** Human-readable max upload size */
export const MAX_UPLOAD_SIZE_LABEL = "50 MB";

// ── Helper to resolve display config for an entry ────────────────────────────

export function resolveTypeConfig(
  fileType: string | null | undefined,
  type: string | null | undefined,
): KbTypeDisplayConfig {
  return (
    TYPE_CONFIG[fileType ?? ""] ?? TYPE_CONFIG[type ?? ""] ?? TYPE_CONFIG.TEXT
  );
}

export function resolveStatusConfig(status: string): KbStatusDisplayConfig {
  return STATUS_CONFIG[status] ?? { label: status, cls: "badge-pending" };
}

/** Check if a file type string has a corresponding MIME for FileTypeBadge */
export function resolveKbMime(
  fileType: string | null | undefined,
  type: string | null | undefined,
): string | null {
  return KB_TYPE_MIME[fileType ?? ""] ?? KB_TYPE_MIME[type ?? ""] ?? null;
}

/** Detect the display category from a File's MIME type for preview icon */
export function detectUploadCategory(
  file: File,
): "image" | "video" | "document" {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return "document";
}

/** Format file size for display */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export type ChatAttachmentPreviewType = "image" | "video";

export type ParsedInteractionAttachment = {
  fileUrl?: string;
  mimeType?: string;
  fileName?: string;
  previewType: ChatAttachmentPreviewType | null;
  hasAttachment: boolean;
  isMultiAttachment?: boolean;
  allAttachments?: Array<{ kbId?: string; fileUrl: string; mimeType?: string; fileName?: string }>;
};

const URL_KEYS = new Set(
  [
    "fileUrl",
    "file_url",
    "url",
    "mediaUrl",
    "media_url",
    "attachmentUrl",
    "attachment_url",
    "documentUrl",
    "document_url",
    "imageUrl",
    "image_url",
    "videoUrl",
    "video_url",
    "photoUrl",
    "photo_url",
  ].map(normalizeKey),
);

const MIME_KEYS = new Set(
  [
    "mimeType",
    "mime_type",
    "contentType",
    "content_type",
    "mediaType",
    "media_type",
    "fileType",
    "file_type",
  ].map(normalizeKey),
);

const NAME_KEYS = new Set(
  [
    "fileName",
    "file_name",
    "filename",
    "originalFilename",
    "original_file_name",
    "caption",
  ].map(normalizeKey),
);

function normalizeKey(key: string): string {
  return key.replace(/[^a-z0-9]/gi, "").toLowerCase();
}

function parseMaybeJson(value: string): unknown {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}

function findFirstStringByKeys(
  value: unknown,
  keys: Set<string>,
  visited = new Set<object>(),
  depth = 0,
): string | undefined {
  if (depth > 6 || value == null) return undefined;

  if (typeof value === "string") {
    const parsed = parseMaybeJson(value);
    if (parsed != null) {
      return findFirstStringByKeys(parsed, keys, visited, depth + 1);
    }
    return undefined;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const nested = findFirstStringByKeys(item, keys, visited, depth + 1);
      if (nested) return nested;
    }
    return undefined;
  }

  if (typeof value !== "object") return undefined;
  if (visited.has(value)) return undefined;
  visited.add(value);

  const record = value as Record<string, unknown>;

  for (const [key, candidate] of Object.entries(record)) {
    if (
      keys.has(normalizeKey(key)) &&
      typeof candidate === "string" &&
      candidate.trim()
    ) {
      return candidate.trim();
    }
  }

  for (const candidate of Object.values(record)) {
    const nested = findFirstStringByKeys(candidate, keys, visited, depth + 1);
    if (nested) return nested;
  }

  return undefined;
}

export function isImageMime(mimeType: string | null | undefined): boolean {
  return !!mimeType?.toLowerCase().startsWith("image/");
}

export function isVideoMime(mimeType: string | null | undefined): boolean {
  return !!mimeType?.toLowerCase().startsWith("video/");
}

export function getAttachmentDisplayName(
  fileName: string | null | undefined,
  fileUrl: string | null | undefined,
): string {
  if (typeof fileName === "string" && fileName.trim()) return fileName.trim();
  if (!fileUrl) return "Attachment";

  const cleanUrl = fileUrl.split("#")[0]?.split("?")[0] ?? "";
  const fallback = cleanUrl.split("/").filter(Boolean).pop();
  if (!fallback) return "Attachment";

  try {
    return decodeURIComponent(fallback);
  } catch {
    return fallback;
  }
}

export function parseInteractionAttachmentMetadata(
  metadata: unknown,
): ParsedInteractionAttachment {
  // Check for multi-attachments first
  const attachmentsArray = (metadata as Record<string, unknown>)?.attachments;
  if (Array.isArray(attachmentsArray) && attachmentsArray.length > 0) {
    const first = attachmentsArray[0];
    return {
      fileUrl: first.fileUrl,
      mimeType: first.mimeType,
      fileName: first.fileName,
      previewType: first.mimeType
        ? isImageMime(first.mimeType) ? "image"
        : isVideoMime(first.mimeType) ? "video"
        : null
        : null,
      hasAttachment: true,
      isMultiAttachment: attachmentsArray.length > 1,
      allAttachments: attachmentsArray,
    };
  }

  // Fallback to single attachment parsing (existing code)
  const rawFileUrl = findFirstStringByKeys(metadata, URL_KEYS);
  const mimeType = findFirstStringByKeys(metadata, MIME_KEYS)?.toLowerCase();
  const rawFileName = findFirstStringByKeys(metadata, NAME_KEYS);
  const fileUrl = rawFileUrl?.trim() || undefined;
  const fileName = rawFileName?.trim() || undefined;

  const previewType: ChatAttachmentPreviewType | null =
    fileUrl && mimeType
      ? isImageMime(mimeType)
        ? "image"
        : isVideoMime(mimeType)
          ? "video"
          : null
      : null;

  return {
    fileUrl,
    mimeType,
    fileName,
    previewType,
    hasAttachment: Boolean(mimeType || fileName),
  };
}

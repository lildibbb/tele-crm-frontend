const MB = 1024 * 1024;

const MAX_BYTES_BY_CATEGORY = {
  image: 10 * MB,
  video: 50 * MB,
  audio: 20 * MB,
  document: 20 * MB,
} as const;

const DOCUMENT_MIME_TYPES = new Set<string>([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
]);

type ReplyAttachmentCategory = keyof typeof MAX_BYTES_BY_CATEGORY;

export function resolveReplyAttachmentCategory(
  mimeType: string | null | undefined,
): ReplyAttachmentCategory | null {
  const normalized = (mimeType ?? "").toLowerCase();
  if (!normalized) return null;
  if (normalized.startsWith("image/")) return "image";
  if (normalized.startsWith("video/")) return "video";
  if (normalized.startsWith("audio/")) return "audio";
  if (DOCUMENT_MIME_TYPES.has(normalized)) return "document";
  return null;
}

export function validateReplyAttachmentFile(file: File): string | null {
  const category = resolveReplyAttachmentCategory(file.type);
  if (!category) {
    return "Unsupported file type. Allowed: image, video, audio, PDF, or common office/text document.";
  }

  const maxBytes = MAX_BYTES_BY_CATEGORY[category];
  if (file.size > maxBytes) {
    const maxMb = Math.floor(maxBytes / MB);
    return `File is too large for ${category}. Maximum allowed size is ${maxMb}MB.`;
  }

  return null;
}

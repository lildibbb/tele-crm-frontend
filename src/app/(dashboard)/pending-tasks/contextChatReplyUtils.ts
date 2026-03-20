import type { Interaction } from "@/lib/schemas/lead.schema";

type BuildOptimisticContextInteractionInput = {
  leadId: string;
  message: string;
  file?: File | null;
  filePreviewUrl?: string | null;
  id?: string;
  createdAt?: string;
};

export function buildOptimisticContextInteraction({
  leadId,
  message,
  file,
  filePreviewUrl,
  id,
  createdAt,
}: BuildOptimisticContextInteractionInput): Interaction {
  return {
    id: id ?? `optimistic-reply-${Date.now()}`,
    leadId,
    type: "MANUAL_REPLY_SENT",
    content: message.trim(),
    metadata: file
      ? ({
          fileName: file.name,
          mimeType: file.type,
          size: file.size,
          ...(filePreviewUrl ? { fileUrl: filePreviewUrl } : {}),
        } as Record<string, unknown>)
      : null,
    createdAt: createdAt ?? new Date().toISOString(),
  };
}

export function extractInteractionAttachmentName(
  metadata: Interaction["metadata"],
): string | null {
  if (!metadata || typeof metadata !== "object") return null;
  const record = metadata as Record<string, unknown>;
  const candidates = [
    record.fileName,
    record.filename,
    record.attachmentName,
    record.originalName,
  ];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }
  return null;
}

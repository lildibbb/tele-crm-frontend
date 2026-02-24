import { z } from "zod/v4";
import { apiClient } from "./apiClient";
import type { ApiResponse } from "@/lib/schemas/common";

// ── Response Schema ────────────────────────────────────────────────────────────

export const AttachmentSchema = z.object({
  id: z.string(),
  leadId: z.string(),
  telegramFileId: z.string().nullable(),
  fileKey: z.string(),
  fileUrl: z.string(),
  mimeType: z.string().nullable(),
  size: z.number().nullable(),
  uploadedAt: z.string().datetime(),
});

export type Attachment = z.infer<typeof AttachmentSchema>;

export const attachmentsApi = {
  /**
   * Returns all uploaded receipts/screenshots for the given lead UUID.
   */
  findByLead: (leadId: string) =>
    apiClient.get<ApiResponse<Attachment[]>>("/attachments", {
      params: { leadId },
    }),
};

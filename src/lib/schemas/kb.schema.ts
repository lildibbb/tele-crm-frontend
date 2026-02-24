import { z } from "zod/v4";
import { KbFileType, KbStatus, KbType } from "@/types/enums";

// ── Enum Schemas ──────────────────────────────────────────────────────────────

export const KbTypeSchema = z.enum([KbType.TEXT, KbType.LINK, KbType.TEMPLATE]);
export const KbFileTypeSchema = z.enum([
  KbFileType.TEXT_MANUAL,
  KbFileType.PDF,
  KbFileType.DOCX,
  KbFileType.IMAGE,
  KbFileType.VIDEO_LINK,
  KbFileType.EXTERNAL_LINK,
]);
export const KbStatusSchema = z.enum([
  KbStatus.PENDING,
  KbStatus.PROCESSING,
  KbStatus.READY,
  KbStatus.FAILED,
]);

// ── Response Schema ───────────────────────────────────────────────────────────

export const KbResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  type: KbTypeSchema,
  fileType: KbFileTypeSchema,
  url: z.string().nullable(),
  status: KbStatusSchema,
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type KbEntry = z.infer<typeof KbResponseSchema>;

// ── Input Schemas ─────────────────────────────────────────────────────────────

export const CreateKbSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  type: KbTypeSchema.default(KbType.TEXT),
  url: z.string().url("Please enter a valid URL").optional(),
});

export type CreateKbInput = z.infer<typeof CreateKbSchema>;

export const UpdateKbSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").optional(),
  content: z.string().min(10, "Content must be at least 10 characters").optional(),
  type: KbTypeSchema.optional(),
  url: z.string().url("Please enter a valid URL").optional(),
  isActive: z.boolean().optional(),
});

export type UpdateKbInput = z.infer<typeof UpdateKbSchema>;

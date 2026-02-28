import { z } from "zod/v4";
import { LeadStatus } from "@/types/enums";

// ── Response Schema ───────────────────────────────────────────────────────────

export const LeadStatusSchema = z.enum([
  LeadStatus.NEW,
  LeadStatus.CONTACTED,
  LeadStatus.REGISTERED,
  LeadStatus.DEPOSIT_REPORTED,
  LeadStatus.DEPOSIT_CONFIRMED,
  LeadStatus.REJECTED,
]);

export const LeadResponseSchema = z.object({
  id: z.string(),
  telegramUserId: z.string(),
  username: z.string().nullable(),
  displayName: z.string().nullable(),
  status: LeadStatusSchema,
  hfmBrokerId: z.string().nullable(),
  email: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  depositBalance: z.string().nullable(),
  registeredAt: z.string().nullable(),
  verifiedAt: z.string().nullable(),
  handoverMode: z.boolean(),
  groupTopicId: z.number().nullable().optional(),
  aiScore: z.number().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Lead = z.infer<typeof LeadResponseSchema>;

// ── Input Schemas ─────────────────────────────────────────────────────────────

export const UpdateLeadStatusSchema = z.object({
  status: LeadStatusSchema,
});

export type UpdateLeadStatusInput = z.infer<typeof UpdateLeadStatusSchema>;

export const UpdateHandoverSchema = z.object({
  handoverMode: z.boolean(),
});

export type UpdateHandoverInput = z.infer<typeof UpdateHandoverSchema>;

export const BulkUpdateHandoverSchema = z.object({
  handoverMode: z.boolean(),
});

export type BulkUpdateHandoverInput = z.infer<typeof BulkUpdateHandoverSchema>;

export const BulkUpdateStatusSchema = z.object({
  ids: z.array(z.string()),
  status: LeadStatusSchema,
});

export type BulkUpdateStatusInput = z.infer<typeof BulkUpdateStatusSchema>;

export const SubmitLeadInfoSchema = z.object({
  telegramUserId: z.number(),
  email: z.string().email().optional(),
  hfmBrokerId: z.string().optional(),
  phoneNumber: z.string().optional(),
  depositBalance: z.string().optional(),
  registeredAt: z.string().datetime().optional(),
});

export type SubmitLeadInfoInput = z.infer<typeof SubmitLeadInfoSchema>;

export const ListLeadsParamsSchema = z.object({
  status: LeadStatusSchema.optional(),
  statuses: z.string().optional(),
  contactId: z.string().optional(),
  registered: z.boolean().optional(),
  balanceMin: z.number().optional(),
  balanceMax: z.number().optional(),
  search: z.string().optional(),
  orderBy: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional(),
  skip: z.number().int().min(0).optional(),
  take: z.number().int().min(1).max(200).optional(),
});

export type ListLeadsParams = z.infer<typeof ListLeadsParamsSchema>;

// ── Leaderboard & Export Params ──────────────────────────────────────────────

export const LeaderboardParamsSchema = z.object({
  limit: z.number().int().min(1).max(100).optional().default(20),
  tier: z.enum(["hot", "warm", "cold"]).optional(),
});

export type LeaderboardParams = z.infer<typeof LeaderboardParamsSchema>;

export const ExportLeadsParamsSchema = z.object({
  status: LeadStatusSchema.optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export type ExportLeadsParams = z.infer<typeof ExportLeadsParamsSchema>;

// ── Interaction Types ─────────────────────────────────────────────────────────

export const InteractionTypeSchema = z.enum([
  "MESSAGE_RECEIVED",
  "AUTO_REPLY_SENT",
  "MANUAL_REPLY_SENT",
  "SYSTEM_STATUS_CHANGE",
]);

export type InteractionType = z.infer<typeof InteractionTypeSchema>;

export const InteractionSchema = z.object({
  id: z.string(),
  leadId: z.string(),
  type: InteractionTypeSchema,
  content: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  createdAt: z.string().datetime(),
});

export type Interaction = z.infer<typeof InteractionSchema>;

export const ListInteractionsParamsSchema = z.object({
  skip: z.number().int().min(0).optional().default(0),
  take: z.number().int().min(1).max(100).optional().default(20),
  type: InteractionTypeSchema.optional(),
});

export type ListInteractionsParams = z.infer<
  typeof ListInteractionsParamsSchema
>;

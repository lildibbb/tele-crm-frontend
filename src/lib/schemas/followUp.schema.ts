import { z } from "zod/v4";
import { FollowUpStatus } from "@/types/enums";

export const FollowUpStatusSchema = z.enum([
  FollowUpStatus.PENDING,
  FollowUpStatus.SENT,
  FollowUpStatus.CANCELLED,
]);

export const FollowUpSchema = z.object({
  id: z.string(),
  leadId: z.string(),
  type: z.string(),
  scheduledAt: z.string().datetime(),
  sentAt: z.string().datetime().nullable().optional(),
  cancelled: z.boolean().optional(),
  status: FollowUpStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
});

export type FollowUp = z.infer<typeof FollowUpSchema>;

export const ListFollowUpsParamsSchema = z.object({
  leadId: z.string().optional(),
  status: FollowUpStatusSchema.optional(),
  skip: z.number().int().min(0).optional(),
  take: z.number().int().min(1).max(100).optional(),
});

export type ListFollowUpsParams = z.infer<typeof ListFollowUpsParamsSchema>;

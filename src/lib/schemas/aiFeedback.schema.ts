import { z } from "zod/v4";

export const AiFeedbackRatingSchema = z.union([z.literal(1), z.literal(5)]);

export const AiFeedbackSchema = z.object({
  id: z.string(),
  leadId: z.string(),
  userMessage: z.string(),
  botReply: z.string(),
  rating: AiFeedbackRatingSchema,
  notes: z.string().nullable().optional(),
  usedAsFewShot: z.boolean(),
  createdAt: z.string().datetime(),
});

export type AiFeedback = z.infer<typeof AiFeedbackSchema>;

export const CreateAiFeedbackSchema = z.object({
  leadId: z.string().min(1, "Lead ID is required"),
  userMessage: z.string().min(1, "User message is required"),
  botReply: z.string().min(1, "Bot reply is required"),
  rating: AiFeedbackRatingSchema,
  notes: z.string().optional(),
});

export type CreateAiFeedbackInput = z.infer<typeof CreateAiFeedbackSchema>;

export const ListAiFeedbackParamsSchema = z.object({
  rating: AiFeedbackRatingSchema.optional(),
  skip: z.number().int().min(0).optional(),
  take: z.number().int().min(1).max(100).optional(),
});

export type ListAiFeedbackParams = z.infer<typeof ListAiFeedbackParamsSchema>;

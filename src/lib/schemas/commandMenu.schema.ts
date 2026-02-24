import { z } from "zod/v4";

// ── Response Schema ───────────────────────────────────────────────────────────

export const CommandMenuResponseSchema = z.object({
  id: z.string(),
  command: z.string(),
  label: z.string(),
  description: z.string().nullable(),
  content: z.record(z.string(), z.unknown()),
  isActive: z.boolean(),
  order: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CommandMenu = z.infer<typeof CommandMenuResponseSchema>;

// ── Input Schemas ─────────────────────────────────────────────────────────────

export const CreateCommandMenuSchema = z.object({
  command: z
    .string()
    .min(1, "Command is required")
    .regex(/^[a-z0-9-]+$/, "Command must be a URL-safe slug (lowercase, numbers, hyphens)"),
  label: z.string().min(1, "Label is required"),
  description: z.string().optional(),
  content: z.record(z.string(), z.unknown()),
  order: z.number().int().min(0).optional(),
});

export type CreateCommandMenuInput = z.infer<typeof CreateCommandMenuSchema>;

export const UpdateCommandMenuSchema = z.object({
  label: z.string().min(1).optional(),
  description: z.string().optional(),
  content: z.record(z.string(), z.unknown()).optional(),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateCommandMenuInput = z.infer<typeof UpdateCommandMenuSchema>;

export const CommandMenuOrderItemSchema = z.object({
  id: z.string(),
  order: z.number().int().min(0),
});

export const ReorderCommandMenuSchema = z.object({
  items: z.array(CommandMenuOrderItemSchema).min(1),
});

export type ReorderCommandMenuInput = z.infer<typeof ReorderCommandMenuSchema>;


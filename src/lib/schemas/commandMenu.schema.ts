import { z } from "zod/v4";

// ── Tiptap JSON Document Schema ───────────────────────────────────────────────

/** Flexible Tiptap JSON doc — validates top-level shape, passes through nested content */
export const TiptapDocSchema = z
  .object({
    type: z.literal("doc"),
    content: z.array(z.record(z.string(), z.unknown())).optional(),
  })
  .passthrough();

export type TiptapDoc = z.infer<typeof TiptapDocSchema>;

/** Empty Tiptap document constant */
export const EMPTY_TIPTAP_DOC: TiptapDoc = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

// ── Response Schema ───────────────────────────────────────────────────────────

export const CommandMenuResponseSchema = z.object({
  id: z.string(),
  command: z.string(),
  label: z.string(),
  description: z.string().nullable(),
  content: z.record(z.string(), z.unknown()),
  isActive: z.boolean(),
  showInMenu: z.boolean(),
  showInKeyboard: z.boolean(),
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
    .regex(/^[a-z0-9]+$/, "Lowercase letters and numbers only (no hyphens)"),
  label: z.string().min(1, "Label is required"),
  description: z.string().optional(),
  content: TiptapDocSchema,
  order: z.number().int().min(0).optional(),
  showInMenu: z.boolean().optional(),
  showInKeyboard: z.boolean().optional(),
});

export type CreateCommandMenuInput = z.infer<typeof CreateCommandMenuSchema>;

export const UpdateCommandMenuSchema = z.object({
  label: z.string().min(1).optional(),
  description: z.string().optional(),
  content: TiptapDocSchema.optional(),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  showInMenu: z.boolean().optional(),
  showInKeyboard: z.boolean().optional(),
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

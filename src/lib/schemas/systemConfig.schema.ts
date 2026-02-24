import { z } from "zod/v4";

export const SystemConfigEntrySchema = z.object({
  key: z.string(),
  value: z.string(),
  description: z.string().nullable().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type SystemConfigEntry = z.infer<typeof SystemConfigEntrySchema>;

export const UpsertSystemConfigSchema = z.object({
  value: z.string().min(1, "Value is required"),
});

export type UpsertSystemConfigInput = z.infer<typeof UpsertSystemConfigSchema>;

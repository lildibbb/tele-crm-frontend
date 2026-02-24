import { z } from "zod/v4";

export const BotStatusSchema = z.object({
  status: z.string(),
  webhookUrl: z.string().nullable().optional(),
  pendingUpdateCount: z.number().optional(),
  lastErrorDate: z.number().nullable().optional(),
  lastErrorMessage: z.string().nullable().optional(),
  maxConnections: z.number().optional(),
});

export type BotStatus = z.infer<typeof BotStatusSchema>;

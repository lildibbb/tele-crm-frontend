import { z } from "zod/v4";
import { AuditAction } from "@/types/enums";

export const AuditActionSchema = z.enum([
  AuditAction.USER_CREATED,
  AuditAction.USER_DEACTIVATED,
  AuditAction.USER_REACTIVATED,
  AuditAction.USER_ROLE_CHANGED,
  AuditAction.PASSWORD_CHANGED,
  AuditAction.LEAD_STATUS_CHANGED,
  AuditAction.LEAD_VERIFIED,
  AuditAction.KB_CREATED,
  AuditAction.KB_UPDATED,
  AuditAction.KB_DELETED,
  AuditAction.COMMAND_MENU_CREATED,
  AuditAction.COMMAND_MENU_UPDATED,
  AuditAction.COMMAND_MENU_DELETED,
  AuditAction.SYSTEM_CONFIG_CHANGED,
]);

export const AuditLogSchema = z.object({
  id: z.string(),
  userId: z.string().nullable(),
  userEmail: z.string().nullable().optional(),
  userRole: z.string().nullable().optional(),
  action: AuditActionSchema,
  resourceType: z.string().nullable().optional(),
  resourceId: z.string().nullable().optional(),
  before: z.record(z.string(), z.unknown()).nullable().optional(),
  after: z.record(z.string(), z.unknown()).nullable().optional(),
  ipAddress: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
});

export type AuditLog = z.infer<typeof AuditLogSchema>;

export const ListAuditLogsParamsSchema = z.object({
  userId: z.string().optional(),
  userEmail: z.string().optional(),
  action: AuditActionSchema.optional(),
  resourceType: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  skip: z.number().int().min(0).optional(),
  take: z.number().int().min(1).max(100).optional(),
});

export type ListAuditLogsParams = z.infer<typeof ListAuditLogsParamsSchema>;

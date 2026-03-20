import { z } from "zod/v4";
import { LeadStatus, PendingTaskStatus } from "@/types/enums";

export const PendingTaskStatusSchema = z.enum([
  PendingTaskStatus.PENDING,
  PendingTaskStatus.RESOLVED,
  PendingTaskStatus.DISMISSED,
]);

export const PendingTaskSchema = z.object({
  id: z.string(),
  leadId: z.string(),
  attachmentId: z.string().nullable(),
  attachment: z
    .object({
      id: z.string(),
      fileKey: z.string(),
      fileUrl: z.string().url(),
      mimeType: z.string().nullable(),
      size: z.number().int().nonnegative().nullable(),
      uploadedAt: z.string().datetime(),
    })
    .nullable()
    .optional(),
  interactionId: z.string().nullable().optional(),
  caption: z.string().nullable(),
  status: PendingTaskStatusSchema,
  createdAt: z.string().datetime(),
  resolvedAt: z.string().datetime().nullable(),
  lead: z
    .object({
      username: z.string().nullable(),
      hfmBrokerId: z.string().nullable(),
      phoneNumber: z.string().nullable(),
      email: z.string().nullable(),
    })
    .nullable()
    .optional(),
});

export type PendingTask = z.infer<typeof PendingTaskSchema>;

export const ListPendingTasksParamsSchema = z.object({
  leadId: z.string().optional(),
  status: PendingTaskStatusSchema.optional(),
  skip: z.number().int().min(0).optional(),
  take: z.number().int().min(1).max(100).optional(),
});

export type ListPendingTasksParams = z.infer<
  typeof ListPendingTasksParamsSchema
>;

export const ListPendingTaskGroupsParamsSchema = z.object({
  status: PendingTaskStatusSchema.optional(),
});

export type ListPendingTaskGroupsParams = z.infer<
  typeof ListPendingTaskGroupsParamsSchema
>;

export const UpdatePendingTaskInputSchema = z.object({
  status: z.enum([PendingTaskStatus.RESOLVED, PendingTaskStatus.DISMISSED]),
});

export type UpdatePendingTaskInput = z.infer<
  typeof UpdatePendingTaskInputSchema
>;

export const PendingTaskGroupLeadSchema = z.object({
  id: z.string(),
  displayName: z.string().nullable(),
  username: z.string().nullable(),
  status: z
    .enum([
      LeadStatus.NEW,
      LeadStatus.CONTACTED,
      LeadStatus.DEPOSIT_REPORTED,
      LeadStatus.DEPOSIT_CONFIRMED,
      LeadStatus.REJECTED,
    ])
    .nullable(),
  email: z.string().nullable(),
  hfmBrokerId: z.string().nullable(),
});

export type PendingTaskGroupLead = z.infer<typeof PendingTaskGroupLeadSchema>;

export const PendingTaskStatusCountsSchema = z.object({
  pending: z.number().int().nonnegative(),
  resolved: z.number().int().nonnegative(),
  dismissed: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
});

export type PendingTaskStatusCounts = z.infer<
  typeof PendingTaskStatusCountsSchema
>;

export const PendingTaskLeadGroupSchema = z.object({
  leadId: z.string(),
  lead: PendingTaskGroupLeadSchema,
  statusCounts: PendingTaskStatusCountsSchema,
  tasks: z.array(PendingTaskSchema),
});

export type PendingTaskLeadGroup = z.infer<typeof PendingTaskLeadGroupSchema>;

export const PendingTaskGroupedByLeadResponseSchema = z.object({
  groups: z.array(PendingTaskLeadGroupSchema),
  totalLeads: z.number().int().nonnegative(),
  totalTasks: z.number().int().nonnegative(),
  statusCounts: PendingTaskStatusCountsSchema,
});

export type PendingTaskGroupedByLeadResponse = z.infer<
  typeof PendingTaskGroupedByLeadResponseSchema
>;

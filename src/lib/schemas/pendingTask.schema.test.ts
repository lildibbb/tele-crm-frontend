import { describe, expect, it } from "vitest";
import {
  PendingTaskGroupedByLeadResponseSchema,
  PendingTaskSchema,
  UpdatePendingTaskInputSchema,
} from "@/lib/schemas/pendingTask.schema";
import { LeadStatus, PendingTaskStatus } from "@/types/enums";

const baseTask = {
  id: "task-1",
  leadId: "lead-1",
  attachmentId: null,
  interactionId: null,
  caption: "Need review",
  status: PendingTaskStatus.PENDING,
  createdAt: "2026-03-15T00:00:00.000Z",
  resolvedAt: null,
};

describe("PendingTaskSchema", () => {
  it("accepts interactionId from API payload", () => {
    expect(() => PendingTaskSchema.parse(baseTask)).not.toThrow();
  });
});

describe("PendingTaskGroupedByLeadResponseSchema", () => {
  it("parses grouped lead payload with counters and lead metadata", () => {
    const payload = {
      groups: [
        {
          leadId: "lead-1",
          lead: {
            id: "lead-1",
            displayName: "Alice",
            username: "alice",
            status: LeadStatus.CONTACTED,
            email: "alice@example.com",
            hfmBrokerId: "HFM-23",
          },
          statusCounts: {
            pending: 1,
            resolved: 2,
            dismissed: 0,
            total: 3,
          },
          tasks: [baseTask],
        },
      ],
      totalLeads: 1,
      totalTasks: 3,
      statusCounts: {
        pending: 1,
        resolved: 2,
        dismissed: 0,
        total: 3,
      },
    };

    expect(() => PendingTaskGroupedByLeadResponseSchema.parse(payload)).not.toThrow();
  });
});

describe("UpdatePendingTaskInputSchema", () => {
  it("rejects setting status back to pending", () => {
    const result = UpdatePendingTaskInputSchema.safeParse({
      status: PendingTaskStatus.PENDING,
    });

    expect(result.success).toBe(false);
  });
});

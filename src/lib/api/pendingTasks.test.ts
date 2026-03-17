import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api/apiClient";
import { pendingTasksApi } from "@/lib/api/pendingTasks";
import { PendingTaskStatus } from "@/types/enums";

describe("pendingTasksApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("lists pending tasks with query params", async () => {
    const getSpy = vi.spyOn(apiClient, "get").mockResolvedValue({
      data: { data: { data: [], total: 0 } },
    } as never);

    await pendingTasksApi.list({
      status: PendingTaskStatus.PENDING,
      skip: 0,
      take: 20,
    });

    expect(getSpy).toHaveBeenCalledWith("/pending-tasks", {
      params: {
        status: PendingTaskStatus.PENDING,
        skip: 0,
        take: 20,
      },
    });
  });

  it("fetches grouped pending tasks by lead", async () => {
    const getSpy = vi.spyOn(apiClient, "get").mockResolvedValue({
      data: {
        data: {
          groups: [],
          totalLeads: 0,
          totalTasks: 0,
          statusCounts: { pending: 0, resolved: 0, dismissed: 0, total: 0 },
        },
      },
    } as never);

    await pendingTasksApi.groupedByLead({
      status: PendingTaskStatus.RESOLVED,
    });

    expect(getSpy).toHaveBeenCalledWith("/pending-tasks/grouped-by-lead", {
      params: { status: PendingTaskStatus.RESOLVED },
    });
  });

  it("updates pending task status", async () => {
    const patchSpy = vi.spyOn(apiClient, "patch").mockResolvedValue({
      data: { data: { id: "task-1", status: PendingTaskStatus.RESOLVED } },
    } as never);

    await pendingTasksApi.updateStatus("task-1", {
      status: PendingTaskStatus.RESOLVED,
    });

    expect(patchSpy).toHaveBeenCalledWith("/pending-tasks/task-1/status", {
      status: PendingTaskStatus.RESOLVED,
    });
  });
});

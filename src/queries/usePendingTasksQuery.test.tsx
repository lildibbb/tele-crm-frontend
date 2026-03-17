import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { pendingTasksApi } from "@/lib/api/pendingTasks";
import { queryKeys } from "@/queries/queryKeys";
import {
  usePendingTasksGroupedByLead,
  useUpdatePendingTaskStatus,
} from "@/queries/usePendingTasksQuery";
import type { PendingTaskGroupedByLeadResponse } from "@/lib/schemas/pendingTask.schema";
import { PendingTaskStatus } from "@/types/enums";

vi.mock("@/lib/api/pendingTasks", () => ({
  pendingTasksApi: {
    list: vi.fn(),
    groupedByLead: vi.fn(),
    updateStatus: vi.fn(),
  },
}));

const baseTask = {
  id: "task-1",
  leadId: "lead-1",
  attachmentId: null,
  interactionId: null,
  caption: "Need follow-up",
  status: PendingTaskStatus.PENDING,
  createdAt: "2026-03-15T00:00:00.000Z",
  resolvedAt: null,
};

const groupedFixture: PendingTaskGroupedByLeadResponse = {
  groups: [
    {
      leadId: "lead-1",
      lead: {
        id: "lead-1",
        displayName: "Alice",
        username: "alice",
        status: "CONTACTED",
        email: "alice@example.com",
        hfmBrokerId: "HFM-2",
      },
      statusCounts: { pending: 1, resolved: 0, dismissed: 0, total: 1 },
      tasks: [baseTask],
    },
  ],
  totalLeads: 1,
  totalTasks: 1,
  statusCounts: { pending: 1, resolved: 0, dismissed: 0, total: 1 },
};

function createWrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

describe("usePendingTasksGroupedByLead", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();
  });

  it("fetches grouped tasks from grouped-by-lead endpoint", async () => {
    vi.mocked(pendingTasksApi.groupedByLead).mockResolvedValue({
      data: { data: groupedFixture },
    } as never);

    const { result } = renderHook(
      () => usePendingTasksGroupedByLead({ status: PendingTaskStatus.PENDING }),
      {
        wrapper: createWrapper(queryClient),
      },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(pendingTasksApi.groupedByLead).toHaveBeenCalledWith({
      status: PendingTaskStatus.PENDING,
    });
    expect(result.current.data?.groups[0]?.leadId).toBe("lead-1");
  });
});

describe("useUpdatePendingTaskStatus", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();
  });

  it("updates both list and grouped caches on successful mutation", async () => {
    const updatedTask = {
      ...baseTask,
      status: PendingTaskStatus.RESOLVED,
      resolvedAt: "2026-03-15T01:00:00.000Z",
    };

    queryClient.setQueryData(queryKeys.pendingTasks.list({ status: "PENDING" }), {
      data: [baseTask],
      total: 1,
      pageCount: 1,
    });
    queryClient.setQueryData(queryKeys.pendingTasks.grouped({ status: "PENDING" }), groupedFixture);

    vi.mocked(pendingTasksApi.updateStatus).mockResolvedValue({
      data: { data: updatedTask },
    } as never);

    const { result } = renderHook(() => useUpdatePendingTaskStatus(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync({
        id: baseTask.id,
        data: { status: PendingTaskStatus.RESOLVED },
      });
    });

    const listCache = queryClient.getQueryData<{
      data: typeof baseTask[];
      total: number;
      pageCount: number;
    }>(queryKeys.pendingTasks.list({ status: "PENDING" }));
    const groupedCache = queryClient.getQueryData<PendingTaskGroupedByLeadResponse>(
      queryKeys.pendingTasks.grouped({ status: "PENDING" }),
    );

    expect(listCache?.data[0]?.status).toBe(PendingTaskStatus.RESOLVED);
    expect(groupedCache?.groups[0]?.tasks[0]?.status).toBe(
      PendingTaskStatus.RESOLVED,
    );
  });
});

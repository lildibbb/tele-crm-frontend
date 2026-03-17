import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { kbApi } from "@/lib/api/kb";
import type { KbEntry } from "@/lib/schemas/kb.schema";
import { queryKeys } from "@/queries/queryKeys";
import { useRetryKb } from "@/queries/useKbQuery";
import { KbFileType, KbStatus, KbType } from "@/types/enums";

vi.mock("@/lib/api/kb", () => ({
  kbApi: {
    findAll: vi.fn(),
    findActive: vi.fn(),
    findOne: vi.fn(),
    createText: vi.fn(),
    uploadFile: vi.fn(),
    retryFailed: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    getProcessingStatus: vi.fn(),
  },
}));

function createWrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

function createKbEntry(status: KbEntry["status"]): KbEntry {
  return {
    id: "kb-1",
    title: "Quarterly FAQ",
    content: "Base content",
    type: KbType.TEXT,
    fileType: KbFileType.PDF,
    url: null,
    status,
    isActive: true,
    createdAt: "2026-03-16T00:00:00.000Z",
    updatedAt: "2026-03-16T00:00:00.000Z",
  };
}

describe("useRetryKb", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: Infinity },
        mutations: { retry: false },
      },
    });
  });

  it("retries failed entry and invalidates KB queries", async () => {
    const failedEntry = createKbEntry(KbStatus.FAILED);
    const pendingEntry = {
      ...failedEntry,
      status: KbStatus.PENDING,
      updatedAt: "2026-03-16T01:00:00.000Z",
    };

    queryClient.setQueryData<KbEntry[]>(queryKeys.kb.list(), [failedEntry]);
    vi.mocked(kbApi.retryFailed).mockResolvedValue({
      data: { data: pendingEntry },
    } as never);
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useRetryKb(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync(failedEntry.id);
    });

    expect(kbApi.retryFailed).toHaveBeenCalledWith(failedEntry.id);
    expect(
      queryClient.getQueryData<KbEntry[]>(queryKeys.kb.list())?.[0]?.status,
    ).toBe(KbStatus.PENDING);

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: queryKeys.kb.all,
        refetchType: "active",
      });
    });
  });
});

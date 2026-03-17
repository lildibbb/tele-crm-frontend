import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { AxiosHeaders, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { kbApi } from "@/lib/api/kb";
import type { ApiResponse } from "@/lib/schemas/common";
import type { KbEntry } from "@/lib/schemas/kb.schema";
import { queryKeys } from "@/queries/queryKeys";
import { shouldPollKbEntries, useUploadKbFile } from "@/queries/useKbQuery";
import { useKbUploadStatus } from "@/queries/useKbUploadStatus";
import { useAuthStore } from "@/store/authStore";
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

class MockEventSource implements EventSource {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSED = 2;

  readonly CONNECTING = 0;
  readonly OPEN = 1;
  readonly CLOSED = 2;
  readonly withCredentials = false;
  readonly url: string;
  readyState = this.OPEN;

  onopen: ((this: EventSource, ev: Event) => unknown) | null = null;
  onmessage: ((this: EventSource, ev: MessageEvent) => unknown) | null = null;
  onerror: ((this: EventSource, ev: Event) => unknown) | null = null;

  constructor(url: string) {
    this.url = url;
  }

  addEventListener<K extends keyof EventSourceEventMap>(
    _type: K,
    _listener: (this: EventSource, ev: EventSourceEventMap[K]) => unknown,
    _options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    _type: string,
    _listener: EventListenerOrEventListenerObject,
    _options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(): void {}

  removeEventListener<K extends keyof EventSourceEventMap>(
    _type: K,
    _listener: (this: EventSource, ev: EventSourceEventMap[K]) => unknown,
    _options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(
    _type: string,
    _listener: EventListenerOrEventListenerObject,
    _options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(): void {}

  dispatchEvent(_event: Event): boolean {
    return true;
  }

  close(): void {
    this.readyState = this.CLOSED;
  }

  emitStatus(status: "processing" | "ready" | "failed", kbId: string): void {
    this.onmessage?.(
      new MessageEvent("message", {
        data: JSON.stringify({ status, kbId }),
      }),
    );
  }

  emitError(): void {
    this.onerror?.(new Event("error"));
  }
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

function createAxiosEnvelope<T>(
  payload: T,
  statusCode: number,
): AxiosResponse<ApiResponse<T>> {
  const config: InternalAxiosRequestConfig = {
    headers: new AxiosHeaders(),
    method: "get",
    url: "/knowledge-base",
  };

  return {
    data: {
      statusCode,
      message: "ok",
      data: payload,
    },
    status: statusCode,
    statusText: "OK",
    headers: {},
    config,
  };
}

function createWrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

describe("KB upload realtime lifecycle", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: Infinity },
        mutations: { retry: false },
      },
    });
    useAuthStore.setState({ accessToken: "test-token" });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("enables polling when PROCESSING entries exist", () => {
    expect(shouldPollKbEntries([createKbEntry(KbStatus.PROCESSING)])).toBe(true);
    expect(shouldPollKbEntries([createKbEntry(KbStatus.PENDING)])).toBe(true);
    expect(shouldPollKbEntries([createKbEntry(KbStatus.READY)])).toBe(false);
  });

  it.each([
    ["ready", KbStatus.READY],
    ["failed", KbStatus.FAILED],
  ] as const)(
    "moves upload from PROCESSING to %s via SSE",
    async (terminalStreamStatus, terminalKbStatus) => {
      const processingEntry = createKbEntry(KbStatus.PROCESSING);
      const source = new MockEventSource("http://localhost");

      vi.mocked(kbApi.uploadFile).mockResolvedValue(
        createAxiosEnvelope(processingEntry, 201),
      );
      vi.mocked(kbApi.getProcessingStatus).mockReturnValue(source);

      const uploadHook = renderHook(() => useUploadKbFile(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        await uploadHook.result.current.mutateAsync({
          file: new File(["sample"], "faq.pdf", { type: "application/pdf" }),
          title: "Quarterly FAQ",
        });
      });

      await waitFor(() => {
        const cachedEntries = queryClient.getQueryData<KbEntry[]>(
          queryKeys.kb.list(),
        );
        expect(cachedEntries?.[0]?.status).toBe(KbStatus.PROCESSING);
      });

      const statusHook = renderHook(
        () =>
          useKbUploadStatus(
            queryClient.getQueryData<KbEntry[]>(queryKeys.kb.list()) ?? [],
          ),
        {
          wrapper: createWrapper(queryClient),
        },
      );

      expect(kbApi.getProcessingStatus).toHaveBeenCalledTimes(1);

      act(() => {
        statusHook.result.current.subscribeToKbStatus(processingEntry.id);
        source.emitStatus(terminalStreamStatus, processingEntry.id);
      });

      expect(kbApi.getProcessingStatus).toHaveBeenCalledTimes(1);

      await waitFor(() => {
        const cachedEntries = queryClient.getQueryData<KbEntry[]>(
          queryKeys.kb.list(),
        );
        expect(cachedEntries?.[0]?.status).toBe(terminalKbStatus);
      });
    },
  );

  it("falls back to cache invalidation + retry when SSE errors", async () => {
    vi.useFakeTimers();

    const processingEntry = createKbEntry(KbStatus.PROCESSING);
    const firstSource = new MockEventSource("http://localhost/first");
    const secondSource = new MockEventSource("http://localhost/second");
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    queryClient.setQueryData(queryKeys.kb.list(), [processingEntry]);
    vi.mocked(kbApi.getProcessingStatus)
      .mockReturnValueOnce(firstSource)
      .mockReturnValueOnce(secondSource);

    renderHook(() => useKbUploadStatus([processingEntry]), {
      wrapper: createWrapper(queryClient),
    });

    expect(kbApi.getProcessingStatus).toHaveBeenCalledTimes(1);

    act(() => {
      firstSource.emitError();
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.kb.list(),
    });
    expect(
      queryClient.getQueryData<KbEntry[]>(queryKeys.kb.list())?.[0]?.status,
    ).toBe(KbStatus.PROCESSING);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(kbApi.getProcessingStatus).toHaveBeenCalledTimes(2);
  });
});

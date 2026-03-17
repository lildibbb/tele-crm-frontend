import { useCallback, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod/v4";
import { kbApi } from "@/lib/api/kb";
import type { KbEntry } from "@/lib/schemas/kb.schema";
import { useAuthStore } from "@/store/authStore";
import { KbStatus } from "@/types/enums";
import { KB_TERMINAL_STATUSES, isKbInFlightStatus } from "./useKbQuery";
import { queryKeys } from "./queryKeys";

const SSE_RETRY_DELAY_MS = 3000;

const KbStatusEventSchema = z.object({
  status: z.enum([
    "processing",
    "ready",
    "failed",
    "PROCESSING",
    "READY",
    "FAILED",
  ]),
  kbId: z.string().optional(),
  progress: z.number().optional(),
  error: z.string().optional(),
});

function normalizeStreamStatus(
  streamStatus: z.infer<typeof KbStatusEventSchema>["status"],
): KbEntry["status"] {
  if (streamStatus === "ready" || streamStatus === "READY") {
    return KbStatus.READY;
  }
  if (streamStatus === "failed" || streamStatus === "FAILED") {
    return KbStatus.FAILED;
  }
  return KbStatus.PROCESSING;
}

export function useKbUploadStatus(entries: KbEntry[] = []) {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const sourcesRef = useRef<Map<string, EventSource>>(new Map());
  const retryTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );
  const subscribeRef = useRef<(kbId: string) => boolean>(() => false);

  const closeSubscription = useCallback((kbId: string) => {
    const source = sourcesRef.current.get(kbId);
    if (!source) return;
    source.close();
    sourcesRef.current.delete(kbId);
  }, []);

  const clearRetryTimer = useCallback((kbId: string) => {
    const timer = retryTimersRef.current.get(kbId);
    if (!timer) return;
    clearTimeout(timer);
    retryTimersRef.current.delete(kbId);
  }, []);

  const invalidateKbList = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.kb.list() });
  }, [queryClient]);

  const patchKbStatus = useCallback(
    (kbId: string, status: KbEntry["status"]) => {
      queryClient.setQueryData<KbEntry[]>(queryKeys.kb.list(), (current) => {
        if (!current || current.length === 0) {
          return current;
        }

        return current.map((entry) => {
          if (entry.id !== kbId) {
            return entry;
          }

          return {
            ...entry,
            status,
            updatedAt: new Date().toISOString(),
          };
        });
      });
    },
    [queryClient],
  );

  const subscribeToKbStatus = useCallback(
    (kbId: string): boolean => {
      if (sourcesRef.current.has(kbId)) {
        return true;
      }

      if (!accessToken) {
        return false;
      }

      const source = kbApi.getProcessingStatus(kbId, accessToken);
      sourcesRef.current.set(kbId, source);

      source.onmessage = (message) => {
        let payload: unknown;
        try {
          payload = JSON.parse(message.data);
        } catch {
          return;
        }

        const parsed = KbStatusEventSchema.safeParse(payload);
        if (!parsed.success) {
          return;
        }

        const targetKbId = parsed.data.kbId ?? kbId;
        const nextStatus = normalizeStreamStatus(parsed.data.status);
        patchKbStatus(targetKbId, nextStatus);

        if (KB_TERMINAL_STATUSES.has(nextStatus)) {
          clearRetryTimer(kbId);
          closeSubscription(kbId);
        }
      };

      source.onerror = () => {
        closeSubscription(kbId);
        invalidateKbList();
        clearRetryTimer(kbId);

        const retryTimer = setTimeout(() => {
          retryTimersRef.current.delete(kbId);
          const currentEntries =
            queryClient.getQueryData<KbEntry[]>(queryKeys.kb.list()) ?? [];
          const targetEntry = currentEntries.find((entry) => entry.id === kbId);
          if (!targetEntry || !isKbInFlightStatus(targetEntry.status)) {
            return;
          }
          subscribeRef.current(kbId);
        }, SSE_RETRY_DELAY_MS);

        retryTimersRef.current.set(kbId, retryTimer);
      };

      return true;
    },
    [
      accessToken,
      clearRetryTimer,
      closeSubscription,
      invalidateKbList,
      patchKbStatus,
      queryClient,
    ],
  );

  useEffect(() => {
    subscribeRef.current = subscribeToKbStatus;
  }, [subscribeToKbStatus]);

  useEffect(() => {
    for (const entry of entries) {
      if (isKbInFlightStatus(entry.status)) {
        subscribeToKbStatus(entry.id);
      }
    }
  }, [entries, subscribeToKbStatus]);

  useEffect(
    () => () => {
      for (const timer of retryTimersRef.current.values()) {
        clearTimeout(timer);
      }
      retryTimersRef.current.clear();
      for (const source of sourcesRef.current.values()) {
        source.close();
      }
      sourcesRef.current.clear();
    },
    [],
  );

  return { subscribeToKbStatus };
}

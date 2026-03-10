import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";
import { superadminApi } from "@/lib/api/superadmin";
import type { BackupLog } from "@/lib/api/superadmin";
import { parseApiData } from "@/lib/api/parseResponse";
import { useAuthStore } from "@/store/authStore";
import { API_BASE_URL } from "@/lib/api/apiClient";

// ── Backup History ────────────────────────────────────────────────────────────

export function useBackupHistory(limit = 10) {
  return useQuery({
    queryKey: queryKeys.backup.history(limit),
    queryFn: async () => {
      const res = await superadminApi.getBackupHistory(limit);
      return parseApiData<BackupLog[]>(res.data) ?? [];
    },
  });
}

// ── Trigger Backup ────────────────────────────────────────────────────────────

export interface TriggerBackupResult {
  jobId: string;
  status: string;
  destinations: string[];
}

export function useTriggerBackup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<TriggerBackupResult | undefined> => {
      const res = await superadminApi.triggerBackup();
      return parseApiData<TriggerBackupResult>(res.data);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.backup.all });
    },
  });
}

// ── Backup Progress SSE ───────────────────────────────────────────────────────

export interface BackupProgress {
  stage: "dumping" | "encrypting" | "uploading" | "done" | "failed";
  pct: number;
  label: string;
  error?: string;
}

/**
 * Subscribes to a backup job's SSE progress stream.
 * Uses fetch + ReadableStream so the Authorization header can be attached.
 * (Native EventSource does not support custom headers.)
 *
 * @param jobId    - Connect when non-null; disconnect and clear when null.
 * @param onDone   - Called once when stage === 'done'.
 * @param onFailed - Called once when stage === 'failed'.
 */
export function useBackupProgress(
  jobId: string | null,
  onDone?: () => void,
  onFailed?: () => void,
) {
  const [progress, setProgress] = useState<BackupProgress | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const disconnect = useCallback(() => {
    abortRef.current?.abort();
    setIsConnected(false);
  }, []);

  useEffect(() => {
    if (!jobId) {
      setProgress(null);
      return;
    }

    const accessToken = useAuthStore.getState().accessToken;
    if (!accessToken) return;

    const controller = new AbortController();
    abortRef.current = controller;
    setIsConnected(true);

    const connect = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/superadmin/backup/progress/${encodeURIComponent(jobId)}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "text/event-stream",
            },
            signal: controller.signal,
          },
        );

        if (!response.ok || !response.body) {
          setIsConnected(false);
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const data = JSON.parse(line.slice(6)) as BackupProgress;
              setProgress(data);
              if (data.stage === "done") {
                setIsConnected(false);
                onDone?.();
              } else if (data.stage === "failed") {
                setIsConnected(false);
                onFailed?.();
              }
            } catch {
              // ignore malformed SSE line
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setIsConnected(false);
        }
      }
    };

    void connect();

    return () => {
      controller.abort();
      setIsConnected(false);
    };
    // onDone/onFailed are intentionally excluded — they're inline functions
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  return {
    progress,
    isConnected,
    isDone: progress?.stage === "done",
    isFailed: progress?.stage === "failed",
    disconnect,
  };
}


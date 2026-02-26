import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  broadcastApi,
  type BroadcastInput,
  type BroadcastLog,
} from "@/lib/api/broadcast";

// ── State & Actions ────────────────────────────────────────────────────────

interface BroadcastState {
  message: string;
  photoUrl: string;
  history: BroadcastLog[];
  historyTotal: number;
  isSending: boolean;
  isLoadingHistory: boolean;
  error: string | null;
  lastEnqueued: number | null;
  pollingId: ReturnType<typeof setInterval> | null;
}

interface BroadcastActions {
  setMessage: (message: string) => void;
  setPhotoUrl: (photoUrl: string) => void;
  send: () => Promise<void>;
  fetchHistory: (page?: number, limit?: number) => Promise<void>;
  startPolling: (logId: string) => void;
  stopPolling: () => void;
  reset: () => void;
}

// ── Store ──────────────────────────────────────────────────────────────────

export const useBroadcastStore = create<BroadcastState & BroadcastActions>()(
  devtools(
    (set, get) => ({
      message: "",
      photoUrl: "",
      history: [],
      historyTotal: 0,
      isSending: false,
      isLoadingHistory: false,
      error: null,
      lastEnqueued: null,
      pollingId: null,

      setMessage: (message) => set({ message }, false, "setMessage"),
      setPhotoUrl: (photoUrl) => set({ photoUrl }, false, "setPhotoUrl"),

      send: async () => {
        const { message, photoUrl } = get();
        if (!message.trim()) return;
        set({ isSending: true, error: null }, false, "send/pending");
        try {
          const input: BroadcastInput = { message: message.trim() };
          if (photoUrl.trim()) input.photoUrl = photoUrl.trim();
          const res = await broadcastApi.send(input);
          const payload = (res.data as unknown as { data: { enqueued: number; logId: string } }).data;
          const enqueued = payload?.enqueued ?? 0;
          const logId = payload?.logId;

          // Optimistically prepend a QUEUED entry
          if (logId) {
            const optimistic: BroadcastLog = {
              id: logId,
              message: input.message,
              photoUrl: input.photoUrl ?? null,
              recipientCount: enqueued,
              status: "QUEUED",
              sentAt: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            set(
              (s) => ({ history: [optimistic, ...s.history], historyTotal: s.historyTotal + 1 }),
              false,
              "send/optimistic",
            );
            // Poll until SENT or FAILED (max ~2 minutes)
            get().startPolling(logId);
          }

          set({ isSending: false, lastEnqueued: enqueued, message: "", photoUrl: "" }, false, "send/success");
        } catch (err: unknown) {
          const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to send broadcast";
          set({ isSending: false, error: msg }, false, "send/error");
        }
      },

      fetchHistory: async (page = 1, limit = 20) => {
        set({ isLoadingHistory: true, error: null }, false, "fetchHistory/pending");
        try {
          const res = await broadcastApi.history({ page, limit });
          const payload = (res.data as unknown as { data: { data: BroadcastLog[]; total: number } }).data;
          set(
            { isLoadingHistory: false, history: payload?.data ?? [], historyTotal: payload?.total ?? 0 },
            false,
            "fetchHistory/success",
          );
        } catch (err: unknown) {
          const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to load history";
          set({ isLoadingHistory: false, error: msg }, false, "fetchHistory/error");
        }
      },

      startPolling: (logId: string) => {
        const { pollingId, stopPolling } = get();
        if (pollingId) stopPolling();
        let attempts = 0;
        const id = setInterval(async () => {
          attempts++;
          if (attempts > 24) { // max 2 min at 5s intervals
            get().stopPolling();
            return;
          }
          try {
            const res = await broadcastApi.history({ page: 1, limit: 20 });
            const payload = (res.data as unknown as { data: { data: BroadcastLog[]; total: number } }).data;
            const logs = payload?.data ?? [];
            const updated = logs.find((l) => l.id === logId);
            if (updated?.status === "SENT" || updated?.status === "FAILED") {
              set({ history: logs, historyTotal: payload?.total ?? 0 }, false, "poll/done");
              get().stopPolling();
            } else {
              // Merge updated list, preserving optimistic entry if not yet in API result
              set(
                (s) => {
                  const ids = new Set(logs.map((l) => l.id));
                  const merged = [...logs, ...s.history.filter((l) => !ids.has(l.id))];
                  return { history: merged, historyTotal: payload?.total ?? s.historyTotal };
                },
                false,
                "poll/update",
              );
            }
          } catch {
            // silent; keep polling
          }
        }, 5000);
        set({ pollingId: id }, false, "startPolling");
      },

      stopPolling: () => {
        const { pollingId } = get();
        if (pollingId) {
          clearInterval(pollingId);
          set({ pollingId: null }, false, "stopPolling");
        }
      },

      reset: () =>
        set({ message: "", photoUrl: "", error: null, lastEnqueued: null }, false, "reset"),
    }),
    { name: "broadcastStore" },
  ),
);

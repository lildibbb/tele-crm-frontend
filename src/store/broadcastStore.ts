import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { broadcastApi, type BroadcastInput } from "@/lib/api/broadcast";
import type { Interaction } from "@/lib/schemas/lead.schema";

// ── State & Actions ────────────────────────────────────────────────────────

interface BroadcastState {
  message: string;
  photoUrl: string;
  history: Interaction[];
  historyTotal: number;
  isSending: boolean;
  isLoadingHistory: boolean;
  error: string | null;
  lastEnqueued: number | null;
}

interface BroadcastActions {
  setMessage: (message: string) => void;
  setPhotoUrl: (photoUrl: string) => void;
  send: () => Promise<void>;
  fetchHistory: (page?: number, limit?: number) => Promise<void>;
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
          const enqueued = (res.data as unknown as { data: { enqueued: number } }).data?.enqueued ?? 0;
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
          const payload = (res.data as unknown as { data: { data: Interaction[]; total: number } }).data;
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

      reset: () =>
        set({ message: "", photoUrl: "", error: null, lastEnqueued: null }, false, "reset"),
    }),
    { name: "broadcastStore" },
  ),
);

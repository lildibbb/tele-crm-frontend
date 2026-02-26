import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { botApi } from "@/lib/api/bot";

interface BotState {
  online: boolean | null; // null = unknown/loading
  lastChecked: Date | null;
}

interface BotActions {
  check: () => Promise<void>;
  startPolling: () => () => void;
}

export const useBotStore = create<BotState & BotActions>()(
  devtools(
    (set) => ({
      online: null,
      lastChecked: null,

      check: async () => {
        try {
          const res = await botApi.getStatus();
          const status = (res.data as unknown as { data?: { status?: string } }).data?.status;
          set({ online: status === "ok" || status === "active", lastChecked: new Date() }, false, "bot/check");
        } catch {
          set({ online: false, lastChecked: new Date() }, false, "bot/error");
        }
      },

      startPolling: () => {
        const { check } = useBotStore.getState();
        void check();
        const id = setInterval(() => void useBotStore.getState().check(), 30_000);
        return () => clearInterval(id);
      },
    }),
    { name: "botStore" },
  ),
);

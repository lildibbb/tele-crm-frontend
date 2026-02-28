import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { superadminApi } from "@/lib/api/superadmin";
import type { BackupLog } from "@/lib/api/superadmin";
import { parseApiData } from "@/lib/api/parseResponse";

interface BackupState {
  history: BackupLog[];
  isLoadingHistory: boolean;
  isTriggering: boolean;
  error: string | null;
  triggerResult: string | null;
}

interface BackupActions {
  fetchHistory: (limit?: number) => Promise<void>;
  triggerBackup: () => Promise<void>;
  clearTriggerResult: () => void;
}

export const useBackupStore = create<BackupState & BackupActions>()(
  devtools(
    (set) => ({
      history: [],
      isLoadingHistory: false,
      isTriggering: false,
      error: null,
      triggerResult: null,

      fetchHistory: async (limit = 10) => {
        set({ isLoadingHistory: true, error: null }, false, "backup/fetchHistory/pending");
        try {
          const res = await superadminApi.getBackupHistory(limit);
          const data = parseApiData<BackupLog[]>(res.data) ?? [];
          set({ isLoadingHistory: false, history: data }, false, "backup/fetchHistory/success");
        } catch (err: unknown) {
          const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to load backup history";
          set({ isLoadingHistory: false, error: msg }, false, "backup/fetchHistory/error");
        }
      },

      triggerBackup: async () => {
        set({ isTriggering: true, error: null, triggerResult: null }, false, "backup/trigger/pending");
        try {
          await superadminApi.triggerBackup();
          set({ isTriggering: false, triggerResult: "Backup queued successfully" }, false, "backup/trigger/success");
        } catch (err: unknown) {
          const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to trigger backup";
          set({ isTriggering: false, error: msg }, false, "backup/trigger/error");
          throw err;
        }
      },

      clearTriggerResult: () => set({ triggerResult: null }),
    }),
    { name: "backup-store" },
  ),
);

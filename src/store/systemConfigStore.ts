import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { systemConfigApi } from "@/lib/api/systemConfig";
import type { SystemConfigEntry } from "@/lib/schemas/systemConfig.schema";
import { parseApiData } from "@/lib/api/parseResponse";

// ── State & Actions ───────────────────────────────────────────────────────────

interface SystemConfigState {
  entries: Record<string, string>;  // key → value
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

interface SystemConfigActions {
  fetchAll: () => Promise<void>;
  getValue: (key: string, fallback?: string) => string;
  upsert: (key: string, value: string) => Promise<void>;
  upsertMany: (updates: Record<string, string>) => Promise<void>;
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useSystemConfigStore = create<SystemConfigState & SystemConfigActions>()(
  devtools(
    (set, get) => ({
      entries: {},
      isLoading: false,
      isSaving: false,
      error: null,

      fetchAll: async () => {
        set({ isLoading: true, error: null }, false, "fetchAll/pending");
        try {
          const res = await systemConfigApi.findAll();
          const raw = parseApiData<SystemConfigEntry[]>(res.data) ?? [];
          const entries: Record<string, string> = {};
          for (const e of raw) entries[e.key] = e.value;
          set({ isLoading: false, entries }, false, "fetchAll/success");
        } catch (err: unknown) {
          const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to load config";
          set({ isLoading: false, error: msg }, false, "fetchAll/error");
        }
      },

      getValue: (key, fallback = "") => {
        return get().entries[key] ?? fallback;
      },

      upsert: async (key, value) => {
        set({ isSaving: true, error: null }, false, "upsert/pending");
        try {
          await systemConfigApi.upsert(key, { value });
          set(
            (s) => ({ isSaving: false, entries: { ...s.entries, [key]: value } }),
            false,
            "upsert/success",
          );
        } catch (err: unknown) {
          const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to save config";
          set({ isSaving: false, error: msg }, false, "upsert/error");
          throw err;
        }
      },

      upsertMany: async (updates) => {
        set({ isSaving: true, error: null }, false, "upsertMany/pending");
        try {
          await Promise.all(
            Object.entries(updates).map(([key, value]) =>
              systemConfigApi.upsert(key, { value }),
            ),
          );
          set(
            (s) => ({ isSaving: false, entries: { ...s.entries, ...updates } }),
            false,
            "upsertMany/success",
          );
        } catch (err: unknown) {
          const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to save config";
          set({ isSaving: false, error: msg }, false, "upsertMany/error");
          throw err;
        }
      },
    }),
    { name: "systemConfigStore" },
  ),
);

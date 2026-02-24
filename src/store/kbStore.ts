import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { kbApi } from "@/lib/api/kb";
import type { KbEntry, CreateKbInput, UpdateKbInput } from "@/lib/schemas/kb.schema";

// ── State & Actions ────────────────────────────────────────────────────────

interface KbState {
  entries: KbEntry[];
  isLoading: boolean;
  error: string | null;
  /** kbId → processing status from SSE */
  processingStatus: Record<string, { status: string; progress?: number; error?: string }>;
}

interface KbActions {
  fetchAll: () => Promise<void>;
  fetchActive: () => Promise<void>;
  createText: (data: CreateKbInput) => Promise<KbEntry>;
  uploadFile: (file: File, title: string) => Promise<void>;
  update: (id: string, data: UpdateKbInput) => Promise<void>;
  remove: (id: string) => Promise<void>;
  watchProcessing: (kbId: string, accessToken: string) => () => void;
}

// ── Store ──────────────────────────────────────────────────────────────────

export const useKbStore = create<KbState & KbActions>()(
  devtools(
    (set) => ({
      entries: [],
      isLoading: false,
      error: null,
      processingStatus: {},

      fetchAll: async () => {
        set({ isLoading: true, error: null }, false, "fetchAll/pending");
        try {
          const res = await kbApi.findAll();
          set({ entries: res.data.data, isLoading: false }, false, "fetchAll/success");
        } catch (err: unknown) {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? "Failed to load knowledge base.";
          set({ isLoading: false, error: message }, false, "fetchAll/error");
        }
      },

      fetchActive: async () => {
        set({ isLoading: true, error: null }, false, "fetchActive/pending");
        try {
          const res = await kbApi.findActive();
          set({ entries: res.data.data, isLoading: false }, false, "fetchActive/success");
        } catch (err: unknown) {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? "Failed to load active entries.";
          set({ isLoading: false, error: message }, false, "fetchActive/error");
        }
      },

      createText: async (data: CreateKbInput) => {
        const res = await kbApi.createText(data);
        const entry = res.data.data;
        set(
          (s) => ({ entries: [...s.entries, entry] }),
          false,
          "createText/success",
        );
        return entry;
      },

      uploadFile: async (file: File, title: string) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", title);
        await kbApi.uploadFile(formData);
        // Refresh list after upload to pick up the new entry
        const res = await kbApi.findAll();
        set({ entries: res.data.data }, false, "uploadFile/refreshed");
      },

      update: async (id: string, data: UpdateKbInput) => {
        const res = await kbApi.update(id, data);
        const updated = res.data.data;
        set(
          (s) => ({ entries: s.entries.map((e) => (e.id === id ? updated : e)) }),
          false,
          "update/success",
        );
      },

      remove: async (id: string) => {
        await kbApi.remove(id);
        set(
          (s) => ({ entries: s.entries.filter((e) => e.id !== id) }),
          false,
          "remove/success",
        );
      },

      watchProcessing: (kbId: string, accessToken: string) => {
        const source = kbApi.getProcessingStatus(kbId, accessToken);
        source.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data) as {
              status: string;
              progress?: number;
              kbId?: string;
              error?: string;
            };
            set(
              (s) => ({
                processingStatus: {
                  ...s.processingStatus,
                  [kbId]: { status: payload.status, progress: payload.progress, error: payload.error },
                },
              }),
              false,
              "watchProcessing/update",
            );
            if (payload.status === "READY" || payload.status === "FAILED") {
              source.close();
            }
          } catch {
            source.close();
          }
        };
        source.onerror = () => source.close();
        // Return cleanup function
        return () => source.close();
      },
    }),
    { name: "kb-store" },
  ),
);

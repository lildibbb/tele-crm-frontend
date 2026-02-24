import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { commandMenuApi } from "@/lib/api/commandMenu";
import type {
  CommandMenu,
  CreateCommandMenuInput,
  UpdateCommandMenuInput,
  ReorderCommandMenuInput,
} from "@/lib/schemas/commandMenu.schema";

// ── State & Actions ────────────────────────────────────────────────────────

interface CommandMenuState {
  items: CommandMenu[];
  isLoading: boolean;
  error: string | null;
}

interface CommandMenuActions {
  fetchAll: () => Promise<void>;
  create: (data: CreateCommandMenuInput) => Promise<CommandMenu>;
  update: (id: string, data: UpdateCommandMenuInput) => Promise<void>;
  remove: (id: string) => Promise<void>;
  reorder: (data: ReorderCommandMenuInput) => Promise<void>;
}

// ── Store ──────────────────────────────────────────────────────────────────

export const useCommandMenuStore = create<CommandMenuState & CommandMenuActions>()(
  devtools(
    (set) => ({
      items: [],
      isLoading: false,
      error: null,

      fetchAll: async () => {
        set({ isLoading: true, error: null }, false, "fetchAll/pending");
        try {
          const res = await commandMenuApi.findAll();
          set({ items: res.data.data, isLoading: false }, false, "fetchAll/success");
        } catch (err: unknown) {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? "Failed to load command menus.";
          set({ isLoading: false, error: message }, false, "fetchAll/error");
        }
      },

      create: async (data: CreateCommandMenuInput) => {
        const res = await commandMenuApi.create(data);
        const item = res.data.data;
        set(
          (s) => ({ items: [...s.items, item].sort((a, b) => a.order - b.order) }),
          false,
          "create/success",
        );
        return item;
      },

      update: async (id: string, data: UpdateCommandMenuInput) => {
        const res = await commandMenuApi.update(id, data);
        const updated = res.data.data;
        set(
          (s) => ({ items: s.items.map((i) => (i.id === id ? updated : i)) }),
          false,
          "update/success",
        );
      },

      remove: async (id: string) => {
        await commandMenuApi.remove(id);
        set(
          (s) => ({ items: s.items.filter((i) => i.id !== id) }),
          false,
          "remove/success",
        );
      },

      reorder: async (data: ReorderCommandMenuInput) => {
        // Optimistic update
        set(
          (s) => {
            const orderMap = new Map(data.items.map((i) => [i.id, i.order]));
            const reordered = s.items
              .map((item) => ({
                ...item,
                order: orderMap.has(item.id) ? orderMap.get(item.id)! : item.order,
              }))
              .sort((a, b) => a.order - b.order);
            return { items: reordered };
          },
          false,
          "reorder/optimistic",
        );
        try {
          await commandMenuApi.reorder(data);
        } catch (err: unknown) {
          // Revert: re-fetch on failure
          const res = await commandMenuApi.findAll();
          set({ items: res.data.data }, false, "reorder/reverted");
          throw err;
        }
      },
    }),
    { name: "command-menu-store" },
  ),
);

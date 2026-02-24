import { create } from "zustand";
import { devtools } from "zustand/middleware";

// ── Types ──────────────────────────────────────────────────────────────────
export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
}

interface UIState {
  sidebarOpen: boolean;
  notificationsOpen: boolean;
  globalLoading: boolean;
}

interface UIActions {
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setNotificationsOpen: (open: boolean) => void;
  setGlobalLoading: (loading: boolean) => void;
}

// ── Store ──────────────────────────────────────────────────────────────────
export const useUIStore = create<UIState & UIActions>()(
  devtools(
    (set, get) => ({
      sidebarOpen: false,
      notificationsOpen: false,
      globalLoading: false,

      setSidebarOpen: (open) => set({ sidebarOpen: open }, false, "setSidebarOpen"),
      toggleSidebar: () =>
        set((s) => ({ sidebarOpen: !s.sidebarOpen }), false, "toggleSidebar"),
      setNotificationsOpen: (open) =>
        set({ notificationsOpen: open }, false, "setNotificationsOpen"),
      setGlobalLoading: (loading) =>
        set({ globalLoading: loading }, false, "setGlobalLoading"),
    }),
    { name: "ui-store" }
  )
);

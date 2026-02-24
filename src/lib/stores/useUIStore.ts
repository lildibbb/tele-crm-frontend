import { create } from "zustand";

interface UIState {
  isSidebarOpen: boolean;
  activeHandoverLeadId: string | null;
  toggleSidebar: () => void;
  setActiveHandoverLead: (leadId: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  activeHandoverLeadId: null,
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setActiveHandoverLead: (leadId) => set({ activeHandoverLeadId: leadId }),
}));

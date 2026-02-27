import { create } from "zustand";
import { persist } from "zustand/middleware";

// ── Widget IDs ────────────────────────────────────────────────────────────────
// Each ID maps to a logical section on the dashboard.
// funnel-activity and trend-charts are paired layouts (2 panels per row).
export type WidgetId =
  | "kpi-cards"
  | "funnel-activity"
  | "action-strip"
  | "trend-charts";

export interface DashboardWidget {
  id: WidgetId;
  label: string;
  visible: boolean;
  order: number;
}

const DEFAULT_WIDGETS: DashboardWidget[] = [
  { id: "kpi-cards", label: "KPI Stats", visible: true, order: 0 },
  { id: "funnel-activity", label: "Funnel & Activity", visible: true, order: 1 },
  { id: "action-strip", label: "Quick Actions", visible: true, order: 2 },
  { id: "trend-charts", label: "Trend Charts", visible: true, order: 3 },
];

interface DashboardLayoutState {
  widgets: DashboardWidget[];
  toggleWidget: (id: WidgetId) => void;
  reorderWidgets: (orderedIds: WidgetId[]) => void;
  resetToDefault: () => void;
}

export const useDashboardLayoutStore = create<DashboardLayoutState>()(
  persist(
    (set) => ({
      widgets: DEFAULT_WIDGETS,

      toggleWidget: (id) =>
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === id ? { ...w, visible: !w.visible } : w,
          ),
        })),

      reorderWidgets: (orderedIds) =>
        set((state) => ({
          widgets: orderedIds.map((id, index) => {
            const existing = state.widgets.find((w) => w.id === id)!;
            return { ...existing, order: index };
          }),
        })),

      resetToDefault: () => set({ widgets: DEFAULT_WIDGETS }),
    }),
    {
      name: "titan-crm-dashboard-layout",
      version: 1,
    },
  ),
);

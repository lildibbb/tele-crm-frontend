import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { analyticsApi } from "@/lib/api/analytics";
import type { VelocityData } from "@/lib/api/analytics";
import type {
  AnalyticsDashboard,
  DailyStats,
  WeeklyStats,
  MonthlyStats,
  WeeklyStatsParams,
  MonthlyStatsParams,
  AnalyticsSummary,
  AnalyticsSummaryParams,
} from "@/lib/schemas/analytics.schema";
import { useAuthStore } from "./authStore";

// ── State & Actions ────────────────────────────────────────────────────────

interface AnalyticsState {
  summary: AnalyticsSummary | null;
  dashboard: AnalyticsDashboard | null;
  today: DailyStats | null;
  weekly: WeeklyStats[];
  monthly: MonthlyStats[];
  velocityData: VelocityData | null;
  isLoading: boolean;
  error: string | null;
}

interface AnalyticsActions {
  fetchSummary: (params?: AnalyticsSummaryParams) => Promise<void>;
  fetchDashboard: () => Promise<void>;
  fetchToday: () => Promise<void>;
  fetchWeekly: (params?: WeeklyStatsParams) => Promise<void>;
  fetchMonthly: (params?: MonthlyStatsParams) => Promise<void>;
  fetchVelocity: () => Promise<void>;
}

// ── Store ──────────────────────────────────────────────────────────────────

export const useAnalyticsStore = create<AnalyticsState & AnalyticsActions>()(
  devtools(
    (set) => ({
      summary: null,
      dashboard: null,
      today: null,
      weekly: [],
      monthly: [],
      velocityData: null,
      isLoading: false,
      error: null,

      fetchSummary: async (params?: AnalyticsSummaryParams) => {
        set({ isLoading: true, error: null }, false, "fetchSummary/pending");
        try {
          // Fallback chain: explicit params.timezone → user stored preference → browser Intl → UTC
          const { user } = useAuthStore.getState();
          const timezone =
            params?.timezone ||
            user?.timezone ||
            Intl.DateTimeFormat().resolvedOptions().timeZone ||
            "UTC";
          const res = await analyticsApi.getSummary({ ...params, timezone } as AnalyticsSummaryParams);
          set(
            { summary: res.data.data, isLoading: false },
            false,
            "fetchSummary/success",
          );
        } catch (err: unknown) {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? "Failed to load analytics summary.";
          set(
            { isLoading: false, error: message },
            false,
            "fetchSummary/error",
          );
        }
      },

      fetchDashboard: async () => {
        set({ isLoading: true, error: null }, false, "fetchDashboard/pending");
        try {
          const res = await analyticsApi.getDashboard();
          set(
            { dashboard: res.data.data, isLoading: false },
            false,
            "fetchDashboard/success",
          );
        } catch (err: unknown) {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? "Failed to load dashboard stats.";
          set(
            { isLoading: false, error: message },
            false,
            "fetchDashboard/error",
          );
        }
      },

      fetchToday: async () => {
        set({ isLoading: true, error: null }, false, "fetchToday/pending");
        try {
          const res = await analyticsApi.getToday();
          set(
            { today: res.data.data, isLoading: false },
            false,
            "fetchToday/success",
          );
        } catch (err: unknown) {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? "Failed to load today's stats.";
          set({ isLoading: false, error: message }, false, "fetchToday/error");
        }
      },

      fetchWeekly: async (params?: WeeklyStatsParams) => {
        set({ isLoading: true, error: null }, false, "fetchWeekly/pending");
        try {
          const res = await analyticsApi.getWeekly(params);
          set(
            { weekly: res.data.data, isLoading: false },
            false,
            "fetchWeekly/success",
          );
        } catch (err: unknown) {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? "Failed to load weekly stats.";
          set({ isLoading: false, error: message }, false, "fetchWeekly/error");
        }
      },

      fetchMonthly: async (params?: MonthlyStatsParams) => {
        set({ isLoading: true, error: null }, false, "fetchMonthly/pending");
        try {
          const res = await analyticsApi.getMonthly(params);
          set(
            { monthly: res.data.data, isLoading: false },
            false,
            "fetchMonthly/success",
          );
        } catch (err: unknown) {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? "Failed to load monthly stats.";
          set(
            { isLoading: false, error: message },
            false,
            "fetchMonthly/error",
          );
        }
      },

      fetchVelocity: async () => {
        try {
          const data = await analyticsApi.getVelocity();
          set({ velocityData: data });
        } catch {
          // velocity is non-critical, fail silently
        }
      },
    }),
    { name: "analytics-store" },
  ),
);

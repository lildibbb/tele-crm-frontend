import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";
import { analyticsApi } from "@/lib/api/analytics";
import type { AnalyticsSummaryParams, WeeklyStatsParams, MonthlyStatsParams, RagStatsParams } from "@/lib/schemas/analytics.schema";
import { useAuthStore } from "@/store/authStore";

export function useAnalyticsSummary(params?: AnalyticsSummaryParams) {
  return useQuery({
    queryKey: queryKeys.analytics.summary((params ?? {}) as Record<string, unknown>),
    queryFn: async () => {
      const { user } = useAuthStore.getState();
      const timezone =
        params?.timezone ||
        user?.timezone ||
        Intl.DateTimeFormat().resolvedOptions().timeZone ||
        "UTC";
      const res = await analyticsApi.getSummary({ ...params, timezone } as AnalyticsSummaryParams);
      return res.data.data;
    },
  });
}

export function useAnalyticsDashboard() {
  return useQuery({
    queryKey: queryKeys.analytics.dashboard(),
    queryFn: async () => {
      const res = await analyticsApi.getDashboard();
      return res.data.data;
    },
  });
}

export function useAnalyticsToday() {
  return useQuery({
    queryKey: queryKeys.analytics.today(),
    queryFn: async () => {
      const res = await analyticsApi.getToday();
      return res.data.data;
    },
  });
}

export function useAnalyticsWeekly(params?: WeeklyStatsParams) {
  return useQuery({
    queryKey: queryKeys.analytics.weekly((params ?? {}) as Record<string, unknown>),
    queryFn: async () => {
      const res = await analyticsApi.getWeekly(params);
      return res.data.data;
    },
  });
}

export function useAnalyticsMonthly(params?: MonthlyStatsParams) {
  return useQuery({
    queryKey: queryKeys.analytics.monthly((params ?? {}) as Record<string, unknown>),
    queryFn: async () => {
      const res = await analyticsApi.getMonthly(params);
      return res.data.data;
    },
  });
}

export function useAnalyticsVelocity() {
  return useQuery({
    queryKey: queryKeys.analytics.velocity(),
    queryFn: () => analyticsApi.getVelocity(),
  });
}

export function useRagStats(params?: RagStatsParams) {
  return useQuery({
    queryKey: queryKeys.analytics.ragStats((params ?? {}) as Record<string, unknown>),
    queryFn: async () => {
      const res = await analyticsApi.getRagStats(params);
      return res.data.data;
    },
  });
}

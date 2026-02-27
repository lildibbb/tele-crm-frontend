import { apiClient } from "./apiClient";
import type {
  AnalyticsDashboard,
  AnalyticsSummary,
  DailyStats,
  WeeklyStats,
  WeeklyStatsParams,
  MonthlyStats,
  MonthlyStatsParams,
  AnalyticsSummaryParams,
  RagStats,
  RagStatsParams,
} from "@/lib/schemas/analytics.schema";
import type { ApiResponse } from "@/lib/schemas/common";

export interface VelocityDistribution {
  p25: number | null;
  p50: number | null;
  p75: number | null;
  count: number;
}
export interface VelocityData {
  newToRegistered: VelocityDistribution;
  newToConfirmed:  VelocityDistribution;
  registeredToConfirmed: { p50: number | null; count: number };
}

export const analyticsApi = {
  /**
   * Returns consolidated KPI cards, funnel metrics, and trend series data.
   * This is the main analytics endpoint.
   */
  getSummary: (params?: AnalyticsSummaryParams) =>
    apiClient.get<ApiResponse<AnalyticsSummary>>("/analytics/summary", {
      params,
    }),

  /**
   * Returns lead funnel counts. Deprecated - use getSummary instead.
   */
  getDashboard: () =>
    apiClient.get<ApiResponse<AnalyticsDashboard>>("/analytics/dashboard"),

  /**
   * Returns today's aggregated stats. Returns null if daily stats haven't been computed yet.
   */
  getToday: () =>
    apiClient.get<ApiResponse<DailyStats | null>>("/analytics/stats"),

  /**
   * Returns new leads, registered leads, and deposits grouped by ISO week.
   */
  getWeekly: (params?: WeeklyStatsParams) =>
    apiClient.get<ApiResponse<WeeklyStats[]>>("/analytics/weekly", { params }),

  /**
   * Returns RAG quality stats - hit rate, avg chunks, zero-hit count, token usage.
   * Requires SUPERADMIN role.
   */
  getRagStats: (params?: RagStatsParams) =>
    apiClient.get<ApiResponse<RagStats>>("/analytics/rag-stats", { params }),

  /**
   * Returns new leads, registered leads, and deposits grouped by month.
   */
  getMonthly: (params?: MonthlyStatsParams) =>
    apiClient.get<ApiResponse<MonthlyStats[]>>("/analytics/monthly", {
      params,
    }),

  getVelocity: async () => {
    const res = await apiClient.get<ApiResponse<VelocityData>>('/analytics/velocity');
    return res.data.data;
  },
};

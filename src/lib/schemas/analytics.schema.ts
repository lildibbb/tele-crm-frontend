import { z } from "zod/v4";

// ── Response Schemas ─────────────────────────────────────────────────────────

export const DailyStatsSchema = z.object({
  id: z.string(),
  date: z.string().datetime(),
  newLeads: z.number(),
  registeredLeads: z.number(),
  depositReported: z.number(),
  conversions: z.number(),
  tokensUsed: z.number(),
  totalLeads: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type DailyStats = z.infer<typeof DailyStatsSchema>;

export const AnalyticsDashboardSchema = z.object({
  totalLeads: z.number(),
  newLeads: z.number(),
  registeredLeads: z.number(),
  depositReported: z.number(),
  depositConfirmed: z.number(),
  recentStats: z.array(DailyStatsSchema),
});

export type AnalyticsDashboard = z.infer<typeof AnalyticsDashboardSchema>;

export const WeeklyStatsSchema = z.object({
  weekStart: z.string(),
  newLeads: z.number(),
  registeredLeads: z.number(),
  depositReported: z.number(),
  depositConfirmed: z.number(),
});

export type WeeklyStats = z.infer<typeof WeeklyStatsSchema>;

export const MonthlyStatsSchema = z.object({
  monthStart: z.string(),
  newLeads: z.number(),
  registeredLeads: z.number(),
  depositReported: z.number(),
  depositConfirmed: z.number(),
});

export type MonthlyStats = z.infer<typeof MonthlyStatsSchema>;

// ── New Analytics Summary Schemas ────────────────────────────────────────────

export const KpiStatSchema = z.object({
  current: z.number(),
  previous: z.number(),
  changePercentage: z.number(),
  trend: z.enum(["up", "down", "neutral"]),
});

export type KpiStat = z.infer<typeof KpiStatSchema>;

export const AnalyticsKpiSchema = z.object({
  totalLeads: KpiStatSchema,
  registeredAccounts: KpiStatSchema,
  depositingClients: KpiStatSchema,
  pendingVerifications: KpiStatSchema,
});

export type AnalyticsKpi = z.infer<typeof AnalyticsKpiSchema>;

export const FunnelConversionRatesSchema = z.object({
  newToRegistered: z.number(),
  registeredToReported: z.number(),
  reportedToConfirmed: z.number(),
  overall: z.number(),
});

export type FunnelConversionRates = z.infer<typeof FunnelConversionRatesSchema>;

export const AnalyticsFunnelSchema = z.object({
  new: z.number(),
  registered: z.number(),
  depositReported: z.number(),
  depositConfirmed: z.number(),
  conversionRates: FunnelConversionRatesSchema,
});

export type AnalyticsFunnel = z.infer<typeof AnalyticsFunnelSchema>;

export const TrendSeriesDataSchema = z.object({
  date: z.string(),
  newLeads: z.number(),
  registered: z.number(),
  confirmed: z.number(),
});

export type TrendSeriesData = z.infer<typeof TrendSeriesDataSchema>;

export const AnalyticsSummarySchema = z.object({
  kpi: AnalyticsKpiSchema,
  funnel: AnalyticsFunnelSchema,
  trendSeries: z.array(TrendSeriesDataSchema),
});

export type AnalyticsSummary = z.infer<typeof AnalyticsSummarySchema>;

// RAG Stats Response — field names match analytics.service.ts return type
export const RagStatsSchema = z.object({
  totalRequests: z.number(),
  ragHitCount: z.number(),
  ragHitRate: z.number(),
  zeroHitCount: z.number(),
  avgChunksPerRequest: z.number(),
  totalPromptTokens: z.number(),
  totalCompletionTokens: z.number(),
});

export type RagStats = z.infer<typeof RagStatsSchema>;

// ── Query Params ──────────────────────────────────────────────────────────────

export const WeeklyStatsParamsSchema = z.object({
  weeks: z.number().int().min(1).max(52).optional(),
});

export type WeeklyStatsParams = z.infer<typeof WeeklyStatsParamsSchema>;

export const MonthlyStatsParamsSchema = z.object({
  months: z.number().int().min(1).max(60).optional(),
});

export type MonthlyStatsParams = z.infer<typeof MonthlyStatsParamsSchema>;

// ── Analytics Summary Params ─────────────────────────────────────────────────

export const AnalyticsSummaryParamsSchema = z.object({
  timeframe: z
    .enum([
      "today",
      "yesterday",
      "this_week",
      "this_month",
      "last_30_days",
      "last_90_days",
      "all_time",
      "custom",
    ])
    .optional()
    .default("last_30_days"),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  timezone: z.string().optional(),
});

export type AnalyticsSummaryParams = z.infer<typeof AnalyticsSummaryParamsSchema>;

export const RagStatsParamsSchema = z.object({
  limit: z.number().int().min(1).max(5000).optional().default(500),
});

export type RagStatsParams = z.infer<typeof RagStatsParamsSchema>;

"use client";

import { useState, useRef, useMemo } from "react";
import { lazy, Suspense } from "react";
import { useAuthStore } from "@/store/authStore";
import { useAnalyticsSummary } from "@/queries/useAnalyticsQuery";
import { useLeadsList } from "@/queries/useLeadsQuery";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/queries/queryKeys";
import { useDashboardLayoutStore } from "@/store/dashboardLayoutStore";
import { UserRole } from "@/types/enums";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { SuperadminHome, OwnerHome, StaffHome } from "@/components/mobile";
import { Users, Wallet, TrendUp, ChatText } from "@phosphor-icons/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { useT, K } from "@/i18n";

// ── Extracted components ────────────────────────────────────────
import {
  HeroBanner,
  PERIODS,
  type PeriodValue,
} from "@/components/dashboard/HeroBanner";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { ActionStrip } from "@/components/dashboard/ActionStrip";
import type { ActivityRow } from "@/components/dashboard/LiveActivityFeed";

import { WidgetErrorBoundary } from "@/components/dashboard/WidgetErrorBoundary";

// ── Lazy-loaded below-fold widgets ─────────────────────────────
const FunnelOverview = lazy(() =>
  import("@/components/dashboard/FunnelOverview").then((m) => ({
    default: m.FunnelOverview,
  })),
);
const LiveActivityFeed = lazy(() =>
  import("@/components/dashboard/LiveActivityFeed").then((m) => ({
    default: m.LiveActivityFeed,
  })),
);
const TrendCharts = lazy(() =>
  import("@/components/dashboard/TrendCharts").then((m) => ({
    default: m.TrendCharts,
  })),
);

// ── Lazy fallback ──────────────────────────────────────────────
function ChartSkeleton() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-7 gap-3 md:gap-4">
      <Skeleton className="xl:col-span-4 h-[320px] rounded-[20px]" />
      <Skeleton className="xl:col-span-3 h-[320px] rounded-[20px]" />
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────
export default function DashboardPage() {
  const t = useT();
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<PeriodValue>("last_30_days");
  const containerRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore((s) => s.user);
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  const { data: summary, isLoading, error } = useAnalyticsSummary({ timeframe: period });
  const { data: leadsResult } = useLeadsList({ skip: 0, take: 20 });
  const leads = leadsResult?.data ?? [];
  const widgets = useDashboardLayoutStore((s) => s.widgets);
  const visibleWidgets = [...widgets]
    .sort((a, b) => a.order - b.order)
    .filter((w) => w.visible);

  // ── Derived data ─────────────────────────────────────────────
  const funnelDonut = useMemo(() => {
    if (!summary?.funnel) return [];
    return [
      {
        name: "Confirmed",
        value: summary.funnel.depositConfirmed,
        color: "#22D3A0",
      },
      {
        name: "Submitted",
        value: summary.funnel.formSubmitted,
        color: "#F59E0B",
      },
      { name: "New", value: summary.funnel.new, color: "#C4232D" },
    ];
  }, [summary]);

  const trendData = useMemo(() => {
    if (!summary?.trendSeries) return [];
    return summary.trendSeries.map((s) => ({
      date: s.date.includes("T")
        ? new Date(s.date).toLocaleTimeString("en-US", {
            hour: "numeric",
            hour12: true,
          })
        : new Date(s.date).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
          }),
      Leads: s.newLeads,
      Confirmed: s.confirmed,
    }));
  }, [summary]);

  const depositsData = useMemo(() => {
    if (!summary?.trendSeries) return [];
    return summary.trendSeries.map((s) => ({
      label: s.date.includes("T")
        ? new Date(s.date).toLocaleTimeString("en-US", {
            hour: "numeric",
            hour12: true,
          })
        : new Date(s.date).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
          }),
      Deposits: s.confirmed,
    }));
  }, [summary]);

  const { avgDeposits, bestDeposits } = useMemo(() => {
    if (!depositsData.length) return { avgDeposits: 0, bestDeposits: 0 };
    const max = Math.max(...depositsData.map((d) => d.Deposits));
    const sum = depositsData.reduce((acc, d) => acc + d.Deposits, 0);
    return {
      avgDeposits: Math.round(sum / depositsData.length),
      bestDeposits: max,
    };
  }, [depositsData]);

  // Fixed: use `leads` as dependency (not `leads.length`) so data actually updates
  const recentActivity: ActivityRow[] = useMemo(() => {
    return leads
      .slice()
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
      .slice(0, 5)
      .map((l) => ({
        id: l.id,
        name: l.displayName ?? l.username ?? String(l.telegramUserId),
        subtitle: l.phoneNumber
          ? l.phoneNumber
          : l.username
            ? `@${l.username}`
            : `#${String(l.telegramUserId).slice(0, 10)}`,
        status: l.status as ActivityRow["status"],
        amount: l.depositBalance
          ? `$${Number(l.depositBalance).toLocaleString()}`
          : undefined,
        time: new Date(l.updatedAt).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
        }),
      }));
  }, [leads]);

  const totalLeads = summary?.kpi.totalLeads.current ?? 0;
  const pendingVerifications = summary?.kpi.formSubmissions.current ?? 0;
  const handoverLeadsCount = useMemo(
    () => leads.filter((l) => l.handoverMode).length,
    [leads],
  );

  const periodLabel = (v: PeriodValue): string => {
    const map: Record<PeriodValue, string> = {
      yesterday: t(K.common.period.yesterday),
      today: t(K.common.period.today),
      this_week: t(K.common.period.weekly),
      this_month: t(K.common.period.monthly),
      last_30_days: t(K.common.period.last30Days),
      last_90_days: t(K.common.period.last90Days),
      all_time: t(K.common.period.allTime),
    };
    return map[v];
  };

  const chartPeriodLabel =
    period === "today"
      ? "Daily"
      : period === "this_week"
        ? "Weekly"
        : "Last 30 Days";

  // ── Handlers ─────────────────────────────────────────────────
  const handleRefresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.all }),
    ]).finally(() => {
      setLastRefresh(new Date());
      setRefreshing(false);
    });
  };

  // ── Mobile: role-based home screens ──
  if (isMobile) {
    if (user?.role === UserRole.SUPERADMIN) return <SuperadminHome />;
    if (user?.role === UserRole.STAFF) return <StaffHome />;
    return <OwnerHome />;
  }

  // ── Desktop: composable dashboard ──
  return (
    <TooltipProvider>
      <div ref={containerRef} className="relative">
        {/* ── Cinematic Hero Banner ─────────────────────── */}
        <HeroBanner
          period={period}
          onPeriodChange={setPeriod}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          lastRefresh={lastRefresh}
          periodLabel={periodLabel}
          t={t}
        />

        <div className="space-y-4 md:space-y-5">
          {visibleWidgets.map((widget) => {
            if (widget.id === "kpi-cards")
              return (
                <WidgetErrorBoundary key="kpi-cards" widgetName="KPI Cards">
                  <KpiCards
                    data={summary?.kpi ?? null}
                    isLoading={isLoading}
                    icons={{
                      total: Users,
                      contacted: ChatText,
                      depositors: Wallet,
                      pending: TrendUp,
                    }}
                    labels={{
                      total: t("dashboard.totalLeads"),
                      contacted: t(K.dashboard.contactedLeads),
                      depositors: t("analytics.totalDepositors"),
                      pending: t("dashboard.pendingVerifications"),
                    }}
                    viewAllLabel={t("dashboard.viewAllLeads")}
                    viewAllHref="/leads"
                  />
                </WidgetErrorBoundary>
              );

            if (widget.id === "funnel-activity")
              return (
                <WidgetErrorBoundary key="funnel-activity" widgetName="Funnel & Activity">
                  <Suspense fallback={<ChartSkeleton />}>
                    <div className="page-section grid grid-cols-1 xl:grid-cols-7 gap-3 md:gap-4">
                      <FunnelOverview
                        data={funnelDonut}
                        totalLeads={totalLeads}
                        period={period}
                        labels={{
                          title: t("dashboard.funnelOverview"),
                          subtitle: t("dashboard.funnelSubtitle"),
                          totalLeads: t("dashboard.totalLeads"),
                          periodLabel: chartPeriodLabel,
                        }}
                      />
                      <LiveActivityFeed
                        rows={recentActivity}
                        labels={{
                          title: t("dashboard.liveActivity"),
                          viewAll: t("dashboard.viewAllLeads"),
                        }}
                        t={t}
                      />
                    </div>
                  </Suspense>
                </WidgetErrorBoundary>
              );

            if (widget.id === "action-strip")
              return (
                <WidgetErrorBoundary key="action-strip" widgetName="Action Strip">
                  <ActionStrip
                    pendingVerifications={pendingVerifications}
                    handoverLeadsCount={handoverLeadsCount}
                    labels={{
                      pendingTitle: t("dashboard.pendingVerifications"),
                      awaitingReview: t("dashboard.awaitingReview"),
                      review: t("common.review"),
                      handoverTitle: t("dashboard.handoverLeads"),
                      manualReplies: t("dashboard.manualReplies"),
                      view: t("common.view"),
                    }}
                  />
                </WidgetErrorBoundary>
              );

            if (widget.id === "trend-charts")
              return (
                <WidgetErrorBoundary key="trend-charts" widgetName="Trend Charts">
                  <Suspense
                    fallback={
                      <div className="grid grid-cols-1 xl:grid-cols-5 gap-3 md:gap-4">
                        <Skeleton className="xl:col-span-3 h-[280px] rounded-[20px]" />
                        <Skeleton className="xl:col-span-2 h-[280px] rounded-[20px]" />
                      </div>
                    }
                  >
                    <TrendCharts
                      trendData={trendData}
                      depositsData={depositsData}
                      avgDeposits={avgDeposits}
                      bestDeposits={bestDeposits}
                      periodLabel={chartPeriodLabel}
                      labels={{
                        acquisitionTitle: t("dashboard.acquisitionTrend"),
                        trendSubtitle: t("dashboard.trendSubtitle"),
                      }}
                    />
                  </Suspense>
                </WidgetErrorBoundary>
              );

            return null;
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}

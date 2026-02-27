"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { MobileAnalytics } from "@/components/mobile";
import { useAnalyticsStore } from "@/store/analyticsStore";
import { useAuthStore } from "@/store/authStore";
import {
  TrendUp,
  Users,
  Wallet,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  ChartBar,
  Pulse,
  CalendarBlank,
  ArrowsLeftRight,
} from "@phosphor-icons/react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useT, K } from "@/i18n";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalyticsSummaryParams } from "@/lib/schemas/analytics.schema";
import { analyticsApi } from "@/lib/api/analytics";

gsap.registerPlugin(useGSAP);

// ── Timeframe constants ──────────────────────────────────────────
type Timeframe = NonNullable<AnalyticsSummaryParams["timeframe"]>;

const TIMEFRAMES: Timeframe[] = [
  "today",
  "yesterday",
  "this_week",
  "this_month",
  "last_30_days",
  "last_90_days",
  "all_time",
];

const TIMEFRAME_LABELS: Record<Timeframe, string> = {
  today: "Today",
  yesterday: "Yesterday",
  this_week: "Weekly",
  this_month: "Monthly",
  last_30_days: "30 Days",
  last_90_days: "90 Days",
  all_time: "All Time",
  custom: "Custom",
};

/**
 * Format a trendSeries date string for x-axis based on granularity.
 * Parses the string directly to avoid locale/timezone issues.
 *
 * API formats:
 *   hourly  → "2026-02-23T14:00"
 *   daily   → "2026-02-23T00:00" or "2026-02-23"
 *   monthly → "2026-02" or "2026-02-01"
 */
function formatXLabel(dateStr: string, timeframe: Timeframe): string {
  switch (timeframe) {
    case "today":
    case "yesterday": {
      // Extract "HH:MM" directly from the string — avoids any Date/timezone issues
      const tIdx = dateStr.indexOf("T");
      if (tIdx !== -1) return dateStr.slice(tIdx + 1, tIdx + 6); // e.g. "14:00"
      return dateStr;
    }
    case "this_week":
    case "last_30_days": {
      // Use noon to dodge timezone boundary issues when creating Date
      const d = new Date(dateStr.slice(0, 10) + "T12:00:00");
      return isNaN(d.getTime())
        ? dateStr.slice(0, 10)
        : d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric" });
    }
    case "this_month":
    case "last_90_days": {
      const d = new Date(dateStr.slice(0, 10) + "T12:00:00");
      return isNaN(d.getTime())
        ? dateStr.slice(0, 10)
        : d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    }
    case "all_time":
    default: {
      // "2026-02" → mid-month to avoid rollover
      const d = new Date(
        (dateStr.slice(0, 7) || dateStr.slice(0, 10)) + "-15T12:00:00",
      );
      return isNaN(d.getTime())
        ? dateStr.slice(0, 7)
        : d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
    }
  }
}

/** Dynamic XAxis interval so hourly charts don't crowd */
function xAxisInterval(dataLen: number): number | "preserveStartEnd" {
  if (dataLen <= 8) return 0; // show every tick
  if (dataLen <= 24) return Math.ceil(dataLen / 6) - 1; // ~6 ticks for 24-hour data
  if (dataLen <= 31) return 4; // every 5th day
  return "preserveStartEnd";
}

// Keep for type-compatibility with legacy data shapes — not used
const _unused: undefined = undefined;
void _unused;

// ── Funnel fill colours ──────────────────────────────────────────
const FUNNEL_FILLS = {
  new: "#C4232D",
  registered: "#a855f7",
  depositReported: "#F59E0B",
  depositConfirmed: "#22d3a0",
};

// ── Tooltip components ───────────────────────────────────────────
function AreaTip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--elevated)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 12,
        padding: "10px 14px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      }}
    >
      <p
        style={{
          fontSize: 11,
          color: "var(--text-muted)",
          marginBottom: 8,
          fontFamily: "inherit",
        }}
      >
        {label}
      </p>
      {payload.map((e: any) => (
        <div
          key={e.name}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 3,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: e.stroke ?? e.fill,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: 12,
              color: "var(--text-secondary)",
              fontFamily: "inherit",
            }}
          >
            {e.name}
          </span>
          <span
            style={{
              fontSize: 12,
              color: "var(--text-primary)",
              fontFamily: "var(--font-jetbrains-mono, monospace)",
              marginLeft: "auto",
              paddingLeft: 12,
            }}
          >
            {e.name === "Amount" ? "$" + e.value.toLocaleString() : e.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function BarTip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--elevated)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 12,
        padding: "10px 14px",
      }}
    >
      <p
        style={{
          fontSize: 11,
          color: "var(--text-muted)",
          marginBottom: 4,
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: 14,
          color: "var(--color-gold)",
          fontFamily: "var(--font-jetbrains-mono, monospace)",
        }}
      >
        {payload[0].value}{" "}
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>leads</span>
      </p>
    </div>
  );
}

// ── InView chart wrapper (GSAP) ─────────────────────────────────
function ChartInView({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (!ref.current) return;
      gsap.from(ref.current, {
        opacity: 0,
        y: 16,
        duration: 0.45,
        ease: "power2.out",
      });
    },
    { scope: ref, dependencies: [] },
  );
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

// ── Compact stat chip ────────────────────────────────────────────
function StatChipBadge({
  label,
  value,
  up,
}: {
  label: string;
  value: string;
  up: boolean;
}) {
  return (
    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-elevated">
      <span
        className="flex items-center gap-0.5 text-[11px] font-semibold"
        style={{ color: up ? "#22d3a0" : "#f87171" }}
      >
        {up ? (
          <ArrowUpRight size={13} weight="regular" />
        ) : (
          <ArrowDownRight size={13} weight="regular" />
        )}
        {value}
      </span>
      <span className="text-[11px] font-sans text-text-muted">{label}</span>
    </div>
  );
}

// ── KPI stat card ────────────────────────────────────────────────
function KpiCard({
  label,
  value,
  change,
  up,
  icon: Icon,
  iconColor,
}: {
  label: string;
  value: string;
  change: string;
  up: boolean;
  icon: React.ElementType;
  iconColor: string;
}) {
  return (
    <div className="kpi-stat-card bg-elevated rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <Icon size={22} weight="duotone" />

        <span
          className={`flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            up ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
          }`}
        >
          {up ? (
            <ArrowUpRight size={12} weight="regular" />
          ) : (
            <ArrowDownRight size={12} weight="regular" />
          )}
          {change}
        </span>
      </div>
      <p className="text-2xl font-bold data-mono text-text-primary leading-none mb-1.5 tracking-tight">
        {value}
      </p>
      <p className="text-[11px] font-sans font-semibold text-text-secondary uppercase tracking-wider">
        {label}
      </p>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const t = useT();
  const [timeframe, setTimeframe] = useState<Timeframe>("this_month");
  const [contentVisible, setContentVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const { summary, isLoading, fetchSummary, velocityData, fetchVelocity } = useAnalyticsStore();
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === "SUPERADMIN";
  const [ragStats, setRagStats] = useState<import("@/lib/schemas/analytics.schema").RagStats | null>(null);
  const [ragLoading, setRagLoading] = useState(false);

  // Fetch on mount and whenever timeframe changes
  useEffect(() => {
    fetchSummary({ timeframe });
    fetchVelocity();
  }, [fetchSummary, timeframe, fetchVelocity]);

  // Fetch RAG stats — SUPERADMIN only, no call for other roles
  useEffect(() => {
    if (!isSuperAdmin) return;
    setRagLoading(true);
    analyticsApi.getRagStats()
      .then((res) => {
        const d = (res.data as unknown as { data: import("@/lib/schemas/analytics.schema").RagStats }).data;
        setRagStats(d ?? null);
      })
      .catch(() => { /* ignore */ })
      .finally(() => setRagLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuperAdmin]);

  // ── Derived data from summary API ──────────────────────────────
  const funnelData = useMemo(() => {
    if (!summary) return [];
    return [
      { name: "New", value: summary.funnel.new, fill: FUNNEL_FILLS.new },
      {
        name: "Registered",
        value: summary.funnel.registered,
        fill: FUNNEL_FILLS.registered,
      },
      {
        name: "Dep. Reported",
        value: summary.funnel.depositReported,
        fill: FUNNEL_FILLS.depositReported,
      },
      {
        name: "Confirmed",
        value: summary.funnel.depositConfirmed,
        fill: FUNNEL_FILLS.depositConfirmed,
      },
    ].filter((f) => f.value > 0);
  }, [summary]);

  // trendSeries → area chart data with formatted x-axis labels
  const trendData = useMemo(() => {
    if (!summary?.trendSeries) return [];
    return summary.trendSeries.map((pt) => ({
      date: formatXLabel(pt.date, timeframe),
      "New Leads": pt.newLeads,
      Registered: pt.registered,
      Confirmed: pt.confirmed,
    }));
  }, [summary, timeframe]);

  const kpi = summary?.kpi;
  const totalLeads = kpi?.totalLeads.current ?? 0;
  const depositConfirmed = kpi?.depositingClients.current ?? 0;
  const conversionRate = kpi?.totalLeads.current
    ? ((depositConfirmed / kpi.totalLeads.current) * 100).toFixed(1) + "%"
    : "—";

  useGSAP(
    () => {
      gsap.from(".kpi-stat-card", {
        opacity: 0,
        y: 18,
        stagger: 0.08,
        duration: 0.45,
        ease: "power2.out",
      });
      gsap.from(".funnel-bar", {
        width: 0,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.07,
      });
    },
    { scope: containerRef, dependencies: [timeframe] },
  );

  const handleTimeframeChange = (tf: Timeframe) => {
    if (tf === timeframe) return;
    setContentVisible(false);
    setTimeout(() => {
      setTimeframe(tf);
      setContentVisible(true);
    }, 250);
  };

  if (isMobile) return <MobileAnalytics />;

  return (
    <div ref={containerRef} className="space-y-5 animate-in-up">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {t("analytics.title")}
          </h1>
          <p className="text-text-secondary text-sm font-sans mt-1">
            {t("analytics.subtitle")}
          </p>

          {/* Compact stat chips */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <div className="flex items-center gap-1 text-[11px] text-text-muted">
              <CalendarBlank size={13} weight="regular" />
              <span>{TIMEFRAME_LABELS[timeframe]}</span>
            </div>
            <span className="w-px h-3.5 bg-border-subtle" />
            <StatChipBadge
              label={t("analytics.conversionRate")}
              value={conversionRate}
              up={depositConfirmed > 0}
            />
            <StatChipBadge
              label={t("analytics.totalLeads")}
              value={totalLeads.toString()}
              up={totalLeads > 0}
            />
          </div>
        </div>

        {/* Timeframe tabs – pill style, scrollable on small screens */}
        <div
          className="bg-elevated p-1 flex items-center gap-0.5 rounded-xl self-start sm:self-auto shrink-0 overflow-x-auto scrollbar-none"
          role="tablist"
          aria-label="Time range"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              role="tab"
              aria-selected={timeframe === tf}
              onClick={() => handleTimeframeChange(tf)}
              className={
                "px-3.5 py-1.5 rounded-lg text-xs font-sans font-medium transition-all cursor-pointer whitespace-nowrap flex-shrink-0 " +
                (timeframe === tf
                  ? "bg-crimson text-white"
                  : "text-text-secondary hover:text-text-primary")
              }
            >
              {TIMEFRAME_LABELS[tf]}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {isLoading && !summary ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[120px] rounded-2xl" />
          ))
        ) : (
          <>
            <KpiCard
              label={t("analytics.totalLeads")}
              value={(kpi?.totalLeads.current ?? 0).toLocaleString()}
              change={`${kpi?.totalLeads.changePercentage ?? 0}%`}
              up={(kpi?.totalLeads.trend ?? "up") === "up"}
              icon={Users}
              iconColor="#60a5fa"
            />
            <KpiCard
              label={t("analytics.totalDepositors")}
              value={(kpi?.depositingClients.current ?? 0).toLocaleString()}
              change={`${kpi?.depositingClients.changePercentage ?? 0}%`}
              up={(kpi?.depositingClients.trend ?? "up") === "up"}
              icon={Wallet}
              iconColor="#22d3a0"
            />
            <KpiCard
              label={t("analytics.pendingVerification")}
              value={(kpi?.pendingVerifications.current ?? 0).toLocaleString()}
              change={`${kpi?.pendingVerifications.changePercentage ?? 0}%`}
              up={(kpi?.pendingVerifications.trend ?? "up") === "up"}
              icon={TrendUp}
              iconColor="#E8B94F"
            />
            <KpiCard
              label={t("analytics.conversionRate")}
              value={conversionRate}
              change={`${kpi?.registeredAccounts.changePercentage ?? 0}%`}
              up={(kpi?.registeredAccounts.trend ?? "up") === "up"}
              icon={Target}
              iconColor="#C4232D"
            />
          </>
        )}
      </div>

      {/* ── Charts ── */}
      <div
        className="space-y-4"
        style={{
          opacity: contentVisible ? 1 : 0,
          transition: "opacity 0.25s ease",
        }}
      >
        {/* Row 1: Trend chart + Conversion Funnel */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          {/* Lead trend area chart */}
          <ChartInView className="xl:col-span-3 bg-elevated rounded-xl p-5">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-sans font-semibold text-[15px] text-text-primary">
                {t("analytics.charts.depositTrend")}
              </h2>
              <span className="flex items-center gap-1.5 text-xs text-text-muted">
                <Pulse size={14} weight="regular" />
                {TIMEFRAME_LABELS[timeframe]}
              </span>
            </div>
            <p className="text-xs font-sans mb-5 text-text-muted">
              {t("analytics.deposit.desc")}
            </p>
            <ResponsiveContainer width="100%" height={168}>
              <AreaChart
                data={trendData}
                margin={{ top: 0, right: 0, left: -22, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="gNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gReg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.38} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gDep" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3a0" stopOpacity={0.38} />
                    <stop offset="95%" stopColor="#22d3a0" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{
                    fontSize: 11,
                    fill: "var(--text-muted)",
                    fontFamily: "inherit",
                  }}
                  axisLine={false}
                  tickLine={false}
                  interval={xAxisInterval(trendData.length)}
                />
                <YAxis hide />
                <Tooltip content={<AreaTip />} offset={12} isAnimationActive={false} wrapperStyle={{ pointerEvents: "none" }} />
                <Area
                  type="monotone"
                  dataKey="New Leads"
                  stroke="#60a5fa"
                  strokeWidth={2}
                  fill="url(#gNew)"
                />
                <Area
                  type="monotone"
                  dataKey="Registered"
                  stroke="#a855f7"
                  strokeWidth={2}
                  fill="url(#gReg)"
                />
                <Area
                  type="monotone"
                  dataKey="Confirmed"
                  stroke="#22d3a0"
                  strokeWidth={2}
                  fill="url(#gDep)"
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-5 mt-4 pt-3.5 border-t border-border-subtle">
              {(
                [
                  ["#60a5fa", "New Leads"],
                  ["#a855f7", "Registered"],
                  ["#22d3a0", "Confirmed"],
                ] as const
              ).map(([color, label]) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: color }}
                  />
                  <span className="text-[11px] text-text-secondary">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </ChartInView>

          {/* Conversion funnel */}
          <ChartInView className="xl:col-span-2 bg-elevated rounded-xl p-5">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-sans font-semibold text-[15px] text-text-primary">
                {t("analytics.charts.funnelBreakdown")}
              </h2>

              <Target size={16} weight="duotone" />
            </div>
            <p className="text-xs font-sans text-text-secondary mb-5">
              {t("analytics.funnel.desc")}
            </p>
            <div className="space-y-2">
              {funnelData.map((step, i) => {
                const pct =
                  funnelData[0]?.value > 0
                    ? Math.round((step.value / funnelData[0].value) * 100)
                    : 0;
                const dropPct =
                  i > 0 && funnelData[i - 1].value > 0
                    ? Math.round(
                        ((funnelData[i - 1].value - step.value) /
                          funnelData[i - 1].value) *
                          100,
                      )
                    : null;
                return (
                  <div key={step.name}>
                    {dropPct !== null && (
                      <div className="flex items-center justify-center py-0.5">
                        <span className="text-[10px] font-sans text-text-muted flex items-center gap-0.5">
                          <ArrowsLeftRight
                            size={10}
                            weight="regular"
                            className="rotate-90"
                          />
                          {dropPct}% drop-off
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[12px] font-sans text-text-secondary">
                            {step.name}
                          </span>
                          <span className="data-mono text-[12px]">
                            {step.value.toLocaleString()}
                          </span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden bg-elevated">
                          <div
                            className="funnel-bar h-full rounded-full"
                            style={{ width: `${pct}%`, background: step.fill }}
                          />
                        </div>
                      </div>
                      <span
                        className="text-[11px] font-mono w-9 text-right"
                        style={{ color: step.fill }}
                      >
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Conversion rates from API */}
            {summary?.funnel.conversionRates && (
              <div className="mt-4 pt-3 border-t border-border-subtle space-y-1">
                {[
                  [
                    "New → Registered",
                    summary.funnel.conversionRates.newToRegistered,
                  ],
                  [
                    "Reg → Reported",
                    summary.funnel.conversionRates.registeredToReported,
                  ],
                  [
                    "Reported → Confirmed",
                    summary.funnel.conversionRates.reportedToConfirmed,
                  ],
                ].map(([label, val]) => (
                  <div key={label as string} className="flex justify-between">
                    <span className="text-[10px] text-text-muted">{label}</span>
                    <span className="text-[10px] font-mono text-text-secondary">
                      {(val as number).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </ChartInView>
        </div>

        {/* Row 2: Lead Sources (funnel bar) + Conversion rates chart */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Lead source bar chart */}
          <ChartInView className="bg-elevated rounded-xl p-5">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-sans font-semibold text-[15px] text-text-primary">
                {t("analytics.charts.leadSources")}
              </h2>

              <ChartBar size={22} weight="duotone" />
            </div>
            <p className="text-xs font-sans mb-5 text-text-muted">
              {t("analytics.source.title")} — {TIMEFRAME_LABELS[timeframe]}
            </p>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart
                data={funnelData}
                layout="vertical"
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                barSize={14}
              >
                <defs>
                  <linearGradient id="gSrc" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#C4232D" stopOpacity={0.9} />
                    <stop
                      offset="100%"
                      stopColor="#C4232D"
                      stopOpacity={0.35}
                    />
                  </linearGradient>
                </defs>
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={130}
                  tick={{
                    fontSize: 11,
                    fill: "var(--text-secondary)",
                    fontFamily: "inherit",
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<BarTip />} offset={12} isAnimationActive={false} wrapperStyle={{ pointerEvents: "none" }} />
                <Bar dataKey="value" fill="url(#gSrc)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 pt-3.5 border-t border-border-subtle">
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {funnelData.map((s) => {
                  const pct =
                    funnelData[0]?.value > 0
                      ? Math.round((s.value / funnelData[0].value) * 100)
                      : 0;
                  return (
                    <div
                      key={s.name}
                      className="flex items-center justify-between"
                    >
                      <span className="text-[11px] font-sans text-text-secondary">
                        {s.name}
                      </span>
                      <span className="text-[11px] font-mono text-text-primary">
                        {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </ChartInView>

          {/* ── Lead Velocity & Time Distribution ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Panel A — Stage Velocity */}
            <ChartInView className="bg-elevated rounded-xl p-5">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-sans font-semibold text-[15px] text-text-primary">
                  {t(K.analytics.velocity.title)}
                </h2>
                <ArrowsLeftRight size={20} weight="duotone" className="text-text-muted" />
              </div>
              <p className="text-xs font-sans mb-5 text-text-muted">{t(K.analytics.velocity.subtitle)}</p>
              {!velocityData || velocityData.newToRegistered.count < 5 ? (
                <div className="flex items-center justify-center h-24 text-text-muted text-xs font-sans">
                  {t(K.analytics.velocity.noData)}
                </div>
              ) : (
                <div className="space-y-3">
                  {[
                    { label: t(K.analytics.velocity.newToReg),     value: velocityData.newToRegistered.p50,     color: "#a855f7" },
                    { label: t(K.analytics.velocity.regToConfirm), value: velocityData.registeredToConfirmed.p50, color: "#22d3a0" },
                    { label: t(K.analytics.velocity.newToConfirm), value: velocityData.newToConfirmed.p50,      color: "#C4232D" },
                  ].map(({ label, value, color }) => {
                    const max = Math.max(
                      velocityData.newToRegistered.p50 ?? 0,
                      velocityData.registeredToConfirmed.p50 ?? 0,
                      velocityData.newToConfirmed.p50 ?? 0,
                      1,
                    );
                    const pct = value != null ? (value / max) * 100 : 0;
                    return (
                      <div key={label}>
                        <div className="flex justify-between text-[11px] font-sans mb-1">
                          <span className="text-text-muted">{label}</span>
                          <span className="data-mono" style={{ color }}>
                            {value != null ? `${value} ${t(K.analytics.velocity.days)}` : "—"}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-void/40">
                          <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, background: color, opacity: 0.8 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ChartInView>

            {/* Panel B — Time Distribution */}
            <ChartInView className="bg-elevated rounded-xl p-5">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-sans font-semibold text-[15px] text-text-primary">
                  {t(K.analytics.velocity.distribution)}
                </h2>
                <ChartBar size={20} weight="duotone" className="text-text-muted" />
              </div>
              <p className="text-xs font-sans mb-5 text-text-muted">
                p25 · median · p75
              </p>
              {!velocityData || velocityData.newToRegistered.count < 5 ? (
                <div className="flex items-center justify-center h-24 text-text-muted text-xs font-sans">
                  {t(K.analytics.velocity.noData)}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart
                    data={[
                      {
                        name: t(K.analytics.velocity.newToReg),
                        p25:  velocityData.newToRegistered.p25,
                        p50:  velocityData.newToRegistered.p50,
                        p75:  velocityData.newToRegistered.p75,
                      },
                      {
                        name: t(K.analytics.velocity.newToConfirm),
                        p25:  velocityData.newToConfirmed.p25,
                        p50:  velocityData.newToConfirmed.p50,
                        p75:  velocityData.newToConfirmed.p75,
                      },
                    ]}
                    margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                    barSize={16}
                    barGap={2}
                  >
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: "var(--text-muted)", fontFamily: "inherit" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis hide />
                    <Tooltip
                      content={({ active, payload, label }: any) =>
                        active && payload?.length ? (
                          <div style={{ background: "var(--elevated)", border: "1px solid var(--border-subtle)", borderRadius: 10, padding: "8px 12px" }}>
                            <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>{label}</p>
                            {payload.map((p: any) => (
                              <p key={p.name} style={{ fontSize: 12, color: p.fill, fontFamily: "var(--font-jetbrains-mono, monospace)" }}>
                                {p.name}: {p.value ?? "—"} {t(K.analytics.velocity.days)}
                              </p>
                            ))}
                          </div>
                        ) : null
                      }
                    />
                    <Bar dataKey="p25" name={t(K.analytics.velocity.p25)} fill="#a855f7" fillOpacity={0.4} radius={[4,4,0,0]} />
                    <Bar dataKey="p50" name={t(K.analytics.velocity.p50)} fill="#a855f7" fillOpacity={0.8} radius={[4,4,0,0]} />
                    <Bar dataKey="p75" name={t(K.analytics.velocity.p75)} fill="#a855f7" fillOpacity={0.3} radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartInView>
          </div>
        </div>
      </div>

      {/* ── RAG Quality Stats (SUPERADMIN only) ── */}
      {isSuperAdmin && (ragLoading || ragStats) && (
        <div className="mt-6 bg-elevated rounded-2xl border border-border-subtle p-5">
          <div className="flex items-center gap-2 mb-4">
            <Pulse size={16} className="text-accent" weight="duotone" />
            <h3 className="font-sans font-semibold text-sm text-text-primary">RAG Quality</h3>
            <span className="text-[10px] font-mono text-text-muted bg-card px-2 py-0.5 rounded-full border border-border-subtle ml-auto">SUPERADMIN</span>
          </div>
          {ragLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : ragStats ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Hit Rate", value: `${ragStats.ragHitRate.toFixed(1)}%`, color: "text-success" },
                { label: "Avg Chunks", value: ragStats.avgChunksPerRequest.toFixed(2), color: "text-accent" },
                { label: "Zero Hits", value: ragStats.zeroHitCount.toString(), color: "text-danger" },
                { label: "Total Requests", value: ragStats.totalRequests.toLocaleString(), color: "text-text-primary" },
                { label: "Prompt Tokens", value: ragStats.totalPromptTokens.toLocaleString(), color: "text-text-primary" },
                { label: "Completion Tokens", value: ragStats.totalCompletionTokens.toLocaleString(), color: "text-text-primary" },
                { label: "RAG Hits", value: ragStats.ragHitCount.toLocaleString(), color: "text-text-primary" },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-card rounded-xl p-3 border border-border-subtle flex flex-col gap-1">
                  <p className={`font-mono text-lg font-bold ${color}`}>{value}</p>
                  <p className="font-sans text-[10px] text-text-muted uppercase tracking-wider">{label}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

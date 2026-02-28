"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ChartBar,
  UsersThree,
  UserCheck,
  Wallet,
  TrendUp,
  TrendDown,
  Percent,
  CalendarBlank,
  ArrowRight,
} from "@phosphor-icons/react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import { useAnalyticsStore } from "@/store/analyticsStore";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface MobileAnalyticsProps {}

type DateRange = "Today" | "7D" | "30D" | "Custom";

const DATE_RANGES: DateRange[] = ["Today", "7D", "30D", "Custom"];

const TIMEFRAME_MAP: Record<DateRange, string> = {
  Today: "today",
  "7D": "this_week",
  "30D": "last_30_days",
  Custom: "custom",
};

// ── Skeleton primitives ────────────────────────────────────────────────────────
function SkeletonBox({ className }: { className?: string }) {
  return <Skeleton className={cn(className)} />;
}

function StatCardSkeleton() {
  return (
    <div className="flex flex-col gap-2.5 rounded-2xl bg-card border border-border-subtle p-4">
      <Skeleton className="h-8 w-8 rounded-lg" />
      <Skeleton className="h-7 w-20 rounded-md" />
      <Skeleton className="h-3.5 w-16 rounded" />
      <Skeleton className="h-3.5 w-14 rounded" />
    </div>
  );
}

function ChartSkeleton({ height = "h-[180px]" }: { height?: string }) {
  return <Skeleton className={cn("w-full rounded-xl", height)} />;
}

// ── Section card wrapper ───────────────────────────────────────────────────────
function SectionCard({
  title,
  children,
  badge,
  icon,
}: {
  title: string;
  children: React.ReactNode;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="mx-4 mt-4 rounded-2xl bg-card border border-border-subtle shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-sans font-semibold text-[14px] text-text-primary">
            {title}
          </span>
        </div>
        {badge}
      </div>
      <div className="px-4 pb-4">{children}</div>
    </div>
  );
}

// ── Custom Tooltip ─────────────────────────────────────────────────────────────
function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-elevated border border-border-subtle px-3 py-2.5 shadow-lg backdrop-blur-sm">
      {label && (
        <p className="font-sans text-[11px] text-text-muted mb-1.5">{label}</p>
      )}
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full shrink-0"
            style={{ background: entry.color }}
          />
          <span className="font-sans text-[11px] text-text-secondary capitalize">
            {entry.name}
          </span>
          <span className="font-mono text-[12px] text-text-primary ml-auto font-semibold">
            {entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Trend badge ────────────────────────────────────────────────────────────────
function TrendBadge({
  trend,
  percentage,
}: {
  trend: "up" | "down" | "neutral";
  percentage: number;
}) {
  const isUp = trend === "up";
  const isNeutral = trend === "neutral";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-mono text-[11px] font-semibold",
        isNeutral && "text-text-muted bg-elevated/60",
        isUp && "text-[#22D3A0] bg-[#22D3A0]/10",
        !isUp && !isNeutral && "text-[#EF4444] bg-[#EF4444]/10",
      )}
    >
      {isNeutral ? (
        <ArrowRight size={10} weight="bold" />
      ) : isUp ? (
        <TrendUp size={10} weight="bold" />
      ) : (
        <TrendDown size={10} weight="bold" />
      )}
      {Math.abs(percentage).toFixed(1)}%
    </span>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function MobileAnalytics({}: MobileAnalyticsProps) {
  const [range, setRange] = useState<DateRange>("7D");
  const chipScrollRef = useRef<HTMLDivElement>(null);
  const { summary, isLoading, fetchSummary } = useAnalyticsStore();

  const handleRangeChange = useCallback(
    (r: DateRange) => {
      setRange(r);
      if (r !== "Custom") {
        fetchSummary({ timeframe: TIMEFRAME_MAP[r] as never });
      }
    },
    [fetchSummary],
  );

  useEffect(() => {
    fetchSummary({ timeframe: TIMEFRAME_MAP[range] as never });
  }, [fetchSummary]); // eslint-disable-line react-hooks/exhaustive-deps

  const kpi = summary?.kpi;
  const trendSeries = summary?.trendSeries ?? [];

  // KPI stat card definitions
  const totalLeads = kpi?.totalLeads?.current ?? 0;
  const depositors = kpi?.depositingClients?.current ?? 0;
  const conversionRate =
    totalLeads > 0 ? ((depositors / totalLeads) * 100) : 0;

  const statCards = [
    {
      id: "leads",
      label: "Total Leads",
      value: totalLeads,
      formatted: totalLeads.toLocaleString(),
      icon: <UsersThree size={20} weight="duotone" />,
      color: "#C4232D",
      bgColor: "bg-elevated",
      iconColor: "text-text-secondary",
      trend: kpi?.totalLeads?.trend ?? "neutral",
      change: kpi?.totalLeads?.changePercentage ?? 0,
    },
    {
      id: "registered",
      label: "Registered",
      value: kpi?.registeredAccounts?.current ?? 0,
      formatted: (kpi?.registeredAccounts?.current ?? 0).toLocaleString(),
      icon: <UserCheck size={20} weight="duotone" />,
      color: "#60A5FA",
      bgColor: "bg-elevated",
      iconColor: "text-text-secondary",
      trend: kpi?.registeredAccounts?.trend ?? "neutral",
      change: kpi?.registeredAccounts?.changePercentage ?? 0,
    },
    {
      id: "deposits",
      label: "Deposits",
      value: depositors,
      formatted: depositors.toLocaleString(),
      icon: <Wallet size={20} weight="duotone" />,
      color: "#22D3A0",
      bgColor: "bg-elevated",
      iconColor: "text-text-secondary",
      trend: kpi?.depositingClients?.trend ?? "neutral",
      change: kpi?.depositingClients?.changePercentage ?? 0,
    },
    {
      id: "conversion",
      label: "Conversion",
      value: conversionRate,
      formatted: `${conversionRate.toFixed(1)}%`,
      icon: <Percent size={20} weight="duotone" />,
      color: "#E8B94F",
      bgColor: "bg-elevated",
      iconColor: "text-text-secondary",
      trend:
        conversionRate > 0
          ? kpi?.depositingClients?.trend ?? "neutral"
          : "neutral",
      change: kpi?.depositingClients?.changePercentage ?? 0,
    },
  ];

  // Build area chart data from trendSeries
  const trendData = trendSeries.slice(-30).map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    "New Leads": d.newLeads,
    Registered: d.registered,
    Confirmed: d.confirmed,
  }));

  // Build funnel bar chart data
  const funnel = summary?.funnel;
  const funnelData = funnel
    ? [
        { stage: "Leads", count: funnel.new, color: "#C4232D" },
        { stage: "Registered", count: funnel.registered, color: "#60A5FA" },
        { stage: "Deposited", count: funnel.depositReported, color: "#22D3A0" },
        { stage: "Confirmed", count: funnel.depositConfirmed, color: "#E8B94F" },
      ]
    : [
        { stage: "Leads", count: totalLeads, color: "#C4232D" },
        {
          stage: "Registered",
          count: kpi?.registeredAccounts?.current ?? 0,
          color: "#60A5FA",
        },
        { stage: "Deposited", count: depositors, color: "#22D3A0" },
        { stage: "Confirmed", count: 0, color: "#E8B94F" },
      ];

  // Funnel drop-off percentages
  const funnelWithPct = funnelData.map((item, i) => ({
    ...item,
    pct:
      i === 0
        ? 100
        : funnelData[0].count > 0
          ? Math.round((item.count / funnelData[0].count) * 100)
          : 0,
  }));

  return (
    <div className="pb-8">
          {/* ── Timeframe Chips ─────────────────────────────────────── */}
          <div
            ref={chipScrollRef}
            className="flex gap-2 overflow-x-auto scrollbar-hide px-4 pt-4 pb-1 snap-x snap-mandatory"
          >
            {DATE_RANGES.map((r) => (
              <button
                key={r}
                onClick={() => handleRangeChange(r)}
                className={cn(
                  "shrink-0 snap-start h-[36px] min-w-[44px] px-5 rounded-full font-sans text-[13px] font-semibold",
                  "transition-all duration-200 active:scale-95 select-none",
                  range === r
                    ? "bg-elevated text-text-primary"
                    : "bg-card text-text-muted border border-border-subtle",
                )}
              >
                {r === "Custom" && (
                  <CalendarBlank
                    size={14}
                    weight="bold"
                    className="inline mr-1 -mt-0.5"
                  />
                )}
                {r}
              </button>
            ))}
          </div>

          {/* ── KPI Stat Cards — 2×2 Grid ──────────────────────────── */}
          <div className="grid grid-cols-2 gap-3 px-4 pt-4">
            {isLoading
              ? [1, 2, 3, 4].map((i) => <StatCardSkeleton key={i} />)
              : statCards.map((card) => (
                  <div
                    key={card.id}
                    className={cn(
                      "relative flex flex-col gap-1 rounded-2xl bg-card border border-border-subtle p-4",
                      "shadow-sm overflow-hidden transition-shadow active:shadow-md",
                    )}
                  >
                    {/* Accent glow line */}
                    <div
                      className="absolute top-0 left-0 right-0 h-[2px]"
                      style={{ background: card.color }}
                    />
                    {/* Icon */}
                    <div
                      className={cn(
                        "flex items-center justify-center h-8 w-8 rounded-lg mb-1",
                        card.bgColor,
                        card.iconColor,
                      )}
                    >
                      {card.icon}
                    </div>
                    {/* Value */}
                    <span className="font-mono text-[22px] font-bold text-text-primary leading-tight tracking-tight">
                      {card.formatted}
                    </span>
                    {/* Label */}
                    <span className="font-sans text-[12px] text-text-secondary leading-tight">
                      {card.label}
                    </span>
                    {/* Trend */}
                    <div className="mt-1">
                      <TrendBadge
                        trend={card.trend as "up" | "down" | "neutral"}
                        percentage={card.change}
                      />
                    </div>
                  </div>
                ))}
          </div>

          {/* ── Lead Trend Area Chart ──────────────────────────────── */}
          <SectionCard
            title="Lead Trend"
            icon={
              <ChartBar
                size={16}
                weight="duotone"
                className="text-text-secondary"
              />
            }
            badge={
              <Badge variant="secondary" className="text-[10px] font-medium">
                {range === "Today" ? "Today" : range === "7D" ? "7 days" : "30 days"}
              </Badge>
            }
          >
            {isLoading ? (
              <ChartSkeleton height="h-[180px]" />
            ) : trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart
                  data={trendData}
                  margin={{ top: 4, right: 4, bottom: 0, left: -24 }}
                >
                  <defs>
                    <linearGradient id="maNew" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#60A5FA" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="maReg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="maDep" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22D3A0" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22D3A0" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border-subtle)"
                    strokeOpacity={0.4}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{
                      fill: "var(--text-muted)",
                      fontSize: 10,
                      fontFamily: "var(--font-mono)",
                    }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis hide />
                  <Tooltip
                    content={<ChartTooltip />}
                    cursor={{ stroke: "var(--border-subtle)", strokeWidth: 1 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="New Leads"
                    stroke="#60A5FA"
                    strokeWidth={2}
                    fill="url(#maNew)"
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0, fill: "#60A5FA" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Registered"
                    stroke="#a855f7"
                    strokeWidth={2}
                    fill="url(#maReg)"
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0, fill: "#a855f7" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Confirmed"
                    stroke="#22D3A0"
                    strokeWidth={2}
                    fill="url(#maDep)"
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0, fill: "#22D3A0" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[180px] rounded-xl bg-elevated/30">
                <span className="font-sans text-[13px] text-text-muted">
                  No trend data available
                </span>
              </div>
            )}

            {/* Chart legend */}
            {!isLoading && trendData.length > 0 && (
              <div className="flex items-center justify-center gap-4 mt-3">
                {[
                  { label: "Leads", color: "#60A5FA" },
                  { label: "Registered", color: "#a855f7" },
                  { label: "Confirmed", color: "#22D3A0" },
                ].map((l) => (
                  <span
                    key={l.label}
                    className="flex items-center gap-1.5 font-sans text-[11px] text-text-muted"
                  >
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ background: l.color }}
                    />
                    {l.label}
                  </span>
                ))}
              </div>
            )}
          </SectionCard>

          {/* ── Funnel Breakdown Bar Chart ─────────────────────────── */}
          <SectionCard
            title="Conversion Funnel"
            icon={
              <TrendUp
                size={16}
                weight="duotone"
                className="text-text-secondary"
              />
            }
            badge={
              funnel?.conversionRates?.overall != null ? (
                <Badge variant="secondary" className="text-[10px] font-medium font-mono">
                  {funnel.conversionRates.overall.toFixed(1)}% overall
                </Badge>
              ) : undefined
            }
          >
            {isLoading ? (
              <ChartSkeleton height="h-[180px]" />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart
                    data={funnelWithPct}
                    margin={{ top: 4, right: 4, bottom: 0, left: -24 }}
                    barSize={32}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border-subtle)"
                      strokeOpacity={0.4}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="stage"
                      tick={{
                        fill: "var(--text-muted)",
                        fontSize: 10,
                        fontFamily: "var(--font-mono)",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis hide />
                    <Tooltip
                      content={<ChartTooltip />}
                      cursor={{ fill: "var(--border-subtle)", fillOpacity: 0.15 }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {funnelWithPct.map((entry, idx) => (
                        <Cell
                          key={`cell-${idx}`}
                          fill={entry.color}
                          fillOpacity={0.85}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                {/* Funnel progress bars */}
                <div className="flex flex-col gap-2.5 mt-4">
                  {funnelWithPct.map((item) => (
                    <div key={item.stage} className="flex items-center gap-3">
                      <span className="w-[80px] shrink-0 font-sans text-[12px] text-text-secondary truncate">
                        {item.stage}
                      </span>
                      <div className="flex-1 h-[6px] rounded-full bg-elevated overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${item.pct}%`,
                            background: item.color,
                          }}
                        />
                      </div>
                      <span className="w-[52px] text-right font-mono text-[12px] font-semibold text-text-primary">
                        {item.count.toLocaleString()}
                      </span>
                      <span className="w-[36px] text-right font-mono text-[11px] text-text-muted">
                        {item.pct}%
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </SectionCard>
        </div>
  );
}

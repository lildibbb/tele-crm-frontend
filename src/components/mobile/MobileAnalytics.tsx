"use client";

import React, { useState, useEffect } from "react";
import { ChartBar } from "@phosphor-icons/react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";
import MobileShell from "./MobileShell";
import { LiveDot } from "./MobileShell";
import MobileMoreDrawer from "./MobileMoreDrawer";
import { useAnalyticsStore } from "@/store/analyticsStore";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface MobileAnalyticsProps {
  readonly onMoreOpen?: () => void;
}

type DateRange = "Today" | "7D" | "30D" | "Custom";

const DATE_RANGES: DateRange[] = ["Today", "7D", "30D", "Custom"];

// ── Section card wrapper ───────────────────────────────────────────────────────
function SectionCard({
  title,
  children,
  badge,
}: {
  title: string;
  children: React.ReactNode;
  badge?: React.ReactNode;
}) {
  return (
    <div className="mx-4 mt-4 p-4 rounded-xl bg-card border border-border-subtle shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="font-sans font-semibold text-[14px] text-text-primary">{title}</span>
        {badge}
      </div>
      {children}
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function MobileAnalytics({ onMoreOpen }: MobileAnalyticsProps) {
  const [range, setRange] = useState<DateRange>("7D");
  const [moreOpen, setMoreOpen] = useState(false);
  const { summary, isLoading, fetchSummary } = useAnalyticsStore();

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const kpi = summary?.kpi;
  const trendSeries = summary?.trendSeries ?? [];

  // Build chart data from trendSeries
  const flowData = trendSeries.slice(-7).map((d) => ({
    day: new Date(d.date).toLocaleDateString("en-US", { weekday: "short" }),
    leads: d.newLeads,
    registered: d.registered,
    deposited: d.confirmed,
  }));

  const funnel = summary?.funnel;
  const funnelItems = funnel
    ? (() => {
        const total = Math.max(funnel.new ?? 1, 1);
        return [
          { label: "Leads",      count: funnel.new,                  pct: 100,                                              color: "var(--crimson)" },
          { label: "Registered", count: funnel.registered,           pct: Math.round((funnel.registered  / total) * 100),  color: "var(--info)" },
          { label: "Deposited",  count: funnel.depositReported,      pct: Math.round((funnel.depositReported / total) * 100), color: "var(--success)" },
          { label: "FTD",        count: funnel.depositConfirmed,     pct: Math.round((funnel.depositConfirmed / total) * 100), color: "var(--gold)" },
        ];
      })()
    : [
        { label: "Leads",      count: kpi?.totalLeads?.current         ?? 0, pct: 100, color: "var(--crimson)" },
        { label: "Registered", count: kpi?.registeredAccounts?.current ?? 0, pct: 65,  color: "var(--info)" },
        { label: "Deposited",  count: kpi?.depositingClients?.current  ?? 0, pct: 31,  color: "var(--success)" },
        { label: "FTD",        count: 0,                                      pct: 0,   color: "var(--gold)" },
      ];

  const statChips = [
    { label: "New Leads",   value: String(kpi?.totalLeads?.current ?? "—"),         color: "var(--crimson)" },
    { label: "Registered",  value: String(kpi?.registeredAccounts?.current ?? "—"), color: "var(--info)" },
    { label: "FTD",         value: String(kpi?.depositingClients?.current ?? "—"),  color: "var(--success)" },
    { label: "Pending",     value: String(kpi?.pendingVerifications?.current ?? "—"), color: "var(--gold)" },
  ];

  return (
    <>
      <MobileShell
        activeTab="home"
        pageTitle="Analytics"
        showLiveDot
        onTabChange={(tab) => {
          if (tab === "more") { setMoreOpen(true); onMoreOpen?.(); }
        }}
      >
      <div className="pb-6">
        {/* Date range control */}
        <div className="flex gap-2 px-4 pt-4">
          {DATE_RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "flex-1 h-9 rounded-full font-sans text-[13px] font-medium transition-colors",
                range === r
                  ? "bg-crimson-subtle text-crimson"
                  : "bg-card text-text-secondary border border-border-subtle",
              )}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Quick stat strip */}
        <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pt-4 pb-1">
          {isLoading
            ? [1, 2, 3, 4].map((i) => <div key={i} className="shrink-0 w-[90px] h-[64px] rounded-[10px] bg-elevated animate-pulse" />)
            : statChips.map((chip) => (
                <div key={chip.label} className="shrink-0 flex flex-col gap-0.5 px-4 py-3 rounded-[10px] bg-card border border-border-subtle shadow-sm">
                  <span className="font-display font-bold text-[20px]" style={{ color: chip.color }}>{chip.value}</span>
                  <span className="font-sans text-[11px] text-text-secondary">{chip.label}</span>
                </div>
              ))}
        </div>

        {/* Lead Flow BarChart */}
        <SectionCard
          title="Lead Flow — 7 Days"
          badge={<span className="font-sans text-[12px] text-text-secondary">New vs Reg vs Dep</span>}
        >
          {flowData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={flowData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <XAxis
                  dataKey="day"
                  tick={{ fill: "var(--text-muted)", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{ background: "var(--elevated)", border: "1px solid var(--border-subtle)", borderRadius: 8 }}
                  labelStyle={{ color: "var(--text-secondary)", fontSize: 11 }}
                  itemStyle={{ color: "var(--text-primary)", fontSize: 12 }}
                />
                <Bar dataKey="leads"      fill="var(--crimson)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="registered" fill="var(--info)"    radius={[3, 3, 0, 0]} />
                <Bar dataKey="deposited"  fill="var(--success)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] rounded-lg bg-elevated animate-pulse" />
          )}
        </SectionCard>

        {/* Conversion Funnel */}
        <SectionCard title="Conversion Funnel">
          <div className="flex flex-col gap-3">
            {funnelItems.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="w-[90px] shrink-0 font-sans text-[13px] text-text-primary">
                  {item.label}: <span className="text-text-secondary">{item.count}</span>
                </span>
                <div className="flex-1 h-[10px] rounded-full bg-elevated overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${item.pct}%`, background: item.color }} />
                </div>
                <span className="w-10 text-right font-sans text-[12px] text-text-secondary">{item.pct}%</span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* AUM Over Time (area chart using trendSeries) */}
        <SectionCard
          title="Lead Trend"
          badge={
            <span className="rounded-full px-2 py-0.5 font-sans text-[11px] font-medium text-success bg-[color-mix(in_srgb,var(--success)_15%,transparent)]">
              30 days
            </span>
          }
        >
          {trendSeries.length > 0 ? (
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={trendSeries.slice(-30)} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="maTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--gold)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--gold)" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={{ background: "var(--elevated)", border: "1px solid var(--border-subtle)", borderRadius: 8 }}
                  labelStyle={{ display: "none" }}
                  itemStyle={{ color: "var(--gold)", fontSize: 12 }}
                />
                <Area type="monotone" dataKey="newLeads" stroke="var(--gold)" strokeWidth={2} fill="url(#maTrend)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[140px] rounded-lg bg-elevated animate-pulse" />
          )}
        </SectionCard>
      </div>
      </MobileShell>
      <MobileMoreDrawer open={moreOpen} onClose={() => setMoreOpen(false)} />
    </>
  );
}

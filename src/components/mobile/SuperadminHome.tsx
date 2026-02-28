"use client";

import React, { useState, useEffect } from "react";
import {
  ChartBar,
  Users,
  CurrencyDollar,
  Pulse,
  WarningCircle,
  CheckCircle,
  ArrowRight,
} from "@phosphor-icons/react";
import { ResponsiveContainer, AreaChart, Area, Tooltip } from "recharts";
import MobileShell, { LiveDot } from "./MobileShell";
import MobileMoreDrawer from "./MobileMoreDrawer";
import { useAnalyticsStore } from "@/store/analyticsStore";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface SuperadminHomeProps {
  readonly onMoreOpen?: () => void;
  readonly onOrgClick?: (orgId: string) => void;
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function SuperadminHome({
  onMoreOpen,
  onOrgClick,
}: SuperadminHomeProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const { summary, isLoading, fetchSummary } = useAnalyticsStore();

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const kpi = summary?.kpi;
  const trend = summary?.trendSeries ?? [];

  const chartData = trend.slice(-14).map((d) => ({
    day: trend.indexOf(d),
    leads: d.newLeads,
    registered: d.registered,
    ftd: d.confirmed,
  }));

  const statChips = [
    {
      Icon: ChartBar,
      iconBg: "bg-gold-subtle",
      value: "—",
      valueClass: "text-text-primary",
      label: "Orgs",
    },
    {
      Icon: Users,
      iconBg: "bg-crimson-subtle",
      value: String(kpi?.totalLeads?.current ?? "—"),
      valueClass: "text-text-primary",
      label: "Total Leads",
    },
    {
      Icon: CurrencyDollar,
      iconBg: "bg-gold-subtle",
      value: "—",
      valueClass: "text-gold",
      label: "Platform AUM",
    },
    {
      Icon: Pulse,
      iconBg: "bg-[color-mix(in_srgb,var(--success)_15%,transparent)]",
      value: String(kpi?.depositingClients?.current ?? "—"),
      valueClass: "text-success",
      label: "Active Today",
    },
  ];

  return (
    <>
      <MobileShell
        role="SUPERADMIN"
        activeTab="home"
        pageTitle="Platform Overview"
        showLiveDot
        onTabChange={(tab) => {
          if (tab === "more") { setMoreOpen(true); onMoreOpen?.(); }
        }}
      >
      <div className="pb-6">
        {/* Stat strip */}
        <div className="px-4 pt-4">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {isLoading
              ? [1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex-shrink-0 w-[120px] h-[92px] rounded-[10px] bg-elevated animate-pulse" />
                ))
              : statChips.map((chip, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 flex flex-col gap-1 w-[120px] p-3 rounded-[10px] bg-card border border-border-subtle shadow-sm"
                  >
                    <span className={cn("flex items-center justify-center w-7 h-7 rounded-lg", chip.iconBg)}>
                      <chip.Icon size={16} className={chip.valueClass} weight="fill" />
                    </span>
                    <span className={cn("font-display font-bold text-[22px] leading-none", chip.valueClass)}>
                      {chip.value}
                    </span>
                    <span className="font-sans text-[11px] text-text-secondary">{chip.label}</span>
                  </div>
                ))}
          </div>
        </div>

        {/* Platform funnel chart */}
        <div className="mx-4 mt-4 p-4 rounded-xl bg-card border border-border-subtle shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="font-sans font-semibold text-[14px] text-text-primary">
              Platform Funnel — 30 Days
            </span>
            <LiveDot />
          </div>
          <p className="font-sans text-[12px] text-text-secondary mb-3">
            All organizations combined
          </p>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="gLeadsSA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--crimson)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--crimson)" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="gRegSA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--info)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--info)" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="gFtdSA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--success)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--success)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={{ background: "var(--elevated)", border: "1px solid var(--border-subtle)", borderRadius: 8 }}
                  labelStyle={{ display: "none" }}
                  itemStyle={{ color: "var(--text-primary)", fontSize: 12 }}
                />
                <Area type="monotone" dataKey="leads"      stroke="var(--crimson)"  fill="url(#gLeadsSA)" strokeWidth={1.5} dot={false} />
                <Area type="monotone" dataKey="registered" stroke="var(--info)"     fill="url(#gRegSA)"   strokeWidth={1.5} dot={false} />
                <Area type="monotone" dataKey="ftd"        stroke="var(--success)"  fill="url(#gFtdSA)"   strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[160px] rounded-lg bg-elevated animate-pulse" />
          )}
          <div className="flex items-center gap-4 mt-2">
            {[
              ["var(--crimson)", "Leads"],
              ["var(--info)", "Registered"],
              ["var(--success)", "FTD"],
            ].map(([c, l]) => (
              <span key={l} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ background: c }} />
                <span className="font-sans text-[11px] text-text-secondary">{l}</span>
              </span>
            ))}
          </div>
        </div>

        {/* KPI summary */}
        <div className="mx-4 mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-sans font-semibold text-[14px] text-text-primary">Platform KPIs</span>
          </div>
          <div className="rounded-xl bg-card border border-border-subtle divide-y divide-border-subtle shadow-sm">
            {[
              { label: "Total Leads", value: kpi?.totalLeads?.current ?? "—", changeClass: "text-success" },
              { label: "Registered", value: kpi?.registeredAccounts?.current ?? "—", changeClass: "text-info" },
              { label: "FTD", value: kpi?.depositingClients?.current ?? "—", changeClass: "text-gold" },
              { label: "Pending Verification", value: kpi?.pendingVerifications?.current ?? "—", changeClass: "text-warning" },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between px-4 py-3">
                <span className="font-sans text-[13px] text-text-secondary">{row.label}</span>
                <span className={cn("font-display font-bold text-[16px]", row.changeClass)}>
                  {String(row.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      </MobileShell>
      <MobileMoreDrawer open={moreOpen} onClose={() => setMoreOpen(false)} />
    </>
  );
}


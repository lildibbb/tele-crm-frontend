"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  CurrencyDollar,
  TrendUp,
  ShieldCheck,
  Plus,
  ArrowRight,
} from "@phosphor-icons/react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  Tooltip,
} from "recharts";
import MobileShell from "./MobileShell";
import MobileMoreDrawer from "./MobileMoreDrawer";
import { useAnalyticsStore } from "@/store/analyticsStore";
import { useLeadsStore } from "@/store/leadsStore";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface OwnerHomeProps {
  readonly onMoreOpen?: () => void;
  readonly onAddLead?: () => void;
  readonly onViewAllLeads?: () => void;
  readonly onVerificationBanner?: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  NEW:               "var(--info)",
  REGISTERED:        "#A855F7",
  DEPOSIT_REPORTED:  "var(--warning)",
  DEPOSIT_CONFIRMED: "var(--success)",
  REJECTED:          "var(--danger)",
};

const STATUS_LABELS: Record<string, string> = {
  NEW:               "NEW",
  REGISTERED:        "REGISTERED",
  DEPOSIT_REPORTED:  "PROOF PENDING",
  DEPOSIT_CONFIRMED: "CONFIRMED",
  REJECTED:          "REJECTED",
};

// ── Skeleton strip ─────────────────────────────────────────────────────────────
function SkeletonChip() {
  return <div className="flex-shrink-0 w-[110px] h-[92px] rounded-[10px] bg-elevated animate-pulse" />;
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function OwnerHome({
  onMoreOpen,
  onAddLead,
  onViewAllLeads,
  onVerificationBanner,
}: OwnerHomeProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const { user } = useAuthStore();
  const { summary, isLoading: analyticsLoading, fetchSummary } = useAnalyticsStore();
  const { leads, isLoading: leadsLoading, fetchLeads } = useLeadsStore();

  useEffect(() => {
    fetchSummary();
    fetchLeads({ skip: 0, take: 3, orderBy: "createdAt", order: "desc" });
  }, [fetchSummary, fetchLeads]);

  const kpi = summary?.kpi;
  const trendSeries = (summary?.trendSeries ?? []).slice(-7);
  const pendingCount = kpi?.pendingVerifications?.current ?? 0;

  // Map trendSeries → chart format
  const chartData = trendSeries.map((d) => ({
    day: new Date(d.date).toLocaleDateString("en-MY", { weekday: "short" }),
    leads: d.newLeads,
    registered: d.registered,
    ftd: d.confirmed,
  }));

  // Build stat chips from real data
  const statChips = [
    {
      Icon: Users,
      iconBg: "bg-crimson-subtle",
      value: String(kpi?.totalLeads?.current ?? "—"),
      label: "New Leads",
      valueClass: "text-text-primary",
    },
    {
      Icon: UserCheck,
      iconBg: "bg-[#60A5FA22]",
      value: String(kpi?.registeredAccounts?.current ?? "—"),
      label: "Registered",
      valueClass: "text-text-primary",
    },
    {
      Icon: CurrencyDollar,
      iconBg: "bg-gold-subtle",
      value: String(kpi?.depositingClients?.current ?? "—"),
      label: "FTD Today",
      valueClass: "text-gold",
    },
    {
      Icon: TrendUp,
      iconBg: "bg-gold-subtle",
      value: "—",
      label: "AUM",
      valueClass: "text-gold",
    },
  ];

  return (
    <>
      <MobileShell
        activeTab="home"
        pageTitle="Dashboard"
        verifyBadgeCount={pendingCount}
        showLiveDot
        onTabChange={(tab) => {
          if (tab === "more") { setMoreOpen(true); onMoreOpen?.(); }
        }}
      >
      <div className="pb-6">
        {/* Section 1 — Stat strip */}
        <div className="px-4 pt-4">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {analyticsLoading
              ? [1, 2, 3, 4].map((i) => <SkeletonChip key={i} />)
              : statChips.map((chip, i) => (
                  <div key={i} className="flex-shrink-0 flex flex-col gap-1 w-[110px] p-3 rounded-[10px] bg-card border border-border-subtle shadow-sm">
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

        {/* Section 2 — IB Funnel chart */}
        <div className="mx-4 mt-4 p-4 rounded-xl bg-card border border-border-subtle shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="font-sans font-semibold text-[14px] text-text-primary">IB Funnel — 7 Days</span>
            <span className="font-mono text-[12px] text-text-muted">
              {chartData[0]?.day ?? ""} – {chartData[chartData.length - 1]?.day ?? ""}
            </span>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <XAxis
                  dataKey="day"
                  tick={{ fill: "var(--text-muted)", fontSize: 10, fontFamily: "JetBrains Mono" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{ background: "var(--elevated)", border: "1px solid var(--border-subtle)", borderRadius: 8 }}
                  labelStyle={{ color: "var(--text-secondary)", fontSize: 11 }}
                  itemStyle={{ color: "var(--text-primary)", fontSize: 12 }}
                />
                <Line type="monotone" dataKey="leads"      stroke="var(--crimson)"  strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="registered" stroke="var(--info)"     strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="ftd"        stroke="var(--success)"  strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[140px] rounded-lg bg-elevated animate-pulse" />
          )}
          <div className="flex items-center gap-4 mt-1">
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

        {/* Section 3 — Verification banner */}
        {pendingCount > 0 && (
          <button
            onClick={onVerificationBanner}
            className="mx-4 mt-4 w-[calc(100%-2rem)] flex items-center gap-3 p-3 rounded-xl border border-crimson bg-crimson-subtle active:scale-[0.97] transition-transform"
          >
            <ShieldCheck size={20} className="text-crimson shrink-0" weight="fill" />
            <span className="font-sans font-semibold text-[14px] text-text-primary flex-1 text-left">
              {pendingCount} leads awaiting verification
            </span>
            <ArrowRight size={16} className="text-crimson shrink-0" />
          </button>
        )}

        {/* Section 4 — Recent leads */}
        <div className="mx-4 mt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-sans font-semibold text-[14px] text-text-primary">Recent Leads</span>
            <button onClick={onViewAllLeads} className="flex items-center gap-1 font-sans text-[12px] text-crimson">
              View All <ArrowRight size={12} />
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {leadsLoading
              ? [1, 2, 3].map((i) => <div key={i} className="h-[72px] rounded-xl bg-card animate-pulse shadow-sm" />)
              : leads.slice(0, 3).map((lead) => {
                  const accentColor = STATUS_COLORS[lead.status] ?? "var(--text-muted)";
                  return (
                    <Link key={lead.id} href={`/leads/${lead.id}`}>
                      <div
                        className="flex flex-col gap-2 p-3 rounded-xl bg-card border border-border-subtle active:scale-[0.97] transition-transform shadow-sm"
                        style={{ borderLeft: `3px solid ${accentColor}` }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-sans font-semibold text-[15px] text-text-primary truncate flex-1 mr-2">
                            {lead.displayName ?? "—"}
                          </span>
                          <span
                            className="rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0"
                            style={{ background: `color-mix(in srgb, ${accentColor} 15%, transparent)`, color: accentColor }}
                          >
                            {STATUS_LABELS[lead.status] ?? lead.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[13px] text-text-secondary">
                            HFM: {lead.hfmBrokerId ?? "—"}
                          </span>
                          <span className="font-sans text-[11px] text-text-muted">
                            {new Date(lead.createdAt).toLocaleDateString("en-MY", { day: "numeric", month: "short" })}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
          </div>
        </div>

        {/* Section 5 — Today pills */}
        <div className="mx-4 mt-4 flex flex-wrap gap-2">
          {[
            { label: `${kpi?.totalLeads?.current ?? "—"} leads today`,    color: "var(--crimson)" },
            { label: `${kpi?.depositingClients?.current ?? "—"} FTDs`,    color: "var(--gold)" },
            { label: `${kpi?.pendingVerifications?.current ?? "—"} pending`, color: "var(--warning)" },
          ].map(({ label, color }) => (
            <span
              key={label}
              className="rounded-full px-3 py-1 font-sans text-[12px] font-medium"
              style={{ background: `color-mix(in srgb, ${color} 15%, transparent)`, color }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={onAddLead}
        className="fixed right-5 flex items-center justify-center w-14 h-14 rounded-full bg-crimson shadow-lg active:scale-95 transition-transform z-30"
        style={{ bottom: "calc(56px + env(safe-area-inset-bottom) + 20px)", boxShadow: "0 4px 24px var(--crimson-glow)" }}
        aria-label="Add Lead"
      >
        <Plus size={24} color="white" weight="bold" />
      </button>
      </MobileShell>
      <MobileMoreDrawer open={moreOpen} onClose={() => setMoreOpen(false)} />
    </>
  );
}


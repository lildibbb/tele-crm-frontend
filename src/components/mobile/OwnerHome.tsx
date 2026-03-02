"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  UserCheck,
  CurrencyDollar,
  TrendUp,
  ShieldCheck,
  Plus,
  ArrowRight,
  Megaphone,
  GearSix,
  CaretRight,
  Clock,
  CircleNotch,
  Circle,
} from "@phosphor-icons/react";
import { useAnalyticsStore } from "@/store/analyticsStore";
import { useLeadsStore } from "@/store/leadsStore";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface OwnerHomeProps {
  readonly onMoreOpen?: () => void;
  readonly onAddLead?: () => void;
  readonly onViewAllLeads?: () => void;
  readonly onVerificationBanner?: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  NEW:               "var(--info)",
  CONTACTED:         "#60A5FA",
  DEPOSIT_REPORTED:  "var(--warning)",
  DEPOSIT_CONFIRMED: "var(--success)",
  REJECTED:          "var(--danger)",
};

const STATUS_LABELS: Record<string, string> = {
  NEW:               "NEW",
  CONTACTED:         "CONTACTED",
  DEPOSIT_REPORTED:  "PROOF PENDING",
  DEPOSIT_CONFIRMED: "CONFIRMED",
  REJECTED:          "REJECTED",
};

// ── Skeleton card──────────────────────────────────────────────────────────────
function SkeletonKpiCard() {
  return (
    <div className="flex flex-col gap-2 p-4 rounded-2xl bg-card border border-border-subtle">
      <Skeleton className="w-10 h-10 rounded-xl" />
      <Skeleton className="w-16 h-6 rounded mt-1" />
      <Skeleton className="w-12 h-3 rounded" />
    </div>
  );
}

function SkeletonActivityCard() {
  return <Skeleton className="h-[60px] rounded-xl" />;
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function OwnerHome({
  onMoreOpen,
  onAddLead,
  onViewAllLeads,
  onVerificationBanner,
}: OwnerHomeProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { summary, isLoading: analyticsLoading, fetchSummary } = useAnalyticsStore();
  const { leads, isLoading: leadsLoading, fetchLeads } = useLeadsStore();

  useEffect(() => {
    fetchSummary();
    fetchLeads({ skip: 0, take: 5, orderBy: "createdAt", order: "desc" });
  }, [fetchSummary, fetchLeads]);

  const kpi = summary?.kpi;
  const pendingCount = kpi?.formSubmissions?.current ?? 0;
  const totalLeads = kpi?.totalLeads?.current ?? 0;
  const registered = kpi?.formSubmissions?.current ?? 0;
  const depositing = kpi?.verifiedClients?.current ?? 0;
  const conversionRate = totalLeads > 0 ? ((depositing / totalLeads) * 100).toFixed(1) : "0.0";

  const kpiCards = [
    {
      Icon: Users,
      iconBg: "bg-elevated",
      iconColor: "text-text-secondary",
      value: String(totalLeads || "—"),
      label: "Total Leads",
      trend: kpi?.totalLeads?.trend,
      trendPct: kpi?.totalLeads?.changePercentage,
    },
    {
      Icon: UserCheck,
      iconBg: "bg-elevated",
      iconColor: "text-text-secondary",
      value: String(registered || "—"),
      label: "Verified",
      trend: kpi?.formSubmissions?.trend,
      trendPct: kpi?.formSubmissions?.changePercentage,
    },
    {
      Icon: CurrencyDollar,
      iconBg: "bg-elevated",
      iconColor: "text-text-secondary",
      value: String(depositing || "—"),
      label: "Deposits",
      trend: kpi?.verifiedClients?.trend,
      trendPct: kpi?.verifiedClients?.changePercentage,
    },
    {
      Icon: TrendUp,
      iconBg: "bg-elevated",
      iconColor: "text-text-secondary",
      value: `${conversionRate}%`,
      label: "Conversion",
      trend: undefined as string | undefined,
      trendPct: undefined as number | undefined,
    },
  ];

  const quickActions = [
    { Icon: Plus, label: "Add Lead", color: "bg-crimson", textColor: "text-white", action: onAddLead },
    { Icon: Megaphone, label: "Broadcast", color: "bg-elevated", textColor: "text-text-secondary", action: () => router.push("/broadcasts") },
    { Icon: ShieldCheck, label: "Verify", color: "bg-elevated", textColor: "text-text-secondary", action: onVerificationBanner },
    { Icon: GearSix, label: "Settings", color: "bg-elevated", textColor: "text-text-secondary", action: () => router.push("/settings") },
  ];

  return (
    <div>
      <div className="pb-6 space-y-5">
        {/* ── KPI Grid 2×2 ──────────────────────────────────── */}
        <section className="px-4 pt-4">
          <div className="grid grid-cols-2 gap-3">
            {analyticsLoading
              ? [1, 2, 3, 4].map((i) => <SkeletonKpiCard key={i} />)
              : kpiCards.map((card) => (
                  <div
                    key={card.label}
                    className="flex flex-col gap-1.5 p-4 rounded-2xl bg-card border border-border-subtle shadow-sm"
                  >
                    <span className={cn("flex items-center justify-center w-10 h-10 rounded-xl", card.iconBg)}>
                      <card.Icon size={20} className={card.iconColor} weight="fill" />
                    </span>
                    <span className={cn("font-mono font-bold text-[26px] leading-tight tracking-tight text-text-primary")}>
                      {card.value}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-sans text-[12px] text-text-secondary">{card.label}</span>
                      {card.trend && card.trend !== "neutral" && card.trendPct != null && (
                        <span className={cn(
                          "font-mono text-[11px] font-medium",
                          card.trend === "up" ? "text-success" : "text-danger"
                        )}>
                          {card.trend === "up" ? "↑" : "↓"}{Math.abs(card.trendPct)}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
          </div>
        </section>

        {/* ── Quick Actions ─────────────────────────────────── */}
        <section className="px-4">
          <h2 className="font-sans font-semibold text-[13px] text-text-muted uppercase tracking-wider mb-3">
            Quick Actions
          </h2>
          <div className="flex items-center gap-4">
            {quickActions.map((qa) => (
              <button
                key={qa.label}
                onClick={qa.action}
                className="flex flex-col items-center gap-2 min-w-[56px] active:scale-95 transition-transform"
              >
                <span className={cn("flex items-center justify-center w-14 h-14 rounded-2xl shadow-sm", qa.color)}>
                  <qa.Icon size={22} className={qa.textColor} weight="bold" />
                </span>
                <span className="font-sans text-[11px] text-text-secondary">{qa.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ── Verification Banner ───────────────────────────── */}
        {pendingCount > 0 && (
          <section className="px-4">
            <button
              onClick={onVerificationBanner}
              className="w-full flex items-center gap-3 p-4 rounded-2xl bg-[color-mix(in_srgb,var(--crimson)_8%,transparent)] active:scale-[0.97] transition-transform"
            >
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[color-mix(in_srgb,var(--crimson)_15%,transparent)]">
                <ShieldCheck size={20} className="text-crimson" weight="fill" />
              </span>
              <div className="flex-1 text-left">
                <span className="font-sans font-semibold text-[14px] text-text-primary block">
                  {pendingCount} leads awaiting verification
                </span>
                <span className="font-sans text-[12px] text-text-muted">Tap to review now</span>
              </div>
              <CaretRight size={16} className="text-crimson shrink-0" />
            </button>
          </section>
        )}

        {/* ── Recent Activity Feed ──────────────────────────── */}
        <section className="px-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-sans font-semibold text-[13px] text-text-muted uppercase tracking-wider">
              Recent Activity
            </h2>
            <button onClick={onViewAllLeads} className="flex items-center gap-1 font-sans text-[12px] text-crimson font-medium min-h-[44px]">
              View All <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-2">
            {leadsLoading
              ? [1, 2, 3, 4, 5].map((i) => <SkeletonActivityCard key={i} />)
              : leads.slice(0, 5).map((lead, idx) => {
                  return (
                    <Link key={lead.id} href={`/leads/${lead.id}`}>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border-subtle active:scale-[0.97] transition-transform shadow-sm group">
                        {/* Timeline dot + connector */}
                        <div className="flex flex-col items-center self-stretch shrink-0">
                          <Circle size={8} weight="fill" className="text-text-muted mt-0.5 shrink-0" />
                          {idx < Math.min(leads.length, 5) - 1 && (
                            <span className="flex-1 w-px bg-border-subtle mt-1" />
                          )}
                        </div>
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-sans font-semibold text-[14px] text-text-primary truncate">
                              {lead.displayName ?? "—"}
                            </span>
                            <Badge variant="secondary" className="text-[10px] font-medium shrink-0">
                              {STATUS_LABELS[lead.status] ?? lead.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[12px] text-text-muted">
                              {lead.hfmBrokerId ? `HFM: ${lead.hfmBrokerId}` : "No broker ID"}
                            </span>
                            <span className="text-text-muted">·</span>
                            <span className="font-sans text-[11px] text-text-muted flex items-center gap-1">
                              <Clock size={10} />
                              {new Date(lead.createdAt).toLocaleDateString("en-MY", { day: "numeric", month: "short" })}
                            </span>
                          </div>
                        </div>
                        <CaretRight size={14} className="text-text-muted shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>
                  );
                })}

            {!leadsLoading && leads.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CircleNotch size={32} className="text-text-muted mb-2" />
                <span className="font-sans text-[13px] text-text-muted">No recent activity</span>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ── FAB ──────────────────────────────────────────── */}
      <button
        onClick={onAddLead}
        className="fixed right-5 flex items-center justify-center w-14 h-14 rounded-full bg-crimson shadow-lg active:scale-95 transition-transform z-30"
        style={{ bottom: "calc(60px + env(safe-area-inset-bottom) + 20px)", boxShadow: "0 4px 24px var(--crimson-glow)" }}
        aria-label="Add Lead"
      >
        <Plus size={24} color="white" weight="bold" />
      </button>
    </div>
  );
}


"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Users,
  ArrowRight,
  CaretRight,
  Clock,
  Timer,
  CheckCircle,
  CircleNotch,
} from "@phosphor-icons/react";
import { useLeadsList } from "@/queries/useLeadsQuery";
import { useAuthStore } from "@/store/authStore";
import { useAnalyticsSummary } from "@/queries/useAnalyticsQuery";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface StaffHomeProps {
  readonly onVerificationQueue?: () => void;
  readonly onMyLeads?: () => void;
}

const STATUS_COLOR: Record<string, string> = {
  NEW:               "var(--info)",
  CONTACTED:         "#60A5FA",
  DEPOSIT_REPORTED:  "var(--warning)",
  DEPOSIT_CONFIRMED: "var(--success)",
  REJECTED:          "var(--danger)",
};

const STATUS_LABEL: Record<string, string> = {
  NEW:               "NEW",
  CONTACTED:         "CONTACTED",
  DEPOSIT_REPORTED:  "PROOF PENDING",
  DEPOSIT_CONFIRMED: "CONFIRMED",
};

// ── Skeleton components ────────────────────────────────────────────────────────
function SkeletonKpiCard() {
  return (
    <div className="flex flex-col gap-2 p-4 rounded-2xl bg-card border border-border-subtle min-h-[100px]">
      <Skeleton className="w-10 h-10 rounded-xl" />
      <Skeleton className="w-14 h-6 rounded mt-1" />
      <Skeleton className="w-20 h-3 rounded" />
    </div>
  );
}

function SkeletonLeadCard() {
  return <Skeleton className="h-[64px] rounded-xl" />;
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function StaffHome({
  onVerificationQueue,
  onMyLeads,
}: StaffHomeProps) {
  const { user } = useAuthStore();
  const { data: leadsResult, isLoading } = useLeadsList({ skip: 0, take: 5, orderBy: "createdAt", order: "desc" });
  const leads = leadsResult?.data ?? [];
  const total = leadsResult?.total ?? 0;
  const { data: summary, isLoading: analyticsLoading } = useAnalyticsSummary();

  const firstName = user?.email?.split("@")[0] ?? "Staff";
  const pendingCount = summary?.kpi?.formSubmissions?.current ?? 0;
  const registeredToday = summary?.kpi?.formSubmissions?.current ?? 0;
  const loading = isLoading || analyticsLoading;

  const today = new Date().toLocaleDateString("en-MY", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const kpiCards = [
    {
      Icon: Users,
      iconBg: "bg-elevated",
      iconColor: "text-text-secondary",
      value: String(total || "—"),
      label: "My Leads",
    },
    {
      Icon: Timer,
      iconBg: "bg-elevated",
      iconColor: "text-text-secondary",
      value: String(pendingCount || "—"),
      label: "Pending Follow-ups",
    },
    {
      Icon: CheckCircle,
      iconBg: "bg-elevated",
      iconColor: "text-text-secondary",
      value: String(registeredToday || "—"),
      label: "Verified Today",
    },
  ];

  const quickActions = [
    { Icon: Users, label: "View Leads", color: "bg-elevated", textColor: "text-text-secondary", action: onMyLeads },
    { Icon: ShieldCheck, label: "Follow-ups", color: "bg-elevated", textColor: "text-text-secondary", action: onVerificationQueue },
  ];

  return (
    <div className="pb-6 space-y-5">
        {/* ── Greeting ──────────────────────────────────────── */}
        <section className="px-4 pt-4">
          <p className="font-sans text-[13px] text-text-muted">Welcome back</p>
          <h1 className="font-sans font-bold text-[24px] text-text-primary mt-0.5 leading-tight">
            {user?.email ?? "Staff"}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="rounded-full px-2.5 py-1 bg-elevated font-sans font-medium text-[11px] text-text-secondary uppercase tracking-wide">
              Staff
            </span>
            <span className="font-sans text-[12px] text-text-muted">{today}</span>
          </div>
        </section>

        {/* ── KPI Cards ─────────────────────────────────────── */}
        <section className="px-4">
          <div className="grid grid-cols-3 gap-2">
            {loading
              ? [1, 2, 3].map((i) => <SkeletonKpiCard key={i} />)
              : kpiCards.map((card) => (
                  <div
                    key={card.label}
                    className="flex flex-col gap-1.5 p-3 rounded-2xl bg-card border border-border-subtle shadow-sm"
                  >
                    <span className={cn("flex items-center justify-center w-9 h-9 rounded-xl", card.iconBg)}>
                      <card.Icon size={18} className={card.iconColor} weight="fill" />
                    </span>
                    <span className="font-mono font-bold text-[22px] leading-tight text-text-primary">
                      {card.value}
                    </span>
                    <span className="font-sans text-[11px] text-text-secondary leading-tight">
                      {card.label}
                    </span>
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
              onClick={onVerificationQueue}
              className="w-full flex items-center gap-3 p-4 rounded-2xl bg-elevated active:scale-[0.97] transition-transform"
            >
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-elevated">
                <ShieldCheck size={20} className="text-text-secondary" weight="fill" />
              </span>
              <div className="flex-1 text-left">
                <span className="font-sans font-semibold text-[14px] text-text-primary block">
                  {pendingCount} deposits awaiting review
                </span>
                <span className="font-sans text-[12px] text-text-muted">Tap to open queue</span>
              </div>
              <CaretRight size={16} className="text-text-muted shrink-0" />
            </button>
          </section>
        )}

        {/* ── Assigned Leads ────────────────────────────────── */}
        <section className="px-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-sans font-semibold text-[13px] text-text-muted uppercase tracking-wider">
              Recent Assigned Leads
            </h2>
            {total > 5 && (
              <button onClick={onMyLeads} className="flex items-center gap-1 font-sans text-[12px] text-crimson font-medium min-h-[44px]">
                All {total} <ArrowRight size={12} />
              </button>
            )}
          </div>
          <div className="space-y-2">
            {isLoading
              ? [1, 2, 3, 4, 5].map((i) => <SkeletonLeadCard key={i} />)
              : leads.slice(0, 5).map((lead) => {
                  return (
                    <Link key={lead.id} href={`/leads/${lead.id}`}>
                      <div
                        className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border-subtle active:scale-[0.97] transition-transform shadow-sm group"
                      >
                        <div className="flex-1 min-w-0">
                          <span className="font-sans font-semibold text-[14px] text-text-primary truncate block">
                            {lead.displayName ?? "—"}
                          </span>
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
                        <Badge variant="secondary" className="text-[10px] font-medium shrink-0">
                          {STATUS_LABEL[lead.status] ?? lead.status}
                        </Badge>
                        <CaretRight size={14} className="text-text-muted shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>
                  );
                })}

            {!isLoading && leads.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CircleNotch size={32} className="text-text-muted mb-2" />
                <span className="font-sans text-[13px] text-text-muted">No leads assigned yet</span>
              </div>
            )}
          </div>
        </section>
    </div>
  );
}


"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Database,
  Brain,
  Lightning,
  ArrowRight,
  ShieldStar,
  Pulse,
  ClockCounterClockwise,
} from "@phosphor-icons/react";
import MobileShell from "./MobileShell";
import MobileMoreDrawer from "./MobileMoreDrawer";
import { useSuperadminStore } from "@/store/superadminStore";
import { useAnalyticsStore } from "@/store/analyticsStore";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface MobileAdminDashboardProps {
  readonly onMoreOpen?: () => void;
}

function SkeletonChip() {
  return <div className="flex-shrink-0 w-[120px] h-[88px] rounded-[12px] bg-elevated animate-pulse" />;
}

const ACTION_COLOR: Record<string, string> = {
  USER_CREATED:     "var(--success)",
  USER_UPDATED:     "var(--info)",
  USER_DEACTIVATED: "var(--danger)",
  USER_REACTIVATED: "var(--success)",
  LOGIN:            "var(--text-muted)",
};

// ── Component ──────────────────────────────────────────────────────────────────
export default function MobileAdminDashboard({ onMoreOpen }: MobileAdminDashboardProps) {
  const router = useRouter();
  const [moreOpen, setMoreOpen] = useState(false);
  const { users, auditLogs, ragStats, isLoadingUsers, isLoadingLogs, isLoadingRag, fetchUsers, fetchAuditLogs, fetchRagStats } = useSuperadminStore();
  const { summary, isLoading: analyticsLoading, fetchSummary } = useAnalyticsStore();

  useEffect(() => {
    fetchUsers();
    fetchAuditLogs({ skip: 0, take: 8 });
    fetchRagStats();
    fetchSummary();
  }, [fetchUsers, fetchAuditLogs, fetchRagStats, fetchSummary]);

  const kpi = summary?.kpi;
  const activeUsers = users.filter((u) => u.isActive).length;
  const totalUsers  = users.length;

  const statChips = [
    {
      Icon: Users,
      iconBg: "bg-crimson-subtle",
      value: String(totalUsers || "—"),
      valueClass: "text-crimson",
      label: "Total Users",
    },
    {
      Icon: ShieldStar,
      iconBg: "bg-[color-mix(in_srgb,var(--success)_15%,transparent)]",
      value: String(activeUsers || "—"),
      valueClass: "text-success",
      label: "Active Users",
    },
    {
      Icon: Pulse,
      iconBg: "bg-gold-subtle",
      value: String(kpi?.totalLeads?.current ?? "—"),
      valueClass: "text-gold",
      label: "Total Leads",
    },
    {
      Icon: Database,
      iconBg: "bg-elevated",
      value: String(ragStats?.totalRequests ?? "—"),
      valueClass: "text-text-primary",
      label: "AI Requests",
    },
  ];

  const recentLogs = auditLogs.slice(0, 8);

  return (
    <>
      <MobileShell
        role="SUPERADMIN"
        activeTab="home"
        pageTitle="Admin Panel"
        showLiveDot
        onTabChange={(tab) => {
          if (tab === "more") { setMoreOpen(true); onMoreOpen?.(); }
        }}
      >
        <div className="pb-6">
          {/* KPI Chips */}
          <div className="px-4 pt-4">
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {(isLoadingUsers || analyticsLoading)
                ? [1, 2, 3, 4].map((i) => <SkeletonChip key={i} />)
                : statChips.map((chip, i) => (
                    <div key={i} className="flex-shrink-0 flex flex-col gap-1 w-[120px] p-3 rounded-[12px] bg-card border border-border-subtle shadow-sm">
                      <span className={cn("flex items-center justify-center w-7 h-7 rounded-lg", chip.iconBg)}>
                        <chip.Icon size={16} className={chip.valueClass} weight="fill" />
                      </span>
                      <p className={cn("font-display text-[22px] font-bold leading-none mt-1", chip.valueClass)}>
                        {chip.value}
                      </p>
                      <p className="font-sans text-[11px] text-text-muted">{chip.label}</p>
                    </div>
                  ))}
            </div>
          </div>

          {/* RAG Stats */}
          <div className="px-4 mt-5">
            <p className="font-sans text-[11px] font-semibold text-text-muted uppercase tracking-widest mb-3">
              AI System
            </p>
            <div className="rounded-[14px] bg-card border border-border-subtle divide-y divide-border-subtle shadow-sm">
              {isLoadingRag ? (
                <div className="p-4 space-y-2">
                  {[1, 2].map((i) => <div key={i} className="h-5 rounded bg-elevated animate-pulse" />)}
                </div>
              ) : ragStats ? (
                <>
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Brain size={16} className="text-info" />
                      <span className="font-sans text-[13px] text-text-primary">Total Requests</span>
                    </div>
                    <span className="font-display text-[13px] font-semibold text-info">
                      {ragStats.totalRequests}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Lightning size={16} className="text-gold" />
                      <span className="font-sans text-[13px] text-text-primary">Hit Rate</span>
                    </div>
                    <span className="font-display text-[13px] font-semibold text-gold">
                      {(ragStats.ragHitRate).toFixed(1)}%
                    </span>
                  </div>
                </>
              ) : (
                <div className="p-4 text-[13px] text-text-muted text-center">No AI stats available</div>
              )}
            </div>
          </div>

          {/* Users List — top 5 */}
          <div className="px-4 mt-5">
            <div className="flex items-center justify-between mb-3">
              <p className="font-sans text-[11px] font-semibold text-text-muted uppercase tracking-widest">
                Users
              </p>
              <button
                onClick={() => router.push("/admin")}
                className="flex items-center gap-1 text-[12px] text-crimson font-semibold"
              >
                Manage <ArrowRight size={12} weight="bold" />
              </button>
            </div>
            <div className="rounded-[14px] bg-card border border-border-subtle divide-y divide-border-subtle overflow-hidden shadow-sm">
              {isLoadingUsers ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-8 h-8 rounded-full bg-elevated animate-pulse" />
                    <div className="flex-1 h-4 rounded bg-elevated animate-pulse" />
                  </div>
                ))
              ) : users.slice(0, 5).map((u) => (
                <div key={u.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-crimson-subtle font-display text-[13px] font-bold text-crimson">
                      {(u.email?.[0] ?? "U").toUpperCase()}
                    </span>
                    <div>
                      <p className="font-sans text-[13px] text-text-primary leading-none">{u.email}</p>
                      <p className="font-sans text-[11px] text-text-muted mt-0.5">{u.role}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "font-sans text-[11px] font-semibold px-2 py-0.5 rounded-full",
                    u.isActive ? "bg-[color-mix(in_srgb,var(--success)_15%,transparent)] text-success" : "bg-danger-subtle text-danger"
                  )}>
                    {u.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              ))}
              {!isLoadingUsers && users.length === 0 && (
                <div className="p-4 text-[13px] text-text-muted text-center">No users found</div>
              )}
            </div>
          </div>

          {/* Audit Log */}
          <div className="px-4 mt-5">
            <div className="flex items-center gap-2 mb-3">
              <ClockCounterClockwise size={14} className="text-text-muted" />
              <p className="font-sans text-[11px] font-semibold text-text-muted uppercase tracking-widest">
                Recent Activity
              </p>
            </div>
            <div className="rounded-[14px] bg-card border border-border-subtle divide-y divide-border-subtle overflow-hidden shadow-sm">
              {isLoadingLogs ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="px-4 py-3 space-y-1">
                    <div className="h-3.5 w-3/4 rounded bg-elevated animate-pulse" />
                    <div className="h-3 w-1/2 rounded bg-elevated animate-pulse" />
                  </div>
                ))
              ) : recentLogs.length > 0 ? recentLogs.map((log) => (
                <div key={log.id} className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span
                      className="font-sans text-[12px] font-semibold"
                      style={{ color: ACTION_COLOR[log.action] ?? "var(--text-muted)" }}
                    >
                      {log.action.replace(/_/g, " ")}
                    </span>
                    <span className="font-sans text-[11px] text-text-muted">
                      {new Date(log.createdAt).toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="font-sans text-[12px] text-text-muted mt-0.5 truncate">
                    {log.resourceType ?? log.resourceId ?? "—"}
                  </p>
                </div>
              )) : (
                <div className="p-4 text-[13px] text-text-muted text-center">No recent activity</div>
              )}
            </div>
          </div>
        </div>
      </MobileShell>
      <MobileMoreDrawer open={moreOpen} onClose={() => setMoreOpen(false)} />
    </>
  );
}

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
import { useSuperadminStore } from "@/store/superadminStore";
import { useAnalyticsStore } from "@/store/analyticsStore";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface MobileAdminDashboardProps {}

// ── Helpers ────────────────────────────────────────────────────────────────────

function SkeletonBar({ className }: { className?: string }) {
  return <Skeleton className={cn(className)} />;
}

function SkeletonHealthCard() {
  return (
    <div className="flex-shrink-0 w-[140px] rounded-2xl bg-card border border-border-subtle p-4 space-y-3">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-3 w-10" />
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function MobileAdminDashboard(_props: MobileAdminDashboardProps) {
  const router = useRouter();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
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

  const healthSystems = [
    { label: "API Server", status: "operational" as const, latency: "24ms" },
    { label: "Database",   status: "operational" as const, latency: "8ms" },
    { label: "Queue",      status: ragStats ? "operational" as const : "degraded" as const, latency: ragStats ? "12ms" : "—" },
  ];

  const statusConfig = {
    operational: { dot: "bg-success", text: "text-success", label: "Healthy" },
    degraded:    { dot: "bg-warning", text: "text-warning", label: "Degraded" },
    down:        { dot: "bg-danger",  text: "text-danger",  label: "Down" },
  };

  const userStats = [
    { Icon: Users,     label: "Total",  value: totalUsers,  color: "text-text-secondary",  bg: "bg-elevated" },
    { Icon: ShieldStar, label: "Active", value: activeUsers, color: "text-text-secondary",  bg: "bg-elevated" },
    { Icon: Pulse,     label: "Leads",  value: kpi?.totalLeads?.current ?? 0, color: "text-text-secondary", bg: "bg-elevated" },
    { Icon: Database,  label: "AI Reqs", value: ragStats?.totalRequests ?? 0, color: "text-text-secondary", bg: "bg-elevated" },
  ];

  const recentLogs = auditLogs.slice(0, 8);

  return (
    <div className="pb-8 space-y-6">

          {/* ── System Health ──────────────────────────────────────── */}
          <section className="px-4 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <p className="font-sans text-[11px] font-bold text-text-muted uppercase tracking-[0.08em]">
                System Health
              </p>
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
              {(isLoadingRag || analyticsLoading)
                ? [1, 2, 3].map((i) => <SkeletonHealthCard key={i} />)
                : healthSystems.map((sys) => {
                    const cfg = statusConfig[sys.status];
                    return (
                      <div
                        key={sys.label}
                        className="flex-shrink-0 w-[140px] rounded-2xl bg-card border border-border-subtle p-4 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-hover)]"
                      >
                        <p className="font-sans text-[12px] font-semibold text-text-secondary mb-2">{sys.label}</p>
                        <div className="flex items-center gap-1.5">
                          <span className={cn("w-2 h-2 rounded-full", cfg.dot)} />
                          <span className={cn("font-sans text-[13px] font-bold", cfg.text)}>{cfg.label}</span>
                        </div>
                        <p className="font-mono text-[11px] text-text-muted mt-1.5">{sys.latency}</p>
                      </div>
                    );
                  })}
            </div>
          </section>

          {/* ── User Quick Stats ───────────────────────────────────── */}
          <section className="px-4">
            <p className="font-sans text-[11px] font-bold text-text-muted uppercase tracking-[0.08em] mb-3">
              User Management
            </p>
            <div className="grid grid-cols-2 gap-3">
              {(isLoadingUsers || analyticsLoading)
                ? [1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-2xl bg-card border border-border-subtle p-4">
                      <SkeletonBar className="h-6 w-12 mb-2" />
                      <SkeletonBar className="h-3 w-16" />
                    </div>
                  ))
                : userStats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl bg-card border border-border-subtle p-4 shadow-[var(--shadow-card)] active:scale-[0.98] transition-transform"
                    >
                      <div className="flex items-center gap-2.5 mb-2">
                        <span className={cn("flex items-center justify-center w-8 h-8 rounded-xl", stat.bg)}>
                          <stat.Icon size={16} className={stat.color} weight="fill" />
                        </span>
                        <p className="font-display text-[24px] font-bold leading-none text-text-primary">
                          {stat.value || "—"}
                        </p>
                      </div>
                      <p className="font-sans text-[11px] text-text-muted font-medium">{stat.label}</p>
                    </div>
                  ))}
            </div>
            <button
              onClick={() => router.push("/admin")}
              className="flex items-center justify-center gap-1.5 w-full mt-3 py-2.5 rounded-xl bg-crimson-subtle text-crimson font-sans text-[13px] font-semibold active:scale-[0.98] transition-transform min-h-[44px]"
            >
              Manage Users <ArrowRight size={14} weight="bold" />
            </button>
          </section>

          {/* ── Maintenance Mode Toggle ────────────────────────────── */}
          <section className="px-4">
            <div className="rounded-2xl bg-card border border-border-subtle p-4 shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-elevated">
                    <Lightning size={20} className="text-text-secondary" weight="fill" />
                  </span>
                  <div>
                    <p className="font-sans text-[14px] font-semibold text-text-primary">Maintenance Mode</p>
                    <p className="font-sans text-[12px] text-text-muted">Restrict user access</p>
                  </div>
                </div>
                <button
                  onClick={() => setMaintenanceMode(!maintenanceMode)}
                  className={cn(
                    "relative w-[52px] h-[30px] rounded-full transition-colors duration-200 min-h-[44px] flex items-center",
                    maintenanceMode ? "bg-warning" : "bg-elevated"
                  )}
                  role="switch"
                  aria-checked={maintenanceMode}
                >
                  <span
                    className={cn(
                      "absolute w-[24px] h-[24px] rounded-full bg-white shadow-md transition-transform duration-200",
                      maintenanceMode ? "translate-x-[25px]" : "translate-x-[3px]"
                    )}
                  />
                </button>
              </div>
              {maintenanceMode && (
                <div className="mt-3 rounded-xl bg-[color-mix(in_srgb,var(--warning)_8%,transparent)] px-3 py-2.5">
                  <p className="font-sans text-[12px] text-warning font-medium">
                    ⚠ System is in maintenance mode. Users will see a maintenance page.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* ── AI System ──────────────────────────────────────────── */}
          <section className="px-4">
            <p className="font-sans text-[11px] font-bold text-text-muted uppercase tracking-[0.08em] mb-3">
              AI System
            </p>
            <div className="rounded-2xl bg-card border border-border-subtle overflow-hidden shadow-[var(--shadow-card)]">
              {isLoadingRag ? (
                <div className="p-4 space-y-3">
                  <SkeletonBar className="h-5 w-full" />
                  <SkeletonBar className="h-5 w-3/4" />
                </div>
              ) : ragStats ? (
                <div className="divide-y divide-border-subtle">
                  <div className="flex items-center justify-between px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <Brain size={18} className="text-text-secondary" weight="fill" />
                      <span className="font-sans text-[13px] text-text-primary font-medium">Total Requests</span>
                    </div>
                    <span className="font-mono text-[14px] font-bold text-info">
                      {ragStats.totalRequests.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <Lightning size={18} className="text-text-secondary" weight="fill" />
                      <span className="font-sans text-[13px] text-text-primary font-medium">Cache Hit Rate</span>
                    </div>
                    <span className="font-mono text-[14px] font-bold text-gold">
                      {ragStats.ragHitRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <Brain size={28} className="text-text-muted mx-auto mb-2" />
                  <p className="font-sans text-[13px] text-text-muted">No AI stats available</p>
                </div>
              )}
            </div>
          </section>

          {/* ── Recent System Events ───────────────────────────────── */}
          <section className="px-4">
            <div className="flex items-center gap-2 mb-3">
              <ClockCounterClockwise size={14} className="text-text-muted" weight="bold" />
              <p className="font-sans text-[11px] font-bold text-text-muted uppercase tracking-[0.08em]">
                Recent Events
              </p>
            </div>
            <div className="rounded-2xl bg-card border border-border-subtle overflow-hidden shadow-[var(--shadow-card)]">
              {isLoadingLogs ? (
                <div className="divide-y divide-border-subtle">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="px-4 py-3.5 space-y-2">
                      <SkeletonBar className="h-4 w-3/4" />
                      <SkeletonBar className="h-3 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : recentLogs.length > 0 ? (
                <div className="divide-y divide-border-subtle">
                  {recentLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 px-4 py-3.5">
                      <span
                        className="mt-0.5 shrink-0"
                      >
                        <Badge variant="secondary" className="text-[10px] font-mono font-bold uppercase tracking-wide">
                          {log.action.replace(/_/g, " ")}
                        </Badge>
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-[12px] text-text-secondary truncate">
                          {log.resourceType ?? log.resourceId ?? "—"}
                        </p>
                      </div>
                      <span className="font-mono text-[11px] text-text-muted shrink-0">
                        {new Date(log.createdAt).toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <ClockCounterClockwise size={28} className="text-text-muted mx-auto mb-2" />
                  <p className="font-sans text-[13px] text-text-muted">No recent events</p>
                </div>
              )}
            </div>
          </section>
        </div>
  );
}

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Crown,
  Wrench,
  Database,
  LockKey,
  GearSix,
  ChartBar,
  CaretLeft,
  CaretRight,
  Users,
  Lightning,
  ShieldCheck,
  ClockCounterClockwise,
  Robot,
  Brain,
  CheckCircle,
  Warning,
  XCircle,
  CurrencyDollar,
  HardDrives,
  Timer,
  Pulse,
  ArrowsClockwise,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useSuperadminUsers,
  useSuperadminAuditLogs,
  useSuperadminRagStats,
  useSuperadminQueues,
  useSuperadminTokenUsage,
  useSuperadminKbHealth,
  useSuperadminSystemHealth,
} from "@/queries/useSuperadminQuery";
import { useAnalyticsSummary } from "@/queries/useAnalyticsQuery";
import { useMaintenanceConfig } from "@/queries/useMaintenanceQuery";
import type { HealthStatus } from "@/lib/api/superadmin";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface MobileAdminOverviewProps {}

// ── Helpers ────────────────────────────────────────────────────────────────────

function SkeletonBar({ className }: { className?: string }) {
  return <Skeleton className={cn(className)} />;
}

function SectionLabel({ children, icon: Icon }: { children: React.ReactNode; icon?: React.ElementType }) {
  return (
    <div className="flex items-center gap-1.5 mb-3">
      {Icon && <Icon size={13} className="text-text-muted" weight="bold" />}
      <p className="font-sans text-[11px] font-bold text-text-muted uppercase tracking-[0.08em]">
        {children}
      </p>
    </div>
  );
}

function StatusDot({ status }: { status: HealthStatus }) {
  return (
    <span className={cn(
      "w-2.5 h-2.5 rounded-full shrink-0",
      status === "ok" ? "bg-success" : status === "degraded" ? "bg-warning animate-pulse" : "bg-danger animate-pulse",
    )} />
  );
}

function healthColor(status: HealthStatus) {
  if (status === "ok") return "text-success";
  if (status === "degraded") return "text-warning";
  return "text-danger";
}

// ── Data ───────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { icon: Wrench,   label: "Maintenance",      desc: "Mode & feature flags",        href: "/admin/maintenance" },
  { icon: Database,  label: "Backup",           desc: "Scheduled backups & history", href: "/admin/backup"      },
  { icon: LockKey,   label: "Secrets",          desc: "Encrypted credentials",       href: "/admin/secrets"     },
  { icon: GearSix,   label: "System Config",    desc: "All configuration keys",      href: "/settings"          },
  { icon: ChartBar,  label: "Google Analytics", desc: "API usage tracking",          href: "/admin/google"      },
];

// ── Component ──────────────────────────────────────────────────────────────────
export default function MobileAdminOverview({}: MobileAdminOverviewProps) {
  const router = useRouter();

  const { data: users = [],          isLoading: isLoadingUsers   } = useSuperadminUsers();
  const { data: summary,             isLoading: analyticsLoading } = useAnalyticsSummary();
  const { data: maintenanceConfig                                 } = useMaintenanceConfig();
  const { data: auditLogs = [],      isLoading: isLoadingLogs    } = useSuperadminAuditLogs({ take: 6 });
  const { data: ragStats,            isLoading: isLoadingRag     } = useSuperadminRagStats();
  const { data: queueStats,          isLoading: isLoadingQueues  } = useSuperadminQueues();
  const { data: tokenUsage,          isLoading: isLoadingTokens  } = useSuperadminTokenUsage();
  const { data: kbHealth,            isLoading: isLoadingKb      } = useSuperadminKbHealth();
  const { data: systemHealth,        isLoading: isLoadingHealth  } = useSuperadminSystemHealth();

  const maintenanceMode  = maintenanceConfig?.maintenanceMode ?? false;
  const featureFlags     = maintenanceConfig?.featureFlags ?? { knowledgeBase: true, broadcast: true, commandMenu: true, followUp: true };
  const maintenanceLoaded = maintenanceConfig !== undefined;

  const totalUsers   = users.length;
  const activeUsers  = users.filter((u) => u.isActive).length;
  const totalLeads   = summary?.kpi?.totalLeads?.current ?? 0;

  const overallStatus  = systemHealth?.status ?? "ok";
  const ragHitRate     = ragStats ? (ragStats.ragHitRate * 100).toFixed(1) : null;

  const kbEmbedded = kbHealth?.embeddingCoverage?.embedded ?? 0;
  const kbTotal    = kbHealth?.embeddingCoverage?.total    ?? 0;
  const kbPct      = kbTotal > 0 ? Math.round((kbEmbedded / kbTotal) * 100) : 100;

  const queues    = queueStats?.queues ?? [];
  const recentLogs = auditLogs.slice(0, 6);

  const FLAG_BADGES: { key: keyof typeof featureFlags; label: string }[] = [
    { key: "knowledgeBase", label: "Knowledge Base" },
    { key: "broadcast",     label: "Broadcast"      },
    { key: "commandMenu",   label: "Command Menu"   },
    { key: "followUp",      label: "Follow-Up"      },
  ];

  function fmtTokens(n: number) {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
    return n.toString();
  }

  return (
    <div className="flex flex-col min-h-screen bg-void text-text-primary font-sans">
      <div className="pt-[env(safe-area-inset-top)]" />

      {/* ── Header ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 flex items-center h-[56px] px-4 bg-base/80 backdrop-blur-xl border-b border-border-subtle">
        <button
          onClick={() => router.back()}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-text-secondary active:bg-elevated transition-colors"
        >
          <CaretLeft size={22} weight="bold" />
        </button>
        <span className="flex-1 text-center font-sans font-bold text-[17px] text-text-primary tracking-tight">
          Admin Overview
        </span>
        <span className="min-w-[44px] flex items-center justify-center">
          <Crown size={20} weight="fill" className="text-text-secondary" />
        </span>
      </header>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <main className="flex-1 pb-[calc(32px+env(safe-area-inset-bottom))] space-y-6">

        {/* ── System Health Banner ──────────────────────────────────── */}
        <div className={cn(
          "mx-4 mt-5 rounded-2xl border p-4 flex items-center gap-3",
          overallStatus === "ok"
            ? "bg-success/5 border-success/20"
            : overallStatus === "degraded"
              ? "bg-warning/5 border-warning/20"
              : "bg-danger/5 border-danger/20",
        )}>
          {isLoadingHealth ? (
            <>
              <SkeletonBar className="w-10 h-10 rounded-2xl shrink-0" />
              <div className="space-y-1.5 flex-1">
                <SkeletonBar className="h-4 w-28" />
                <SkeletonBar className="h-3 w-36" />
              </div>
            </>
          ) : (
            <>
              <div className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0",
                overallStatus === "ok" ? "bg-success/10" : overallStatus === "degraded" ? "bg-warning/10" : "bg-danger/10",
              )}>
                {overallStatus === "ok"
                  ? <CheckCircle size={22} weight="fill" className="text-success" />
                  : overallStatus === "degraded"
                    ? <Warning size={22} weight="fill" className="text-warning" />
                    : <XCircle  size={22} weight="fill" className="text-danger"  />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("font-sans font-bold text-[15px]", healthColor(overallStatus))}>
                  System {overallStatus === "ok" ? "Operational" : overallStatus === "degraded" ? "Degraded" : "Down"}
                </p>
                <p className="text-[12px] text-text-muted">
                  {systemHealth?.checks?.length ?? 0} services monitored
                  {systemHealth?.timestamp && ` · ${new Date(systemHealth.timestamp).toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" })}`}
                </p>
              </div>
            </>
          )}
        </div>

        {/* ── Overview Stats ────────────────────────────────────────── */}
        <section className="px-4">
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { label: "Total Users",  value: totalUsers,  Icon: Users,    loading: isLoadingUsers   },
              { label: "Active Users", value: activeUsers, Icon: Lightning, loading: isLoadingUsers  },
              { label: "Total Leads",  value: totalLeads,  Icon: ChartBar,  loading: analyticsLoading },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-card border border-border-subtle p-3.5 shadow-[var(--shadow-card)] text-center">
                {stat.loading ? (
                  <div className="space-y-2 flex flex-col items-center">
                    <SkeletonBar className="h-8 w-10" />
                    <SkeletonBar className="h-3 w-14" />
                  </div>
                ) : (
                  <>
                    <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-elevated mx-auto mb-2">
                      <stat.Icon size={18} className="text-text-secondary" weight="fill" />
                    </span>
                    <p className="font-display text-[22px] font-bold leading-none text-text-primary">
                      {stat.value || "—"}
                    </p>
                    <p className="font-sans text-[10px] text-text-muted font-medium mt-1">{stat.label}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── AI Performance ────────────────────────────────────────── */}
        <section className="px-4">
          <SectionLabel icon={Brain}>AI Performance</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            {/* RAG Hit Rate */}
            <div className="rounded-2xl bg-card border border-border-subtle p-4 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-2 mb-2.5">
                <Robot size={14} weight="fill" className="text-info" />
                <p className="font-sans text-[11px] text-text-muted font-medium">Hit Rate</p>
              </div>
              {isLoadingRag ? <SkeletonBar className="h-7 w-16" /> : (
                <p className="font-display text-[24px] font-bold text-info leading-none">
                  {ragHitRate ?? "—"}{ragHitRate && <span className="text-[12px] font-sans text-text-muted ml-0.5">%</span>}
                </p>
              )}
            </div>
            {/* Total Requests */}
            <div className="rounded-2xl bg-card border border-border-subtle p-4 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-2 mb-2.5">
                <Brain size={14} weight="fill" className="text-text-secondary" />
                <p className="font-sans text-[11px] text-text-muted font-medium">Requests</p>
              </div>
              {isLoadingRag ? <SkeletonBar className="h-7 w-16" /> : (
                <p className="font-display text-[24px] font-bold text-text-primary leading-none">
                  {ragStats?.totalRequests?.toLocaleString() ?? "—"}
                </p>
              )}
            </div>
            {/* 30d Tokens */}
            <div className="rounded-2xl bg-card border border-border-subtle p-4 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-2 mb-2.5">
                <Lightning size={14} weight="fill" className="text-gold" />
                <p className="font-sans text-[11px] text-text-muted font-medium">30d Tokens</p>
              </div>
              {isLoadingTokens ? <SkeletonBar className="h-7 w-16" /> : (
                <p className="font-display text-[22px] font-bold text-gold leading-none">
                  {tokenUsage?.rolling30dTokens != null ? fmtTokens(tokenUsage.rolling30dTokens) : "—"}
                </p>
              )}
            </div>
            {/* 30d Cost */}
            <div className="rounded-2xl bg-card border border-border-subtle p-4 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-2 mb-2.5">
                <CurrencyDollar size={14} weight="fill" className="text-success" />
                <p className="font-sans text-[11px] text-text-muted font-medium">Est. Cost</p>
              </div>
              {isLoadingTokens ? <SkeletonBar className="h-7 w-16" /> : (
                <p className="font-display text-[22px] font-bold text-success leading-none">
                  ${tokenUsage?.rolling30dCostUsd?.toFixed(2) ?? "—"}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ── Health Checks ─────────────────────────────────────────── */}
        <section className="px-4">
          <SectionLabel icon={Pulse}>Health Checks</SectionLabel>
          <div className="rounded-2xl bg-card border border-border-subtle overflow-hidden shadow-[var(--shadow-card)]">
            {isLoadingHealth ? (
              <div className="divide-y divide-border-subtle">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="px-4 py-3 flex items-center gap-3">
                    <SkeletonBar className="w-2.5 h-2.5 rounded-full shrink-0" />
                    <SkeletonBar className="h-4 w-32 flex-1" />
                    <SkeletonBar className="h-3 w-14" />
                  </div>
                ))}
              </div>
            ) : !systemHealth?.checks?.length ? (
              <div className="p-5 text-center text-text-muted text-[13px]">No health data</div>
            ) : (
              <div className="divide-y divide-border-subtle">
                {systemHealth.checks.map((check) => (
                  <div key={check.name} className="flex items-center gap-3 px-4 py-3 min-h-[44px]">
                    <StatusDot status={check.status} />
                    <p className="flex-1 font-sans text-[13px] text-text-primary capitalize">
                      {check.name.replace(/_/g, " ")}
                    </p>
                    {check.latencyMs != null && (
                      <div className="flex items-center gap-1">
                        <Timer size={11} className="text-text-muted" />
                        <span className="font-mono text-[11px] text-text-muted">{check.latencyMs}ms</span>
                      </div>
                    )}
                    <span className={cn("font-sans text-[11px] font-bold uppercase ml-1", healthColor(check.status))}>
                      {check.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Queue Monitor ─────────────────────────────────────────── */}
        <section className="px-4">
          <SectionLabel icon={ArrowsClockwise}>Queue Monitor</SectionLabel>
          <div className="rounded-2xl bg-card border border-border-subtle overflow-hidden shadow-[var(--shadow-card)]">
            {isLoadingQueues ? (
              <div className="divide-y divide-border-subtle">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="px-4 py-3.5 space-y-2">
                    <SkeletonBar className="h-4 w-28" />
                    <SkeletonBar className="h-3 w-44" />
                  </div>
                ))}
              </div>
            ) : !queues.length ? (
              <div className="p-5 text-center text-text-muted text-[13px]">No queues</div>
            ) : (
              <div className="divide-y divide-border-subtle">
                {queues.map((q) => (
                  <div key={q.name} className="px-4 py-3 min-h-[52px]">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="font-sans text-[13px] font-semibold text-text-primary capitalize">
                        {q.name.replace(/-/g, " ")}
                      </p>
                      {q.failed > 0 && (
                        <Badge variant="secondary" className="text-[10px] font-bold bg-danger/10 text-danger border-0 px-2 py-0.5">
                          {q.failed} failed
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-4">
                      <span className="text-[11px] font-mono text-text-muted">W: <b className="text-text-secondary">{q.waiting}</b></span>
                      <span className="text-[11px] font-mono text-text-muted">A: <b className="text-info">{q.active}</b></span>
                      <span className="text-[11px] font-mono text-text-muted">C: <b className="text-success">{q.completed}</b></span>
                      {q.delayed > 0 && (
                        <span className="text-[11px] font-mono text-text-muted">D: <b className="text-warning">{q.delayed}</b></span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── KB Health ─────────────────────────────────────────────── */}
        <section className="px-4">
          <SectionLabel icon={HardDrives}>Knowledge Base Health</SectionLabel>
          <div className="rounded-2xl bg-card border border-border-subtle p-4 shadow-[var(--shadow-card)]">
            {isLoadingKb ? (
              <div className="space-y-3">
                <SkeletonBar className="h-4 w-40" />
                <SkeletonBar className="h-2 w-full rounded-full" />
                <SkeletonBar className="h-3 w-32" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <p className="font-sans text-[13px] font-semibold text-text-primary">Embedding Coverage</p>
                  <span className={cn(
                    "font-display text-[20px] font-bold",
                    kbPct >= 80 ? "text-success" : kbPct >= 50 ? "text-warning" : "text-danger",
                  )}>{kbPct}%</span>
                </div>
                <div className="h-2 rounded-full bg-elevated overflow-hidden mb-2">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      kbPct >= 80 ? "bg-success" : kbPct >= 50 ? "bg-warning" : "bg-danger",
                    )}
                    style={{ width: `${kbPct}%` }}
                  />
                </div>
                <p className="text-[11px] text-text-muted">
                  {kbEmbedded.toLocaleString()} / {kbTotal.toLocaleString()} chunks embedded
                  {kbHealth?.total != null && ` · ${kbHealth.total} entries`}
                </p>
              </>
            )}
          </div>
        </section>

        {/* ── System Status ──────────────────────────────────────────── */}
        <section className="px-4">
          <SectionLabel>System Status</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => router.push("/admin/maintenance")}
              className="rounded-2xl bg-card border border-border-subtle p-4 shadow-[var(--shadow-card)] text-left active:scale-[0.98] transition-transform min-h-[44px]"
            >
              <div className="flex items-center gap-2 mb-2.5">
                <Wrench size={16} className="text-text-secondary" weight="fill" />
                <p className="font-sans text-[11px] text-text-muted font-medium">Maintenance</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn("w-2.5 h-2.5 rounded-full", maintenanceMode ? "bg-warning animate-pulse" : "bg-success")} />
                <span className={cn("font-display text-[16px] font-bold", maintenanceMode ? "text-warning" : "text-success")}>
                  {maintenanceMode ? "Active" : "Off"}
                </span>
              </div>
            </button>
            <div className="rounded-2xl bg-card border border-border-subtle p-4 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-2 mb-2.5">
                <ShieldCheck size={16} className="text-text-secondary" weight="fill" />
                <p className="font-sans text-[11px] text-text-muted font-medium">Zero Hits</p>
              </div>
              {isLoadingRag ? (
                <SkeletonBar className="h-5 w-8" />
              ) : (
                <span className={cn("font-display text-[16px] font-bold", (ragStats?.zeroHitCount ?? 0) > 0 ? "text-warning" : "text-success")}>
                  {ragStats?.zeroHitCount ?? "—"}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* ── Quick Actions ──────────────────────────────────────────── */}
        <section className="px-4">
          <SectionLabel>Quick Actions</SectionLabel>
          <div className="rounded-2xl bg-card border border-border-subtle overflow-hidden shadow-[var(--shadow-card)]">
            {NAV_ITEMS.map((item, i) => (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={cn(
                  "flex items-center gap-4 w-full px-4 py-3.5 active:bg-elevated transition-colors text-left min-h-[56px]",
                  i < NAV_ITEMS.length - 1 && "border-b border-border-subtle",
                )}
              >
                <span className="w-10 h-10 rounded-xl bg-elevated flex items-center justify-center shrink-0">
                  <item.icon size={20} weight="fill" className="text-text-secondary" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-sans font-semibold text-[14px] text-text-primary">{item.label}</p>
                  <p className="font-sans text-[12px] text-text-muted truncate">{item.desc}</p>
                </div>
                <CaretRight size={16} className="text-text-muted shrink-0" />
              </button>
            ))}
          </div>
        </section>

        {/* ── Feature Flags ──────────────────────────────────────────── */}
        {maintenanceLoaded && (
          <section className="px-4">
            <SectionLabel>Feature Flags</SectionLabel>
            <div className="rounded-2xl bg-card border border-border-subtle p-4 shadow-[var(--shadow-card)]">
              <div className="flex flex-wrap gap-2">
                {FLAG_BADGES.map(({ key, label }) => (
                  <Badge key={key} variant="secondary" className="text-[11px] font-bold gap-1.5 px-3 py-1.5 rounded-full">
                    <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", featureFlags[key] ? "bg-success" : "bg-danger")} />
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Recent Events ──────────────────────────────────────────── */}
        <section className="px-4">
          <SectionLabel icon={ClockCounterClockwise}>Recent Events</SectionLabel>
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
                  <div key={log.id} className="flex items-center gap-3 px-4 py-3 min-h-[44px]">
                    <Badge variant="secondary" className="text-[10px] font-mono font-bold uppercase tracking-wide shrink-0">
                      {log.action.replace(/_/g, " ")}
                    </Badge>
                    <p className="flex-1 font-sans text-[12px] text-text-secondary truncate min-w-0">
                      {log.resourceType ?? log.resourceId ?? "—"}
                    </p>
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
      </main>
    </div>
  );
}

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
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSuperadminUsers, useSuperadminAuditLogs } from "@/queries/useSuperadminQuery";
import { useAnalyticsSummary } from "@/queries/useAnalyticsQuery";
import { useMaintenanceConfig } from "@/queries/useMaintenanceQuery";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface MobileAdminOverviewProps {}

interface NavItem {
  icon: React.ElementType;
  label: string;
  desc: string;
  href: string;
  iconColor: string;
  iconBg: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function SkeletonBar({ className }: { className?: string }) {
  return <Skeleton className={cn(className)} />;
}

// ── Data ───────────────────────────────────────────────────────────────────────
const NAV_ITEMS: NavItem[] = [
  { icon: Wrench,   label: "Maintenance",      desc: "Mode & feature flags",        href: "/admin/maintenance",        iconColor: "text-text-secondary", iconBg: "bg-elevated" },
  { icon: Database,  label: "Backup",           desc: "Scheduled backups & history", href: "/admin/backup",             iconColor: "text-text-secondary", iconBg: "bg-elevated" },
  { icon: LockKey,   label: "Secrets",          desc: "Encrypted credentials",       href: "/admin/secrets",            iconColor: "text-text-secondary", iconBg: "bg-elevated" },
  { icon: GearSix,   label: "System Config",    desc: "All configuration keys",      href: "/settings",                 iconColor: "text-text-secondary", iconBg: "bg-elevated" },
  { icon: ChartBar,  label: "Google Analytics", desc: "API usage tracking",          href: "/admin/google",             iconColor: "text-text-secondary", iconBg: "bg-elevated" },
];

// ── Component ──────────────────────────────────────────────────────────────────
export default function MobileAdminOverview({}: MobileAdminOverviewProps) {
  const router = useRouter();
  const { data: users = [], isLoading: isLoadingUsers } = useSuperadminUsers();
  const { data: summary, isLoading: analyticsLoading } = useAnalyticsSummary();
  const { data: maintenanceConfig } = useMaintenanceConfig();
  const { data: auditLogs = [], isLoading: isLoadingLogs } = useSuperadminAuditLogs({ take: 8 });
  const recentLogs = auditLogs.slice(0, 8);
  const maintenanceMode = maintenanceConfig?.maintenanceMode ?? false;
  const featureFlags = maintenanceConfig?.featureFlags ?? { knowledgeBase: true, broadcast: true, commandMenu: true, followUp: true };
  const maintenanceLoaded = maintenanceConfig !== undefined;

  const totalUsers = users.length;
  const activeToday = users.filter((u) => u.isActive).length;
  const totalLeads = summary?.kpi?.totalLeads?.current ?? 0;
  const pendingVerifications = users.filter((u) => u.isActive && !u.telegramId).length;

  const overviewStats = [
    { label: "Total Users",  value: totalUsers,  Icon: Users,       color: "text-text-secondary", bg: "bg-elevated",  loading: isLoadingUsers },
    { label: "Active Today", value: activeToday,  Icon: Lightning,   color: "text-text-secondary", bg: "bg-elevated", loading: isLoadingUsers },
    { label: "Total Leads",  value: totalLeads,   Icon: ChartBar,    color: "text-text-secondary", bg: "bg-elevated",     loading: analyticsLoading },
  ];

  const FLAG_BADGES: { key: keyof typeof featureFlags; label: string }[] = [
    { key: "knowledgeBase", label: "Knowledge Base" },
    { key: "broadcast",     label: "Broadcast" },
    { key: "commandMenu",   label: "Command Menu" },
    { key: "followUp",      label: "Follow-Up" },
  ];

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

        {/* ── Overview Stats (3-across) ─────────────────────────────── */}
        <section className="px-4 pt-5">
          <div className="grid grid-cols-3 gap-2.5">
            {overviewStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl bg-card border border-border-subtle p-3.5 shadow-[var(--shadow-card)] text-center"
              >
                {stat.loading ? (
                  <div className="space-y-2 flex flex-col items-center">
                    <SkeletonBar className="h-8 w-10" />
                    <SkeletonBar className="h-3 w-14" />
                  </div>
                ) : (
                  <>
                    <span className={cn("flex items-center justify-center w-9 h-9 rounded-xl mx-auto mb-2", stat.bg)}>
                      <stat.Icon size={18} className={stat.color} weight="fill" />
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

        {/* ── System Status ──────────────────────────────────────────── */}
        <section className="px-4">
          <p className="font-sans text-[11px] font-bold text-text-muted uppercase tracking-[0.08em] mb-3">
            System Status
          </p>
          <div className="grid grid-cols-2 gap-3">
            {/* Maintenance Mode */}
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
                <span className={cn(
                  "font-display text-[16px] font-bold",
                  maintenanceMode ? "text-warning" : "text-success"
                )}>
                  {maintenanceMode ? "Active" : "Off"}
                </span>
              </div>
            </button>

            {/* Bot Status */}
            <div className="rounded-2xl bg-card border border-border-subtle p-4 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-2 mb-2.5">
                <Lightning size={16} className="text-text-secondary" weight="fill" />
                <p className="font-sans text-[11px] text-text-muted font-medium">Bot Engine</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
                <span className="font-display text-[16px] font-bold text-success">Online</span>
              </div>
            </div>

            {/* Pending Verifications */}
            <div className="rounded-2xl bg-card border border-border-subtle p-4 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-2 mb-2.5">
                <ShieldCheck size={16} className="text-text-secondary" weight="fill" />
                <p className="font-sans text-[11px] text-text-muted font-medium">Pending</p>
              </div>
              {isLoadingUsers ? (
                <SkeletonBar className="h-5 w-8" />
              ) : (
                <span className="font-display text-[16px] font-bold text-info">{pendingVerifications}</span>
              )}
            </div>

            {/* Active Sessions */}
            <div className="rounded-2xl bg-card border border-border-subtle p-4 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-2 mb-2.5">
                <Users size={16} className="text-text-secondary" weight="fill" />
                <p className="font-sans text-[11px] text-text-muted font-medium">Sessions</p>
              </div>
              {isLoadingUsers ? (
                <SkeletonBar className="h-5 w-8" />
              ) : (
                <span className="font-display text-[16px] font-bold text-gold">{activeToday}</span>
              )}
            </div>
          </div>
        </section>

        {/* ── Quick Actions ──────────────────────────────────────────── */}
        <section className="px-4">
          <p className="font-sans text-[11px] font-bold text-text-muted uppercase tracking-[0.08em] mb-3">
            Quick Actions
          </p>
          <div className="rounded-2xl bg-card border border-border-subtle overflow-hidden shadow-[var(--shadow-card)]">
            {NAV_ITEMS.map((item, i) => (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={cn(
                  "flex items-center gap-4 w-full px-4 py-3.5 active:bg-elevated transition-colors text-left min-h-[56px]",
                  i < NAV_ITEMS.length - 1 && "border-b border-border-subtle"
                )}
              >
                <span className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", item.iconBg)}>
                  <item.icon size={20} weight="fill" className={item.iconColor} />
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
            <p className="font-sans text-[11px] font-bold text-text-muted uppercase tracking-[0.08em] mb-3">
              Feature Flags
            </p>
            <div className="rounded-2xl bg-card border border-border-subtle p-4 shadow-[var(--shadow-card)]">
              <div className="flex flex-wrap gap-2">
                {FLAG_BADGES.map(({ key, label }) => {
                  const enabled = featureFlags[key];
                  return (
                    <Badge
                      key={key}
                      variant="secondary"
                      className="text-[11px] font-bold gap-1.5 px-3 py-1.5 rounded-full"
                    >
                      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", enabled ? "bg-success" : "bg-danger")} />
                      {label}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </section>
        )}
        {/* ── Recent Events ──────────────────────────────────────────── */}
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

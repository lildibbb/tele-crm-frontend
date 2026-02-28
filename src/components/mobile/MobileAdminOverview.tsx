"use client";

import React, { useEffect } from "react";
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
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useSuperadminStore } from "@/store/superadminStore";
import { useAnalyticsStore } from "@/store/analyticsStore";
import { useMaintenanceStore } from "@/store/maintenanceStore";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface MobileAdminOverviewProps {}

interface NavItem {
  icon: React.ElementType;
  label: string;
  desc: string;
  href: string;
  color: string;
}

// ── Data ───────────────────────────────────────────────────────────────────────
const NAV_ITEMS: NavItem[] = [
  { icon: Wrench,   label: "Maintenance",      desc: "Mode & feature flags",        href: "/admin/maintenance",        color: "text-warning" },
  { icon: Database,  label: "Backup",           desc: "Scheduled backups & history", href: "/admin/backup",             color: "text-info" },
  { icon: LockKey,   label: "Secrets",          desc: "Encrypted credentials",       href: "/admin/secrets",            color: "text-crimson" },
  { icon: GearSix,   label: "System Config",    desc: "All configuration keys",      href: "/settings",                 color: "text-text-secondary" },
  { icon: ChartBar,  label: "Google Analytics", desc: "API usage tracking",          href: "/admin/google-analytics",   color: "text-success" },
];

// ── Component ──────────────────────────────────────────────────────────────────
export default function MobileAdminOverview({}: MobileAdminOverviewProps) {
  const router = useRouter();
  const { users, isLoadingUsers, fetchUsers } = useSuperadminStore();
  const { summary, isLoading: analyticsLoading, fetchSummary } = useAnalyticsStore();
  const { maintenanceMode, featureFlags, isLoaded: maintenanceLoaded, fetchPublicConfig } = useMaintenanceStore();

  useEffect(() => {
    fetchUsers();
    fetchSummary();
    fetchPublicConfig();
  }, [fetchUsers, fetchSummary, fetchPublicConfig]);

  const totalUsers = users.length;
  const activeToday = users.filter((u) => u.isActive).length;
  const totalLeads = summary?.kpi?.totalLeads?.current ?? 0;
  const pendingVerifications = users.filter((u) => u.isActive && !u.telegramId).length;

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
      <header className="sticky top-0 z-30 flex items-center h-[52px] px-4 bg-base border-b border-border-subtle">
        <button
          onClick={() => router.back()}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-crimson"
        >
          <CaretLeft size={22} weight="bold" />
        </button>
        <span className="flex-1 text-center font-sans font-semibold text-[17px] text-text-primary">
          Admin Panel
        </span>
        <span className="min-w-[44px] flex items-center justify-center">
          <Crown size={20} weight="fill" className="text-gold" />
        </span>
      </header>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <main className="flex-1 pb-[calc(32px+env(safe-area-inset-bottom))]">

        {/* Status Cards */}
        <div className="grid grid-cols-2 gap-3 px-4 pt-4">
          <button
            onClick={() => router.push("/admin/maintenance")}
            className="rounded-xl bg-card border border-border-subtle p-3 shadow-sm text-left active:bg-elevated transition-colors"
          >
            <p className="font-sans text-[11px] text-text-muted mb-1">Maintenance Mode</p>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 font-display text-[15px] font-bold",
                maintenanceMode ? "text-warning" : "text-success",
              )}
            >
              <span className={cn("w-2 h-2 rounded-full", maintenanceMode ? "bg-warning" : "bg-success")} />
              {maintenanceMode ? "ON" : "OFF"}
            </span>
          </button>

          <div className="rounded-xl bg-card border border-border-subtle p-3 shadow-sm">
            <p className="font-sans text-[11px] text-text-muted mb-1">Bot Status</p>
            <span className="inline-flex items-center gap-1.5 font-display text-[15px] font-bold text-success">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Online
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 px-4 mt-4">
          {[
            { Icon: Users,       label: "Total Users",          value: totalUsers,            color: "text-crimson",   loading: isLoadingUsers },
            { Icon: ChartBar,    label: "Total Leads",          value: totalLeads,            color: "text-gold",      loading: analyticsLoading },
            { Icon: Lightning,   label: "Active Today",         value: activeToday,           color: "text-success",   loading: isLoadingUsers },
            { Icon: ShieldCheck, label: "Pending Verifications", value: pendingVerifications, color: "text-warning",   loading: isLoadingUsers },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl bg-card border border-border-subtle p-3 shadow-sm">
              {stat.loading ? (
                <div className="space-y-2">
                  <div className="h-6 w-12 rounded bg-elevated animate-pulse" />
                  <div className="h-3 w-20 rounded bg-elevated animate-pulse" />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <stat.Icon size={16} weight="fill" className={stat.color} />
                    <p className={cn("font-display text-[20px] font-bold leading-none", stat.color)}>
                      {stat.value}
                    </p>
                  </div>
                  <p className="font-sans text-[11px] text-text-muted">{stat.label}</p>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Navigation Cards */}
        <div className="mx-4 mt-6">
          <h3 className="text-[11px] font-bold text-text-secondary uppercase tracking-[0.1em] px-2 mb-2">
            Administration
          </h3>
          <div className="rounded-xl bg-card border border-border-subtle overflow-hidden divide-y divide-border-subtle shadow-sm">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className="flex items-center gap-4 w-full p-4 active:bg-elevated transition-colors text-left"
              >
                <span
                  className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", item.color)}
                  style={{ background: "var(--elevated)" }}
                >
                  <item.icon size={20} weight="fill" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-sans font-medium text-[14px] text-text-primary">{item.label}</p>
                  <p className="font-sans text-[12px] text-text-muted truncate">{item.desc}</p>
                </div>
                <CaretRight size={16} className="text-text-muted shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Feature Flags Summary */}
        {maintenanceLoaded && (
          <div className="mx-4 mt-6">
            <h3 className="text-[11px] font-bold text-text-secondary uppercase tracking-[0.1em] px-2 mb-2">
              Feature Flags
            </h3>
            <div className="flex flex-wrap gap-2 px-2">
              {FLAG_BADGES.map(({ key, label }) => (
                <span
                  key={key}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-sans text-[11px] font-semibold",
                    featureFlags[key]
                      ? "bg-[color-mix(in_srgb,var(--success)_15%,transparent)] text-success"
                      : "bg-[color-mix(in_srgb,var(--danger)_15%,transparent)] text-danger",
                  )}
                >
                  <span className={cn("w-1.5 h-1.5 rounded-full", featureFlags[key] ? "bg-success" : "bg-danger")} />
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

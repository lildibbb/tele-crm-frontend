"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  ChartBar,
  Users,
  Pulse,
  Wrench,
  ClipboardText,
  Database,
  CheckCircle,
  WarningCircle,
  CaretRight,
  Clock,
  ShieldCheck,
} from "@phosphor-icons/react";
import { LiveDot } from "./MobileShell";
import { useAnalyticsSummary } from "@/queries/useAnalyticsQuery";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface SuperadminHomeProps {
  readonly onOrgClick?: (orgId: string) => void;
}

// ── Skeleton components ────────────────────────────────────────────────────────
function SkeletonKpiCard() {
  return (
    <div className="flex flex-col gap-2 p-4 rounded-2xl bg-card border border-border-subtle min-h-[110px]">
      <Skeleton className="w-10 h-10 rounded-xl" />
      <Skeleton className="w-14 h-6 rounded mt-1" />
      <Skeleton className="w-20 h-3 rounded" />
    </div>
  );
}

function SkeletonRow() {
  return <Skeleton className="h-[52px] rounded-lg" />;
}

// ── Mock data for system-level info not in analytics store ──────────────────────
const HEALTH_CHECKS = [
  { name: "API Server", status: "healthy" as const, latency: "12ms" },
  { name: "Database", status: "healthy" as const, latency: "3ms" },
  { name: "Redis Cache", status: "healthy" as const, latency: "1ms" },
  { name: "File Storage", status: "warning" as const, latency: "89ms" },
];

const AUDIT_EVENTS = [
  { id: "1", action: "User login", actor: "admin@org.com", time: "2 min ago", type: "auth" as const },
  { id: "2", action: "Lead status changed", actor: "staff@org.com", time: "15 min ago", type: "data" as const },
  { id: "3", action: "Backup completed", actor: "system", time: "1 hour ago", type: "system" as const },
  { id: "4", action: "New user created", actor: "admin@org.com", time: "3 hours ago", type: "auth" as const },
  { id: "5", action: "Config updated", actor: "superadmin", time: "5 hours ago", type: "system" as const },
];

// ── Main ───────────────────────────────────────────────────────────────────────
export default function SuperadminHome({
  onOrgClick,
}: SuperadminHomeProps) {
  const router = useRouter();
  const { data: summary, isLoading } = useAnalyticsSummary();

  const kpi = summary?.kpi;
  const totalLeads = kpi?.totalLeads?.current ?? 0;
  const activeToday = kpi?.verifiedClients?.current ?? 0;

  const kpiCards = [
    {
      Icon: ChartBar,
      iconBg: "bg-elevated",
      iconColor: "text-text-secondary",
      value: "—",
      label: "Total Orgs",
    },
    {
      Icon: Users,
      iconBg: "bg-elevated",
      iconColor: "text-text-secondary",
      value: String(totalLeads || "—"),
      label: "Total Users",
    },
    {
      Icon: Pulse,
      iconBg: "bg-elevated",
      iconColor: "text-text-secondary",
      value: String(activeToday || "—"),
      label: "System Health",
    },
  ];

  const quickActions = [
    { Icon: Users, label: "Manage Users", color: "bg-elevated", textColor: "text-text-secondary", onClick: () => router.push("/admin/users") },
    { Icon: Wrench, label: "Maintenance", color: "bg-elevated", textColor: "text-text-secondary", onClick: () => router.push("/admin/maintenance") },
    { Icon: ClipboardText, label: "Audit Logs", color: "bg-elevated", textColor: "text-text-secondary", onClick: () => router.push("/audit-logs") },
    { Icon: Database, label: "Backups", color: "bg-elevated", textColor: "text-text-secondary", onClick: () => router.push("/admin/backup") },
  ];

  return (
      <div className="pb-6 space-y-5">
        {/* ── KPI Cards ─────────────────────────────────────── */}
        <section className="px-4 pt-4">
          <div className="grid grid-cols-3 gap-2">
            {isLoading
              ? [1, 2, 3].map((i) => <SkeletonKpiCard key={i} />)
              : kpiCards.map((card) => (
                  <div
                    key={card.label}
                    className="flex flex-col gap-1.5 p-3 rounded-2xl bg-card border border-border-subtle shadow-sm"
                  >
                    <span className={cn("flex items-center justify-center w-10 h-10 rounded-xl", card.iconBg)}>
                      <card.Icon size={20} className={card.iconColor} weight="fill" />
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
                onClick={qa.onClick}
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

        {/* ── System Health ──────────────────────────────────── */}
        <section className="px-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-sans font-semibold text-[13px] text-text-muted uppercase tracking-wider">
              System Health
            </h2>
            <LiveDot />
          </div>
          <div className="rounded-2xl bg-card border border-border-subtle shadow-sm divide-y divide-border-subtle overflow-hidden">
            {isLoading
              ? [1, 2, 3, 4].map((i) => (
                  <div key={i} className="px-4 py-3">
                    <SkeletonRow />
                  </div>
                ))
              : HEALTH_CHECKS.map((check) => (
                  <div key={check.name} className="flex items-center gap-3 px-4 py-3">
                    {check.status === "healthy" ? (
                      <CheckCircle size={18} className="text-text-secondary shrink-0" weight="fill" />
                    ) : (
                      <WarningCircle size={18} className="text-text-secondary shrink-0" weight="fill" />
                    )}
                    <span className="font-sans text-[13px] text-text-primary flex-1">{check.name}</span>
                    <span className="font-mono text-[12px] text-text-secondary">
                      {check.latency}
                    </span>
                    <Badge variant="secondary" className="text-[10px] font-medium">
                      {check.status === "healthy" ? "OK" : "SLOW"}
                    </Badge>
                  </div>
                ))}
          </div>
        </section>

        {/* ── Recent Audit Events ───────────────────────────── */}
        <section className="px-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-sans font-semibold text-[13px] text-text-muted uppercase tracking-wider">
              Recent Audit Events
            </h2>
          </div>
          <div className="space-y-2">
            {isLoading
              ? [1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-[56px] rounded-xl" />
                ))
              : AUDIT_EVENTS.map((event) => {
                  const typeConfig = {
                    auth:   { icon: ShieldCheck, bg: "bg-elevated" },
                    data:   { icon: ClipboardText, bg: "bg-elevated" },
                    system: { icon: Wrench, bg: "bg-elevated" },
                  }[event.type];
                  const EventIcon = typeConfig.icon;

                  return (
                    <div
                      key={event.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border-subtle shadow-sm"
                    >
                      <span className={cn("flex items-center justify-center w-8 h-8 rounded-lg shrink-0", typeConfig.bg)}>
                        <EventIcon size={16} className="text-text-secondary" weight="fill" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="font-sans font-medium text-[13px] text-text-primary truncate block">
                          {event.action}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[11px] text-text-muted truncate">
                            {event.actor}
                          </span>
                          <span className="text-text-muted">·</span>
                          <span className="font-sans text-[11px] text-text-muted flex items-center gap-1 shrink-0">
                            <Clock size={10} />
                            {event.time}
                          </span>
                        </div>
                      </div>
                      <CaretRight size={14} className="text-text-muted shrink-0" />
                    </div>
                  );
                })}
          </div>
        </section>
      </div>
  );
}


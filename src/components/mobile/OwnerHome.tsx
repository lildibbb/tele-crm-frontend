"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  UserCheck,
  CurrencyDollar,
  ChatCircleDots,
  ShieldCheck,
  UploadSimple,
  ArrowRight,
  Megaphone,
  GearSix,
  CaretRight,
  Clock,
  CircleNotch,
  TrendUp,
  TrendDown,
  ClipboardText,
  Image as PhosphorImage,
  PaperPlaneTilt,
  Sparkle,
} from "@phosphor-icons/react";
import { useAnalyticsSummary } from "@/queries/useAnalyticsQuery";
import { useLeadsList } from "@/queries/useLeadsQuery";
import { usePendingTasksList } from "@/queries/usePendingTasksQuery";
import { PendingTaskStatus } from "@/types/enums";
import type { PendingTask } from "@/lib/schemas/pendingTask.schema";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { timeAgo } from "@/lib/format";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface OwnerHomeProps {
  readonly onViewAllLeads?: () => void;
}

type PeriodValue =
  | "today"
  | "yesterday"
  | "this_week"
  | "this_month"
  | "last_30_days"
  | "last_90_days"
  | "all_time";

const PERIOD_OPTIONS: { value: PeriodValue; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "this_week", label: "This Week" },
  { value: "this_month", label: "This Month" },
  { value: "last_30_days", label: "Last 30 Days" },
  { value: "last_90_days", label: "Last 90 Days" },
  { value: "all_time", label: "All Time" },
];

const STATUS_LABELS: Record<string, string> = {
  NEW: "NEW",
  CONTACTED: "CONTACTED",
  DEPOSIT_REPORTED: "PROOF PENDING",
  DEPOSIT_CONFIRMED: "CONFIRMED",
  REJECTED: "REJECTED",
};

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-500",
  CONTACTED: "bg-amber-500",
  DEPOSIT_REPORTED: "bg-orange-500",
  DEPOSIT_CONFIRMED: "bg-emerald-500",
  REJECTED: "bg-rose-500",
};

// ── Skeleton Components ────────────────────────────────────────────────────────
function SkeletonKpiCard() {
  return (
    <div className="flex flex-col gap-2 p-4 rounded-2xl bg-card border border-border-subtle">
      <Skeleton className="w-10 h-10 rounded-xl" />
      <Skeleton className="w-16 h-7 rounded mt-1" />
      <Skeleton className="w-20 h-3 rounded" />
    </div>
  );
}

function SkeletonActivityCard() {
  return <Skeleton className="h-[72px] rounded-2xl" />;
}

function SkeletonTaskCard() {
  return <Skeleton className="w-[200px] h-[220px] rounded-2xl shrink-0" />;
}

// ── KPI Card ───────────────────────────────────────────────────────────────────
function KpiCard({
  Icon,
  iconBg,
  iconColor,
  value,
  label,
  trend,
  trendPct,
}: {
  Icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  value: string;
  label: string;
  trend?: string;
  trendPct?: number;
}) {
  const hasTrend = trend && trend !== "neutral" && trendPct != null;
  const isUp = trend === "up";

  return (
    <div className="relative flex flex-col gap-1.5 p-4 rounded-3xl bg-card/60 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden group">
      {/* Subtle glass reflection */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-xl",
            iconBg,
          )}
        >
          <Icon size={20} className={iconColor} weight="fill" />
        </span>
        {hasTrend && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono",
              isUp ? "bg-success/10 text-success" : "bg-danger/10 text-danger",
            )}
          >
            {isUp ? (
              <TrendUp size={10} weight="bold" />
            ) : (
              <TrendDown size={10} weight="bold" />
            )}
            {Math.abs(trendPct!)}%
          </span>
        )}
      </div>
      <span className="font-mono font-bold text-[28px] leading-tight tracking-tight text-text-primary">
        {value}
      </span>
      <span className="font-sans text-[11px] font-medium text-text-secondary uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

// ── Pending Task Mini Card ─────────────────────────────────────────────────────
function PendingTaskMiniCard({ task }: { task: PendingTask }) {
  const mimeType = task.attachment?.mimeType ?? "";
  const isImage = mimeType.startsWith("image/");
  const caption = task.caption?.trim() || "Attachment received";

  return (
    <Link href="/pending-tasks" className="block">
      <div className="w-[200px] shrink-0 rounded-3xl border border-white/10 bg-card/60 backdrop-blur-xl overflow-hidden active:scale-[0.97] transition-all shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.12)] snap-start">
        {/* Thumbnail */}
        <div className="relative h-[120px] bg-black/20 overflow-hidden">
          {isImage && task.attachment?.fileUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={task.attachment.fileUrl}
              alt={caption}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <PhosphorImage
                size={32}
                className="text-text-muted"
                weight="duotone"
              />
            </div>
          )}
          {/* Status pill */}
          <Badge
            className={cn(
              "absolute top-2 right-2 border text-[8px] px-1.5 py-0 uppercase tracking-wider",
              task.status === PendingTaskStatus.PENDING
                ? "bg-warning/90 text-white border-warning/20"
                : task.status === PendingTaskStatus.RESOLVED
                  ? "bg-success/90 text-white border-success/20"
                  : "bg-danger/90 text-white border-danger/20",
            )}
          >
            {task.status}
          </Badge>
        </div>
        {/* Info */}
        <div className="p-3 space-y-1">
          <p className="text-[12px] font-semibold text-text-primary line-clamp-1">
            {caption}
          </p>
          <div className="flex items-center gap-1.5">
            <Clock size={10} className="text-text-muted shrink-0" />
            <span className="text-[10px] text-text-muted font-mono">
              {task.createdAt ? timeAgo(task.createdAt) : "—"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function OwnerHome({ onViewAllLeads }: OwnerHomeProps) {
  const router = useRouter();
  const [period, setPeriod] = useState<PeriodValue>("last_30_days");

  const { data: summary, isLoading: analyticsLoading } = useAnalyticsSummary({
    timeframe: period,
  });
  const { data: leadsResult, isLoading: leadsLoading } = useLeadsList({
    skip: 0,
    take: 5,
    orderBy: "createdAt",
    order: "desc",
  });
  const { data: pendingTasksResult, isLoading: pendingTasksLoading } =
    usePendingTasksList({
      status: PendingTaskStatus.PENDING,
      take: 10,
    });
  const leads = leadsResult?.data ?? [];
  const pendingTasks = pendingTasksResult?.data ?? [];
  const totalPending = pendingTasksResult?.total ?? 0;

  const kpi = summary?.kpi;
  const pendingCount = kpi?.formSubmissions?.current ?? 0;
  const totalLeads = kpi?.totalLeads?.current ?? 0;
  const registered = kpi?.formSubmissions?.current ?? 0;
  const depositing = kpi?.verifiedClients?.current ?? 0;

  const kpiCards = [
    {
      Icon: Users,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-500",
      value: String(totalLeads || "—"),
      label: "Total Leads",
      trend: kpi?.totalLeads?.trend,
      trendPct: kpi?.totalLeads?.changePercentage,
    },
    {
      Icon: UserCheck,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-500",
      value: String(registered || "—"),
      label: "Pending Verify",
      trend: kpi?.formSubmissions?.trend,
      trendPct: kpi?.formSubmissions?.changePercentage,
    },
    {
      Icon: CurrencyDollar,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-500",
      value: String(depositing || "—"),
      label: "Depositors",
      trend: kpi?.verifiedClients?.trend,
      trendPct: kpi?.verifiedClients?.changePercentage,
    },
    {
      Icon: ChatCircleDots,
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-500",
      value: String(kpi?.contactedLeads?.current || "—"),
      label: "Contacted",
      trend: kpi?.contactedLeads?.trend,
      trendPct: kpi?.contactedLeads?.changePercentage,
    },
  ];

  const quickActions = [
    {
      Icon: UploadSimple,
      label: "Import",
      color: "bg-blue-500/8",
      iconColor: "text-blue-500",
      action: () => router.push("/leads"),
    },
    {
      Icon: Megaphone,
      label: "Broadcast",
      color: "bg-amber-500/8",
      iconColor: "text-amber-500",
      action: () => router.push("/broadcasts"),
    },
    {
      Icon: ShieldCheck,
      label: "Verify",
      color: "bg-emerald-500/8",
      iconColor: "text-emerald-500",
      action: () => router.push("/verification"),
    },
    {
      Icon: GearSix,
      label: "Settings",
      color: "bg-violet-500/8",
      iconColor: "text-violet-500",
      action: () => router.push("/settings"),
    },
  ];

  return (
    <div>
      <div className="pb-6 space-y-5">
        {/* ── KPI Section ───────────────────────────────────── */}
        <section className="px-4 pt-4">
          {/* Timeframe Selector */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-sans font-bold text-[15px] text-text-primary">
              Performance
            </h2>
            <Select
              value={period}
              onValueChange={(v) => setPeriod(v as PeriodValue)}
            >
              <SelectTrigger className="h-8 w-auto min-w-[130px] bg-elevated border-border-subtle rounded-lg text-[12px] font-medium text-text-secondary gap-1.5 px-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIOD_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-2 gap-3">
            {analyticsLoading
              ? [1, 2, 3, 4].map((i) => <SkeletonKpiCard key={i} />)
              : kpiCards.map((card) => <KpiCard key={card.label} {...card} />)}
          </div>
        </section>

        {/* ── Quick Actions ─────────────────────────────────── */}
        <section className="px-4">
          <h2 className="font-sans font-bold text-[13px] text-text-muted uppercase tracking-wider mb-3">
            Quick Actions
          </h2>
          <div className="flex items-center gap-3">
            {quickActions.map((qa) => (
              <button
                key={qa.label}
                onClick={qa.action}
                className="flex flex-col items-center gap-2 flex-1 py-3 rounded-2xl active:scale-95 transition-transform"
              >
                <span
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-2xl border border-border-subtle",
                    qa.color,
                  )}
                >
                  <qa.Icon size={22} className={qa.iconColor} weight="bold" />
                </span>
                <span className="font-sans text-[11px] font-medium text-text-secondary">
                  {qa.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* ── Verification Banner ───────────────────────────── */}
        {pendingCount > 0 && (
          <section className="px-4">
            <button
              onClick={() => router.push("/verification")}
              className="w-full flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-crimson/8 to-crimson/3 border border-crimson/10 active:scale-[0.97] transition-transform"
            >
              <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-crimson/12">
                <ShieldCheck size={22} className="text-crimson" weight="fill" />
              </span>
              <div className="flex-1 text-left">
                <span className="font-sans font-bold text-[14px] text-text-primary block">
                  {pendingCount} awaiting verification
                </span>
                <span className="font-sans text-[12px] text-text-muted">
                  Tap to review now
                </span>
              </div>
              <CaretRight size={16} className="text-crimson shrink-0" />
            </button>
          </section>
        )}

        {/* ── Pending Tasks Carousel ────────────────────────── */}
        <section>
          <div className="flex items-center justify-between px-4 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-warning/10 flex items-center justify-center">
                <ClipboardText
                  size={14}
                  className="text-warning"
                  weight="fill"
                />
              </div>
              <div>
                <h2 className="font-sans font-bold text-[13px] text-text-primary leading-tight">
                  Pending Tasks
                </h2>
                <p className="font-sans text-[10px] text-text-muted">
                  Media requiring review
                </p>
              </div>
              {totalPending > 0 && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-warning/15 border border-warning/25 text-warning text-[10px] font-bold tabular-nums">
                  {totalPending}
                </span>
              )}
            </div>
            <button
              onClick={() => router.push("/pending-tasks")}
              className="flex items-center gap-1 font-sans text-[11px] text-crimson font-semibold min-h-[44px]"
            >
              View All <ArrowRight size={12} />
            </button>
          </div>
          <div className="pl-4 overflow-hidden">
            {pendingTasksLoading ? (
              <div className="flex gap-3 overflow-hidden">
                {[1, 2, 3].map((i) => (
                  <SkeletonTaskCard key={i} />
                ))}
              </div>
            ) : pendingTasks.length === 0 ? (
              <div className="flex items-center gap-3 px-4 py-6 mr-4 bg-elevated/50 rounded-2xl border border-border-subtle">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                  <Sparkle size={18} className="text-success" weight="fill" />
                </div>
                <div>
                  <p className="font-sans font-semibold text-[13px] text-text-primary">
                    All caught up!
                  </p>
                  <p className="font-sans text-[11px] text-text-muted">
                    No pending tasks right now
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-2 pr-4 snap-x snap-mandatory scrollbar-hide">
                {pendingTasks.map((task) => (
                  <PendingTaskMiniCard key={task.id} task={task} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Recent Activity Feed ──────────────────────────── */}
        <section className="px-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-sans font-bold text-[13px] text-text-muted uppercase tracking-wider">
              Recent Activity
            </h2>
            <button
              onClick={onViewAllLeads}
              className="flex items-center gap-1 font-sans text-[11px] text-crimson font-semibold min-h-[44px]"
            >
              View All <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-2">
            {leadsLoading
              ? [1, 2, 3, 4, 5].map((i) => <SkeletonActivityCard key={i} />)
              : leads.slice(0, 5).map((lead) => {
                  const statusColor =
                    STATUS_COLORS[lead.status] ?? "bg-gray-500";
                  return (
                    <Link key={lead.id} href={`/leads/detail?id=${lead.id}`}>
                      <div className="relative flex items-center gap-3 p-3.5 rounded-3xl bg-card/60 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.12)] active:scale-[0.97] transition-all overflow-hidden group">
                        {/* Subtle glass reflection */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-elevated flex items-center justify-center shrink-0 ml-1">
                          <span className="font-sans font-bold text-[13px] text-text-secondary">
                            {(lead.displayName ?? "?")
                              .split(" ")
                              .map((w) => w[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-sans font-semibold text-[14px] text-text-primary truncate">
                              {lead.displayName ?? "—"}
                            </span>
                            <Badge
                              variant="secondary"
                              className={cn(
                                "text-[9px] font-bold shrink-0 uppercase tracking-wider",
                              )}
                            >
                              {STATUS_LABELS[lead.status] ?? lead.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[11px] text-text-muted truncate">
                              {lead.hfmBrokerId
                                ? `HFM: ${lead.hfmBrokerId}`
                                : (lead.phoneNumber ?? "No ID")}
                            </span>
                            <span className="text-text-muted text-[8px]">
                              •
                            </span>
                            <span className="font-sans text-[10px] text-text-muted flex items-center gap-0.5 shrink-0">
                              <Clock size={9} />
                              {new Date(lead.createdAt).toLocaleDateString(
                                "en-MY",
                                { day: "numeric", month: "short" },
                              )}
                            </span>
                          </div>
                        </div>

                        <CaretRight
                          size={14}
                          className="text-text-muted/40 shrink-0"
                        />
                      </div>
                    </Link>
                  );
                })}

            {!leadsLoading && leads.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-14 h-14 rounded-2xl bg-elevated flex items-center justify-center mb-3">
                  <CircleNotch
                    size={28}
                    className="text-text-muted"
                    weight="duotone"
                  />
                </div>
                <span className="font-sans font-semibold text-[14px] text-text-secondary">
                  No recent activity
                </span>
                <span className="font-sans text-[12px] text-text-muted mt-1">
                  Leads will appear here once they start coming in
                </span>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

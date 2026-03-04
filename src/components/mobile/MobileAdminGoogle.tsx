"use client";

import React from "react";
import { Icon } from "@iconify/react";
import {
  CheckCircle,
  XCircle,
  Clock,
  ArrowCounterClockwise,
} from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";
import { useGoogleAnalyticsStats } from "@/queries/useGoogleAnalyticsQuery";
import type { GoogleOpLog } from "@/lib/api/googleAnalytics";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface MobileAdminGoogleProps {}

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="rounded-2xl bg-card border border-border-subtle p-4 shadow-[var(--shadow-card)] flex items-start gap-3">
      <div className={cn("p-2 rounded-xl shrink-0", accent)}>{icon}</div>
      <div className="min-w-0">
        <p className="font-sans text-[10px] text-text-muted font-semibold uppercase tracking-wide">
          {label}
        </p>
        <p className="font-display text-[22px] font-bold text-text-primary mt-0.5 leading-none">
          {value}
        </p>
      </div>
    </div>
  );
}

// ── Op Log Card ───────────────────────────────────────────────────────────────

function OpLogCard({ op }: { op: GoogleOpLog }) {
  const serviceLabel = op.service === "sheets" ? "Sheets" : "Drive";
  const opLabel =
    op.operation === "fullSync"
      ? "Full Sync"
      : op.operation === "appendRow"
        ? "Append Row"
        : "Upload";
  const time = new Date(op.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const date = new Date(op.timestamp).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
  const isOk = op.status === "ok";

  return (
    <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-card border border-border-subtle">
      {/* Service icon */}
      <span className="w-9 h-9 rounded-xl bg-elevated flex items-center justify-center shrink-0">
        {op.service === "sheets" ? (
          <Icon icon="logos:google-sheets" className="w-4 h-4" />
        ) : (
          <Icon icon="logos:google-drive" className="w-4 h-4" />
        )}
      </span>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-sans font-semibold text-[13px] text-text-primary">
            {serviceLabel} · {opLabel}
          </p>
          {isOk ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-success shrink-0">
              <CheckCircle size={12} weight="fill" /> OK
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] text-danger shrink-0">
              <XCircle size={12} weight="fill" /> Failed
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
          <span className="font-mono text-[11px] text-text-muted">
            {time} · {date}
          </span>
          {op.records != null && (
            <span className="font-mono text-[11px] text-text-muted">
              {op.records.toLocaleString()} records
            </span>
          )}
          {op.durationMs != null && (
            <span className="font-mono text-[11px] text-text-muted">
              {op.durationMs}ms
            </span>
          )}
        </div>

        {op.errorMessage && (
          <p className="font-sans text-[11px] text-danger mt-1 truncate" title={op.errorMessage}>
            {op.errorMessage}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function MobileAdminGoogle({}: MobileAdminGoogleProps) {
  const router = useRouter();
  const { user } = useAuthStore();

  // SUPERADMIN guard
  if (user?.role !== "SUPERADMIN") {
    router.replace("/");
    return null;
  }

  const { data, isLoading, error, refetch } = useGoogleAnalyticsStats();

  const stats = data?.stats;
  const ops = data?.recentOps ?? [];
  const totalFailures =
    (stats?.sheetsSyncFail ?? 0) + (stats?.driveUploadFail ?? 0);
  const totalOps =
    (stats?.sheetsSyncOk ?? 0) +
    (stats?.sheetsSyncFail ?? 0) +
    (stats?.driveUploadOk ?? 0) +
    (stats?.driveUploadFail ?? 0);

  return (
    <div className="flex flex-col pb-6">
      {/* ── Refresh bar ────────────────────────────────────────────── */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <p className="font-sans text-[11px] font-bold text-text-muted uppercase tracking-[0.08em]">
          Google API Analytics
        </p>
        <button
          onClick={() => void refetch()}
          disabled={isLoading}
          className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl bg-elevated active:bg-card transition-colors disabled:opacity-50"
        >
          <ArrowCounterClockwise
            size={16}
            className={cn("text-text-secondary", isLoading && "animate-spin")}
          />
        </button>
      </div>

      {/* ── Error ──────────────────────────────────────────────────── */}
      {error && (
        <div className="mx-4 mb-3 px-3.5 py-3 rounded-xl bg-danger/10 border border-danger/20">
          <p className="font-sans text-[12px] text-danger">
            {error instanceof Error ? error.message : "Failed to load analytics"}
          </p>
        </div>
      )}

      {/* ── Stat cards ─────────────────────────────────────────────── */}
      <div className="px-4 mb-4">
        {isLoading && !data ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[76px] rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Sheets Syncs"
              value={(stats?.sheetsSyncOk ?? 0).toLocaleString()}
              icon={<Icon icon="logos:google-sheets" className="w-5 h-5" />}
              accent="bg-emerald-500/10"
            />
            <StatCard
              label="Drive Uploads"
              value={(stats?.driveUploadOk ?? 0).toLocaleString()}
              icon={<Icon icon="logos:google-drive" className="w-5 h-5" />}
              accent="bg-blue-500/10"
            />
            <StatCard
              label="Total Ops"
              value={totalOps.toLocaleString()}
              icon={<Clock size={20} weight="duotone" className="text-info" />}
              accent="bg-info/10"
            />
            <StatCard
              label="Failures"
              value={totalFailures}
              icon={
                <XCircle
                  size={20}
                  weight="duotone"
                  className={totalFailures > 0 ? "text-danger" : "text-text-muted"}
                />
              }
              accent={totalFailures > 0 ? "bg-danger/10" : "bg-elevated"}
            />
          </div>
        )}
      </div>

      {/* ── Recent ops ─────────────────────────────────────────────── */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <p className="font-sans text-[11px] font-bold text-text-muted uppercase tracking-[0.08em]">
            Recent Operations
          </p>
          {ops.length > 0 && (
            <span className="font-sans text-[11px] text-text-muted">
              {ops.filter((o) => o.status === "fail").length} failures
            </span>
          )}
        </div>

        {isLoading && !data ? (
          <div className="space-y-2.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-[72px] rounded-2xl" />
            ))}
          </div>
        ) : ops.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12">
            <span className="w-14 h-14 rounded-2xl bg-elevated flex items-center justify-center">
              <Icon icon="logos:google-drive" className="w-7 h-7 opacity-40" />
            </span>
            <p className="font-sans text-[13px] text-text-muted text-center">
              No recent operations
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {ops.map((op, i) => (
              <OpLogCard key={i} op={op} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

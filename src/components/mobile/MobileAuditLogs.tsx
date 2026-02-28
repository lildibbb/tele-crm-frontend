"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  ClipboardText,
  ArrowCounterClockwise,
  Warning,
  CaretLeft,
  CaretDown,
  Lightning,
  Users,
  CalendarBlank,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useT, K } from "@/i18n";
import { auditLogsApi } from "@/lib/api/auditLogs";
import type { AuditLog } from "@/lib/schemas/auditLog.schema";
import { AuditAction } from "@/types/enums";
import { parseApiData } from "@/lib/api/parseResponse";
import {
  auditIconMap,
  auditFallbackIcon,
  formatAuditAction,
  computeChangeSummary,
} from "@/lib/audit-utils";

// ── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 20;

const FILTER_CHIPS: { label: string; value: AuditAction | null }[] = [
  { label: "All", value: null },
  { label: "Status Changed", value: AuditAction.LEAD_STATUS_CHANGED },
  { label: "Verified", value: AuditAction.LEAD_VERIFIED },
  { label: "KB Created", value: AuditAction.KB_CREATED },
  { label: "Config Changed", value: AuditAction.SYSTEM_CONFIG_CHANGED },
  { label: "User Created", value: AuditAction.USER_CREATED },
];

const ROLE_BADGE: Record<string, string> = {
  SUPERADMIN: "bg-crimson/10 text-crimson",
  OWNER: "bg-gold/10 text-gold",
  ADMIN: "bg-info/10 text-info",
  STAFF: "bg-success/10 text-success",
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function buildDiffEntries(
  before: Record<string, unknown> | null | undefined,
  after: Record<string, unknown> | null | undefined,
): { key: string; from: string; to: string }[] {
  if (!before && !after) return [];
  const b = before ?? {};
  const a = after ?? {};
  const allKeys = new Set([...Object.keys(b), ...Object.keys(a)]);
  const entries: { key: string; from: string; to: string }[] = [];
  for (const k of allKeys) {
    const bv = String(b[k] ?? "—");
    const av = String(a[k] ?? "—");
    if (bv !== av) entries.push({ key: k, from: bv, to: av });
  }
  return entries;
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function SkeletonCard({ index }: { index: number }) {
  return (
    <div className="relative flex gap-3 px-4">
      {/* Timeline spine */}
      <div className="flex flex-col items-center pt-1">
        <Skeleton className="w-10 h-10 rounded-full" />
        {index < 3 && (
          <div className="w-px flex-1 bg-border-subtle/40 mt-1" />
        )}
      </div>
      {/* Card skeleton */}
      <div className="flex-1 rounded-xl bg-card border border-border-subtle p-3.5 mb-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-32 rounded-md" />
            <Skeleton className="h-3 w-24 rounded-md" />
          </div>
          <Skeleton className="h-3 w-12 rounded-md" />
        </div>
        <Skeleton className="h-3 w-44 rounded-md mt-2.5" />
      </div>
    </div>
  );
}

function StatsHeader({
  todayCount,
  topAction,
  uniqueActors,
}: {
  todayCount: number;
  topAction: string | null;
  uniqueActors: number;
}) {
  const stats = [
    {
      icon: CalendarBlank,
      label: "Today",
      value: String(todayCount),
      color: "text-text-secondary",
      bg: "bg-elevated",
    },
    {
      icon: Lightning,
      label: "Top Action",
      value: topAction ? formatAuditAction(topAction) : "—",
      color: "text-text-secondary",
      bg: "bg-elevated",
    },
    {
      icon: Users,
      label: "Actors",
      value: String(uniqueActors),
      color: "text-text-secondary",
      bg: "bg-elevated",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 px-4 py-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="flex flex-col items-center gap-1.5 rounded-xl bg-card border border-border-subtle p-2.5"
        >
          <span
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              s.bg,
            )}
          >
            <s.icon size={16} weight="fill" className={s.color} />
          </span>
          <span className="font-mono text-[14px] font-bold text-text-primary leading-none truncate max-w-full">
            {s.value}
          </span>
          <span className="font-sans text-[10px] text-text-muted uppercase tracking-wider">
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Props ────────────────────────────────────────────────────────────────────
export interface MobileAuditLogsProps {}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function MobileAuditLogs({}: MobileAuditLogsProps) {
  const router = useRouter();
  const t = useT();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [actionFilter, setActionFilter] = useState<AuditAction | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchLogs = useCallback(
    async (skip: number, replace: boolean) => {
      try {
        if (replace) setLoading(true);
        else setLoadingMore(true);
        setError(null);

        const params: Record<string, unknown> = { skip, take: PAGE_SIZE };
        if (actionFilter) params.action = actionFilter;

        const { data } = await auditLogsApi.findMany(params as never);
        const items: AuditLog[] = parseApiData<AuditLog[]>(data) ?? [];

        setLogs((prev) => (replace ? items : [...prev, ...items]));
        setHasMore(items.length >= PAGE_SIZE);
      } catch {
        setError("Failed to load audit logs");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [actionFilter],
  );

  useEffect(() => {
    setLogs([]);
    setExpandedId(null);
    fetchLogs(0, true);
  }, [fetchLogs]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) fetchLogs(logs.length, false);
  };

  // ── Derived stats ──────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const todayCount = logs.filter((l) => isToday(l.createdAt)).length;
    const actors = new Set(logs.map((l) => l.userEmail).filter(Boolean));
    const freq: Record<string, number> = {};
    for (const l of logs) {
      freq[l.action] = (freq[l.action] ?? 0) + 1;
    }
    const topAction =
      Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    return { todayCount, uniqueActors: actors.size, topAction };
  }, [logs]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary font-sans">
      <div className="pt-[env(safe-area-inset-top)]" />

      {/* ── Sticky header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border-subtle">
        <div className="flex items-center gap-2.5 px-4 h-[56px]">
          <button
            onClick={() => router.back()}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center -ml-2 rounded-xl active:bg-elevated transition-colors"
          >
            <CaretLeft size={22} weight="bold" className="text-text-primary" />
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-elevated shrink-0">
              <ClipboardText
                size={18}
                weight="fill"
                className="text-text-secondary"
              />
            </span>
            <div className="min-w-0">
              <h1 className="font-sans font-bold text-[17px] text-text-primary leading-tight truncate">
                {t(K.auditLog.title)}
              </h1>
              <p className="font-mono text-[10px] text-text-muted leading-tight">
                {logs.length > 0 ? `${logs.length} entries loaded` : "Activity trail"}
              </p>
            </div>
          </div>
        </div>

        {/* ── Filter chips (horizontal scroll) ────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 pb-3 -mt-0.5">
          {FILTER_CHIPS.map((chip) => {
            const isActive = actionFilter === chip.value;
            return (
              <button
                key={chip.label}
                onClick={() => setActionFilter(chip.value)}
                className={cn(
                  "shrink-0 rounded-full min-h-[32px] px-3.5 font-sans text-[12px] font-semibold transition-all",
                  isActive
                    ? "bg-crimson/15 text-crimson"
                    : "bg-elevated text-text-secondary active:bg-card",
                )}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto pb-[env(safe-area-inset-bottom)]">
        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-2.5 mx-4 mt-3 px-3.5 py-3 rounded-xl bg-danger/10">
            <Warning size={18} weight="fill" className="text-text-secondary shrink-0" />
            <span className="font-sans text-[13px] text-danger flex-1">
              {error}
            </span>
            <button
              onClick={() => fetchLogs(0, true)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg active:bg-danger/10 transition-colors"
            >
              <ArrowCounterClockwise size={18} className="text-text-secondary" />
            </button>
          </div>
        )}

        {/* Skeleton loading */}
        {loading && (
          <div className="pt-3">
            <div className="grid grid-cols-3 gap-2 px-4 pb-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-1.5 rounded-xl bg-card border border-border-subtle p-2.5"
                >
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="h-4 w-8 rounded-md" />
                  <Skeleton className="h-2 w-10 rounded-md" />
                </div>
              ))}
            </div>
            {[0, 1, 2, 3].map((i) => (
              <SkeletonCard key={i} index={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && logs.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 py-24 px-8">
            <span className="w-20 h-20 rounded-2xl bg-elevated flex items-center justify-center">
              <ClipboardText
                size={40}
                weight="duotone"
                className="text-text-muted"
              />
            </span>
            <div className="text-center space-y-1.5">
              <h2 className="font-sans font-bold text-[20px] text-text-primary">
                {t(K.auditLog.empty)}
              </h2>
              <p className="font-sans text-[14px] text-text-muted leading-relaxed max-w-[240px] mx-auto">
                No audit log entries found. Activity will appear here as actions
                are performed.
              </p>
            </div>
            <button
              onClick={() => {
                setActionFilter(null);
                fetchLogs(0, true);
              }}
              className="mt-2 min-h-[44px] px-5 rounded-full bg-elevated font-sans text-[13px] font-semibold text-text-secondary active:bg-card transition-colors"
            >
              Refresh
            </button>
          </div>
        )}

        {/* Stats header + timeline */}
        {!loading && logs.length > 0 && (
          <>
            <StatsHeader
              todayCount={stats.todayCount}
              topAction={stats.topAction}
              uniqueActors={stats.uniqueActors}
            />

            {/* ── Timeline feed ──────────────────────────────────────── */}
            <div className="relative">
              {logs.map((log, idx) => {
                const Icon =
                  auditIconMap[log.action] ?? auditFallbackIcon;
                const isExpanded = expandedId === log.id;
                const diffEntries = isExpanded
                  ? buildDiffEntries(log.before, log.after)
                  : [];
                const isLast = idx === logs.length - 1;

                return (
                  <div key={log.id} className="relative flex gap-3 px-4">
                    {/* ── Timeline spine ───────────────────────────── */}
                    <div className="flex flex-col items-center pt-1 shrink-0">
                      <span className="w-10 h-10 rounded-full flex items-center justify-center ring-[3px] ring-background z-10 bg-elevated">
                        <Icon
                          size={18}
                          weight="fill"
                          className="text-text-secondary"
                        />
                      </span>
                      {!isLast && (
                        <div className="w-px flex-1 bg-border-subtle/50 mt-1" />
                      )}
                    </div>

                    {/* ── Event card ───────────────────────────────── */}
                    <button
                      onClick={() =>
                        setExpandedId(isExpanded ? null : log.id)
                      }
                      className={cn(
                        "flex-1 rounded-xl bg-card border border-border-subtle mb-3 text-left transition-all active:scale-[0.98]",
                        isExpanded && "bg-elevated",
                      )}
                    >
                      <div className="p-3.5">
                        {/* Top row */}
                        <div className="flex items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-sans font-semibold text-[14px] text-text-primary leading-snug">
                              {formatAuditAction(log.action)}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              <span className="font-sans text-[12px] text-text-secondary truncate max-w-[160px]">
                                {log.userEmail ?? t(K.auditLog.system)}
                              </span>
                              {log.userRole && (
                                <span
                                  className={cn(
                                    "font-mono text-[10px] px-1.5 py-0.5 rounded-full font-semibold leading-none",
                                    ROLE_BADGE[log.userRole] ??
                                      "bg-elevated text-text-muted",
                                  )}
                                >
                                  {log.userRole}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                            <span className="font-mono text-[11px] text-text-muted">
                              {timeAgo(log.createdAt)}
                            </span>
                            <CaretDown
                              size={14}
                              weight="bold"
                              className={cn(
                                "text-text-muted transition-transform duration-200",
                                isExpanded && "rotate-180",
                              )}
                            />
                          </div>
                        </div>

                        {/* Resource line */}
                        {(log.resourceType || log.resourceId) && (
                          <div className="mt-2 flex items-center gap-1 font-mono text-[11px] text-text-muted">
                            <span className="px-1.5 py-0.5 rounded bg-elevated text-text-secondary">
                              {log.resourceType}
                            </span>
                            {log.resourceId && (
                              <span className="opacity-60">
                                #{log.resourceId.slice(0, 8)}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Change summary (collapsed) */}
                        {!isExpanded &&
                          (log.before || log.after) && (
                            <p className="mt-1.5 font-sans text-[12px] text-text-muted truncate">
                              {computeChangeSummary(log.before, log.after)}
                            </p>
                          )}
                      </div>

                      {/* ── Expanded detail ─────────────────────────── */}
                      {isExpanded && (
                        <div className="px-3.5 pb-3.5">
                          <div className="border-t border-border-subtle pt-3 space-y-2">
                            {diffEntries.length > 0 ? (
                              <div className="space-y-1.5">
                                {diffEntries.map((d) => (
                                  <div
                                    key={d.key}
                                    className="flex flex-col gap-0.5 rounded-lg bg-background p-2"
                                  >
                                    <span className="font-mono text-[10px] text-text-muted uppercase tracking-wider">
                                      {d.key}
                                    </span>
                                    <div className="flex items-center gap-1.5 font-mono text-[12px] flex-wrap">
                                      <span className="text-danger line-through opacity-80">
                                        {d.from}
                                      </span>
                                      <span className="text-text-muted">→</span>
                                      <span className="text-success font-semibold">
                                        {d.to}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="rounded-lg bg-background p-2.5">
                                <span className="font-sans text-[12px] text-text-muted">
                                  {computeChangeSummary(
                                    log.before,
                                    log.after,
                                  )}
                                </span>
                              </div>
                            )}

                            {/* Metadata row */}
                            <div className="flex items-center gap-3 pt-1 flex-wrap">
                              {log.ipAddress && (
                                <span className="font-mono text-[10px] text-text-muted px-2 py-1 rounded-full bg-background">
                                  IP {log.ipAddress}
                                </span>
                              )}
                              <span className="font-mono text-[10px] text-text-muted px-2 py-1 rounded-full bg-background">
                                {new Date(log.createdAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* ── Load more ───────────────────────────────────────── */}
            {hasMore && (
              <div className="flex justify-center px-4 pb-6 pt-1">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className={cn(
                    "min-h-[44px] px-6 rounded-full font-sans text-[13px] font-semibold transition-all active:scale-[0.97]",
                    "bg-card border border-border-subtle text-text-secondary",
                    "disabled:opacity-50",
                  )}
                >
                  {loadingMore ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-crimson border-t-transparent rounded-full animate-spin" />
                      <span>Loading…</span>
                    </span>
                  ) : (
                    "Load more"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

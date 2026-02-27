"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ClipboardText,
  ArrowCounterClockwise,
  Warning,
  MagnifyingGlass,
  Hash,
  ChartBar,
  Users,
  Calendar,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { auditLogsApi } from "@/lib/api/auditLogs";
import type { AuditLog } from "@/lib/schemas/auditLog.schema";
import { AuditAction } from "@/types/enums";
import { useT, K } from "@/i18n";

const PAGE_SIZE = 20;

const ALL_ACTIONS = Object.values(AuditAction);

function formatDate(iso: string) {
  const d = new Date(iso);
  return (
    d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) +
    " " +
    d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  );
}

function isToday(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function actionChipClass(action: string): string {
  if (action.endsWith("_CREATED")) return "bg-success/10 text-success border-success/20";
  if (action.endsWith("_DELETED") || action === AuditAction.USER_DEACTIVATED)
    return "bg-danger/10 text-danger border-danger/20";
  if (
    action.endsWith("_UPDATED") ||
    action.endsWith("_CHANGED") ||
    action === AuditAction.USER_REACTIVATED ||
    action === AuditAction.LEAD_VERIFIED
  )
    return "bg-info/10 text-info border-info/20";
  return "bg-text-muted/10 text-text-secondary border-border-subtle";
}

function formatActionLabel(action: string): string {
  return action.replace(/_/g, " ");
}

function metadataSummary(meta: Record<string, unknown> | null | undefined): string {
  if (!meta) return "—";
  const keys = Object.keys(meta);
  if (keys.length === 0) return "—";
  const first = keys[0];
  const val = meta[first];
  const display = typeof val === "object" ? JSON.stringify(val) : String(val);
  const summary = `${first}: ${display}`;
  return summary.length > 48 ? summary.slice(0, 48) + "…" : summary;
}

export default function AuditLogsPage() {
  const t = useT();
  const [items, setItems] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filterAction, setFilterAction] = useState<string>("");
  const [filterUserId, setFilterUserId] = useState<string>("");

  const load = useCallback(
    async (skip: number, action?: string, userId?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await auditLogsApi.findMany({
          skip,
          take: PAGE_SIZE,
          ...(action ? { action: action as AuditLog["action"] } : {}),
          ...(userId ? { userId } : {}),
        });
        const outer = res.data as unknown as {
          data: { data: AuditLog[]; total?: number } | AuditLog[];
        };
        let arr: AuditLog[];
        let count: number;
        if (Array.isArray(outer.data)) {
          arr = outer.data;
          count = arr.length;
        } else {
          arr = (outer.data as { data: AuditLog[] }).data ?? [];
          count = (outer.data as { total?: number }).total ?? arr.length;
        }
        setItems(arr);
        setTotal(count);
      } catch {
        setError("Failed to load audit logs");
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void load(page * PAGE_SIZE, filterAction, filterUserId);
  }, [page, load, filterAction, filterUserId]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Derived stats from current page data
  const todayCount = useMemo(
    () => items.filter((l) => isToday(l.createdAt)).length,
    [items],
  );

  const mostCommonAction = useMemo(() => {
    if (items.length === 0) return "—";
    const freq: Record<string, number> = {};
    for (const l of items) freq[l.action] = (freq[l.action] ?? 0) + 1;
    const top = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
    return top ? formatActionLabel(top[0]) : "—";
  }, [items]);

  const uniqueActors = useMemo(
    () => new Set(items.map((l) => l.userId ?? "system")).size,
    [items],
  );

  function applyFilters() {
    setPage(0);
    // useEffect will fire due to state changes
  }

  function clearFilters() {
    setFilterAction("");
    setFilterUserId("");
    setPage(0);
  }

  const hasActiveFilters = filterAction !== "" || filterUserId !== "";

  return (
    <div className="space-y-6 animate-in-up">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-text-muted/10 border border-border-subtle flex items-center justify-center flex-shrink-0">
            <ClipboardText size={18} className="text-text-primary" weight="fill" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-text-primary">{t(K.auditLog.title)}</h1>
            <p className="font-sans text-sm text-text-secondary">{t(K.auditLog.subtitle)}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void load(page * PAGE_SIZE, filterAction, filterUserId)}
          disabled={isLoading}
          className="gap-1.5 text-xs"
        >
          <ArrowCounterClockwise size={13} className={isLoading ? "animate-spin" : ""} />
          {t(K.auditLog.refresh)}
        </Button>
      </div>

      {/* ── Stats bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total logs */}
        <div className="bg-elevated rounded-xl border border-border-subtle px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-text-muted/10 flex items-center justify-center flex-shrink-0">
            <Hash size={15} className="text-text-muted" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wider text-text-muted font-sans">{t(K.auditLog.stats.total)}</p>
            <p className="text-lg font-bold text-text-primary font-display leading-tight">{total.toLocaleString()}</p>
          </div>
        </div>

        {/* Today's activity */}
        <div className="bg-elevated rounded-xl border border-border-subtle px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
            <Calendar size={15} className="text-accent" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wider text-text-muted font-sans">{t(K.auditLog.stats.today)}</p>
            <p className="text-lg font-bold text-text-primary font-display leading-tight">{todayCount}</p>
          </div>
        </div>

        {/* Most common action */}
        <div className="bg-elevated rounded-xl border border-border-subtle px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center flex-shrink-0">
            <ChartBar size={15} className="text-info" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wider text-text-muted font-sans">{t(K.auditLog.stats.topAction)}</p>
            <p className="text-xs font-semibold text-text-primary font-sans leading-tight truncate" title={mostCommonAction}>
              {mostCommonAction}
            </p>
          </div>
        </div>

        {/* Unique actors */}
        <div className="bg-elevated rounded-xl border border-border-subtle px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
            <Users size={15} className="text-success" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wider text-text-muted font-sans">{t(K.auditLog.stats.actors)}</p>
            <p className="text-lg font-bold text-text-primary font-display leading-tight">{uniqueActors}</p>
          </div>
        </div>
      </div>

      {/* ── Search + filter bar ── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* User ID search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <MagnifyingGlass
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
          />
          <input
            type="text"
            placeholder={t(K.auditLog.search)}
            value={filterUserId}
            onChange={(e) => setFilterUserId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            className="w-full pl-8 pr-3 py-2 text-xs font-sans rounded-lg bg-elevated border border-border-subtle text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50 transition-colors"
          />
        </div>

        {/* Action filter */}
        <select
          value={filterAction}
          onChange={(e) => { setFilterAction(e.target.value); setPage(0); }}
          className="px-3 py-2 text-xs font-sans rounded-lg bg-elevated border border-border-subtle text-text-primary focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50 transition-colors cursor-pointer"
        >
          <option value="">{t(K.auditLog.allActions)}</option>
          {ALL_ACTIONS.map((a) => (
            <option key={a} value={a}>{formatActionLabel(a)}</option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-2 text-xs font-sans rounded-lg text-text-muted hover:text-text-primary hover:bg-elevated border border-border-subtle transition-colors"
          >
            {t(K.auditLog.clear)}
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm font-sans">
          <Warning size={14} className="flex-shrink-0" />
          {error}
        </div>
      )}

      {/* ── Table ── */}
      <div className="bg-elevated rounded-2xl border border-border-subtle overflow-hidden">
        {isLoading && items.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-text-muted">
            <ClipboardText size={32} className="opacity-20" />
            <p className="font-sans text-sm">{t(K.auditLog.empty)}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="bg-card border-b border-border-subtle">
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-text-muted font-medium">{t(K.auditLog.col.actor)}</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-text-muted font-medium">{t(K.auditLog.col.action)}</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-text-muted font-medium">{t(K.auditLog.col.entity)}</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-text-muted font-medium">{t(K.auditLog.col.details)}</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-text-muted font-medium">{t(K.auditLog.col.timestamp)}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-elevated/80 transition-colors border-b border-border-subtle/50 last:border-0"
                  >
                    {/* Actor */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {log.userId ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-text-muted/10 border border-border-subtle flex items-center justify-center flex-shrink-0">
                            <span className="text-[9px] font-bold text-text-muted uppercase">
                              {log.userId.slice(0, 2)}
                            </span>
                          </div>
                          <span className="text-xs font-mono text-text-secondary">
                            {log.userId.slice(0, 8)}…
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-sans text-text-muted italic">{t(K.auditLog.system)}</span>
                      )}
                    </td>

                    {/* Action chip */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${actionChipClass(log.action)}`}
                      >
                        {formatActionLabel(log.action)}
                      </span>
                    </td>

                    {/* Entity */}
                    <td className="px-4 py-3">
                      {log.resourceType ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium text-text-primary">{log.resourceType}</span>
                          {log.resourceId && (
                            <span className="text-[10px] font-mono text-text-muted">
                              {log.resourceId.slice(0, 8)}…
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-text-muted text-xs">—</span>
                      )}
                    </td>

                    {/* Details (metadata summary) */}
                    <td className="px-4 py-3 max-w-[200px]">
                      <span className="text-[11px] font-mono text-text-muted truncate block" title={
                        log.metadata ? JSON.stringify(log.metadata) : undefined
                      }>
                        {metadataSummary(log.metadata)}
                      </span>
                    </td>

                    {/* Timestamp */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-xs font-mono text-text-muted">{formatDate(log.createdAt)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-border-subtle flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="text-xs"
            >
              {t(K.auditLog.prev)}
            </Button>
            <span className="font-sans text-xs text-text-muted">
              {t(K.auditLog.page)} {page + 1} {t(K.auditLog.of)} {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="text-xs"
            >
              {t(K.auditLog.next)}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}


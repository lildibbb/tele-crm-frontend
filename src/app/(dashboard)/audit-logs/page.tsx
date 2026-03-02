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
  X,
  Copy,
  Check,
  CaretDown,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { auditLogsApi } from "@/lib/api/auditLogs";
import type { AuditLog } from "@/lib/schemas/auditLog.schema";
import { AuditAction } from "@/types/enums";
import { parsePaginatedData } from "@/lib/api/parseResponse";
import { formatDateTime, timeAgo, isToday } from "@/lib/format";
import { roleBadgeCls } from "@/lib/badge-config";
import { useT, K } from "@/i18n";
import {
  auditIconMap,
  auditColorMap,
  auditFallbackIcon,
  formatAuditAction,
  computeChangeSummary,
} from "@/lib/audit-utils";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { MobileAuditLogs } from "@/components/mobile";

const PAGE_SIZE = 20;
const ALL_ACTIONS = Object.values(AuditAction);

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function getInitials(email: string | null | undefined): string {
  if (!email) return "?";
  return email.slice(0, 2).toUpperCase();
}

/* ── Drawer ───────────────────────────────────────────────────────────────── */

function AuditDrawer({ log, onClose }: { log: AuditLog; onClose: () => void }) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  const IconComp = auditIconMap[log.action] ?? auditFallbackIcon;
  const colorCls = auditColorMap[log.action] ?? "text-text-secondary";

  function copyId() {
    if (log.resourceId) {
      void navigator.clipboard.writeText(log.resourceId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const beforeKeys = Object.keys(log.before ?? {});
  const afterKeys = Object.keys(log.after ?? {});
  const diffKeys = [...new Set([...beforeKeys, ...afterKeys])];

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-base/80 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="relative w-[500px] max-w-[100vw] bg-card border-l border-border-subtle flex flex-col overflow-hidden animate-in slide-in-from-right duration-200 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle bg-card flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-elevated border border-border-subtle flex items-center justify-center">
              <IconComp
                size={16}
                weight="duotone"
                className="text-text-secondary"
              />
            </div>
            <div>
              <h3 className="font-sans font-semibold text-[14px] text-text-primary">
                {formatAuditAction(log.action)}
              </h3>
              <p className="text-[11px] text-text-muted font-sans">
                {formatDateTime(log.createdAt)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-elevated transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Actor */}
          <section>
            <p className="text-[10px] uppercase tracking-widest font-medium text-text-muted mb-2">
              {t(K.auditLog.drawer.actor)}
            </p>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-elevated border border-border-subtle">
              <div className="w-9 h-9 rounded-full bg-accent/10 border border-border-subtle flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold">
                  {getInitials(log.userEmail)}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-primary truncate">
                  {log.userEmail ?? t(K.auditLog.system)}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {log.userRole && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${roleBadgeCls(log.userRole)}`}
                    >
                      {log.userRole}
                    </span>
                  )}
                  {log.ipAddress && (
                    <span className="text-[10px] text-text-muted font-mono">
                      {log.ipAddress}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Resource */}
          {log.resourceType && (
            <section>
              <p className="text-[10px] uppercase tracking-widest font-medium text-text-muted mb-2">
                {t(K.auditLog.drawer.resource)}
              </p>
              <div className="flex items-center justify-between p-3 rounded-xl bg-elevated border border-border-subtle">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-text-primary">
                    {log.resourceType}
                  </p>
                  {log.resourceId && (
                    <p className="text-[10px] font-mono text-text-muted break-all">
                      {log.resourceId}
                    </p>
                  )}
                </div>
                {log.resourceId && (
                  <button
                    onClick={copyId}
                    className="ml-2 flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-sans text-text-muted hover:text-text-primary hover:bg-card transition-colors shadow-sm"
                  >
                    {copied ? (
                      <Check size={11} className="text-success" />
                    ) : (
                      <Copy size={11} />
                    )}
                    {copied
                      ? t(K.auditLog.drawer.copied)
                      : t(K.auditLog.drawer.copyId)}
                  </button>
                )}
              </div>
            </section>
          )}

          {/* Before / After diff */}
          {(log.before || log.after) && (
            <section>
              <p className="text-[10px] uppercase tracking-widest font-medium text-text-muted mb-2">
                Diff
              </p>
              <div className="rounded-xl border border-border-subtle overflow-hidden">
                {/* Header row */}
                <div className="grid grid-cols-3 text-[10px] font-semibold uppercase tracking-widest text-text-muted bg-card border-b border-border-subtle shadow-sm">
                  <div className="px-3 py-2">Key</div>
                  <div className="px-3 py-2 border-l border-border-subtle">
                    {t(K.auditLog.drawer.before)}
                  </div>
                  <div className="px-3 py-2 border-l border-border-subtle">
                    {t(K.auditLog.drawer.after)}
                  </div>
                </div>
                {diffKeys.length === 0 ? (
                  <p className="px-3 py-3 text-xs text-text-muted font-sans">
                    {t(K.auditLog.drawer.noChange)}
                  </p>
                ) : (
                  diffKeys.map((k) => {
                    const bv = log.before ? String(log.before[k] ?? "") : "";
                    const av = log.after ? String(log.after[k] ?? "") : "";
                    const changed = bv !== av;
                    return (
                      <div
                        key={k}
                        className={`grid grid-cols-3 text-[11px] font-mono border-b border-border-subtle/50 last:border-0 ${changed ? "bg-warning/5" : ""}`}
                      >
                        <div className="px-3 py-2 text-text-muted">{k}</div>
                        <div
                          className={`px-3 py-2 border-l border-border-subtle/50 ${changed ? "text-danger" : "text-text-secondary"}`}
                        >
                          {bv || "—"}
                        </div>
                        <div
                          className={`px-3 py-2 border-l border-border-subtle/50 ${changed ? "text-success" : "text-text-secondary"}`}
                        >
                          {av || "—"}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default function AuditLogsPage() {
  const isMobile = useIsMobile();
  const t = useT();

  const [items, setItems] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AuditLog | null>(null);

  // Filters
  const [filterAction, setFilterAction] = useState<string>("");
  const [filterEmail, setFilterEmail] = useState<string>("");
  const [filterFrom, setFilterFrom] = useState<string>("");
  const [filterTo, setFilterTo] = useState<string>("");
  const [actionMenuOpen, setActionMenuOpen] = useState(false);

  const load = useCallback(
    async (
      skip: number,
      action?: string,
      email?: string,
      from?: string,
      to?: string,
    ) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await auditLogsApi.findMany({
          skip,
          take: PAGE_SIZE,
          ...(action ? { action: action as AuditLog["action"] } : {}),
          ...(email ? { userEmail: email } : {}),
          ...(from ? { from } : {}),
          ...(to ? { to } : {}),
        });
        const { data: arr, total: count } = parsePaginatedData<AuditLog>(
          res.data,
        );
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
    if (isMobile) return;
    void load(
      page * PAGE_SIZE,
      filterAction,
      filterEmail,
      filterFrom,
      filterTo,
    );
  }, [page, load, filterAction, filterEmail, filterFrom, filterTo, isMobile]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasActiveFilters =
    filterAction !== "" ||
    filterEmail !== "" ||
    filterFrom !== "" ||
    filterTo !== "";

  const todayCount = useMemo(
    () => items.filter((l) => isToday(l.createdAt)).length,
    [items],
  );
  const mostCommonAction = useMemo(() => {
    if (items.length === 0) return "—";
    const freq: Record<string, number> = {};
    for (const l of items) freq[l.action] = (freq[l.action] ?? 0) + 1;
    const top = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
    return top ? formatAuditAction(top[0]) : "—";
  }, [items]);
  const uniqueActors = useMemo(
    () => new Set(items.map((l) => l.userEmail ?? l.userId ?? "system")).size,
    [items],
  );

  if (isMobile) return <MobileAuditLogs />;

  function clearFilters() {
    setFilterAction("");
    setFilterEmail("");
    setFilterFrom("");
    setFilterTo("");
    setPage(0);
  }

  return (
    <div className="space-y-6 animate-in-up">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-text-muted/10 border border-border-subtle flex items-center justify-center flex-shrink-0">
            <ClipboardText
              size={18}
              className="text-text-primary"
              weight="fill"
            />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-text-primary">
              {t(K.auditLog.title)}
            </h1>
            <p className="font-sans text-sm text-text-secondary">
              {t(K.auditLog.subtitle)}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            void load(
              page * PAGE_SIZE,
              filterAction,
              filterEmail,
              filterFrom,
              filterTo,
            )
          }
          disabled={isLoading}
          className="gap-1.5 text-xs"
        >
          <ArrowCounterClockwise
            size={13}
            className={isLoading ? "animate-spin" : ""}
          />
          {t(K.auditLog.refresh)}
        </Button>
      </div>

      {/* ── Stats bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            icon: Hash,
            color: "text-text-muted",
            bg: "bg-elevated",
            label: t(K.auditLog.stats.total),
            value: total.toLocaleString(),
          },
          {
            icon: Calendar,
            color: "text-text-muted",
            bg: "bg-elevated",
            label: t(K.auditLog.stats.today),
            value: String(todayCount),
          },
          {
            icon: ChartBar,
            color: "text-text-muted",
            bg: "bg-elevated",
            label: t(K.auditLog.stats.topAction),
            value: mostCommonAction,
          },
          {
            icon: Users,
            color: "text-text-muted",
            bg: "bg-elevated",
            label: t(K.auditLog.stats.actors),
            value: String(uniqueActors),
          },
        ].map(({ icon: Icon, color, bg, label, value }) => (
          <div
            key={label}
            className="bg-elevated rounded-xl border border-border-subtle shadow-sm px-4 py-3 flex items-center gap-3"
          >
            <div
              className={`w-8 h-8 rounded-lg ${bg} border border-border-subtle flex items-center justify-center flex-shrink-0`}
            >
              <Icon size={15} className={color} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-wider text-text-muted font-sans">
                {label}
              </p>
              <p className="text-sm font-bold text-text-primary font-display leading-tight truncate">
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter bar ── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Email search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <MagnifyingGlass
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
          />
          <input
            type="text"
            placeholder={t(K.auditLog.filter.email)}
            value={filterEmail}
            onChange={(e) => {
              setFilterEmail(e.target.value);
              setPage(0);
            }}
            className="w-full pl-8 pr-3 py-2 text-xs font-sans rounded-lg bg-elevated border border-border-subtle text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50 transition-colors"
          />
        </div>

        {/* Action filter */}
        <div className="relative">
          <button
            onClick={() => setActionMenuOpen((o) => !o)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-sans rounded-lg bg-elevated border border-border-subtle text-text-primary hover:border-accent/50 transition-colors"
          >
            <span>
              {filterAction
                ? formatAuditAction(filterAction)
                : t(K.auditLog.allActions)}
            </span>
            <CaretDown size={11} className="text-text-muted" />
          </button>
          {actionMenuOpen && (
            <div className="absolute top-full left-0 mt-1 z-20 bg-card border border-border-subtle rounded-xl min-w-[200px] py-1 max-h-64 overflow-y-auto shadow-sm">
              <button
                className="w-full text-left px-3 py-1.5 text-xs font-sans text-text-muted hover:bg-elevated hover:text-text-primary transition-colors"
                onClick={() => {
                  setFilterAction("");
                  setActionMenuOpen(false);
                  setPage(0);
                }}
              >
                {t(K.auditLog.allActions)}
              </button>
              {ALL_ACTIONS.map((a) => (
                <button
                  key={a}
                  className={`w-full text-left px-3 py-1.5 text-xs font-sans transition-colors hover:bg-elevated ${filterAction === a ? "text-accent font-semibold" : "text-text-secondary hover:text-text-primary"}`}
                  onClick={() => {
                    setFilterAction(a);
                    setActionMenuOpen(false);
                    setPage(0);
                  }}
                >
                  {formatAuditAction(a)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Date range */}
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={filterFrom}
            onChange={(e) => {
              setFilterFrom(e.target.value);
              setPage(0);
            }}
            className="px-2 py-2 text-xs font-sans rounded-lg bg-elevated border border-border-subtle text-text-primary focus:outline-none focus:ring-1 focus:ring-accent/50 transition-colors"
            title={t(K.auditLog.filter.from)}
          />
          <span className="text-text-muted text-xs font-sans">—</span>
          <input
            type="date"
            value={filterTo}
            onChange={(e) => {
              setFilterTo(e.target.value);
              setPage(0);
            }}
            className="px-2 py-2 text-xs font-sans rounded-lg bg-elevated border border-border-subtle text-text-primary focus:outline-none focus:ring-1 focus:ring-accent/50 transition-colors"
            title={t(K.auditLog.filter.to)}
          />
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-2 text-xs font-sans rounded-lg text-text-muted hover:text-text-primary hover:bg-elevated border border-border-subtle transition-colors"
          >
            <X size={11} />
            {t(K.auditLog.filter.clearAll)}
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
                <tr className="bg-card border-b border-border-subtle shadow-sm">
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-text-muted font-medium">
                    {t(K.auditLog.col.actor)}
                  </th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-text-muted font-medium">
                    {t(K.auditLog.col.action)}
                  </th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-text-muted font-medium">
                    {t(K.auditLog.col.entity)}
                  </th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-text-muted font-medium">
                    {t(K.auditLog.col.change)}
                  </th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-text-muted font-medium">
                    {t(K.auditLog.col.timestamp)}
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((log) => {
                  const IconComp =
                    auditIconMap[log.action] ?? auditFallbackIcon;
                  const colorCls =
                    auditColorMap[log.action] ?? "text-text-secondary";
                  const changeSummary = computeChangeSummary(
                    log.before,
                    log.after,
                  );
                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelected(log)}
                      className="cursor-pointer hover:bg-card/60 transition-colors border-b border-border-subtle/50 last:border-0 shadow-sm"
                    >
                      {/* Actor */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {log.userEmail ? (
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-accent/10 border border-border-subtle flex items-center justify-center flex-shrink-0">
                              <span className="text-[9px] font-bold">
                                {getInitials(log.userEmail)}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-text-primary truncate max-w-[140px]">
                                {log.userEmail}
                              </p>
                              {log.userRole && (
                                <span
                                  className={`text-[8px] font-bold px-1 py-0.5 rounded ${roleBadgeCls(log.userRole)}`}
                                >
                                  {log.userRole}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs font-sans text-text-muted italic">
                            {t(K.auditLog.system)}
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <IconComp
                            size={13}
                            weight="duotone"
                            className={colorCls}
                          />
                          <span className="text-xs font-sans text-text-primary">
                            {formatAuditAction(log.action)}
                          </span>
                        </div>
                      </td>

                      {/* Entity */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {log.resourceType ? (
                          <div>
                            <span className="text-xs font-medium text-text-primary">
                              {log.resourceType}
                            </span>
                            {log.resourceId && (
                              <span className="ml-1.5 text-[10px] font-mono text-text-muted">
                                {log.resourceId.slice(0, 8)}…
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-text-muted text-xs">—</span>
                        )}
                      </td>

                      {/* Change summary */}
                      <td className="px-4 py-3 max-w-[200px]">
                        <span
                          className="text-[11px] font-mono text-text-muted truncate block"
                          title={
                            changeSummary !== "—" ? changeSummary : undefined
                          }
                        >
                          {changeSummary}
                        </span>
                      </td>

                      {/* Timestamp */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className="text-xs font-mono text-text-muted"
                          title={formatDateTime(log.createdAt)}
                        >
                          {timeAgo(log.createdAt)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
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

      {/* ── Drawer ── */}
      {selected && (
        <AuditDrawer log={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

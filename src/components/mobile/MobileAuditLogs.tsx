"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  ClipboardText,
  ArrowCounterClockwise,
  Warning,
  CaretLeft,
  CaretDown,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useT, K } from "@/i18n";
import { auditLogsApi } from "@/lib/api/auditLogs";
import type { AuditLog } from "@/lib/schemas/auditLog.schema";
import { AuditAction } from "@/types/enums";
import {
  auditIconMap,
  auditColorMap,
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
        const items: AuditLog[] = (data as unknown as { data: AuditLog[] }).data ?? [];

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

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen bg-void text-text-primary font-sans">
      <div className="pt-[env(safe-area-inset-top)]" />

      {/* ── Sticky header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 flex items-center gap-2 px-4 h-[52px] bg-base border-b border-border-subtle">
        <button
          onClick={() => router.back()}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center -ml-2"
        >
          <CaretLeft size={20} className="text-text-primary" />
        </button>
        <ClipboardText size={20} className="text-text-primary shrink-0" />
        <span className="font-sans font-semibold text-[17px] text-text-primary truncate">
          {t(K.auditLog.title)}
        </span>
      </header>

      {/* ── Filter chips ──────────────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 pt-3 pb-2">
        {FILTER_CHIPS.map((chip) => {
          const isActive = actionFilter === chip.value;
          return (
            <button
              key={chip.label}
              onClick={() => setActionFilter(chip.value)}
              className={cn(
                "shrink-0 rounded-full h-7 px-3 font-sans text-[12px] font-medium transition-colors",
                isActive
                  ? "bg-crimson-subtle text-crimson"
                  : "bg-card text-text-secondary border border-border-subtle",
              )}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto pt-2 pb-[env(safe-area-inset-bottom)]">
        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-2 mx-4 mb-3 px-3 py-2 rounded-xl bg-danger/10 text-danger text-[13px]">
            <Warning size={16} weight="fill" />
            <span>{error}</span>
            <button
              onClick={() => fetchLogs(0, true)}
              className="ml-auto min-h-[44px] flex items-center"
            >
              <ArrowCounterClockwise size={16} />
            </button>
          </div>
        )}

        {/* Loading spinner */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <span className="w-6 h-6 border-2 border-crimson border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && logs.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center px-8">
            <ClipboardText size={64} weight="fill" className="text-text-muted" />
            <span className="font-display font-bold text-[20px] text-text-primary">
              {t(K.auditLog.empty)}
            </span>
            <span className="font-sans text-[14px] text-text-muted">
              No audit log entries found
            </span>
          </div>
        )}

        {/* Card list */}
        {!loading &&
          logs.map((log) => {
            const Icon = auditIconMap[log.action] ?? auditFallbackIcon;
            const colorCls = auditColorMap[log.action] ?? "text-text-secondary";
            const isExpanded = expandedId === log.id;
            const diffEntries = isExpanded
              ? buildDiffEntries(log.before, log.after)
              : [];

            return (
              <button
                key={log.id}
                onClick={() => setExpandedId(isExpanded ? null : log.id)}
                className="rounded-xl bg-card border border-border-subtle shadow-sm mx-4 mb-3 p-3 w-[calc(100%-2rem)] text-left transition-colors"
              >
                {/* Card header */}
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
                      colorCls.replace("text-", "bg-") + "/10",
                    )}
                  >
                    <Icon size={18} weight="fill" className={colorCls} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-sans font-semibold text-[14px] text-text-primary leading-snug truncate">
                      {formatAuditAction(log.action)}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-sans text-[12px] text-text-secondary truncate max-w-[140px]">
                        {log.userEmail ?? t(K.auditLog.system)}
                      </span>
                      {log.userRole && (
                        <span
                          className={cn(
                            "font-mono text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                            ROLE_BADGE[log.userRole] ?? "bg-card text-text-muted",
                          )}
                        >
                          {log.userRole}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0 gap-0.5">
                    <span className="font-mono text-[11px] text-text-muted">
                      {timeAgo(log.createdAt)}
                    </span>
                    <CaretDown
                      size={14}
                      className={cn(
                        "text-text-muted transition-transform",
                        isExpanded && "rotate-180",
                      )}
                    />
                  </div>
                </div>

                {/* Resource line */}
                {(log.resourceType || log.resourceId) && (
                  <div className="mt-1.5 font-mono text-[11px] text-text-muted truncate pl-[46px]">
                    {log.resourceType}
                    {log.resourceId && (
                      <span className="ml-1 opacity-60">
                        #{log.resourceId.slice(0, 8)}
                      </span>
                    )}
                  </div>
                )}

                {/* Expanded diff */}
                {isExpanded && (
                  <div className="mt-3 pt-2 border-t border-border-subtle pl-[46px]">
                    {diffEntries.length > 0 ? (
                      <div className="space-y-1.5">
                        {diffEntries.map((d) => (
                          <div key={d.key} className="font-mono text-[11px]">
                            <span className="text-text-muted">{d.key}:</span>{" "}
                            <span className="text-danger line-through">
                              {d.from}
                            </span>{" "}
                            <span className="text-text-muted">→</span>{" "}
                            <span className="text-success">{d.to}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="font-sans text-[12px] text-text-muted">
                        {computeChangeSummary(log.before, log.after)}
                      </span>
                    )}
                    {log.ipAddress && (
                      <div className="font-mono text-[10px] text-text-muted mt-2 opacity-60">
                        IP: {log.ipAddress}
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          })}

        {/* Load more */}
        {!loading && hasMore && logs.length > 0 && (
          <div className="flex justify-center px-4 pb-4 pt-1">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="h-10 px-6 rounded-full bg-card border border-border-subtle font-sans text-[13px] font-medium text-text-secondary transition-colors active:bg-elevated disabled:opacity-50"
            >
              {loadingMore ? (
                <span className="w-4 h-4 border-2 border-text-muted border-t-transparent rounded-full animate-spin inline-block" />
              ) : (
                "Load more"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

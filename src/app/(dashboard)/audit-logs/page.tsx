"use client";

import { useCallback, useEffect, useState } from "react";
import { ClipboardText, ArrowCounterClockwise, Warning } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { auditLogsApi } from "@/lib/api/auditLogs";
import type { AuditLog } from "@/lib/schemas/auditLog.schema";

const PAGE_SIZE = 20;

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) +
    " " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function actionBadgeClass(action: string) {
  if (action.startsWith("USER_")) return "badge badge-admin";
  if (action.startsWith("LEAD_")) return "badge badge-new";
  if (action.startsWith("KB_") || action.startsWith("COMMAND_")) return "badge badge-staff";
  return "badge badge-owner";
}

export default function AuditLogsPage() {
  const [items, setItems] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (skip: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await auditLogsApi.findMany({ skip, take: PAGE_SIZE });
      const outer = res.data as unknown as { data: { data: AuditLog[]; total?: number } | AuditLog[] };
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
  }, []);

  useEffect(() => {
    void load(page * PAGE_SIZE);
  }, [page, load]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/20 flex items-center justify-center flex-shrink-0">
            <ClipboardText className="h-5 w-5 text-accent" weight="fill" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-text-primary">Audit Logs</h1>
            <p className="font-sans text-sm text-text-secondary">System-wide action history</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void load(page * PAGE_SIZE)}
          disabled={isLoading}
          className="gap-1.5 text-xs text-text-muted"
        >
          <ArrowCounterClockwise className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm font-sans">
          <Warning className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-elevated rounded-2xl border border-border-subtle overflow-hidden">
        <div className="px-5 py-3 bg-card border-b border-border-subtle flex items-center justify-between">
          <h2 className="font-sans font-semibold text-sm text-text-primary">Events</h2>
          <span className="badge badge-new">{total} total</span>
        </div>

        {isLoading && items.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-text-muted">
            <ClipboardText className="h-8 w-8 opacity-30" />
            <p className="font-sans text-sm">No audit events found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Time</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Action</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Resource</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Actor</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {items.map((log) => (
                  <tr key={log.id} className="hover:bg-card/40 transition-colors">
                    <td className="px-4 py-3 text-text-muted text-xs font-mono whitespace-nowrap">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={actionBadgeClass(log.action)}>
                        {log.action.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-xs">
                      {log.resourceType && (
                        <span className="text-text-primary font-medium">{log.resourceType}</span>
                      )}
                      {log.resourceId && (
                        <span className="ml-1 text-text-muted font-mono text-[10px]">
                          {log.resourceId.slice(0, 8)}…
                        </span>
                      )}
                      {!log.resourceType && <span className="text-text-muted">—</span>}
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-xs font-mono">
                      {log.userId ? log.userId.slice(0, 8) + "…" : <span className="text-text-muted">system</span>}
                    </td>
                    <td className="px-4 py-3 text-text-muted text-xs font-mono">
                      {log.ipAddress ?? "—"}
                    </td>
                  </tr>
                ))}
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
              ← Previous
            </Button>
            <span className="font-sans text-xs text-text-muted">
              Page {page + 1} of {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="text-xs"
            >
              Next →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

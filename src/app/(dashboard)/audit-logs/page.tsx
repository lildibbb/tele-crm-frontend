"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ClipboardText,
  ArrowCounterClockwise,
  Warning,
  UserCircle,
  Key,
  Users,
  BookOpen,
  Command,
  Sliders,
  Robot,
  Megaphone,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { auditLogsApi } from "@/lib/api/auditLogs";
import type { AuditLog } from "@/lib/schemas/auditLog.schema";

const PAGE_SIZE = 20;

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) +
    " " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function ActionIcon({ action }: { action: string }) {
  if (action.startsWith("USER_") || action.startsWith("AUTH_")) return <UserCircle size={13} className="text-info" />;
  if (action.startsWith("LEAD_")) return <Users size={13} className="text-crimson" />;
  if (action.startsWith("KB_")) return <BookOpen size={13} className="text-accent" />;
  if (action.startsWith("COMMAND_")) return <Command size={13} className="text-accent" />;
  if (action.startsWith("SYSTEM_CONFIG")) return <Sliders size={13} className="text-warning" />;
  if (action.startsWith("BOT_")) return <Robot size={13} className="text-success" />;
  if (action.startsWith("BROADCAST_")) return <Megaphone size={13} className="text-crimson" />;
  return <Key size={13} className="text-text-muted" />;
}

function actionPillClass(action: string) {
  if (action.startsWith("USER_") || action.startsWith("AUTH_")) return "bg-info/10 text-info border-info/20";
  if (action.startsWith("LEAD_")) return "bg-crimson/10 text-crimson border-crimson/20";
  if (action.startsWith("KB_") || action.startsWith("COMMAND_")) return "bg-accent/10 text-accent border-accent/20";
  if (action.startsWith("SYSTEM_CONFIG")) return "bg-warning/10 text-warning border-warning/20";
  if (action.startsWith("BOT_")) return "bg-success/10 text-success border-success/20";
  return "bg-elevated text-text-secondary border-border-subtle";
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
    <div className="space-y-6 animate-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
            <ClipboardText size={18} className="text-accent" weight="fill" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-text-primary">Audit Logs</h1>
            <p className="font-sans text-sm text-text-secondary">System-wide action history</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void load(page * PAGE_SIZE)}
          disabled={isLoading}
          className="gap-1.5 text-xs"
        >
          <ArrowCounterClockwise size={13} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm font-sans">
          <Warning size={14} className="flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-base rounded-2xl border border-border-subtle overflow-hidden">
        <div className="px-5 py-3 border-b border-border-subtle flex items-center justify-between">
          <h2 className="font-sans font-semibold text-sm text-text-primary">Events</h2>
          <span className="text-xs font-medium text-text-muted bg-elevated px-2.5 py-0.5 rounded-full border border-border-subtle">
            {total} total
          </span>
        </div>

        {isLoading && items.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-text-muted">
            <ClipboardText size={32} className="opacity-20" />
            <p className="font-sans text-sm">No audit events found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="border-b border-border-subtle bg-elevated/40">
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Time</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Action</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Resource</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Actor</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {items.map((log) => (
                  <tr key={log.id} className="hover:bg-elevated/30 transition-colors">
                    <td className="px-4 py-3 text-text-muted text-xs font-mono whitespace-nowrap">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${actionPillClass(log.action)}`}>
                        <ActionIcon action={log.action} />
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


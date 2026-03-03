"use client";

import { Icon } from "@iconify/react";
import { ArrowClockwise, CheckCircle, XCircle, Clock } from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGoogleAnalyticsStats } from "@/queries/useGoogleAnalyticsQuery";
import type { GoogleOpLog } from "@/lib/api/googleAnalytics";

// ── KPI Tile ──────────────────────────────────────────────────────────────────

function KpiTile({
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
    <div className="page-panel bg-elevated rounded-xl p-4 border border-border-subtle flex items-start gap-3">
      <div className={`p-2 rounded-lg shrink-0 ${accent}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-[11px] text-text-muted font-medium">{label}</p>
        <p className="text-2xl font-bold text-text-primary mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// ── Operation row ─────────────────────────────────────────────────────────────

function OpRow({ op }: { op: GoogleOpLog }) {
  const serviceLabel = op.service === "sheets" ? "Sheets" : "Drive";
  const opLabel = op.operation === "fullSync" ? "Full Sync" : op.operation === "appendRow" ? "Append Row" : "Upload";
  const time = new Date(op.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const date = new Date(op.timestamp).toLocaleDateString([], { month: "short", day: "numeric" });

  return (
    <TableRow>
      <TableCell className="whitespace-nowrap">
        <p className="text-xs text-text-primary">{time}</p>
        <p className="text-[10px] text-text-muted">{date}</p>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5">
          {op.service === "sheets" ? (
            <Icon icon="logos:google-sheets" className="w-3.5 h-3.5 shrink-0" />
          ) : (
            <Icon icon="logos:google-drive" className="w-3.5 h-3.5 shrink-0" />
          )}
          <span className="text-xs text-text-secondary">{serviceLabel}</span>
        </div>
      </TableCell>
      <TableCell className="text-xs text-text-secondary">{opLabel}</TableCell>
      <TableCell>
        {op.status === "ok" ? (
          <span className="inline-flex items-center gap-1 text-[11px] text-success">
            <CheckCircle size={12} weight="fill" /> OK
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] text-danger">
            <XCircle size={12} weight="fill" /> Failed
          </span>
        )}
      </TableCell>
      <TableCell className="text-xs text-text-muted">
        {op.records != null ? op.records.toLocaleString() : "—"}
      </TableCell>
      <TableCell className="text-xs text-text-muted whitespace-nowrap">
        {op.durationMs != null ? `${op.durationMs}ms` : "—"}
      </TableCell>
      <TableCell className="text-[10px] text-danger/70 max-w-[200px] truncate" title={op.errorMessage ?? undefined}>
        {op.errorMessage ?? "—"}
      </TableCell>
    </TableRow>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminGooglePage() {
  const { data, isLoading, error, refetch } = useGoogleAnalyticsStats();

  const stats = data?.stats;
  const ops = data?.recentOps ?? [];
  const totalFailures = (stats?.sheetsSyncFail ?? 0) + (stats?.driveUploadFail ?? 0);
  const totalOps = (stats?.sheetsSyncOk ?? 0) + (stats?.sheetsSyncFail ?? 0) + (stats?.driveUploadOk ?? 0) + (stats?.driveUploadFail ?? 0);

  return (
    <div className="space-y-6 animate-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Google Services</h1>
          <p className="text-sm text-text-secondary mt-1">API usage for Sheets and Drive integrations</p>
        </div>
        <button
          onClick={() => void refetch()}
          className="p-1.5 rounded-md text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowClockwise size={15} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-xs">{error instanceof Error ? error.message : String(error)}</div>
      )}

      {/* KPI Tiles */}
      {isLoading && !data ? (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiTile
            label="Sheets Syncs"
            value={(stats?.sheetsSyncOk ?? 0).toLocaleString()}
            icon={<Icon icon="logos:google-sheets" className="w-5 h-5" />}
            accent="bg-emerald-500/10"
          />
          <KpiTile
            label="Drive Uploads"
            value={(stats?.driveUploadOk ?? 0).toLocaleString()}
            icon={<Icon icon="logos:google-drive" className="w-5 h-5" />}
            accent="bg-blue-500/10"
          />
          <KpiTile
            label="Total Operations"
            value={totalOps.toLocaleString()}
            icon={<Clock size={20} weight="duotone" className="text-info" />}
            accent="bg-info/10"
          />
          <KpiTile
            label="Failures"
            value={totalFailures}
            icon={<XCircle size={20} weight="duotone" className={totalFailures > 0 ? "text-danger" : "text-text-muted"} />}
            accent={totalFailures > 0 ? "bg-danger/10" : "bg-elevated"}
          />
        </div>
      )}

      {/* Recent Operations Table */}
      <div className="page-panel bg-elevated rounded-xl overflow-hidden border border-border-subtle">
        <div className="px-5 py-4 bg-card border-b border-border-subtle flex items-center justify-between shadow-sm">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Recent Operations</h2>
            <p className="text-xs text-text-muted mt-0.5">Last {ops.length} API calls, newest first</p>
          </div>
          {ops.length > 0 && (
            <span className="text-[11px] text-text-muted">
              {ops.filter((o) => o.status === "fail").length} failures
            </span>
          )}
        </div>

        {isLoading && !data ? (
          <div className="p-5 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        ) : ops.length === 0 ? (
          <div className="px-5 py-12 text-center text-text-muted text-sm">
            No operations recorded yet. Syncs and uploads will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Operation</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Records</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ops.map((op) => (
                  <OpRow key={op.id} op={op} />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

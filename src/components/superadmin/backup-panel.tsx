"use client";

import { useEffect, useState } from "react";
import { useBackupStore } from "@/store/backupStore";
import { useSystemConfigStore } from "@/store/systemConfigStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Database,
  CheckCircle,
  ArrowClockwise,
  Warning,
  Play,
  Clock,
  HardDrives,
} from "@phosphor-icons/react";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_CONFIG: Record<string, { label: string; cls: string; dot: string }> = {
  success: { label: "Success", cls: "text-success", dot: "bg-success" },
  partial: { label: "Partial", cls: "text-warning", dot: "bg-warning" },
  failed:  { label: "Failed",  cls: "text-danger",  dot: "bg-danger"  },
};

// ── InlineToggle ──────────────────────────────────────────────────────────────

function InlineToggle({
  value,
  onChange,
  disabled,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus-visible:ring-2 ${value ? "bg-crimson" : "bg-border-subtle"} disabled:opacity-50`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${value ? "translate-x-4.5" : "translate-x-0.5"}`}
      />
    </button>
  );
}

// ── BackupPanel ───────────────────────────────────────────────────────────────

export function BackupPanel() {
  const { history, isLoadingHistory, isTriggering, triggerResult, error, fetchHistory, triggerBackup, clearTriggerResult } = useBackupStore();
  const { entries, fetchAll, upsertMany } = useSystemConfigStore();

  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [retentionDraft, setRetentionDraft] = useState("");
  const [configErr, setConfigErr] = useState<string | null>(null);

  useEffect(() => { void fetchAll(); void fetchHistory(); }, [fetchAll, fetchHistory]);

  useEffect(() => {
    if (Object.keys(entries).length === 0) return;
    setRetentionDraft(entries["backup.retentionDays"] ?? "30");
  }, [entries]);

  useEffect(() => {
    if (triggerResult) {
      const t = setTimeout(clearTriggerResult, 4000);
      return () => clearTimeout(t);
    }
  }, [triggerResult, clearTriggerResult]);

  const getVal = (key: string, def = "false") => entries[key] ?? def;

  const saveConfig = async (updates: Record<string, string>) => {
    setIsSavingConfig(true);
    setConfigErr(null);
    try {
      await upsertMany(updates);
      const firstKey = Object.keys(updates)[0];
      setSavedKey(firstKey ?? null);
      setTimeout(() => setSavedKey(null), 2000);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Save failed";
      setConfigErr(msg);
      setTimeout(() => setConfigErr(null), 3000);
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleTrigger = async () => {
    try { await triggerBackup(); void fetchHistory(10); }
    catch { /* error shown from store */ }
  };

  const backupEnabled = getVal("backup.enabled") === "true";
  const schedule = getVal("backup.schedule", "weekly");

  return (
    <div className="page-panel bg-elevated rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-card flex items-center justify-between border-b border-border-subtle shadow-sm">
        <div className="flex items-center gap-2">
          <HardDrives size={16} weight="duotone" className="text-info" />
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Database Backup</h2>
            <p className="text-xs text-text-secondary mt-0.5">pg_dump → encrypted → S3/R2 storage</p>
          </div>
        </div>
        <button onClick={() => void fetchHistory(10)} className="p-1.5 rounded-md text-text-muted hover:text-text-primary transition-colors">
          <ArrowClockwise size={14} className={isLoadingHistory ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="px-5 py-5 space-y-5">
        {/* ① Config row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Enable toggle */}
          <div className="space-y-2">
            <Label className="text-[11px] font-medium text-text-secondary">Enable Backup</Label>
            <div className="flex items-center gap-3">
              <InlineToggle
                value={backupEnabled}
                onChange={(v) => void saveConfig({ "backup.enabled": String(v) })}
                disabled={isSavingConfig}
              />
              <span className="text-xs text-text-muted">{backupEnabled ? "On" : "Off"}</span>
              {savedKey === "backup.enabled" && (
                <CheckCircle size={13} className="text-success" />
              )}
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-medium text-text-secondary flex items-center gap-1">
              <Clock size={11} weight="duotone" /> Schedule
            </Label>
            <div className="flex gap-2">
              <select
                value={schedule}
                onChange={(e) => void saveConfig({ "backup.schedule": e.target.value })}
                disabled={isSavingConfig}
                className="flex-1 h-8 rounded-md border border-input bg-transparent px-2 text-xs text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-crimson/40 disabled:opacity-50"
              >
                <option value="daily">Daily (4 AM)</option>
                <option value="weekly">Weekly (Sun 4 AM)</option>
                <option value="monthly">Monthly (1st, 4 AM)</option>
              </select>
              {savedKey === "backup.schedule" && <CheckCircle size={13} className="text-success self-center" />}
            </div>
          </div>

          {/* Retention */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-medium text-text-secondary">Retention (days)</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                min={1}
                max={365}
                value={retentionDraft}
                onChange={(e) => setRetentionDraft(e.target.value)}
                className="h-8 text-xs w-20"
              />
              <Button
                size="sm"
                variant="outline"
                className={`h-8 px-3 text-xs ${savedKey === "backup.retentionDays" ? "text-success border-success/30" : ""}`}
                disabled={isSavingConfig}
                onClick={() => void saveConfig({ "backup.retentionDays": retentionDraft })}
              >
                {savedKey === "backup.retentionDays" ? "Saved!" : "Save"}
              </Button>
            </div>
          </div>
        </div>

        {configErr && (
          <p className="text-xs text-danger flex items-center gap-1">
            <Warning size={12} /> {configErr}
          </p>
        )}

        {/* ② Manual trigger */}
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={handleTrigger}
            disabled={isTriggering}
            className="h-8 gap-1.5 text-xs"
          >
            <Play size={13} weight="fill" />
            {isTriggering ? "Queuing…" : "Run Backup Now"}
          </Button>
          {triggerResult && (
            <span className="text-xs text-success flex items-center gap-1">
              <CheckCircle size={13} /> {triggerResult}
            </span>
          )}
          {error && (
            <span className="text-xs text-danger flex items-center gap-1">
              <Warning size={13} /> {error}
            </span>
          )}
        </div>

        {/* ③ History table */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted flex items-center gap-1.5">
            <Database size={11} weight="duotone" /> Recent Backups
          </h3>

          {isLoadingHistory ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full rounded-lg" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <p className="text-xs text-text-muted py-4 text-center">No backups yet</p>
          ) : (
            <div className="rounded-lg border border-border-subtle overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border-subtle bg-card shadow-sm">
                    <th className="text-left px-4 py-2.5 font-medium text-text-muted">Filename</th>
                    <th className="text-left px-3 py-2.5 font-medium text-text-muted">Size</th>
                    <th className="text-left px-3 py-2.5 font-medium text-text-muted">Status</th>
                    <th className="text-left px-3 py-2.5 font-medium text-text-muted">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((log, idx) => {
                    const sc = STATUS_CONFIG[log.status] ?? STATUS_CONFIG.failed;
                    return (
                      <tr key={log.id} className={`${idx !== 0 ? "border-t border-border-subtle" : ""} hover:bg-elevated/50`}>
                        <td className="px-4 py-2.5 font-mono text-[10px] text-text-secondary max-w-[200px] truncate">
                          {log.filename}
                        </td>
                        <td className="px-3 py-2.5 text-text-muted">{formatBytes(log.sizeBytes)}</td>
                        <td className="px-3 py-2.5">
                          <span className={`flex items-center gap-1.5 ${sc.cls}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                            {sc.label}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-text-muted whitespace-nowrap">{formatDate(log.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useBackupHistory, useTriggerBackup, useBackupProgress } from "@/queries/useBackupQuery";
import {
  useSystemConfig,
  useUpsertManySystemConfig,
} from "@/queries/useSystemConfigQuery";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Database,
  CheckCircle,
  ArrowClockwise,
  Warning,
  Play,
  Clock,
  HardDrives,
} from "@phosphor-icons/react";
import { BackupProgressCard } from "./backup-progress-card";
import { useT, K } from "@/i18n";

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

const STATUS_CONFIG: Record<
  string,
  { label: string; cls: string; dot: string }
> = {
  success: { label: "Success", cls: "text-success", dot: "bg-success" },
  partial: { label: "Partial", cls: "text-warning", dot: "bg-warning" },
  failed: { label: "Failed", cls: "text-danger", dot: "bg-danger" },
};

// ── BackupPanel ───────────────────────────────────────────────────────────────

export function BackupPanel() {
  const t = useT();
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [historyLimit, setHistoryLimit] = useState(10);
  const {
    data: history = [],
    isLoading: isLoadingHistory,
    refetch: refetchHistory,
  } = useBackupHistory(historyLimit);
  const triggerBackupMutation = useTriggerBackup();
  const { data: entries = {} } = useSystemConfig();
  const upsertMany = useUpsertManySystemConfig();

  const { progress: backupProgress, isConnected: isBackupRunning } = useBackupProgress(
    activeJobId,
    () => {
      void refetchHistory();
      setTimeout(() => setActiveJobId(null), 3000);
    },
  );

  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [retentionDraft, setRetentionDraft] = useState("");
  const [configErr, setConfigErr] = useState<string | null>(null);

  useEffect(() => {
    if (Object.keys(entries).length === 0) return;
    setRetentionDraft(entries["backup.retentionDays"] ?? "30");
  }, [entries]);

  const getVal = (key: string, def = "false") => entries[key] ?? def;

  const saveConfig = async (updates: Record<string, string>) => {
    setIsSavingConfig(true);
    setConfigErr(null);
    try {
      await upsertMany.mutateAsync(updates);
      const firstKey = Object.keys(updates)[0];
      setSavedKey(firstKey ?? null);
      setTimeout(() => setSavedKey(null), 2000);
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? t(K.superadmin.backup.saveFailed);
      setConfigErr(msg);
      setTimeout(() => setConfigErr(null), 3000);
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleTrigger = async () => {
    try {
      const result = await triggerBackupMutation.mutateAsync();
      if (result?.jobId) {
        setActiveJobId(result.jobId);
      }
    } catch {
      /* error in triggerBackupMutation.error */
    }
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
            <h2 className="text-sm font-semibold text-text-primary">
              {t(K.superadmin.backup.header)}
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              {t(K.superadmin.backup.headerDesc)}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-text-muted hover:text-text-primary"
          onClick={() => void refetchHistory()}
        >
          <ArrowClockwise
            size={14}
            className={isLoadingHistory ? "animate-spin" : ""}
          />
        </Button>
      </div>

      <div className="px-5 py-5 space-y-5">
        {/* ① Config row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Enable toggle */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-text-secondary">
              {t(K.superadmin.backup.enableBackup)}
            </Label>
            <div className="flex items-center gap-3">
              <Switch
                checked={backupEnabled}
                onCheckedChange={(v) =>
                  void saveConfig({ "backup.enabled": String(v) })
                }
                disabled={isSavingConfig}
              />
              <span className="text-xs text-text-muted">
                {backupEnabled ? t(K.superadmin.backup.on) : t(K.superadmin.backup.off)}
              </span>
              {savedKey === "backup.enabled" && (
                <CheckCircle size={13} className="text-success" />
              )}
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-text-secondary flex items-center gap-1">
              <Clock size={11} weight="duotone" /> {t(K.superadmin.backup.schedule)}
            </Label>
            <div className="flex gap-2 items-center">
              <Select
                value={schedule}
                onValueChange={(v) => void saveConfig({ "backup.schedule": v })}
                disabled={isSavingConfig}
              >
                <SelectTrigger className="h-8 text-xs flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily" className="text-xs">{t(K.superadmin.backup.dailySchedule)}</SelectItem>
                  <SelectItem value="weekly" className="text-xs">{t(K.superadmin.backup.weeklySchedule)}</SelectItem>
                  <SelectItem value="monthly" className="text-xs">{t(K.superadmin.backup.monthlySchedule)}</SelectItem>
                </SelectContent>
              </Select>
              {savedKey === "backup.schedule" && (
                <CheckCircle size={13} className="text-success shrink-0" />
              )}
            </div>
          </div>

          {/* Retention */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-text-secondary">
              {t(K.superadmin.backup.retentionLabel)}
            </Label>
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
                onClick={() =>
                  void saveConfig({ "backup.retentionDays": retentionDraft })
                }
              >
                {savedKey === "backup.retentionDays" ? t(K.superadmin.backup.saved) : t(K.superadmin.backup.save)}
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
        <div className="flex items-center gap-3 flex-wrap">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                disabled={triggerBackupMutation.isPending || isBackupRunning}
                className="h-8 gap-1.5 text-xs"
              >
                <Play size={13} weight="fill" />
                {triggerBackupMutation.isPending
                  ? t(K.superadmin.backup.queuing)
                  : t(K.superadmin.backup.runNow)}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Run Backup Now?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will queue an immediate database backup. The process runs
                  in the background and may take a few minutes.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => void handleTrigger()}>
                  Run Backup
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          {triggerBackupMutation.error && (
            <span className="text-xs text-danger flex items-center gap-1">
              <Warning size={13} />
              {(triggerBackupMutation.error as Error).message}
            </span>
          )}
        </div>

        {/* ③ Progress card */}
        {activeJobId && backupProgress && (
          <BackupProgressCard
            progress={backupProgress}
            onRetry={() => setActiveJobId(null)}
            onDismiss={() => setActiveJobId(null)}
          />
        )}

        {/* ④ History table */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted flex items-center gap-1.5">
            <Database size={11} weight="duotone" /> {t(K.superadmin.backup.recentBackups)}
          </h3>

          {isLoadingHistory ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full rounded-lg" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <p className="text-xs text-text-muted py-4 text-center">
              {t(K.superadmin.backup.noBackups)}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-card hover:bg-card">
                    <TableHead className="text-xs font-medium text-text-muted">
                      {t(K.superadmin.backup.filename)}
                    </TableHead>
                    <TableHead className="text-xs font-medium text-text-muted">
                      {t(K.superadmin.backup.size)}
                    </TableHead>
                    <TableHead className="text-xs font-medium text-text-muted">
                      {t(K.superadmin.backup.status)}
                    </TableHead>
                    <TableHead className="text-xs font-medium text-text-muted">
                      {t(K.superadmin.backup.created)}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((log) => {
                    const sc =
                      STATUS_CONFIG[log.status] ?? STATUS_CONFIG.failed;
                    return (
                      <TableRow key={log.id} className="hover:bg-elevated/50">
                        <TableCell
                          className="font-mono text-xs text-text-secondary max-w-[200px] truncate cursor-pointer hover:text-text-primary transition-colors"
                          title={`${log.filename} — click to copy`}
                          onClick={() => void navigator.clipboard.writeText(log.filename)}
                        >
                          {log.filename}
                        </TableCell>
                        <TableCell className="text-sm text-text-secondary">
                          {formatBytes(log.sizeBytes)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-medium ${sc.cls}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${sc.dot}`}
                            />
                            {log.status === "success"
                              ? t(K.superadmin.backup.statusSuccess)
                              : log.status === "partial"
                                ? t(K.superadmin.backup.statusPartial)
                                : t(K.superadmin.backup.statusFailed)}
                          </span>
                        </TableCell>
                        <TableCell
                          className="text-xs text-text-secondary whitespace-nowrap"
                          title={new Date(log.createdAt).toLocaleString()}
                        >
                          {formatDate(log.createdAt)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
          {history.length >= historyLimit && historyLimit < 50 && (
            <Button
              size="sm"
              variant="ghost"
              className="w-full text-xs text-text-muted hover:text-text-primary"
              onClick={() => setHistoryLimit((l) => Math.min(l + 15, 50))}
            >
              Load more
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

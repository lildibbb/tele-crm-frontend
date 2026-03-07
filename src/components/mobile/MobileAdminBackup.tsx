"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useBackupHistory, useTriggerBackup } from "@/queries/useBackupQuery";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  HardDrives,
  Play,
  Warning,
  CheckCircle,
  Database,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { BackupStatus } from "@/lib/api/superadmin";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface MobileAdminBackupProps {}

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
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
  BackupStatus,
  { label: string; dot: string; badge: string }
> = {
  success: {
    label: "Success",
    dot: "bg-success",
    badge: "bg-success/10 text-success border-success/20",
  },
  partial: {
    label: "Partial",
    dot: "bg-warning",
    badge: "bg-warning/10 text-warning border-warning/20",
  },
  failed: {
    label: "Failed",
    dot: "bg-danger",
    badge: "bg-danger/10 text-danger border-danger/20",
  },
};

// ── Component ──────────────────────────────────────────────────────────────────
export default function MobileAdminBackup(_props: MobileAdminBackupProps) {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user?.role !== "SUPERADMIN") router.replace("/");
  }, [user, router]);

  const { data: history = [], isLoading } = useBackupHistory(10);
  const triggerMutation = useTriggerBackup();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [triggerResult, setTriggerResult] = useState<string | null>(null);

  if (user?.role !== "SUPERADMIN") return <div />;

  const handleTrigger = async () => {
    setConfirmOpen(false);
    try {
      await triggerMutation.mutateAsync();
      setTriggerResult("Backup queued successfully");
      setTimeout(() => setTriggerResult(null), 4000);
    } catch {
      // error surfaced via triggerMutation.error
    }
  };

  return (
    <div className="min-h-full bg-void pb-8">
      <div className="px-4 py-4 space-y-4">
        {/* Create backup button */}
        <button
          onClick={() => setConfirmOpen(true)}
          disabled={triggerMutation.isPending}
          className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl bg-crimson text-white font-sans font-semibold text-[14px] active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          {triggerMutation.isPending ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Backup Running…
            </>
          ) : (
            <>
              <Play size={16} weight="fill" />
              Create Backup
            </>
          )}
        </button>

        {/* Success notice */}
        {triggerResult && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-success/10 border border-success/20">
            <CheckCircle
              size={16}
              className="text-success shrink-0"
              weight="fill"
            />
            <p className="font-sans text-[13px] text-success font-medium">
              {triggerResult}
            </p>
          </div>
        )}

        {/* Error notice */}
        {triggerMutation.error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-danger/10 border border-danger/20">
            <Warning size={16} className="text-danger shrink-0" weight="fill" />
            <p className="font-sans text-[13px] text-danger font-medium">
              {(triggerMutation.error as Error).message}
            </p>
          </div>
        )}

        {/* History list */}
        <p className="font-sans text-[11px] font-bold text-text-muted uppercase tracking-[0.08em] px-1">
          Backup History
        </p>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl bg-card border border-border-subtle p-4 space-y-2"
              >
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="rounded-2xl bg-card border border-border-subtle p-8 text-center">
            <Database size={28} className="text-text-muted mx-auto mb-2" />
            <p className="font-sans text-[13px] text-text-muted">
              No backups yet
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((log) => {
              const sc = STATUS_CONFIG[log.status] ?? STATUS_CONFIG.failed;
              return (
                <div
                  key={log.id}
                  className="rounded-2xl bg-card border border-border-subtle p-4 shadow-[var(--shadow-card)]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-[12px] text-text-primary truncate">
                        {log.filename}
                      </p>
                      <p className="font-sans text-[11px] text-text-muted mt-0.5">
                        {formatDate(log.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                          sc.badge,
                        )}
                      >
                        <span
                          className={cn("w-1.5 h-1.5 rounded-full", sc.dot)}
                        />
                        {sc.label}
                      </span>
                      <span className="font-mono text-[11px] text-text-muted">
                        {formatBytes(log.sizeBytes)}
                      </span>
                    </div>
                  </div>
                  {log.error && (
                    <p className="mt-2 font-sans text-[11px] text-danger bg-danger/10 px-2 py-1.5 rounded-lg">
                      {log.error}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation sheet */}
      <Sheet
        open={confirmOpen}
        onOpenChange={(v) => !v && setConfirmOpen(false)}
      >
        <SheetContent
          side="bottom"
          className="p-0 border-t border-border-subtle rounded-t-[20px] bg-base focus:outline-none"
        >
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-8 h-1 rounded-full bg-border-default" />
          </div>
          <div className="px-5 pb-4 pt-2 space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-info/10 shrink-0">
                <HardDrives size={24} className="text-info" weight="duotone" />
              </span>
              <div>
                <p className="font-sans font-semibold text-[16px] text-text-primary">
                  Create Backup
                </p>
                <p className="font-sans text-[12px] text-text-muted mt-0.5">
                  Queue an immediate database backup
                </p>
              </div>
            </div>
            <p className="font-sans text-[13px] text-text-secondary">
              A pg_dump will be taken, encrypted, and uploaded to your
              configured storage destinations.
            </p>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setConfirmOpen(false)}
                className="flex-1 h-12 rounded-2xl bg-elevated text-text-secondary font-sans font-semibold text-[14px] active:scale-[0.98] transition-transform"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleTrigger()}
                className="flex-1 h-12 rounded-2xl bg-crimson text-white font-sans font-semibold text-[14px] active:scale-[0.98] transition-transform"
              >
                Run Backup
              </button>
            </div>
          </div>
          <div style={{ height: "max(16px, env(safe-area-inset-bottom))" }} />
        </SheetContent>
      </Sheet>
    </div>
  );
}

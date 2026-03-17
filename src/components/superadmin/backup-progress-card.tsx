"use client";

import { CircleNotch, CheckCircle, XCircle } from "@phosphor-icons/react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import type { BackupProgress } from "@/queries/useBackupQuery";

interface BackupProgressCardProps {
  progress: BackupProgress;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function BackupProgressCard({
  progress,
  onRetry,
  onDismiss,
}: BackupProgressCardProps) {
  const isDone = progress.stage === "done";
  const isFailed = progress.stage === "failed";
  const isActive = !isDone && !isFailed;

  return (
    <div className="rounded-lg border border-border-subtle bg-card px-4 py-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isActive && (
            <CircleNotch
              size={15}
              weight="bold"
              className="animate-spin text-info shrink-0"
            />
          )}
          {isDone && (
            <CheckCircle
              size={15}
              weight="fill"
              className="text-success shrink-0"
            />
          )}
          {isFailed && (
            <XCircle
              size={15}
              weight="fill"
              className="text-danger shrink-0"
            />
          )}
          <span className="text-xs font-medium text-text-primary">
            {progress.label}
          </span>
        </div>
        <span className="text-xs text-text-muted tabular-nums">
          {progress.pct}%
        </span>
      </div>

      <Progress value={progress.pct} className="h-1.5" />

      {isFailed && progress.error && (
        <p className="text-xs text-danger mt-1">{progress.error}</p>
      )}

      {(isDone || isFailed) && (
        <div className="flex gap-2 pt-1">
          {isFailed && onRetry && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={onRetry}
            >
              Retry
            </Button>
          )}
          {onDismiss && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs"
              onClick={onDismiss}
            >
              Dismiss
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

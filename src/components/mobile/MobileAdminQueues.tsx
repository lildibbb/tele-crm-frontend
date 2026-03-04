"use client";

import React, { useState } from "react";
import {
  ArrowsClockwise,
  Trash,
  Queue,
  ArrowCounterClockwise,
  Warning,
} from "@phosphor-icons/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { superadminApi } from "@/lib/api/superadmin";
import type { QueueJobCount } from "@/lib/api/superadmin";
import { queryKeys } from "@/queries/queryKeys";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface MobileAdminQueuesProps {}

type ConfirmAction = { type: "retry" | "purge"; queue: QueueJobCount };

// ── Helpers ───────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-card border border-border-subtle p-4 space-y-3">
      <Skeleton className="h-4 w-32 rounded-md" />
      <div className="grid grid-cols-4 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10 rounded-xl" />
        ))}
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 flex-1 rounded-xl" />
        <Skeleton className="h-9 flex-1 rounded-xl" />
      </div>
    </div>
  );
}

// ── Queue Card ────────────────────────────────────────────────────────────────

function QueueCard({
  queue,
  onAction,
  isPending,
}: {
  queue: QueueJobCount;
  onAction: (action: ConfirmAction) => void;
  isPending: boolean;
}) {
  const stats = [
    { label: "Waiting", value: queue.waiting, color: "text-text-secondary" },
    { label: "Active", value: queue.active, color: queue.active > 0 ? "text-info" : "text-text-secondary" },
    { label: "Done", value: queue.completed, color: "text-success" },
    { label: "Failed", value: queue.failed, color: queue.failed > 0 ? "text-danger" : "text-text-secondary" },
  ];

  return (
    <div className="rounded-2xl bg-card border border-border-subtle p-4 shadow-[var(--shadow-card)] space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="w-8 h-8 rounded-xl bg-elevated flex items-center justify-center shrink-0">
          <Queue size={16} weight="fill" className="text-text-secondary" />
        </span>
        <p className="font-mono font-semibold text-[13px] text-text-primary truncate flex-1">
          {queue.name}
        </p>
        {queue.failed > 0 && (
          <Badge variant="destructive" className="text-[10px] px-2 py-0.5 shrink-0">
            {queue.failed} failed
          </Badge>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl bg-elevated p-2 text-center"
          >
            <p className={cn("font-display text-[16px] font-bold leading-none", s.color)}>
              {s.value}
            </p>
            <p className="font-sans text-[9px] text-text-muted mt-1 uppercase tracking-wide">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          disabled={queue.failed === 0 || isPending}
          onClick={() => onAction({ type: "retry", queue })}
          className="flex-1 min-h-[36px] flex items-center justify-center gap-1.5 rounded-xl border border-border-default bg-elevated font-sans font-semibold text-[12px] text-text-secondary active:bg-card disabled:opacity-40 transition-colors"
        >
          <ArrowsClockwise size={13} weight="bold" />
          Retry Failed
        </button>
        <button
          disabled={queue.failed === 0 || isPending}
          onClick={() => onAction({ type: "purge", queue })}
          className="flex-1 min-h-[36px] flex items-center justify-center gap-1.5 rounded-xl bg-danger/10 border border-danger/20 font-sans font-semibold text-[12px] text-danger active:bg-danger/20 disabled:opacity-40 transition-colors"
        >
          <Trash size={13} weight="bold" />
          Purge Failed
        </button>
      </div>
    </div>
  );
}

// ── Confirm Sheet ─────────────────────────────────────────────────────────────

function ConfirmSheet({
  action,
  onClose,
  onConfirm,
  isPending,
}: {
  action: ConfirmAction | null;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}) {
  const isRetry = action?.type === "retry";

  return (
    <Sheet open={!!action} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="bottom"
        className="bg-card border-border-subtle rounded-t-3xl pb-safe"
      >
        <SheetHeader className="pb-4">
          <div className="w-10 h-1 rounded-full bg-border-default mx-auto mb-4" />
          <div
            className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3",
              isRetry ? "bg-info/10" : "bg-danger/10",
            )}
          >
            {isRetry ? (
              <ArrowsClockwise size={28} weight="fill" className="text-info" />
            ) : (
              <Trash size={28} weight="fill" className="text-danger" />
            )}
          </div>
          <SheetTitle className="font-display font-bold text-[18px] text-text-primary text-center">
            {isRetry ? "Retry Failed Jobs?" : "Purge Failed Jobs?"}
          </SheetTitle>
          <p className="font-sans text-[13px] text-text-secondary text-center leading-relaxed mt-1">
            {isRetry
              ? `Re-queue all failed jobs in "${action?.queue.name}".`
              : `Permanently delete all failed jobs in "${action?.queue.name}". This cannot be undone.`}
          </p>
        </SheetHeader>

        <div className="flex flex-col gap-3 px-1 pt-2">
          <button
            onClick={onConfirm}
            disabled={isPending}
            className={cn(
              "w-full min-h-[50px] flex items-center justify-center gap-2 rounded-2xl font-sans font-semibold text-[15px] text-white transition-colors disabled:opacity-60",
              isRetry
                ? "bg-info active:bg-info/90"
                : "bg-danger active:bg-danger/90",
            )}
          >
            {isPending ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isRetry ? (
              <>
                <ArrowsClockwise size={18} weight="bold" />
                Retry Jobs
              </>
            ) : (
              <>
                <Trash size={18} weight="bold" />
                Purge Jobs
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="w-full min-h-[50px] flex items-center justify-center rounded-2xl bg-elevated font-sans font-semibold text-[15px] text-text-secondary active:bg-card transition-colors"
          >
            Cancel
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function MobileAdminQueues({}: MobileAdminQueuesProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  // SUPERADMIN guard
  if (user?.role !== "SUPERADMIN") {
    router.replace("/");
    return null;
  }

  const { data, isLoading, refetch } = useQuery({
    queryKey: queryKeys.superadmin.queues(),
    queryFn: () => superadminApi.getQueues(),
    refetchInterval: 30_000,
  });

  const retryMutation = useMutation({
    mutationFn: (name: string) => superadminApi.retryFailed(name),
    onSuccess: (result, name) => {
      toast.success(`Retried ${result.retried} job(s) in "${name}"`);
      queryClient.invalidateQueries({ queryKey: queryKeys.superadmin.queues() });
      setConfirmAction(null);
    },
    onError: () => toast.error("Failed to retry jobs"),
  });

  const purgeMutation = useMutation({
    mutationFn: (name: string) => superadminApi.purgeFailed(name),
    onSuccess: (result, name) => {
      toast.success(`Purged ${result.purged} job(s) from "${name}"`);
      queryClient.invalidateQueries({ queryKey: queryKeys.superadmin.queues() });
      setConfirmAction(null);
    },
    onError: () => toast.error("Failed to purge jobs"),
  });

  const isPending = retryMutation.isPending || purgeMutation.isPending;
  const queues = data?.queues ?? [];
  const totalFailed = queues.reduce((sum, q) => sum + q.failed, 0);

  const handleConfirm = () => {
    if (!confirmAction) return;
    if (confirmAction.type === "retry") {
      retryMutation.mutate(confirmAction.queue.name);
    } else {
      purgeMutation.mutate(confirmAction.queue.name);
    }
  };

  return (
    <div className="flex flex-col pb-6">
      {/* ── Stats bar ──────────────────────────────────────────────── */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between gap-2 rounded-2xl bg-card border border-border-subtle px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-elevated flex items-center justify-center shrink-0">
              <Queue size={18} weight="fill" className="text-text-secondary" />
            </span>
            <div>
              <p className="font-sans font-semibold text-[13px] text-text-primary">
                {isLoading ? "—" : queues.length} queue{queues.length !== 1 ? "s" : ""}
              </p>
              <p className="font-sans text-[11px] text-text-muted">
                {isLoading ? "—" : totalFailed > 0 ? `${totalFailed} failed job(s)` : "No failures"}
              </p>
            </div>
          </div>
          <button
            onClick={() => void refetch()}
            disabled={isLoading}
            className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl bg-elevated active:bg-card transition-colors disabled:opacity-50"
          >
            <ArrowCounterClockwise
              size={16}
              className={cn("text-text-secondary", isLoading && "animate-spin")}
            />
          </button>
        </div>
      </div>

      {/* ── Failed warning ─────────────────────────────────────────── */}
      {!isLoading && totalFailed > 0 && (
        <div className="mx-4 mb-3 flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-danger/8 border border-danger/20">
          <Warning size={16} weight="fill" className="text-danger shrink-0 mt-0.5" />
          <p className="font-sans text-[12px] text-danger leading-relaxed">
            {totalFailed} failed job(s) across {queues.filter((q) => q.failed > 0).length} queue(s). Review and retry or purge.
          </p>
        </div>
      )}

      {/* ── Loading skeletons ──────────────────────────────────────── */}
      {isLoading && (
        <div className="px-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* ── Empty state ────────────────────────────────────────────── */}
      {!isLoading && queues.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 px-6">
          <span className="w-16 h-16 rounded-2xl bg-elevated flex items-center justify-center">
            <Queue size={32} weight="duotone" className="text-text-muted" />
          </span>
          <div className="text-center">
            <p className="font-sans font-semibold text-[16px] text-text-primary">
              No queues
            </p>
            <p className="font-sans text-[13px] text-text-muted mt-1">
              No job queues are registered.
            </p>
          </div>
        </div>
      )}

      {/* ── Queue cards ────────────────────────────────────────────── */}
      {!isLoading && queues.length > 0 && (
        <div className="px-4 space-y-3">
          {queues.map((q) => (
            <QueueCard
              key={q.name}
              queue={q}
              onAction={setConfirmAction}
              isPending={isPending}
            />
          ))}
        </div>
      )}

      {/* ── Confirm sheet ──────────────────────────────────────────── */}
      <ConfirmSheet
        action={confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirm}
        isPending={isPending}
      />
    </div>
  );
}

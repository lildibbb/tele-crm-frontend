"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Megaphone,
  PaperPlaneRight,
  Spinner,
  CheckCircle,
  Warning,
  Clock,
  Users,
  CalendarBlank,
  Image as ImageIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useBroadcastStore } from "@/store/broadcastStore";
import { useMaintenanceStore } from "@/store/maintenanceStore";
import { useT, K } from "@/i18n";
import type { BroadcastStatus } from "@/lib/api/broadcast";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface MobileBroadcastsProps {}

const MAX_MSG_LENGTH = 4096;

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Status Chip ────────────────────────────────────────────────────────────────

const STATUS_MAP: Record<
  BroadcastStatus,
  { label: string; icon: React.ReactNode }
> = {
  QUEUED: {
    label: "Queued",
    icon: <Clock className="h-2.5 w-2.5 text-text-secondary" weight="fill" />,
  },
  SENDING: {
    label: "Sending",
    icon: <Spinner className="h-2.5 w-2.5 text-text-secondary animate-spin" />,
  },
  SENT: {
    label: "Sent",
    icon: <CheckCircle className="h-2.5 w-2.5 text-text-secondary" weight="fill" />,
  },
  FAILED: {
    label: "Failed",
    icon: <Warning className="h-2.5 w-2.5 text-text-secondary" weight="fill" />,
  },
};

function StatusChip({ status }: { status: BroadcastStatus }) {
  const { label, icon } = STATUS_MAP[status] ?? STATUS_MAP.QUEUED;
  return (
    <Badge variant="secondary" className="text-[10px] font-medium gap-1">
      {icon}
      {label}
    </Badge>
  );
}

// ── Skeleton Loading ───────────────────────────────────────────────────────────

function HistorySkeleton() {
  return (
    <div className="flex flex-col gap-3 px-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-xl bg-card border border-border-subtle p-4"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Empty State ────────────────────────────────────────────────────────────────

function EmptyHistory() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center px-8">
      <div className="w-16 h-16 rounded-2xl bg-elevated flex items-center justify-center mb-1">
        <Megaphone size={32} weight="fill" className="text-text-secondary" />
      </div>
      <span className="font-display font-bold text-[17px] text-text-primary">
        No broadcasts yet
      </span>
      <span className="font-sans text-[13px] text-text-muted leading-relaxed max-w-[240px]">
        Compose your first message above to reach all your leads at once.
      </span>
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  value,
  label,
  accentCls,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  accentCls: string;
}) {
  return (
    <div className="bg-card rounded-xl border border-border-subtle p-3 flex items-center gap-2.5">
      <div
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
          accentCls,
        )}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="font-mono text-[17px] font-bold text-text-primary leading-tight">
          {value}
        </p>
        <p className="font-sans text-[10px] text-text-muted truncate">
          {label}
        </p>
      </div>
    </div>
  );
}

// ── Confirmation Bottom Sheet ──────────────────────────────────────────────────

function ConfirmSheet({
  open,
  message,
  photoUrl,
  onConfirm,
  onCancel,
  isSending,
  t,
}: {
  open: boolean;
  message: string;
  photoUrl: string;
  onConfirm: () => void;
  onCancel: () => void;
  isSending: boolean;
  t: (key: string) => string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Sheet */}
      <div className="relative bg-elevated rounded-t-2xl p-5 pb-[calc(24px+env(safe-area-inset-bottom))] animate-in slide-in-from-bottom duration-200">
        {/* Drag handle */}
        <div className="w-10 h-1 rounded-full bg-border-default mx-auto mb-5" />

        {/* Icon + Title */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-elevated flex items-center justify-center">
            <Megaphone size={20} weight="fill" className="text-text-secondary" />
          </div>
          <div>
            <h3 className="font-display font-bold text-[17px] text-text-primary">
              {t(K.broadcast.confirmTitle)}
            </h3>
            <p className="font-sans text-[12px] text-text-secondary">
              {t(K.broadcast.confirmDesc)}
            </p>
          </div>
        </div>

        {/* Preview */}
        <div className="rounded-xl bg-card border border-border-subtle p-3 mb-5">
          <p className="font-sans text-[13px] text-text-primary leading-snug line-clamp-4">
            {message}
          </p>
          {photoUrl.trim() && (
            <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-border-subtle">
              <ImageIcon size={12} className="text-text-muted" />
              <span className="font-sans text-[11px] text-text-muted truncate">
                {t(K.broadcast.photoAttached)}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isSending}
            className="flex-1 min-h-[44px] rounded-xl bg-card border border-border-subtle font-sans font-semibold text-[14px] text-text-primary active:bg-elevated transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isSending}
            className="flex-1 min-h-[44px] rounded-xl bg-crimson font-sans font-semibold text-[14px] text-white flex items-center justify-center gap-2 active:opacity-80 transition-opacity disabled:opacity-50"
          >
            {isSending ? (
              <Spinner className="h-4 w-4 animate-spin" />
            ) : (
              <PaperPlaneRight size={16} weight="fill" />
            )}
            {isSending ? t(K.broadcast.sending) : t(K.broadcast.sendNow)}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function MobileBroadcasts({}: MobileBroadcastsProps) {
  const t = useT();
  const broadcastEnabled = useMaintenanceStore((s) => s.featureFlags.broadcast);

  const {
    message,
    photoUrl,
    history,
    historyTotal,
    isSending,
    isLoadingHistory,
    error,
    lastEnqueued,
    setMessage,
    setPhotoUrl,
    send,
    fetchHistory,
    stopPolling,
    reset,
  } = useBroadcastStore();

  const [showConfirm, setShowConfirm] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const LIMIT = 20;

  useEffect(() => {
    void fetchHistory(historyPage, LIMIT);
    return () => stopPolling();
  }, [historyPage, fetchHistory, stopPolling]);

  const handleSend = useCallback(async () => {
    setShowConfirm(false);
    await send();
    setHistoryPage(1);
  }, [send]);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const { pendingCount, last7Days, totalRecipients } = useMemo(() => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return {
      pendingCount: history.filter(
        (b) => b.status === "QUEUED" || b.status === "SENDING",
      ).length,
      last7Days: history.filter(
        (b) => new Date(b.createdAt).getTime() >= sevenDaysAgo,
      ).length,
      totalRecipients: history.reduce(
        (sum, b) => sum + (b.recipientCount ?? 0),
        0,
      ),
    };
  }, [history]);

  const hasMore = history.length < historyTotal;
  const charRatio = message.length / MAX_MSG_LENGTH;

  return (
    <div className="flex flex-col gap-4 pb-6">
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 pt-2">
        <div className="w-10 h-10 rounded-xl bg-elevated flex items-center justify-center shrink-0">
          <Megaphone size={20} weight="fill" className="text-text-secondary" />
        </div>
        <div>
          <h1 className="font-display font-bold text-[20px] text-text-primary leading-tight">
            {t(K.broadcast.title)}
          </h1>
          <p className="font-sans text-[12px] text-text-secondary">
            {t(K.broadcast.subtitle)}
          </p>
        </div>
      </div>

      {/* ── Alerts ──────────────────────────────────────────────────────────── */}
      {!broadcastEnabled && (
        <div className="mx-4 rounded-xl bg-warning/10 p-3 flex items-start gap-2">
          <Warning size={18} className="text-text-secondary shrink-0 mt-0.5" weight="fill" />
          <p className="font-sans text-[13px] text-warning leading-snug">
            Broadcast feature is currently disabled by your administrator.
          </p>
        </div>
      )}

      {lastEnqueued !== null && lastEnqueued > 0 && (
        <div className="mx-4 rounded-xl bg-success/10 p-3 flex items-start gap-2">
          <CheckCircle size={18} className="text-text-secondary shrink-0 mt-0.5" weight="fill" />
          <p className="font-sans text-[13px] text-success leading-snug">
            {t(K.broadcast.enqueuedFor)} {lastEnqueued} recipients
          </p>
        </div>
      )}

      {error && (
        <div className="mx-4 rounded-xl bg-danger/10 p-3 flex items-start gap-2">
          <Warning size={18} className="text-text-secondary shrink-0 mt-0.5" weight="fill" />
          <p className="font-sans text-[13px] text-danger leading-snug">{error}</p>
        </div>
      )}

      {/* ── Stats Row ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2 px-4">
        <StatCard
          icon={<Megaphone className="h-3.5 w-3.5 text-text-secondary" weight="fill" />}
          value={historyTotal}
          label={t(K.broadcast.stats.total)}
          accentCls="bg-elevated"
        />
        <StatCard
          icon={<Clock className="h-3.5 w-3.5 text-text-secondary" weight="fill" />}
          value={pendingCount}
          label={t(K.broadcast.stats.inProgress)}
          accentCls="bg-elevated"
        />
        <StatCard
          icon={<CalendarBlank className="h-3.5 w-3.5 text-text-secondary" weight="fill" />}
          value={last7Days}
          label={t(K.broadcast.stats.last7d)}
          accentCls="bg-elevated"
        />
      </div>

      {/* ── Compose Card ────────────────────────────────────────────────────── */}
      <div className="mx-4 rounded-xl bg-card border border-border-subtle shadow-sm overflow-hidden">
        <div className="px-4 pt-4 pb-3 border-b border-border-subtle">
          <h2 className="font-display font-bold text-[15px] text-text-primary">
            {t(K.broadcast.compose)}
          </h2>
        </div>

        <div className="p-4 flex flex-col gap-3">
          {/* Textarea */}
          <div className="relative">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t(K.broadcast.messagePlaceholder)}
              disabled={!broadcastEnabled || isSending}
              rows={4}
              maxLength={MAX_MSG_LENGTH}
              className="w-full rounded-lg bg-elevated border border-border-subtle p-3 pb-7 font-sans text-[14px] text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:ring-1 focus:ring-crimson/40 disabled:opacity-50"
            />
            {/* Character count overlay */}
            <div className="absolute bottom-2 right-3 flex items-center gap-2">
              <div className="w-16 h-1 rounded-full bg-border-subtle overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    charRatio > 0.9
                      ? "bg-danger"
                      : charRatio > 0.7
                        ? "bg-warning"
                        : "bg-crimson/60",
                  )}
                  style={{ width: `${Math.min(charRatio * 100, 100)}%` }}
                />
              </div>
              <span
                className={cn(
                  "font-mono text-[10px]",
                  charRatio > 0.9 ? "text-danger" : "text-text-muted",
                )}
              >
                {message.length}/{MAX_MSG_LENGTH}
              </span>
            </div>
          </div>

          {/* Photo URL input */}
          <div className="flex items-center gap-2">
            <ImageIcon size={16} className="text-text-muted shrink-0" />
            <Input
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder={t(K.broadcast.photoUrlPlaceholder)}
              disabled={!broadcastEnabled || isSending}
              className="flex-1 h-9 rounded-lg bg-elevated border border-border-subtle px-3 font-sans text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-crimson/40 disabled:opacity-50"
            />
          </div>
          {photoUrl.trim() && (
            <p className="font-sans text-[11px] text-text-muted pl-6">
              {t(K.broadcast.photoCaption)}
            </p>
          )}

          {/* Send button */}
          <button
            disabled={!message.trim() || isSending || !broadcastEnabled}
            onClick={() => setShowConfirm(true)}
            className={cn(
              "w-full min-h-[44px] rounded-xl font-sans font-semibold text-[14px] flex items-center justify-center gap-2 transition-all",
              message.trim() && broadcastEnabled
                ? "bg-crimson text-white active:opacity-80 shadow-sm shadow-crimson/20"
                : "bg-elevated border border-border-subtle text-text-muted",
            )}
          >
            {isSending ? (
              <Spinner className="h-4 w-4 animate-spin" />
            ) : (
              <PaperPlaneRight size={16} weight="fill" />
            )}
            {isSending ? t(K.broadcast.sending) : t(K.broadcast.send)}
          </button>
        </div>
      </div>

      {/* ── History ──────────────────────────────────────────────────────────── */}
      <div className="px-4 flex items-center justify-between">
        <h2 className="font-display font-bold text-[15px] text-text-primary">
          {t(K.broadcast.history)}
        </h2>
        {historyTotal > 0 && (
          <span className="font-mono text-[11px] text-text-muted">
            {historyTotal} {t(K.broadcast.total)}
          </span>
        )}
      </div>

      {isLoadingHistory && history.length === 0 ? (
        <HistorySkeleton />
      ) : history.length === 0 ? (
        <EmptyHistory />
      ) : (
        <div className="flex flex-col gap-2.5 px-4">
          {history.map((log) => (
            <div
              key={log.id}
              className="rounded-xl bg-card border border-border-subtle shadow-sm p-3.5"
            >
              {/* Top: status + date */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <StatusChip status={log.status} />
                <span className="font-mono text-[10px] text-text-muted">
                  {formatDate(log.sentAt ?? log.createdAt)}
                </span>
              </div>

              {/* Message preview */}
              <p className="font-sans text-[13px] text-text-primary leading-snug line-clamp-2 mb-2.5">
                {log.message}
              </p>

              {/* Bottom meta: recipients + photo indicator */}
              <div className="flex items-center gap-3 pt-2 border-t border-border-subtle">
                <span className="flex items-center gap-1.5 font-sans text-[11px] text-text-secondary">
                  <Users size={13} className="text-text-muted" />
                  {log.recipientCount.toLocaleString()} recipients
                </span>
                {log.photoUrl && (
                  <span className="flex items-center gap-1 font-sans text-[11px] text-text-muted">
                    <ImageIcon size={12} />
                    {t(K.broadcast.photoAttached)}
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* Load more */}
          {hasMore && (
            <button
              onClick={() => setHistoryPage((p) => p + 1)}
              disabled={isLoadingHistory}
              className="w-full min-h-[44px] rounded-xl bg-elevated border border-border-subtle font-sans font-semibold text-[13px] text-text-secondary flex items-center justify-center gap-2 active:bg-card transition-colors disabled:opacity-50"
            >
              {isLoadingHistory && (
                <Spinner className="h-3.5 w-3.5 animate-spin" />
              )}
              {t(K.broadcast.next)}
            </button>
          )}
        </div>
      )}

      {/* ── Confirmation Sheet ──────────────────────────────────────────────── */}
      <ConfirmSheet
        open={showConfirm}
        message={message}
        photoUrl={photoUrl}
        onConfirm={handleSend}
        onCancel={() => setShowConfirm(false)}
        isSending={isSending}
        t={t}
      />
    </div>
  );
}

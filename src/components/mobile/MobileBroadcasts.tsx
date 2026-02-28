"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Megaphone,
  PaperPlaneRight,
  Spinner,
  CheckCircle,
  Warning,
  Clock,
  Users,
  CaretLeft,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useBroadcastStore } from "@/store/broadcastStore";
import { useMaintenanceStore } from "@/store/maintenanceStore";
import { useT, K } from "@/i18n";
import type { BroadcastStatus } from "@/lib/api/broadcast";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface MobileBroadcastsProps {}

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

function StatusChip({ status }: { status: BroadcastStatus }) {
  const map: Record<BroadcastStatus, { label: string; cls: string; icon?: React.ReactNode }> = {
    QUEUED: {
      label: "Queued",
      cls: "bg-warning/10 text-warning border-warning/20",
      icon: <Spinner className="h-2.5 w-2.5 animate-spin" />,
    },
    SENDING: {
      label: "Sending",
      cls: "bg-warning/10 text-warning border-warning/20",
      icon: <Spinner className="h-2.5 w-2.5 animate-spin" />,
    },
    SENT: {
      label: "Sent",
      cls: "bg-success/10 text-success border-success/20",
      icon: <CheckCircle className="h-2.5 w-2.5" weight="fill" />,
    },
    FAILED: {
      label: "Failed",
      cls: "bg-danger/10 text-danger border-danger/20",
      icon: <Warning className="h-2.5 w-2.5" weight="fill" />,
    },
  };
  const { label, cls, icon } = map[status] ?? map.QUEUED;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border",
        cls,
      )}
    >
      {icon}
      {label}
    </span>
  );
}

// ── Empty State ────────────────────────────────────────────────────────────────

function EmptyHistory() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center px-8">
      <Megaphone size={48} weight="fill" className="text-text-muted" />
      <span className="font-display font-bold text-[18px] text-text-primary">
        No broadcasts yet
      </span>
      <span className="font-sans text-[13px] text-text-muted">
        Send your first message above
      </span>
    </div>
  );
}

// ── Confirmation Bottom Sheet ──────────────────────────────────────────────────

function ConfirmSheet({
  open,
  message,
  onConfirm,
  onCancel,
  isSending,
}: {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isSending: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      {/* Sheet */}
      <div className="relative bg-elevated rounded-t-2xl p-5 pb-[calc(20px+env(safe-area-inset-bottom))] animate-in slide-in-from-bottom duration-200">
        <div className="w-10 h-1 rounded-full bg-border-subtle mx-auto mb-4" />
        <h3 className="font-display font-bold text-[17px] text-text-primary mb-1">
          Confirm Broadcast
        </h3>
        <p className="font-sans text-[13px] text-text-secondary mb-4">
          This will send the message to all active leads. This action cannot be undone.
        </p>
        <div className="rounded-lg bg-card border border-border-subtle p-3 mb-5">
          <p className="font-sans text-[13px] text-text-primary line-clamp-3">
            {message}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isSending}
            className="flex-1 h-11 rounded-xl bg-card border border-border-subtle font-sans font-semibold text-[14px] text-text-primary active:bg-elevated transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isSending}
            className="flex-1 h-11 rounded-xl bg-crimson font-sans font-semibold text-[14px] text-white flex items-center justify-center gap-2 active:opacity-80 transition-opacity disabled:opacity-50"
          >
            {isSending ? (
              <Spinner className="h-4 w-4 animate-spin" />
            ) : (
              <PaperPlaneRight size={16} weight="fill" />
            )}
            {isSending ? "Sending…" : "Send Now"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function MobileBroadcasts({}: MobileBroadcastsProps) {
  const router = useRouter();
  const t = useT();
  const broadcastEnabled = useMaintenanceStore((s) => s.featureFlags.broadcast);

  const {
    message,
    history,
    historyTotal,
    isSending,
    isLoadingHistory,
    error,
    lastEnqueued,
    setMessage,
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
  const pendingCount = history.filter(
    (b) => b.status === "QUEUED" || b.status === "SENDING",
  ).length;
  const hasMore = history.length < historyTotal;

  return (
    <div className="flex flex-col min-h-screen bg-void text-text-primary font-sans">
      <div className="pt-[env(safe-area-inset-top)]" />

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 flex items-center h-[52px] px-4 bg-base border-b border-border-subtle">
        <button
          onClick={() => router.back()}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-crimson"
        >
          <CaretLeft size={22} weight="bold" />
        </button>
        <span className="flex-1 text-center font-sans font-semibold text-[17px] text-text-primary">
          {t(K.broadcast.title)}
        </span>
        <div className="min-w-[44px] flex items-center justify-center">
          <Megaphone size={20} className="text-text-muted" weight="fill" />
        </div>
      </header>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto pb-[calc(24px+env(safe-area-inset-bottom))]">
        {/* Feature disabled banner */}
        {!broadcastEnabled && (
          <div className="mx-4 mt-4 rounded-xl bg-warning/10 border border-warning/20 p-3 flex items-start gap-2">
            <Warning size={18} className="text-warning shrink-0 mt-0.5" weight="fill" />
            <p className="font-sans text-[13px] text-warning leading-snug">
              Broadcast feature is currently disabled by your administrator.
            </p>
          </div>
        )}

        {/* Success alert */}
        {lastEnqueued !== null && lastEnqueued > 0 && (
          <div className="mx-4 mt-4 rounded-xl bg-success/10 border border-success/20 p-3 flex items-start gap-2">
            <CheckCircle size={18} className="text-success shrink-0 mt-0.5" weight="fill" />
            <p className="font-sans text-[13px] text-success leading-snug">
              {t(K.broadcast.enqueuedFor)} {lastEnqueued} recipients
            </p>
          </div>
        )}

        {/* Error alert */}
        {error && (
          <div className="mx-4 mt-4 rounded-xl bg-danger/10 border border-danger/20 p-3 flex items-start gap-2">
            <Warning size={18} className="text-danger shrink-0 mt-0.5" weight="fill" />
            <p className="font-sans text-[13px] text-danger leading-snug">{error}</p>
          </div>
        )}

        {/* ── Stats Row ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 px-4 mt-4">
          <div className="bg-elevated rounded-xl border border-border-subtle p-3 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-crimson/10 border border-crimson/20 flex items-center justify-center shrink-0">
              <Megaphone className="h-3.5 w-3.5 text-crimson" weight="fill" />
            </div>
            <div>
              <p className="font-mono text-[16px] font-bold text-text-primary leading-tight">
                {historyTotal}
              </p>
              <p className="font-sans text-[10px] text-text-muted">
                {t(K.broadcast.stats.total)}
              </p>
            </div>
          </div>
          <div className="bg-elevated rounded-xl border border-border-subtle p-3 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-warning/10 border border-warning/20 flex items-center justify-center shrink-0">
              <Clock className="h-3.5 w-3.5 text-warning" weight="fill" />
            </div>
            <div>
              <p className="font-mono text-[16px] font-bold text-text-primary leading-tight">
                {pendingCount}
              </p>
              <p className="font-sans text-[10px] text-text-muted">
                {t(K.broadcast.stats.inProgress)}
              </p>
            </div>
          </div>
        </div>

        {/* ── Compose Card ────────────────────────────────────────────────── */}
        <div className="mx-4 mt-4 rounded-xl bg-card border border-border-subtle shadow-sm p-4">
          <h2 className="font-display font-bold text-[15px] text-text-primary mb-3">
            {t(K.broadcast.compose)}
          </h2>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t(K.broadcast.messagePlaceholder)}
            disabled={!broadcastEnabled || isSending}
            rows={4}
            maxLength={4096}
            className="w-full rounded-lg bg-elevated border border-border-subtle p-3 font-sans text-[14px] text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:ring-1 focus:ring-crimson/40 disabled:opacity-50"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="font-mono text-[11px] text-text-muted">
              {message.length}/4096
            </span>
            <button
              disabled={!message.trim() || isSending || !broadcastEnabled}
              onClick={() => setShowConfirm(true)}
              className={cn(
                "h-9 px-5 rounded-xl font-sans font-semibold text-[13px] flex items-center gap-2 transition-all",
                message.trim() && broadcastEnabled
                  ? "bg-crimson text-white active:opacity-80"
                  : "bg-card border border-border-subtle text-text-muted",
              )}
            >
              {isSending ? (
                <Spinner className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <PaperPlaneRight size={14} weight="fill" />
              )}
              {isSending ? t(K.broadcast.sending) : t(K.broadcast.send)}
            </button>
          </div>
        </div>

        {/* ── History ─────────────────────────────────────────────────────── */}
        <div className="px-4 mt-6 mb-2">
          <h2 className="font-display font-bold text-[15px] text-text-primary">
            {t(K.broadcast.history)}
          </h2>
        </div>

        {isLoadingHistory && history.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="h-6 w-6 text-text-muted animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <EmptyHistory />
        ) : (
          <div className="flex flex-col gap-3 px-4">
            {history.map((log) => (
              <div
                key={log.id}
                className="rounded-xl bg-card border border-border-subtle shadow-sm p-4"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="font-sans text-[13px] text-text-primary leading-snug line-clamp-2 flex-1">
                    {log.message}
                  </p>
                  <StatusChip status={log.status} />
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 font-sans text-[11px] text-text-muted">
                    <Users size={12} />
                    {log.recipientCount}
                  </span>
                  <span className="font-mono text-[11px] text-text-muted">
                    {formatDate(log.sentAt ?? log.createdAt)}
                  </span>
                </div>
              </div>
            ))}

            {/* Load more */}
            {hasMore && (
              <button
                onClick={() => setHistoryPage((p) => p + 1)}
                disabled={isLoadingHistory}
                className="w-full h-10 rounded-xl bg-elevated border border-border-subtle font-sans font-semibold text-[13px] text-text-secondary flex items-center justify-center gap-2 active:bg-card transition-colors disabled:opacity-50 mb-2"
              >
                {isLoadingHistory ? (
                  <Spinner className="h-3.5 w-3.5 animate-spin" />
                ) : null}
                Load more
              </button>
            )}
          </div>
        )}
      </main>

      {/* ── Confirmation Sheet ──────────────────────────────────────────────── */}
      <ConfirmSheet
        open={showConfirm}
        message={message}
        onConfirm={handleSend}
        onCancel={() => setShowConfirm(false)}
        isSending={isSending}
      />
    </div>
  );
}

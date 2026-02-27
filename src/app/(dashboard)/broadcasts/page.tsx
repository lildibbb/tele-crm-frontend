"use client";
import React, { useEffect, useState } from "react";
import {
  Megaphone,
  PaperPlaneRight,
  Image as ImageIcon,
  CheckCircle,
  Clock,
  Warning,
  Spinner,
  Users,
  CalendarBlank,
  HourglassMedium,
} from "@phosphor-icons/react";
import { useBroadcastStore } from "@/store/broadcastStore";
import type { BroadcastStatus } from "@/lib/api/broadcast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useT, K } from "@/i18n";
import { useMaintenanceStore } from "@/store/maintenanceStore";
import { FeatureDisabledBanner } from "@/components/maintenance/FeatureDisabledBanner";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusChip({ status }: { status: BroadcastStatus }) {
  const map: Record<BroadcastStatus, { label: string; cls: string }> = {
    QUEUED:  { label: "Queued",  cls: "bg-warning/10 text-warning border-warning/20" },
    SENDING: { label: "Sending", cls: "bg-warning/10 text-warning border-warning/20" },
    SENT:    { label: "Sent",    cls: "bg-success/10 text-success border-success/20" },
    FAILED:  { label: "Failed",  cls: "bg-danger/10 text-danger border-danger/20" },
  };
  const { label, cls } = map[status] ?? map.QUEUED;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cls}`}>
      {(status === "QUEUED" || status === "SENDING") && (
        <Spinner className="h-2.5 w-2.5 animate-spin" />
      )}
      {label}
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BroadcastsPage() {
  const broadcastEnabled = useMaintenanceStore((s) => s.featureFlags.broadcast);
  const isBlocked = !broadcastEnabled;
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

  const t = useT();
  const [showConfirm, setShowConfirm] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);

  useEffect(() => {
    void fetchHistory(historyPage);
    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyPage]);

  const handleSend = async () => {
    setShowConfirm(false);
    await send();
    setHistoryPage(1);
  };

  // ── Derived stats ──────────────────────────────────────────────────────────
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const last7Days = history.filter((b) => new Date(b.createdAt).getTime() >= sevenDaysAgo).length;
  const pendingCount = history.filter((b) => b.status === "QUEUED" || b.status === "SENDING").length;
  const totalRecipients = history.reduce((sum, b) => sum + (b.recipientCount ?? 0), 0);

  const totalPages = Math.ceil(historyTotal / 20);

  return (
    <div className="space-y-6 animate-in-up">
      {!broadcastEnabled && (
        <FeatureDisabledBanner feature="Broadcast Messages" />
      )}

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-crimson/10 border border-crimson/20 flex items-center justify-center flex-shrink-0">
          <Megaphone className="h-5 w-5 text-crimson" weight="fill" />
        </div>
        <div>
          <h1 className="font-display font-bold text-xl text-text-primary">{t(K.broadcast.title)}</h1>
          <p className="font-sans text-sm text-text-secondary">
            {t(K.broadcast.subtitle)}
          </p>
        </div>
      </div>

      {/* ── Stats bar ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            icon: <Megaphone className="h-4 w-4 text-crimson" />,
            label: t(K.broadcast.stats.total),
            value: historyTotal,
            bg: "bg-crimson/10 border-crimson/20",
          },
          {
            icon: <CalendarBlank className="h-4 w-4 text-indigo-500" />,
            label: t(K.broadcast.stats.last7d),
            value: last7Days,
            bg: "bg-indigo-500/10 border-indigo-500/20",
          },
          {
            icon: <HourglassMedium className="h-4 w-4 text-warning" />,
            label: t(K.broadcast.stats.inProgress),
            value: pendingCount,
            bg: "bg-warning/10 border-warning/20",
          },
          {
            icon: <Users className="h-4 w-4 text-success" />,
            label: t(K.broadcast.stats.recipients),
            value: totalRecipients.toLocaleString(),
            bg: "bg-success/10 border-success/20",
          },
        ].map(({ icon, label, value, bg }) => (
          <div
            key={label}
            className="bg-elevated rounded-2xl border border-border-subtle p-4 flex items-center gap-3"
          >
            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 ${bg}`}>
              {icon}
            </div>
            <div className="min-w-0">
              <p className="font-sans text-[11px] text-text-muted truncate">{label}</p>
              <p className="font-display font-bold text-base text-text-primary leading-tight">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-2xl space-y-6">

        {/* ── Compose card ─────────────────────────────────────────────────── */}
        <div className="bg-elevated rounded-2xl border border-border-subtle overflow-hidden">
          <div className="px-5 py-4 bg-card border-b border-border-subtle">
            <h2 className="font-sans font-semibold text-sm text-text-primary">{t(K.broadcast.compose)}</h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="font-sans text-xs font-medium text-text-secondary uppercase tracking-wider">
                {t(K.broadcast.message)} <span className="text-crimson">*</span>
              </label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t(K.broadcast.messagePlaceholder)}
                rows={4}
                maxLength={4096}
                className="resize-none text-sm"
              />
              <p className="font-sans text-[11px] text-text-muted text-right">
                {message.length} / 4096
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="font-sans text-xs font-medium text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5" /> {t(K.broadcast.photoUrl)}
                <span className="normal-case font-normal text-text-muted">{t(K.broadcast.photoUrlOptional)}</span>
              </label>
              <Input
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder={t(K.broadcast.photoUrlPlaceholder)}
                className="text-sm font-mono"
              />
              <p className="font-sans text-[11px] text-text-muted">
                {t(K.broadcast.photoCaption)}
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm font-sans">
                <Warning className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {lastEnqueued !== null && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/20 text-success text-sm font-sans">
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                {t(K.broadcast.enqueuedFor)} <strong>{lastEnqueued}</strong> recipient(s)
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={reset}
                className="text-text-muted hover:text-text-primary text-xs"
                disabled={isSending}
              >
                {t(K.broadcast.clear)}
              </Button>
              <Button
                onClick={() => setShowConfirm(true)}
                disabled={!message.trim() || isSending}
                className="gap-2 bg-crimson hover:bg-crimson/90 text-white text-sm"
              >
                {isSending ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    {t(K.broadcast.sending)}
                  </>
                ) : (
                  <>
                    <PaperPlaneRight className="h-4 w-4" />
                    {t(K.broadcast.send)}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* ── History table ─────────────────────────────────────────────────── */}
        <div className="bg-elevated rounded-2xl border border-border-subtle overflow-hidden">
          <div className="px-5 py-4 bg-card border-b border-border-subtle flex items-center justify-between">
            <h2 className="font-sans font-semibold text-sm text-text-primary">{t(K.broadcast.history)}</h2>
            <span className="font-mono text-xs text-text-muted">{historyTotal} {t(K.broadcast.total)}</span>
          </div>

          {isLoadingHistory && history.length === 0 ? (
            <div className="flex items-center justify-center py-14">
              <div className="w-5 h-5 rounded-full border-2 border-crimson border-t-transparent animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-14 text-text-muted">
              <Megaphone className="h-8 w-8 opacity-25" />
              <p className="font-sans text-sm">{t(K.broadcast.empty)}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border-subtle bg-card">
                    <th className="px-4 py-2.5 font-sans text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                      {t(K.broadcast.col.message)}
                    </th>
                    <th className="px-4 py-2.5 font-sans text-[11px] font-semibold uppercase tracking-wider text-text-muted w-24">
                      {t(K.broadcast.col.status)}
                    </th>
                    <th className="px-4 py-2.5 font-sans text-[11px] font-semibold uppercase tracking-wider text-text-muted w-28 text-right">
                      {t(K.broadcast.col.recipients)}
                    </th>
                    <th className="px-4 py-2.5 font-sans text-[11px] font-semibold uppercase tracking-wider text-text-muted w-44">
                      {t(K.broadcast.col.sentAt)}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item, idx) => (
                    <tr
                      key={item.id}
                      className={`border-b border-border-subtle last:border-0 ${idx % 2 === 1 ? "bg-card/40" : ""}`}
                    >
                      {/* Message */}
                      <td className="px-4 py-3 max-w-0">
                        <p className="font-sans text-sm text-text-primary line-clamp-1">
                          {item.message}
                        </p>
                        {item.photoUrl && (
                          <span className="mt-0.5 inline-flex items-center gap-1 font-sans text-[10px] text-text-muted">
                            <ImageIcon className="h-3 w-3" /> {t(K.broadcast.photoAttached)}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <StatusChip status={item.status} />
                      </td>

                      {/* Recipients */}
                      <td className="px-4 py-3 text-right">
                        <span className="font-mono text-xs text-text-secondary">
                          {item.recipientCount ?? "—"}
                        </span>
                      </td>

                      {/* Sent At */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-text-muted">
                          <Clock className="h-3 w-3 flex-shrink-0" />
                          <span className="font-mono text-xs">
                            {item.sentAt ? formatDate(item.sentAt) : formatDate(item.createdAt)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {historyTotal > 20 && (
            <div className="px-5 py-3 border-t border-border-subtle flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                disabled={historyPage === 1}
                onClick={() => setHistoryPage((p) => p - 1)}
                className="text-xs"
              >
                {t(K.broadcast.prev)}
              </Button>
              <span className="font-sans text-xs text-text-muted">
                {t(K.broadcast.page)} {historyPage} {t(K.broadcast.of)} {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={historyPage >= totalPages}
                onClick={() => setHistoryPage((p) => p + 1)}
                className="text-xs"
              >
                {t(K.broadcast.next)}
              </Button>
            </div>
          )}
        </div>

        {/* ── Confirm Dialog ────────────────────────────────────────────────── */}
        <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
          <DialogContent className="max-w-sm rounded-2xl">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-warning/15 border border-warning/20 flex items-center justify-center flex-shrink-0">
                  <Megaphone className="h-5 w-5 text-warning" weight="fill" />
                </div>
                <DialogTitle className="font-bold text-lg text-text-primary">
                  {t(K.broadcast.confirmTitle)}
                </DialogTitle>
              </div>
              <DialogDescription className="font-sans text-sm text-text-secondary">
                {t(K.broadcast.confirmDesc)}
              </DialogDescription>
            </DialogHeader>
            <div className="my-3 p-3 rounded-xl bg-card border border-border-subtle">
              <p className="font-sans text-sm text-text-primary line-clamp-4">{message}</p>
              {photoUrl && (
                <p className="font-mono text-[11px] text-text-muted mt-1.5 truncate">
                  📎 {photoUrl}
                </p>
              )}
            </div>
            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={() => setShowConfirm(false)} className="flex-1">
                {t(K.common.cancel)}
              </Button>
              <Button
                onClick={() => !isBlocked && void handleSend()}
                disabled={isBlocked}
                className="flex-1 bg-crimson hover:bg-crimson/90 text-white gap-2 disabled:opacity-50"
              >
                <PaperPlaneRight className="h-4 w-4" />
                {t(K.broadcast.sendNow)}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}

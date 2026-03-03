"use client";
import React, { useState } from "react";
import {
  Megaphone,
  PaperPlaneRight,
  Image as ImageIcon,
  CheckCircle,
  Clock,
  Warning,
  Users,
  CalendarBlank,
  HourglassMedium,
} from "@phosphor-icons/react";
import { useBroadcastHistory, useSendBroadcast } from "@/queries/useBroadcastsQuery";
import type { BroadcastStatus } from "@/lib/api/broadcast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useT, K } from "@/i18n";
import { useMaintenanceConfig } from "@/queries/useMaintenanceQuery";
import { FeatureDisabledBanner } from "@/components/maintenance/FeatureDisabledBanner";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { MobileBroadcasts } from "@/components/mobile";
import { BROADCAST_STATUS_BADGE } from "@/lib/badge-config";
import { cn } from "@/lib/utils";

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
  const badgeInfo = BROADCAST_STATUS_BADGE[status];
  const label = badgeInfo
    ? status.charAt(0) + status.slice(1).toLowerCase()
    : status;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold",
        badgeInfo?.cls ?? "bg-muted text-muted-foreground",
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full flex-shrink-0",
          badgeInfo?.dotCls ?? "bg-muted-foreground",
        )}
      />
      {label}
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BroadcastsPage() {
  const isMobile = useIsMobile();
  const { data: maintenanceConfig } = useMaintenanceConfig();
  const broadcastEnabled = maintenanceConfig?.featureFlags.broadcast ?? true;
  const isBlocked = !broadcastEnabled;
  const [message, setMessage] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [lastEnqueued, setLastEnqueued] = useState<number | null>(null);
  const [error, setBroadcastError] = useState<string | null>(null);

  const t = useT();
  const [showConfirm, setShowConfirm] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);

  const { data: historyData, isLoading: isLoadingHistory } = useBroadcastHistory({ page: historyPage });
  const history = historyData?.data ?? [];
  const historyTotal = historyData?.total ?? 0;
  const sendMutation = useSendBroadcast();
  const isSending = sendMutation.isPending;
  const reset = () => { setMessage(""); setPhotoUrl(""); setLastEnqueued(null); setBroadcastError(null); };

  if (isMobile) return <MobileBroadcasts />;

  const handleSend = async () => {
    setShowConfirm(false);
    try {
      const input: { message: string; photoUrl?: string } = { message: message.trim() };
      if (photoUrl.trim()) input.photoUrl = photoUrl.trim();
      const res = await sendMutation.mutateAsync(input);
      const enqueued = (res.data as { data?: { recipientCount?: number } })?.data?.recipientCount ?? 0;
      setLastEnqueued(enqueued);
      setBroadcastError(null);
      setHistoryPage(1);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to send broadcast.";
      setBroadcastError(msg);
    }
  };

  // ── Derived stats ──────────────────────────────────────────────────────────
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const last7Days = history.filter(
    (b) => new Date(b.createdAt).getTime() >= sevenDaysAgo,
  ).length;
  const pendingCount = history.filter(
    (b) => b.status === "QUEUED" || b.status === "SENDING",
  ).length;
  const totalRecipients = history.reduce(
    (sum, b) => sum + (b.recipientCount ?? 0),
    0,
  );

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
          <h1 className="font-display font-bold text-xl text-text-primary">
            {t(K.broadcast.title)}
          </h1>
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
            className="bg-card rounded-xl border border-border p-4 flex items-center gap-3 shadow-sm"
          >
            <div
              className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 ${bg}`}
            >
              {icon}
            </div>
            <div className="min-w-0">
              <p className="font-sans text-[11px] text-muted-foreground truncate">
                {label}
              </p>
              <p className="font-display font-bold text-base text-foreground leading-tight">
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-2xl space-y-6">
        {/* ── Compose card ─────────────────────────────────────────────────── */}
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-border bg-muted/30">
            <h2 className="font-sans font-semibold text-sm text-foreground">
              {t(K.broadcast.compose)}
            </h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="font-sans text-xs font-medium text-muted-foreground">
                {t(K.broadcast.message)} <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t(K.broadcast.messagePlaceholder)}
                rows={4}
                maxLength={4096}
                className="resize-none text-sm"
              />
              <p className="font-sans text-[11px] text-muted-foreground text-right">
                {message.length} / 4096
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="font-sans text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5" /> {t(K.broadcast.photoUrl)}
                <span className="font-normal text-muted-foreground/60">
                  {t(K.broadcast.photoUrlOptional)}
                </span>
              </label>
              <Input
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder={t(K.broadcast.photoUrlPlaceholder)}
                className="text-sm font-mono"
              />
              <p className="font-sans text-[11px] text-muted-foreground">
                {t(K.broadcast.photoCaption)}
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 ring-1 ring-inset ring-red-500/20 text-red-700 dark:text-red-400 text-sm font-sans">
                <Warning className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {lastEnqueued !== null && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 ring-1 ring-inset ring-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm font-sans">
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                {t(K.broadcast.enqueuedFor)} <strong>{lastEnqueued}</strong>{" "}
                recipient(s)
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={reset}
                className="text-muted-foreground hover:text-foreground text-xs"
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
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
            <h2 className="font-sans font-semibold text-sm text-foreground">
              {t(K.broadcast.history)}
            </h2>
            <span className="font-mono text-xs text-muted-foreground">
              {historyTotal} {t(K.broadcast.total)}
            </span>
          </div>

          {isLoadingHistory && history.length === 0 ? (
            <div className="flex items-center justify-center py-14">
              <div className="w-5 h-5 rounded-full border-2 border-crimson border-t-transparent animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-14 text-muted-foreground">
              <Megaphone className="h-8 w-8 opacity-25" />
              <p className="font-sans text-sm">{t(K.broadcast.empty)}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead>{t(K.broadcast.col.message)}</TableHead>
                  <TableHead className="w-28">
                    {t(K.broadcast.col.status)}
                  </TableHead>
                  <TableHead className="w-28 text-right">
                    {t(K.broadcast.col.recipients)}
                  </TableHead>
                  <TableHead className="w-44">
                    {t(K.broadcast.col.sentAt)}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((item) => (
                  <TableRow key={item.id}>
                    {/* Message */}
                    <TableCell className="max-w-0">
                      <p className="font-sans text-sm text-foreground line-clamp-1">
                        {item.message}
                      </p>
                      {item.photoUrl && (
                        <span className="mt-0.5 inline-flex items-center gap-1 font-sans text-[10px] text-muted-foreground">
                          <ImageIcon className="h-3 w-3" />{" "}
                          {t(K.broadcast.photoAttached)}
                        </span>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <StatusChip status={item.status} />
                    </TableCell>

                    {/* Recipients */}
                    <TableCell className="text-right">
                      <span className="font-mono text-xs text-muted-foreground">
                        {item.recipientCount ?? "—"}
                      </span>
                    </TableCell>

                    {/* Sent At */}
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="h-3 w-3 flex-shrink-0" />
                        <span className="font-mono text-xs">
                          {item.sentAt
                            ? formatDate(item.sentAt)
                            : formatDate(item.createdAt)}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {historyTotal > 20 && (
            <div className="px-5 py-3 border-t border-border bg-muted/20 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                disabled={historyPage === 1}
                onClick={() => setHistoryPage((p) => p - 1)}
                className="text-xs"
              >
                {t(K.broadcast.prev)}
              </Button>
              <span className="font-sans text-xs text-muted-foreground">
                {t(K.broadcast.page)} {historyPage} {t(K.broadcast.of)}{" "}
                {totalPages}
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
                <DialogTitle className="font-bold text-lg text-foreground">
                  {t(K.broadcast.confirmTitle)}
                </DialogTitle>
              </div>
              <DialogDescription className="font-sans text-sm text-muted-foreground">
                {t(K.broadcast.confirmDesc)}
              </DialogDescription>
            </DialogHeader>
            <div className="my-3 p-3 rounded-xl bg-muted/50 border border-border">
              <p className="font-sans text-sm text-foreground line-clamp-4">
                {message}
              </p>
              {photoUrl && (
                <p className="font-mono text-[11px] text-muted-foreground mt-1.5 truncate">
                  📎 {photoUrl}
                </p>
              )}
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="ghost"
                onClick={() => setShowConfirm(false)}
                className="flex-1"
              >
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

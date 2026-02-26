"use client";
import React, { useEffect, useState } from "react";
import {
  Megaphone,
  PaperPlaneRight,
  Image as ImageIcon,
  CheckCircle,
  Clock,
  Warning,
} from "@phosphor-icons/react";
import { useBroadcastStore } from "@/store/broadcastStore";
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

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function BroadcastsPage() {
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
    reset,
  } = useBroadcastStore();

  const [showConfirm, setShowConfirm] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);

  useEffect(() => {
    void fetchHistory(historyPage);
  }, [historyPage, fetchHistory]);

  const handleSend = async () => {
    setShowConfirm(false);
    await send();
    void fetchHistory(1);
    setHistoryPage(1);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-crimson/15 border border-crimson/20 flex items-center justify-center flex-shrink-0">
          <Megaphone className="h-5 w-5 text-crimson" weight="fill" />
        </div>
        <div>
          <h1 className="font-display font-bold text-xl text-text-primary">Broadcast</h1>
          <p className="font-sans text-sm text-text-secondary">
            Send a message to all leads with a Telegram account
          </p>
        </div>
      </div>

      {/* Compose Card */}
      <div className="bg-elevated rounded-2xl border border-border-subtle overflow-hidden">
        <div className="px-5 py-4 bg-card border-b border-border-subtle">
          <h2 className="font-sans font-semibold text-sm text-text-primary">Compose Message</h2>
        </div>
        <div className="p-5 space-y-4">
          {/* Message input */}
          <div className="space-y-1.5">
            <label className="font-sans text-xs font-medium text-text-secondary uppercase tracking-wider">
              Message <span className="text-crimson">*</span>
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your broadcast message here…"
              rows={4}
              maxLength={4096}
              className="resize-none text-sm"
            />
            <p className="font-sans text-[11px] text-text-muted text-right">
              {message.length} / 4096
            </p>
          </div>

          {/* Optional photo URL */}
          <div className="space-y-1.5">
            <label className="font-sans text-xs font-medium text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5" /> Photo URL
              <span className="normal-case font-normal text-text-muted">(optional)</span>
            </label>
            <Input
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="text-sm font-mono"
            />
            <p className="font-sans text-[11px] text-text-muted">
              Message will be sent as a photo caption when provided.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm font-sans">
              <Warning className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Success banner */}
          {lastEnqueued !== null && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/20 text-success text-sm font-sans">
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              Broadcast enqueued for <strong>{lastEnqueued}</strong> recipient(s)
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={reset}
              className="text-text-muted hover:text-text-primary text-xs"
              disabled={isSending}
            >
              Clear
            </Button>
            <Button
              onClick={() => setShowConfirm(true)}
              disabled={!message.trim() || isSending}
              className="gap-2 bg-crimson hover:bg-crimson/90 text-white text-sm"
            >
              {isSending ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <PaperPlaneRight className="h-4 w-4" />
                  Send Broadcast
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="bg-elevated rounded-2xl border border-border-subtle overflow-hidden">
        <div className="px-5 py-4 bg-card border-b border-border-subtle flex items-center justify-between">
          <h2 className="font-sans font-semibold text-sm text-text-primary">Broadcast History</h2>
          <span className="badge badge-new">{historyTotal} total</span>
        </div>

        {isLoadingHistory && history.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 rounded-full border-2 border-crimson border-t-transparent animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-text-muted">
            <Megaphone className="h-8 w-8 opacity-30" />
            <p className="font-sans text-sm">No broadcasts sent yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border-subtle">
            {history.map((item) => (
              <div key={item.id} className="px-5 py-3.5 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-crimson/10 border border-crimson/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Megaphone className="h-3.5 w-3.5 text-crimson" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-sm text-text-primary leading-relaxed line-clamp-2">
                    {item.content ?? "(no content)"}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Clock className="h-3 w-3 text-text-muted" />
                    <span className="font-mono text-[11px] text-text-muted">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
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
              Previous
            </Button>
            <span className="font-sans text-xs text-text-muted">
              Page {historyPage} of {Math.ceil(historyTotal / 20)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              disabled={historyPage >= Math.ceil(historyTotal / 20)}
              onClick={() => setHistoryPage((p) => p + 1)}
              className="text-xs"
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-warning/15 border border-warning/20 flex items-center justify-center flex-shrink-0">
                <Megaphone className="h-5 w-5 text-warning" weight="fill" />
              </div>
              <DialogTitle className="font-bold text-lg text-text-primary">
                Confirm Broadcast
              </DialogTitle>
            </div>
            <DialogDescription className="font-sans text-sm text-text-secondary">
              This will send your message to <strong>all leads</strong> with a Telegram account.
              This action cannot be undone.
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
              Cancel
            </Button>
            <Button
              onClick={() => void handleSend()}
              className="flex-1 bg-crimson hover:bg-crimson/90 text-white gap-2"
            >
              <PaperPlaneRight className="h-4 w-4" />
              Send Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

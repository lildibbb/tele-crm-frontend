"use client";
import React, { useCallback, useEffect, useState } from "react";
import {
  Timer,
  Check,
  X,
  Clock,
  Warning,
  ArrowCounterClockwise,
  ArrowClockwise,
  XCircle,
} from "@phosphor-icons/react";
import { followUpsApi } from "@/lib/api/followUps";
import type { FollowUp } from "@/lib/schemas/followUp.schema";
import { FollowUpStatus } from "@/types/enums";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

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

function StatusBadge({ status }: { status: FollowUp["status"] }) {
  const map: Record<string, { label: string; cls: string }> = {
    [FollowUpStatus.PENDING]:   { label: "Pending",   cls: "bg-warning/10 text-warning border-warning/20" },
    [FollowUpStatus.SENT]:      { label: "Sent",      cls: "bg-success/10 text-success border-success/20" },
    [FollowUpStatus.CANCELLED]: { label: "Cancelled", cls: "bg-muted/30 text-text-secondary border-border-subtle" },
  };
  const { label, cls } = map[status] ?? map[FollowUpStatus.PENDING];
  return (
    <span className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full border ${cls}`}>
      {label}
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

type FailedJob = {
  id: string;
  name: string;
  failedReason?: string;
  data?: Record<string, unknown>;
};

export default function FollowUpsPage() {
  const [tab, setTab] = useState<"scheduled" | "failed">("scheduled");
  const [items, setItems] = useState<FollowUp[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<FollowUp | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Failed tab state
  const [failedJobs, setFailedJobs] = useState<FailedJob[]>([]);
  const [isLoadingFailed, setIsLoadingFailed] = useState(false);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const load = useCallback(async (skip: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await followUpsApi.findAll({ skip, take: PAGE_SIZE });
      // Response: { statusCode, message, data: { data: FollowUp[], total: N } }
      const outer = res.data as unknown as { data: { data: FollowUp[]; total?: number } | FollowUp[] };
      let arr: FollowUp[];
      let count: number;
      if (Array.isArray(outer.data)) {
        arr = outer.data;
        count = arr.length;
      } else {
        arr = (outer.data as { data: FollowUp[] }).data ?? [];
        count = (outer.data as { total?: number }).total ?? arr.length;
      }
      setItems(arr);
      setTotal(count);
    } catch {
      setError("Failed to load follow-ups");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(page * PAGE_SIZE);
  }, [page, load]);

  const loadFailed = useCallback(async () => {
    setIsLoadingFailed(true);
    try {
      const res = await followUpsApi.getFailed({ start: 0, end: 49 });
      const jobs = (res.data as unknown as { data?: FailedJob[] }).data ?? [];
      setFailedJobs(jobs);
    } catch {
      setError("Failed to load failed jobs");
    } finally {
      setIsLoadingFailed(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "failed") void loadFailed();
  }, [tab, loadFailed]);

  const handleRetry = async (jobId: string) => {
    setRetryingId(jobId);
    try {
      await followUpsApi.retryJob(jobId);
      setFailedJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch {
      setError("Failed to retry job");
    } finally {
      setRetryingId(null);
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setIsCancelling(true);
    try {
      await followUpsApi.cancel(cancelTarget.id);
      setItems((prev) =>
        prev.map((f) =>
          f.id === cancelTarget.id
            ? { ...f, status: FollowUpStatus.CANCELLED }
            : f,
        ),
      );
    } catch {
      setError("Failed to cancel follow-up");
    } finally {
      setIsCancelling(false);
      setCancelTarget(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/20 flex items-center justify-center flex-shrink-0">
            <Timer className="h-5 w-5 text-accent" weight="fill" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-text-primary">Follow-ups</h1>
            <p className="font-sans text-sm text-text-secondary">
              Scheduled AI messages sent to leads after status changes
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => tab === "scheduled" ? void load(page * PAGE_SIZE) : void loadFailed()}
          disabled={isLoading || isLoadingFailed}
          className="gap-1.5 text-xs text-text-muted"
        >
          <ArrowCounterClockwise className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-card rounded-xl border border-border-subtle w-fit">
        {(["scheduled", "failed"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-xs font-sans font-medium transition-colors ${
              tab === t
                ? "bg-elevated text-text-primary border border-border-subtle shadow-sm"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            {t === "scheduled" ? "Scheduled" : "Failed"}
            {t === "failed" && failedJobs.length > 0 && (
              <span className="ml-1.5 bg-danger text-white text-[9px] px-1.5 py-px rounded-full">{failedJobs.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm font-sans">
          <Warning className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Failed jobs tab */}
      {tab === "failed" && (
        <div className="bg-elevated rounded-2xl border border-border-subtle overflow-hidden">
          <div className="px-5 py-4 bg-card border-b border-border-subtle flex items-center justify-between">
            <h2 className="font-sans font-semibold text-sm text-text-primary">Failed Jobs</h2>
            <span className="badge badge-new">{failedJobs.length} jobs</span>
          </div>
          {isLoadingFailed ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            </div>
          ) : failedJobs.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-text-muted">
              <XCircle className="h-8 w-8 opacity-30" />
              <p className="font-sans text-sm">No failed jobs — all clear!</p>
            </div>
          ) : (
            <div className="divide-y divide-border-subtle">
              {failedJobs.map((job) => (
                <div key={job.id} className="px-5 py-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-danger/10 border border-danger/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <XCircle className="h-3.5 w-3.5 text-danger" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-sm font-medium text-text-primary">{job.name}</p>
                    {job.failedReason && (
                      <p className="font-mono text-[11px] text-danger mt-0.5 line-clamp-2">{job.failedReason}</p>
                    )}
                    <p className="font-mono text-[10px] text-text-muted mt-1">Job #{job.id}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void handleRetry(job.id)}
                    disabled={retryingId === job.id}
                    className="flex-shrink-0 h-7 text-xs gap-1.5"
                  >
                    {retryingId === job.id ? (
                      <div className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />
                    ) : (
                      <ArrowClockwise className="h-3 w-3" />
                    )}
                    Retry
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Scheduled messages tab */}
      {tab === "scheduled" && (
      <div className="bg-elevated rounded-2xl border border-border-subtle overflow-hidden">
        <div className="px-5 py-4 bg-card border-b border-border-subtle flex items-center justify-between">
          <h2 className="font-sans font-semibold text-sm text-text-primary">Scheduled Messages</h2>
          <span className="badge badge-new">{total} total</span>
        </div>

        {isLoading && items.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-text-muted">
            <Timer className="h-8 w-8 opacity-30" />
            <p className="font-sans text-sm">No follow-ups scheduled</p>
          </div>
        ) : (
          <div className="divide-y divide-border-subtle">
            {items.map((item) => (
              <div key={item.id} className="px-5 py-4 flex items-start gap-3">
                {/* Icon */}
                <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Timer className="h-3.5 w-3.5 text-accent" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={item.status} />
                    <div className="flex items-center gap-1 text-[11px] text-text-muted font-sans">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(item.scheduledAt)}</span>
                    </div>
                  </div>
                  <p className="font-sans text-sm text-text-primary leading-relaxed line-clamp-2">
                    {item.type.replace(/_/g, ' ')}
                  </p>
                  <p className="font-mono text-[10px] text-text-muted">
                    Lead: {item.leadId}
                  </p>
                </div>

                {/* Cancel button — only for PENDING */}
                {item.status === FollowUpStatus.PENDING && (
                  <button
                    onClick={() => setCancelTarget(item)}
                    className="flex-shrink-0 w-7 h-7 rounded-full bg-danger/10 border border-danger/20 text-danger flex items-center justify-center hover:bg-danger/20 transition-colors"
                    title="Cancel follow-up"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}

                {item.status === FollowUpStatus.SENT && (
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-success/10 border border-success/20 text-success flex items-center justify-center">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-border-subtle flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="text-xs"
            >
              Previous
            </Button>
            <span className="font-sans text-xs text-text-muted">
              Page {page + 1} of {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="text-xs"
            >
              Next
            </Button>
          </div>
        )}
      </div>
      )}

      {/* Cancel Confirm Dialog */}
      <Dialog open={!!cancelTarget} onOpenChange={(o) => !o && setCancelTarget(null)}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg text-text-primary">Cancel Follow-up?</DialogTitle>
            <DialogDescription className="font-sans text-sm text-text-secondary">
              This will cancel the scheduled follow-up message. It cannot be restored.
            </DialogDescription>
          </DialogHeader>
          {cancelTarget && (
            <div className="my-3 p-3 rounded-xl bg-card border border-border-subtle">
              <p className="font-sans text-sm text-text-primary line-clamp-3">
                {cancelTarget.type.replace(/_/g, ' ')}
              </p>
              <p className="font-mono text-[11px] text-text-muted mt-1">
                Scheduled: {formatDate(cancelTarget.scheduledAt)}
              </p>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setCancelTarget(null)} className="flex-1">
              Keep it
            </Button>
            <Button
              onClick={() => void handleCancel()}
              disabled={isCancelling}
              className="flex-1 bg-danger hover:bg-danger/90 text-white gap-2"
            >
              {isCancelling ? (
                <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
              Cancel Follow-up
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

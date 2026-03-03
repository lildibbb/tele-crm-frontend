"use client";
import React, { useCallback, useEffect, useState } from "react";
import {
  Timer,
  Check,
  X,
  Warning,
  ArrowCounterClockwise,
  ArrowClockwise,
  XCircle,
  CalendarCheck,
  CheckCircle,
  ProhibitInset,
  SmileySad,
} from "@phosphor-icons/react";
import { followUpsApi } from "@/lib/api/followUps";
import type { FollowUp } from "@/lib/schemas/followUp.schema";
import { FollowUpStatus } from "@/types/enums";
import { parseApiData, parsePaginatedData } from "@/lib/api/parseResponse";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useT, K } from "@/i18n";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { MobileFollowUps } from "@/components/mobile";

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

function StatusChip({ status }: { status: FollowUp["status"] }) {
  const map: Record<string, { label: string; cls: string }> = {
    [FollowUpStatus.PENDING]: {
      label: "Scheduled",
      cls: "bg-info/10 text-info border-info/20",
    },
    [FollowUpStatus.SENT]: {
      label: "Sent",
      cls: "bg-success/10 text-success border-success/20",
    },
    [FollowUpStatus.CANCELLED]: {
      label: "Cancelled",
      cls: "bg-muted/20 text-text-secondary border-border-subtle",
    },
  };
  const { label, cls } = map[status] ?? map[FollowUpStatus.PENDING];
  return (
    <span
      className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${cls}`}
    >
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
  const isMobile = useIsMobile();
  const t = useT();
  const TYPE_LABELS: Record<string, string> = {
    follow_up_register: t(K.followUp.type.register),
    follow_up_deposit: t(K.followUp.type.deposit),
    follow_up_verification: t(K.followUp.type.verification),
  };
  const typeLabel = (type: string) =>
    TYPE_LABELS[type] ?? type.replace(/_/g, " ");

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
      const { data: arr, total: count } = parsePaginatedData<FollowUp>(
        res.data,
      );
      setItems(arr);
      setTotal(count);
    } catch {
      setError("Failed to load follow-ups");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isMobile) return;
    void load(page * PAGE_SIZE);
  }, [page, load, isMobile]);

  const loadFailed = useCallback(async () => {
    setIsLoadingFailed(true);
    try {
      const res = await followUpsApi.getFailed({ start: 0, end: 49 });
      const jobs = parseApiData<FailedJob[]>(res.data) ?? [];
      setFailedJobs(jobs);
    } catch {
      setError("Failed to load failed jobs");
    } finally {
      setIsLoadingFailed(false);
    }
  }, []);

  useEffect(() => {
    if (isMobile) return;
    if (tab === "failed") void loadFailed();
  }, [tab, loadFailed, isMobile]);

  if (isMobile) return <MobileFollowUps />;

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

  // Stat counts
  const countScheduled = items.filter(
    (i) => i.status === FollowUpStatus.PENDING,
  ).length;
  const countSent = items.filter(
    (i) => i.status === FollowUpStatus.SENT,
  ).length;
  const countCancelled = items.filter(
    (i) => i.status === FollowUpStatus.CANCELLED,
  ).length;
  const countFailed = failedJobs.length;

  return (
    <div className="space-y-6 animate-in-up">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-xl text-text-primary">
            {t(K.followUp.title)}
          </h1>
          <p className="font-sans text-sm text-text-secondary">
            {t(K.followUp.subtitle)}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            tab === "scheduled"
              ? void load(page * PAGE_SIZE)
              : void loadFailed()
          }
          disabled={isLoading || isLoadingFailed}
          className="gap-1.5 text-xs"
        >
          <ArrowCounterClockwise className="h-3.5 w-3.5" />
          {t(K.followUp.refresh)}
        </Button>
      </div>

      {/* ── Stats bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: t(K.followUp.stats.scheduled),
            value: countScheduled,
            icon: CalendarCheck,
            cls: "text-text-secondary",
          },
          {
            label: t(K.followUp.stats.sent),
            value: countSent,
            icon: CheckCircle,
            cls: "text-text-secondary",
          },
          {
            label: t(K.followUp.stats.cancelled),
            value: countCancelled,
            icon: ProhibitInset,
            cls: "text-text-secondary",
          },
          {
            label: t(K.followUp.stats.failed),
            value: countFailed,
            icon: SmileySad,
            cls: "text-text-secondary",
          },
        ].map(({ label, value, icon: Icon, cls }) => (
          <div
            key={label}
            className="bg-card rounded-xl border border-border-subtle px-4 py-3 flex items-center gap-3 shadow-[var(--shadow-card)]"
          >
            <Icon className={`h-4 w-4 flex-shrink-0 ${cls}`} weight="duotone" />
            <div>
              <p className="font-display font-bold text-lg leading-none text-text-primary">
                {value}
              </p>
              <p className="font-sans text-xs text-text-muted mt-0.5">
                {label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tab switcher ── */}
      <div className="bg-elevated rounded-xl p-1 flex gap-1 w-fit border border-border-subtle">
        {(["scheduled", "failed"] as const).map((tabKey) => (
          <button
            key={tabKey}
            onClick={() => setTab(tabKey)}
            className={`relative px-5 py-1.5 rounded-lg text-xs font-sans font-medium transition-all ${
              tab === tabKey
                ? "bg-card text-text-primary shadow-sm border border-border-subtle"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            {tabKey === "scheduled"
              ? t(K.followUp.tabs.scheduled)
              : t(K.followUp.tabs.failed)}
            {tabKey === "failed" && failedJobs.length > 0 && (
              <span className="ml-1.5 bg-danger text-white text-[9px] px-1.5 py-px rounded-full leading-none">
                {failedJobs.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm font-sans">
          <Warning className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* ── Scheduled tab ── */}
      {tab === "scheduled" && (
        <div className="bg-card rounded-xl border border-border-subtle overflow-hidden shadow-[var(--shadow-card)]">
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[minmax(0,1.5fr)_minmax(0,1.5fr)_100px_minmax(0,1fr)_72px] gap-4 px-5 py-2.5 bg-card border-b border-border-subtle shadow-sm">
            {[
              t(K.followUp.col.lead),
              t(K.followUp.col.type),
              t(K.followUp.col.status),
              t(K.followUp.col.scheduledAt),
              "",
            ].map((h) => (
              <span
                key={h}
                className="font-sans text-[11px] font-semibold uppercase tracking-wide text-text-muted"
              >
                {h}
              </span>
            ))}
          </div>

          {isLoading && items.length === 0 ? (
            <div className="flex items-center justify-center py-14">
              <div className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-14 text-text-muted">
              <Timer className="h-8 w-8 text-text-muted opacity-40" weight="duotone" />
              <div className="text-center">
                <p className="font-sans text-sm font-medium text-text-primary">
                  {t(K.followUp.empty)}
                </p>
                <p className="font-sans text-xs text-text-muted mt-0.5">
                  {t(K.followUp.emptyDesc)}
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border-subtle">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-1 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1.5fr)_100px_minmax(0,1fr)_72px] gap-x-4 gap-y-1 px-5 py-3.5 items-center hover:bg-card/40 transition-colors shadow-sm"
                >
                  {/* Lead */}
                  <div className="min-w-0">
                    <p className="font-sans text-sm font-medium text-text-primary truncate">
                      {t(K.followUp.col.lead)}
                    </p>
                    <p className="font-mono text-xs text-text-muted truncate">
                      {item.leadId}
                    </p>
                  </div>

                  {/* Type */}
                  <div className="min-w-0">
                    <p className="font-sans text-sm text-text-primary truncate">
                      {typeLabel(item.type)}
                    </p>
                    <p className="font-sans text-xs text-text-muted truncate">
                      {item.type}
                    </p>
                  </div>

                  {/* Status */}
                  <div>
                    <StatusChip status={item.status} />
                  </div>

                  {/* Scheduled At */}
                  <div className="min-w-0">
                    <p className="font-sans text-sm text-text-primary">
                      {formatDate(item.scheduledAt)}
                    </p>
                    {item.sentAt && (
                      <p className="font-sans text-xs text-text-muted">
                        Sent {formatDate(item.sentAt)}
                      </p>
                    )}
                  </div>

                  {/* Action */}
                  <div className="flex justify-end">
                    {item.status === FollowUpStatus.PENDING ? (
                      <button
                        onClick={() => setCancelTarget(item)}
                        className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg text-xs font-sans font-medium bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20 transition-colors"
                        title="Cancel follow-up"
                      >
                        <X className="h-3 w-3" />
                        {t(K.followUp.cancel)}
                      </button>
                    ) : item.status === FollowUpStatus.SENT ? (
                      <span className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg text-xs font-sans font-medium text-success">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    ) : null}
                  </div>
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
                {t(K.followUp.prev)}
              </Button>
              <span className="font-sans text-xs text-text-muted">
                {t(K.followUp.page)} {page + 1} {t(K.followUp.of)} {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="text-xs"
              >
                {t(K.followUp.next)}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ── Failed tab ── */}
      {tab === "failed" && (
        <div className="bg-elevated rounded-2xl border border-border-subtle overflow-hidden">
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)_72px] gap-4 px-5 py-2.5 bg-card border-b border-border-subtle shadow-sm">
            {[t(K.followUp.failedJob), t(K.followUp.failedError), ""].map(
              (h) => (
                <span
                  key={h}
                  className="font-sans text-[11px] font-semibold uppercase tracking-wide text-text-muted"
                >
                  {h}
                </span>
              ),
            )}
          </div>

          {isLoadingFailed ? (
            <div className="flex items-center justify-center py-14">
              <div className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            </div>
          ) : failedJobs.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-14 text-text-muted">
              <div className="w-12 h-12 rounded-2xl bg-success/10 border border-success/20 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-success" weight="duotone" />
              </div>
              <div className="text-center">
                <p className="font-sans text-sm font-medium text-text-primary">
                  {t(K.followUp.noFailed)}
                </p>
                <p className="font-sans text-xs text-text-muted mt-0.5">
                  {t(K.followUp.noFailedDesc)}
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border-subtle">
              {failedJobs.map((job) => (
                <div
                  key={job.id}
                  className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_72px] gap-x-4 gap-y-1 px-5 py-3.5 items-center hover:bg-card/40 transition-colors shadow-sm"
                >
                  {/* Job / Lead */}
                  <div className="min-w-0">
                    <p className="font-sans text-sm font-medium text-text-primary truncate">
                      {job.name}
                    </p>
                    <p className="font-mono text-xs text-text-muted truncate">
                      #{job.id}
                    </p>
                  </div>

                  {/* Error */}
                  <div className="min-w-0">
                    {job.failedReason ? (
                      <p className="font-mono text-xs text-danger line-clamp-2 break-all">
                        {job.failedReason}
                      </p>
                    ) : (
                      <p className="font-sans text-xs text-text-muted italic">
                        {t(K.followUp.noErrorDetail)}
                      </p>
                    )}
                  </div>

                  {/* Retry */}
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void handleRetry(job.id)}
                      disabled={retryingId === job.id}
                      className="h-7 text-xs gap-1.5 px-2.5"
                    >
                      {retryingId === job.id ? (
                        <div className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />
                      ) : (
                        <ArrowClockwise className="h-3 w-3" />
                      )}
                      {t(K.followUp.retry)}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Cancel Confirm Dialog ── */}
      <Dialog
        open={!!cancelTarget}
        onOpenChange={(o) => !o && setCancelTarget(null)}
      >
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg text-text-primary">
              {t(K.followUp.cancelTitle)}
            </DialogTitle>
            <DialogDescription className="font-sans text-sm text-text-secondary">
              {t(K.followUp.cancelDesc)}
            </DialogDescription>
          </DialogHeader>
          {cancelTarget && (
            <div className="my-3 p-3 rounded-xl bg-card border border-border-subtle shadow-sm">
              <p className="font-sans text-sm font-medium text-text-primary">
                {typeLabel(cancelTarget.type)}
              </p>
              <p className="font-mono text-[11px] text-text-muted mt-1">
                Scheduled: {formatDate(cancelTarget.scheduledAt)}
              </p>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setCancelTarget(null)}
              className="flex-1"
            >
              {t(K.followUp.keep)}
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
              {t(K.followUp.cancelBtn)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

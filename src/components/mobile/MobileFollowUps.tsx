"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Timer,
  Check,
  X,
  Warning,
  ArrowClockwise,
  CaretLeft,
  CalendarCheck,
  CheckCircle,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useT, K } from "@/i18n";
import { followUpsApi } from "@/lib/api/followUps";
import type { FollowUp } from "@/lib/schemas/followUp.schema";
import { FollowUpStatus } from "@/types/enums";
import { parseApiData, parsePaginatedData } from "@/lib/api/parseResponse";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface MobileFollowUpsProps {}

type TabKey = "scheduled" | "failed";

type FailedJob = {
  id: string;
  name: string;
  failedReason?: string;
  data?: Record<string, unknown>;
};

// ── Constants ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_CHIP_MAP: Record<string, { label: string; cls: string }> = {
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

function StatusChip({ status }: { status: FollowUp["status"] }) {
  const { label, cls } =
    STATUS_CHIP_MAP[status] ?? STATUS_CHIP_MAP[FollowUpStatus.PENDING];
  return (
    <span
      className={cn(
        "inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full border whitespace-nowrap",
        cls,
      )}
    >
      {label}
    </span>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function MobileFollowUps({}: MobileFollowUpsProps) {
  const router = useRouter();
  const t = useT();

  const TYPE_LABELS: Record<string, string> = {
    follow_up_register: t(K.followUp.type.register),
    follow_up_deposit: t(K.followUp.type.deposit),
    follow_up_verification: t(K.followUp.type.verification),
  };
  const typeLabel = (type: string) =>
    TYPE_LABELS[type] ?? type.replace(/_/g, " ");

  // ── State ──────────────────────────────────────────────────────────────────
  const [tab, setTab] = useState<TabKey>("scheduled");
  const [items, setItems] = useState<FollowUp[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inline cancel confirmation
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Failed tab
  const [failedJobs, setFailedJobs] = useState<FailedJob[]>([]);
  const [isLoadingFailed, setIsLoadingFailed] = useState(false);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  // ── Data loading ───────────────────────────────────────────────────────────

  const load = useCallback(async (skip: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await followUpsApi.findAll({ skip, take: PAGE_SIZE });
      const { data: arr, total: count } = parsePaginatedData<FollowUp>(res.data);
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
      const jobs = parseApiData<FailedJob[]>(res.data) ?? [];
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

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleCancel = async (id: string) => {
    setIsCancelling(true);
    try {
      await followUpsApi.cancel(id);
      setItems((prev) =>
        prev.map((f) =>
          f.id === id ? { ...f, status: FollowUpStatus.CANCELLED } : f,
        ),
      );
    } catch {
      setError("Failed to cancel follow-up");
    } finally {
      setIsCancelling(false);
      setCancelTargetId(null);
    }
  };

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

  const hasMore = (page + 1) * PAGE_SIZE < total;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-screen bg-void text-text-primary font-sans">
      <div className="pt-[env(safe-area-inset-top)]" />

      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-20 flex items-center gap-3 px-4 h-[52px] bg-base border-b border-border-subtle">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center -ml-1"
        >
          <CaretLeft size={20} className="text-text-primary" />
        </button>
        <span className="font-sans font-semibold text-[17px] text-text-primary flex-1">
          {t(K.followUp.title)}
        </span>
        <Timer size={20} className="text-text-secondary" />
      </header>

      {/* ── Tab chips ── */}
      <div className="flex gap-2 px-4 pt-3 pb-2">
        {(["scheduled", "failed"] as const).map((key) => {
          const isActive = tab === key;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                "shrink-0 flex items-center gap-1 rounded-full h-8 px-4 font-sans text-[13px] font-medium transition-colors",
                isActive
                  ? "bg-crimson-subtle text-crimson"
                  : "bg-card text-text-secondary border border-border-subtle",
              )}
            >
              {key === "scheduled"
                ? t(K.followUp.tabs.scheduled)
                : t(K.followUp.tabs.failed)}
              {key === "failed" && failedJobs.length > 0 && (
                <span className="min-w-[18px] h-[18px] rounded-full bg-danger font-mono text-[10px] text-white flex items-center justify-center px-1">
                  {failedJobs.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="mx-4 mb-2 flex items-center gap-2 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm font-sans">
          <Warning className="h-4 w-4 flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="p-1">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto px-4 pb-[env(safe-area-inset-bottom)]">
        {/* ── Scheduled tab ── */}
        {tab === "scheduled" && (
          <div className="space-y-3 pb-4">
            {isLoading && items.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-20 text-center">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <CalendarCheck
                    size={28}
                    className="text-accent"
                    weight="duotone"
                  />
                </div>
                <p className="font-sans text-sm font-medium text-text-primary">
                  {t(K.followUp.empty)}
                </p>
                <p className="font-sans text-xs text-text-muted">
                  {t(K.followUp.emptyDesc)}
                </p>
              </div>
            ) : (
              <>
                {items.map((item) => {
                  const isConfirming = cancelTargetId === item.id;
                  return (
                    <div
                      key={item.id}
                      className="bg-elevated rounded-xl border border-border-subtle p-4 space-y-2"
                    >
                      {/* Top row: type + status */}
                      <div className="flex items-center justify-between">
                        <span className="font-sans text-sm font-medium text-text-primary">
                          {typeLabel(item.type)}
                        </span>
                        <StatusChip status={item.status} />
                      </div>

                      {/* Lead ID */}
                      <p className="font-mono text-xs text-text-muted truncate">
                        {item.leadId}
                      </p>

                      {/* Scheduled date */}
                      <div className="flex items-center gap-1.5 text-text-secondary">
                        <CalendarCheck size={14} />
                        <span className="font-sans text-xs">
                          {formatDate(item.scheduledAt)}
                        </span>
                      </div>

                      {item.sentAt && (
                        <div className="flex items-center gap-1.5 text-success">
                          <CheckCircle size={14} />
                          <span className="font-sans text-xs">
                            Sent {formatDate(item.sentAt)}
                          </span>
                        </div>
                      )}

                      {/* Action area */}
                      {item.status === FollowUpStatus.PENDING && (
                        <div className="pt-1">
                          {isConfirming ? (
                            <div className="flex items-center gap-2">
                              <span className="font-sans text-xs text-text-secondary flex-1">
                                Cancel this follow-up?
                              </span>
                              <button
                                onClick={() => setCancelTargetId(null)}
                                className="h-7 px-3 rounded-lg text-xs font-sans font-medium bg-card border border-border-subtle text-text-secondary"
                              >
                                Keep
                              </button>
                              <button
                                onClick={() => void handleCancel(item.id)}
                                disabled={isCancelling}
                                className="h-7 px-3 rounded-lg text-xs font-sans font-medium bg-danger/10 text-danger border border-danger/20 flex items-center gap-1"
                              >
                                {isCancelling ? (
                                  <div className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />
                                ) : (
                                  <X className="h-3 w-3" />
                                )}
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setCancelTargetId(item.id)}
                              className="inline-flex items-center gap-1 h-7 px-3 rounded-lg text-xs font-sans font-medium bg-danger/10 text-danger border border-danger/20"
                            >
                              <X className="h-3 w-3" />
                              {t(K.followUp.cancel)}
                            </button>
                          )}
                        </div>
                      )}

                      {item.status === FollowUpStatus.SENT && (
                        <div className="flex items-center gap-1 text-success pt-1">
                          <Check className="h-3.5 w-3.5" />
                          <span className="font-sans text-xs font-medium">
                            Delivered
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Load more */}
                {hasMore && (
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={isLoading}
                    className="w-full h-10 rounded-xl bg-card border border-border-subtle font-sans text-sm font-medium text-text-secondary flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                    ) : (
                      "Load more"
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Failed tab ── */}
        {tab === "failed" && (
          <div className="space-y-3 pb-4">
            {isLoadingFailed ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
              </div>
            ) : failedJobs.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-20 text-center">
                <div className="w-14 h-14 rounded-2xl bg-success/10 border border-success/20 flex items-center justify-center">
                  <CheckCircle
                    size={28}
                    className="text-success"
                    weight="duotone"
                  />
                </div>
                <p className="font-sans text-sm font-medium text-text-primary">
                  {t(K.followUp.noFailed)}
                </p>
                <p className="font-sans text-xs text-text-muted">
                  {t(K.followUp.noFailedDesc)}
                </p>
              </div>
            ) : (
              failedJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-elevated rounded-xl border border-border-subtle p-4 space-y-2"
                >
                  <p className="font-sans text-sm font-medium text-text-primary">
                    {job.name}
                  </p>
                  {job.failedReason ? (
                    <p className="font-mono text-xs text-danger line-clamp-3 break-all">
                      {job.failedReason}
                    </p>
                  ) : (
                    <p className="font-sans text-xs text-text-muted italic">
                      {t(K.followUp.noErrorDetail)}
                    </p>
                  )}
                  <div className="pt-1">
                    <button
                      onClick={() => void handleRetry(job.id)}
                      disabled={retryingId === job.id}
                      className="inline-flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs font-sans font-medium bg-card border border-border-subtle text-text-primary"
                    >
                      {retryingId === job.id ? (
                        <div className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />
                      ) : (
                        <ArrowClockwise className="h-3 w-3" />
                      )}
                      {t(K.followUp.retry)}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

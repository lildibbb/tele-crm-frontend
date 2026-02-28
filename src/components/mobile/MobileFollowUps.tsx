"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Timer,
  Check,
  X,
  Warning,
  ArrowClockwise,
  CaretLeft,
  CalendarCheck,
  CheckCircle,
  Clock,
  PaperPlaneTilt,
  Prohibit,
  Lightning,
  SmileySad,
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

function relativeTime(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  const absDiff = Math.abs(diff);
  const mins = Math.floor(absDiff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

// ── Status chip config ─────────────────────────────────────────────────────────

const STATUS_CHIP_MAP: Record<
  string,
  { label: string; cls: string; Icon: React.ElementType }
> = {
  [FollowUpStatus.PENDING]: {
    label: "Scheduled",
    cls: "bg-info/10 text-info border-info/20",
    Icon: Clock,
  },
  [FollowUpStatus.SENT]: {
    label: "Sent",
    cls: "bg-success/10 text-success border-success/20",
    Icon: CheckCircle,
  },
  [FollowUpStatus.CANCELLED]: {
    label: "Cancelled",
    cls: "bg-muted/20 text-text-muted border-border-subtle",
    Icon: Prohibit,
  },
};

function StatusChip({ status }: { status: FollowUp["status"] }) {
  const { label, cls, Icon } =
    STATUS_CHIP_MAP[status] ?? STATUS_CHIP_MAP[FollowUpStatus.PENDING];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap",
        cls,
      )}
    >
      <Icon size={10} weight="fill" />
      {label}
    </span>
  );
}

// ── Skeleton card ──────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-xl bg-card border border-border-subtle p-4 space-y-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 w-28 rounded bg-elevated" />
        <div className="h-5 w-16 rounded-full bg-elevated" />
      </div>
      <div className="h-3 w-44 rounded bg-elevated" />
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded bg-elevated" />
        <div className="h-3 w-32 rounded bg-elevated" />
      </div>
      <div className="h-8 w-20 rounded-lg bg-elevated" />
    </div>
  );
}

// ── Stat pill ──────────────────────────────────────────────────────────────────

function StatPill({
  Icon,
  value,
  label,
  cls,
}: {
  Icon: React.ElementType;
  value: number;
  label: string;
  cls: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 flex-1 min-w-0 py-2.5">
      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", cls)}>
        <Icon size={14} weight="fill" />
      </div>
      <span className="font-mono text-[15px] font-bold text-text-primary leading-none">
        {value}
      </span>
      <span className="font-sans text-[10px] text-text-muted truncate">{label}</span>
    </div>
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inline cancel confirmation
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Failed tab
  const [failedJobs, setFailedJobs] = useState<FailedJob[]>([]);
  const [isLoadingFailed, setIsLoadingFailed] = useState(false);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  // ── Derived stats ─────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const scheduled = items.filter((i) => i.status === FollowUpStatus.PENDING).length;
    const sent = items.filter((i) => i.status === FollowUpStatus.SENT).length;
    const cancelled = items.filter((i) => i.status === FollowUpStatus.CANCELLED).length;
    return { scheduled, sent, cancelled, failed: failedJobs.length };
  }, [items, failedJobs]);

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
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary font-sans">
      <div className="pt-[env(safe-area-inset-top)]" />

      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border-subtle">
        <div className="flex items-center gap-3 px-4 h-[56px]">
          <button
            onClick={() => router.back()}
            className="w-11 h-11 flex items-center justify-center -ml-1.5 rounded-xl active:bg-elevated transition-colors"
            aria-label="Back"
          >
            <CaretLeft size={20} weight="bold" className="text-text-primary" />
          </button>
          <span className="font-sans font-bold text-[18px] text-text-primary flex-1 tracking-tight">
            {t(K.followUp.title)}
          </span>
          <div className="w-9 h-9 rounded-lg bg-elevated flex items-center justify-center">
            <Timer size={18} weight="duotone" className="text-text-secondary" />
          </div>
        </div>

        {/* ── Segmented tab bar ── */}
        <div className="px-4 pb-3">
          <div className="flex bg-elevated rounded-xl p-1 gap-1">
            {(["scheduled", "failed"] as const).map((key) => {
              const isActive = tab === key;
              const count = key === "scheduled" ? total : failedJobs.length;
              return (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={cn(
                    "relative flex-1 flex items-center justify-center gap-1.5 h-10 rounded-lg font-sans text-[13px] font-semibold transition-all",
                    isActive
                      ? "bg-card text-text-primary shadow-sm"
                      : "text-text-muted active:bg-card/50",
                  )}
                >
                  {key === "scheduled" ? (
                    <CalendarCheck size={15} weight={isActive ? "fill" : "regular"} />
                  ) : (
                    <Warning size={15} weight={isActive ? "fill" : "regular"} />
                  )}
                  {key === "scheduled"
                    ? t(K.followUp.tabs.scheduled)
                    : t(K.followUp.tabs.failed)}
                  {count > 0 && (
                    <span
                      className={cn(
                        "min-w-[18px] h-[18px] rounded-full font-mono text-[10px] font-bold flex items-center justify-center px-1",
                        key === "failed" && isActive
                          ? "bg-danger text-white"
                          : key === "failed"
                            ? "bg-danger/20 text-danger"
                            : isActive
                              ? "bg-crimson text-white"
                              : "bg-crimson/15 text-crimson",
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ── Error banner ── */}
      {error && (
        <div className="mx-4 mt-3 flex items-center gap-2.5 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-[13px] font-sans">
          <Warning className="h-4 w-4 flex-shrink-0" weight="fill" />
          <span className="flex-1">{error}</span>
          <button
            onClick={() => setError(null)}
            className="w-8 h-8 flex items-center justify-center rounded-lg active:bg-danger/10 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ── Stats summary ── */}
      {!isLoading && tab === "scheduled" && items.length > 0 && (
        <div className="mx-4 mt-3 rounded-xl bg-card border border-border-subtle flex divide-x divide-border-subtle">
          <StatPill
            Icon={Clock}
            value={stats.scheduled}
            label="Scheduled"
            cls="bg-info/10 text-info"
          />
          <StatPill
            Icon={PaperPlaneTilt}
            value={stats.sent}
            label="Sent"
            cls="bg-success/10 text-success"
          />
          <StatPill
            Icon={Prohibit}
            value={stats.cancelled}
            label="Cancelled"
            cls="bg-muted/20 text-text-muted"
          />
          <StatPill
            Icon={Warning}
            value={stats.failed}
            label="Failed"
            cls="bg-danger/10 text-danger"
          />
        </div>
      )}

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-[env(safe-area-inset-bottom)]">
        {/* ── Scheduled tab ── */}
        {tab === "scheduled" && (
          <div className="space-y-3 pb-4">
            {isLoading && items.length === 0 ? (
              /* Skeleton loading */
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : items.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center gap-4 py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-info/10 border border-info/20 flex items-center justify-center">
                  <CalendarCheck
                    size={32}
                    className="text-info"
                    weight="duotone"
                  />
                </div>
                <div className="space-y-1.5">
                  <p className="font-sans text-[15px] font-semibold text-text-primary">
                    {t(K.followUp.empty)}
                  </p>
                  <p className="font-sans text-[13px] text-text-muted max-w-[240px]">
                    {t(K.followUp.emptyDesc)}
                  </p>
                </div>
              </div>
            ) : (
              <>
                {items.map((item) => {
                  const isConfirming = cancelTargetId === item.id;
                  const isPending = item.status === FollowUpStatus.PENDING;
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "rounded-xl border p-4 space-y-2.5 transition-colors",
                        isPending
                          ? "bg-card border-border-subtle"
                          : "bg-card/60 border-border-subtle/60",
                      )}
                    >
                      {/* Top row: type label + status chip */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="w-7 h-7 rounded-lg bg-crimson/10 flex items-center justify-center shrink-0">
                            <Lightning size={14} weight="fill" className="text-crimson" />
                          </div>
                          <span className="font-sans text-[14px] font-semibold text-text-primary truncate">
                            {typeLabel(item.type)}
                          </span>
                        </div>
                        <StatusChip status={item.status} />
                      </div>

                      {/* Lead ID */}
                      <p className="font-mono text-[11px] text-text-muted truncate pl-9">
                        ID: {item.leadId}
                      </p>

                      {/* Date rows */}
                      <div className="flex flex-col gap-1.5 pl-9">
                        <div className="flex items-center gap-1.5 text-text-secondary">
                          <CalendarCheck size={13} weight="duotone" />
                          <span className="font-sans text-[12px]">
                            {formatDate(item.scheduledAt)}
                          </span>
                          {isPending && (
                            <span className="ml-auto font-mono text-[10px] text-info font-semibold bg-info/10 px-1.5 py-0.5 rounded">
                              in {relativeTime(item.scheduledAt)}
                            </span>
                          )}
                        </div>

                        {item.sentAt && (
                          <div className="flex items-center gap-1.5 text-success">
                            <CheckCircle size={13} weight="fill" />
                            <span className="font-sans text-[12px]">
                              Sent {formatDate(item.sentAt)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action area */}
                      {isPending && (
                        <div className="pt-1 pl-9">
                          {isConfirming ? (
                            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-danger/5 border border-danger/10">
                              <span className="font-sans text-[12px] text-text-secondary flex-1">
                                Cancel this follow-up?
                              </span>
                              <button
                                onClick={() => setCancelTargetId(null)}
                                className="h-9 min-w-[60px] px-3 rounded-lg text-[12px] font-sans font-semibold bg-card border border-border-subtle text-text-secondary active:scale-95 transition-transform"
                              >
                                Keep
                              </button>
                              <button
                                onClick={() => void handleCancel(item.id)}
                                disabled={isCancelling}
                                className="h-9 min-w-[60px] px-3 rounded-lg text-[12px] font-sans font-semibold bg-danger text-white flex items-center justify-center gap-1.5 active:scale-95 transition-transform disabled:opacity-50"
                              >
                                {isCancelling ? (
                                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                ) : (
                                  <X className="h-3 w-3" weight="bold" />
                                )}
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setCancelTargetId(item.id)}
                              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-[12px] font-sans font-semibold bg-danger/10 text-danger border border-danger/20 active:scale-95 active:bg-danger/20 transition-all"
                            >
                              <X className="h-3.5 w-3.5" weight="bold" />
                              {t(K.followUp.cancel)}
                            </button>
                          )}
                        </div>
                      )}

                      {item.status === FollowUpStatus.SENT && (
                        <div className="flex items-center gap-1.5 text-success pl-9 pt-0.5">
                          <Check className="h-3.5 w-3.5" weight="bold" />
                          <span className="font-sans text-[12px] font-semibold">
                            Delivered
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Pagination */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0 || isLoading}
                    className={cn(
                      "h-11 flex-1 rounded-xl font-sans text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-[0.97]",
                      page === 0
                        ? "bg-elevated text-text-muted cursor-not-allowed"
                        : "bg-card border border-border-subtle text-text-secondary",
                    )}
                  >
                    Previous
                  </button>
                  <span className="font-mono text-[11px] text-text-muted shrink-0">
                    {page + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!hasMore || isLoading}
                    className={cn(
                      "h-11 flex-1 rounded-xl font-sans text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-[0.97]",
                      !hasMore
                        ? "bg-elevated text-text-muted cursor-not-allowed"
                        : "bg-crimson/10 border border-crimson/20 text-crimson",
                    )}
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 rounded-full border-2 border-crimson/30 border-t-crimson animate-spin" />
                    ) : (
                      "Next"
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Failed tab ── */}
        {tab === "failed" && (
          <div className="space-y-3 pb-4">
            {isLoadingFailed ? (
              /* Skeleton loading */
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : failedJobs.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center gap-4 py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-success/10 border border-success/20 flex items-center justify-center">
                  <CheckCircle
                    size={32}
                    className="text-success"
                    weight="duotone"
                  />
                </div>
                <div className="space-y-1.5">
                  <p className="font-sans text-[15px] font-semibold text-text-primary">
                    {t(K.followUp.noFailed)}
                  </p>
                  <p className="font-sans text-[13px] text-text-muted max-w-[240px]">
                    {t(K.followUp.noFailedDesc)}
                  </p>
                </div>
              </div>
            ) : (
              failedJobs.map((job) => {
                const isRetrying = retryingId === job.id;
                return (
                  <div
                    key={job.id}
                    className="rounded-xl bg-card border border-border-subtle p-4 space-y-2.5"
                  >
                    {/* Header row */}
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-danger/10 flex items-center justify-center shrink-0">
                        <SmileySad size={14} weight="fill" className="text-danger" />
                      </div>
                      <p className="font-sans text-[14px] font-semibold text-text-primary truncate flex-1">
                        {job.name}
                      </p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-danger/10 text-danger border-danger/20 whitespace-nowrap">
                        <Warning size={10} weight="fill" />
                        Failed
                      </span>
                    </div>

                    {/* Error reason */}
                    {job.failedReason ? (
                      <div className="ml-9 p-2.5 rounded-lg bg-danger/5 border border-danger/10">
                        <p className="font-mono text-[11px] text-danger/80 line-clamp-3 break-all leading-relaxed">
                          {job.failedReason}
                        </p>
                      </div>
                    ) : (
                      <p className="font-sans text-[12px] text-text-muted italic ml-9">
                        {t(K.followUp.noErrorDetail)}
                      </p>
                    )}

                    {/* Retry action */}
                    <div className="pt-0.5 pl-9">
                      <button
                        onClick={() => void handleRetry(job.id)}
                        disabled={isRetrying}
                        className={cn(
                          "inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-[12px] font-sans font-semibold border transition-all active:scale-95",
                          isRetrying
                            ? "bg-elevated border-border-subtle text-text-muted"
                            : "bg-card border-border-subtle text-text-primary active:bg-elevated",
                        )}
                      >
                        {isRetrying ? (
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-text-muted/30 border-t-text-muted animate-spin" />
                        ) : (
                          <ArrowClockwise className="h-3.5 w-3.5" weight="bold" />
                        )}
                        {t(K.followUp.retry)}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

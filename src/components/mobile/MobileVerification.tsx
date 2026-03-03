"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  ChatCircleDots,
  Clock,
  Image as PhosphorImage,
  Receipt,
  Eye,
} from "@phosphor-icons/react";
import { useLeadsList, useVerifyLead, useUpdateLeadStatus } from "@/queries/useLeadsQuery";
import type { Lead } from "@/queries/useLeadsQuery";
import { LeadStatus } from "@/types/enums";
import { attachmentsApi, type Attachment } from "@/lib/api/attachments";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────────────────────
export type FilterTab = "PENDING" | "ALL";
export interface MobileVerificationProps {
  readonly onMoreOpen?: () => void;
  readonly onApprove?: (id: string) => void;
  readonly onReject?: (id: string) => void;
}

export interface VerificationItem {
  id: string;
  leadName: string;
  leadId: string;
  hfmId: string;
  depositAmount: string;
  submittedAt: string;
  initials: string;
  status: string;
  statusLabel: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function timeAgoShort(iso: string): string {
  const hrs = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000);
  if (hrs < 1) return "Just now";
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  [LeadStatus.DEPOSIT_REPORTED]: {
    label: "Pending",
    color: "text-warning",
    bg: "bg-[color-mix(in_srgb,var(--warning)_15%,transparent)]",
  },
  [LeadStatus.DEPOSIT_CONFIRMED]: {
    label: "Approved",
    color: "text-success",
    bg: "bg-[color-mix(in_srgb,var(--success)_15%,transparent)]",
  },
  [LeadStatus.REJECTED]: {
    label: "Rejected",
    color: "text-danger",
    bg: "bg-[color-mix(in_srgb,var(--danger)_15%,transparent)]",
  },
};

function toVerificationItem(lead: Lead): VerificationItem {
  const meta = STATUS_META[lead.status] ?? STATUS_META[LeadStatus.DEPOSIT_REPORTED];
  return {
    id: lead.id,
    leadName: lead.displayName ?? "Unknown",
    leadId: `#TJ-${lead.id.slice(-4)}`,
    hfmId: lead.hfmBrokerId ?? "—",
    depositAmount: lead.depositBalance ?? "$0.00",
    submittedAt: lead.createdAt ? timeAgoShort(lead.createdAt) : "—",
    initials: (lead.displayName ?? "??")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    status: lead.status,
    statusLabel: meta.label,
  };
}

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: "PENDING", label: "Pending" },
  { id: "ALL", label: "All" },
];

// ── Skeleton Card ──────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border-subtle bg-card p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-11 h-11 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-3/5" />
          <Skeleton className="h-3 w-2/5" />
        </div>
        <Skeleton className="w-16 h-5 rounded-full" />
      </div>
      <Skeleton className="h-px w-full" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="w-10 h-10 rounded-lg" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="flex-1 h-11 rounded-xl" />
        <Skeleton className="flex-1 h-11 rounded-xl" />
        <Skeleton className="flex-1 h-11 rounded-xl" />
      </div>
    </div>
  );
}

function SkeletonStats() {
  return (
    <div className="flex gap-3 px-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex-1 p-3 rounded-xl bg-card border border-border-subtle">
          <Skeleton className="w-6 h-6 rounded-lg mb-2" />
          <Skeleton className="h-5 w-8 mb-1" />
          <Skeleton className="h-3 w-14" />
        </div>
      ))}
    </div>
  );
}

// ── Receipt Thumbnail ──────────────────────────────────────────────────────────
function ReceiptThumbnail({ leadId, onView }: { leadId: string; onView: () => void }) {
  const [thumb, setThumb] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    attachmentsApi
      .findByLead(leadId)
      .then((res) => {
        if (cancelled) return;
        const attachments: Attachment[] = res.data?.data ?? [];
        const img = attachments.find((a) =>
          a.mimeType?.startsWith("image/"),
        );
        if (img) setThumb(img.fileUrl);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [leadId]);

  if (loading) {
    return <Skeleton className="w-11 h-11 rounded-lg shrink-0" />;
  }

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onView(); }}
      className="relative w-11 h-11 rounded-lg bg-elevated overflow-hidden shrink-0 active:scale-95 transition-transform"
    >
      {thumb ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumb} alt="Receipt" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <Eye size={14} className="text-white" weight="bold" />
          </div>
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Receipt size={18} className="text-text-muted" />
        </div>
      )}
    </button>
  );
}

// ── Receipt Preview Modal ──────────────────────────────────────────────────────
function ReceiptPreview({
  leadId,
  leadName,
  onClose,
}: {
  leadId: string;
  leadName: string;
  onClose: () => void;
}) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    attachmentsApi
      .findByLead(leadId)
      .then((res) => setAttachments(res.data?.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [leadId]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
        <span className="font-sans font-semibold text-[15px] text-text-primary">
          Receipts — {leadName}
        </span>
        <button
          onClick={onClose}
          className="h-9 px-3 rounded-lg bg-elevated font-sans text-[13px] font-medium text-text-secondary active:scale-95 transition-transform"
        >
          Close
        </button>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-crimson border-t-transparent animate-spin" />
          </div>
        ) : attachments.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-20">
            <PhosphorImage size={48} className="text-text-muted" />
            <span className="font-sans text-[14px] text-text-muted">No receipts uploaded</span>
          </div>
        ) : (
          attachments.map((att) => (
            <div key={att.id} className="rounded-xl border border-border-subtle overflow-hidden bg-card">
              {att.mimeType?.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={att.fileUrl}
                  alt="Receipt proof"
                  className="w-full max-h-[60vh] object-contain bg-elevated"
                />
              ) : (
                <a
                  href={att.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4"
                >
                  <Receipt size={24} className="text-text-muted" />
                  <span className="font-mono text-[13px] text-info underline truncate">
                    {att.fileKey}
                  </span>
                </a>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Verification Card ──────────────────────────────────────────────────────────
function VerificationCard({
  item,
  onApprove,
  onReject,
  onAskMore,
  onViewReceipt,
}: {
  item: VerificationItem;
  onApprove: () => void;
  onReject: () => void;
  onAskMore: () => void;
  onViewReceipt: () => void;
}) {
  const meta = STATUS_META[item.status] ?? STATUS_META[LeadStatus.DEPOSIT_REPORTED];
  const isPending = item.status === LeadStatus.DEPOSIT_REPORTED;

  return (
    <div
      className={cn(
        "rounded-xl border border-border-subtle bg-card shadow-sm",
        isPending && "bg-warning/5",
      )}
    >
      {/* Header row: avatar + name + status badge */}
      <div className="flex items-center gap-3 p-4 pb-0">
        <div className="w-11 h-11 rounded-full flex items-center justify-center bg-crimson-subtle shrink-0">
          <span className="font-sans font-bold text-[15px] text-text-primary">
            {item.initials}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-sans font-semibold text-[15px] text-text-primary truncate">
            {item.leadName}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="font-mono text-[11px] text-text-muted">{item.leadId}</span>
            <span className="text-text-muted">·</span>
            <span className="font-mono text-[11px] text-text-muted">HFM: {item.hfmId}</span>
          </div>
        </div>
        <Badge variant="secondary" className="text-[10px] font-medium shrink-0">{meta.label}</Badge>
      </div>

      {/* Deposit + date + receipt */}
      <div className="px-4 pt-3 pb-3">
        <div className="h-px bg-border-subtle mb-3" />
        <div className="flex items-center justify-between">
          <div>
            <div className="font-sans font-bold text-[20px] text-text-primary leading-none">
              {item.depositAmount}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <Clock size={12} className="text-text-muted" />
              <span className="font-sans text-[11px] text-text-muted">{item.submittedAt}</span>
            </div>
          </div>
          <ReceiptThumbnail leadId={item.id} onView={onViewReceipt} />
        </div>
      </div>

      {/* Action buttons — only for pending items */}
      {isPending && (
        <div className="flex gap-2 px-4 pb-4">
          <button
            onClick={onApprove}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 h-11 rounded-xl font-sans font-semibold text-[13px]",
              "bg-elevated text-text-primary",
              "active:scale-[0.97] transition-transform",
            )}
          >
            <CheckCircle size={16} weight="bold" className="text-text-secondary" />
            Approve
          </button>
          <button
            onClick={onReject}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 h-11 rounded-xl font-sans font-semibold text-[13px]",
              "bg-elevated text-text-primary",
              "active:scale-[0.97] transition-transform",
            )}
          >
            <XCircle size={16} weight="bold" className="text-text-secondary" />
            Reject
          </button>
          <button
            onClick={onAskMore}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 h-11 rounded-xl font-sans font-semibold text-[13px]",
              "bg-elevated text-text-primary",
              "active:scale-[0.97] transition-transform",
            )}
          >
            <ChatCircleDots size={16} weight="bold" className="text-text-secondary" />
            Ask More
          </button>
        </div>
      )}
    </div>
  );
}

// ── Empty State ────────────────────────────────────────────────────────────────
function EmptyState({ todayCount }: { todayCount: number }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-elevated flex items-center justify-center">
        <ShieldCheck size={36} className="text-text-secondary" weight="fill" />
      </div>
      <span className="font-sans font-bold text-[22px] text-text-primary">All caught up!</span>
      <span className="font-sans text-[14px] text-text-secondary leading-snug">
        No pending verifications in the queue.
        <br />
        Check back when new deposits are reported.
      </span>
      {todayCount > 0 && (
        <span className="font-sans font-medium text-[13px] text-text-secondary mt-1">
          {todayCount} verified today
        </span>
      )}
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function MobileVerification({
  onApprove,
  onReject,
}: MobileVerificationProps) {
  const verificationStatuses = `${LeadStatus.DEPOSIT_REPORTED},${LeadStatus.DEPOSIT_CONFIRMED},${LeadStatus.REJECTED}`;
  const { data: leadsResult, isLoading } = useLeadsList({ skip: 0, take: 50, statuses: verificationStatuses });
  const leads = leadsResult?.data ?? [];
  const verifyMutation = useVerifyLead();
  const updateStatusMutation = useUpdateLeadStatus();
  const [filter, setFilter] = useState<FilterTab>("PENDING");
  const openModal = (_id: string, _kind: string) => { /* askMore modal not supported on mobile */ };

  const [receiptPreview, setReceiptPreview] = useState<{ id: string; name: string } | null>(null);

  // ── Derived data ───────────────────────────────────────────────────────────
  const pendingLeads = useMemo(
    () => leads.filter((l) => l.status === LeadStatus.DEPOSIT_REPORTED),
    [leads],
  );

  const allVerificationLeads = useMemo(
    () =>
      leads.filter(
        (l) =>
          l.status === LeadStatus.DEPOSIT_REPORTED ||
          l.status === LeadStatus.DEPOSIT_CONFIRMED ||
          l.status === LeadStatus.REJECTED,
      ),
    [leads],
  );

  const [processedIds, setProcessedIds] = useState<Set<string>>(new Set());
  const [todayCount, setTodayCount] = useState(0);

  const displayLeads = useMemo(() => {
    const source = filter === "PENDING" ? pendingLeads : allVerificationLeads;
    return source
      .filter((l) => !processedIds.has(l.id))
      .map(toVerificationItem);
  }, [filter, pendingLeads, allVerificationLeads, processedIds]);

  const pendingCount = useMemo(
    () => pendingLeads.filter((l) => !processedIds.has(l.id)).length,
    [pendingLeads, processedIds],
  );

  const approvedToday = leads.filter((l) => l.status === LeadStatus.DEPOSIT_CONFIRMED).length;
  const rejectedToday = leads.filter((l) => l.status === LeadStatus.REJECTED).length;

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleApprove = useCallback(
    async (id: string) => {
      setProcessedIds((prev) => new Set(prev).add(id));
      setTodayCount((c) => c + 1);
      toast.success("Lead approved");
      onApprove?.(id);
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([8, 40, 8]);
      try { verifyMutation.mutate(id); } catch { /* noop */ }
    },
    [onApprove, verifyMutation],
  );

  const handleReject = useCallback(
    async (id: string) => {
      setProcessedIds((prev) => new Set(prev).add(id));
      toast.error("Lead rejected");
      onReject?.(id);
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(30);
      try { updateStatusMutation.mutate({ id, data: { status: "REJECTED" } }); } catch { /* noop */ }
    },
    [onReject, updateStatusMutation],
  );

  const handleAskMore = useCallback(
    (id: string) => {
      openModal(id, "askMore");
    },
    [openModal],
  );

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border-subtle">
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={22} className="text-text-secondary" weight="fill" />
            <h1 className="font-sans font-bold text-[18px] text-text-primary">Verification</h1>
          </div>
          {pendingCount > 0 && (
            <span className="flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full bg-crimson font-mono text-[12px] font-bold text-white">
              {pendingCount}
            </span>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 px-4 pb-3">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={cn(
                "shrink-0 rounded-full h-8 px-4 font-sans text-[13px] font-medium transition-colors",
                filter === tab.id
                  ? "bg-crimson/15 text-crimson"
                  : "bg-card text-text-secondary border border-border-subtle",
              )}
            >
              {tab.label}
              {tab.id === "PENDING" && pendingCount > 0 && (
                <span className="ml-1.5 font-mono text-[11px]">({pendingCount})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stats Row ───────────────────────────────────────────────────────── */}
      <div className="pt-4 pb-2">
        {isLoading && leads.length === 0 ? (
          <SkeletonStats />
        ) : (
          <div className="flex gap-3 px-4">
            {/* Pending */}
            <div className="flex-1 p-3 rounded-xl bg-card border border-border-subtle shadow-sm">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-elevated">
                <Clock size={16} className="text-text-secondary" weight="fill" />
              </span>
              <p className="font-sans text-[22px] font-bold text-text-primary leading-none mt-2">
                {pendingCount}
              </p>
              <p className="font-sans text-[11px] text-text-muted mt-0.5">Pending</p>
            </div>
            {/* Approved */}
            <div className="flex-1 p-3 rounded-xl bg-card border border-border-subtle shadow-sm">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-elevated">
                <CheckCircle size={16} className="text-text-secondary" weight="fill" />
              </span>
              <p className="font-sans text-[22px] font-bold text-text-primary leading-none mt-2">
                {approvedToday + todayCount}
              </p>
              <p className="font-sans text-[11px] text-text-muted mt-0.5">Approved</p>
            </div>
            {/* Rejected */}
            <div className="flex-1 p-3 rounded-xl bg-card border border-border-subtle shadow-sm">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-elevated">
                <XCircle size={16} className="text-text-secondary" weight="fill" />
              </span>
              <p className="font-sans text-[22px] font-bold text-text-primary leading-none mt-2">
                {rejectedToday}
              </p>
              <p className="font-sans text-[11px] text-text-muted mt-0.5">Rejected</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Card List ───────────────────────────────────────────────────────── */}
      <div className="px-4 pt-2 space-y-3">
        {isLoading && leads.length === 0 ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : displayLeads.length === 0 ? (
          <EmptyState todayCount={approvedToday + todayCount} />
        ) : (
          displayLeads.map((item) => (
            <VerificationCard
              key={item.id}
              item={item}
              onApprove={() => handleApprove(item.id)}
              onReject={() => handleReject(item.id)}
              onAskMore={() => handleAskMore(item.id)}
              onViewReceipt={() => setReceiptPreview({ id: item.id, name: item.leadName })}
            />
          ))
        )}
      </div>

      {/* ── Receipt Preview Modal ───────────────────────────────────────────── */}
      {receiptPreview && (
        <ReceiptPreview
          leadId={receiptPreview.id}
          leadName={receiptPreview.name}
          onClose={() => setReceiptPreview(null)}
        />
      )}
    </div>
  );
}

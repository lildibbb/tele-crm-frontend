"use client";

import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  ChatCircleDots,
  Clock,
  Image as PhosphorImage,
  Receipt,
  Eye,
  Paperclip,
} from "@phosphor-icons/react";
import {
  useLeadsList,
  useVerifyLead,
  useUpdateLeadStatus,
} from "@/queries/useLeadsQuery";
import type { Lead } from "@/queries/useLeadsQuery";
import { LeadStatus } from "@/types/enums";
import { attachmentsApi, type Attachment } from "@/lib/api/attachments";
import { LEAD_REPLY_REQUIRED_MESSAGE, leadsApi } from "@/lib/api/leads";
import {
  canSendLeadReply,
  normalizeLeadReplyMessage,
} from "@/lib/reply/leadReplyContract";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { validateReplyAttachmentFile } from "@/lib/replyAttachmentPolicy";

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

const STATUS_META: Record<
  string,
  { label: string; color: string; bg: string }
> = {
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
  const meta =
    STATUS_META[lead.status] ?? STATUS_META[LeadStatus.DEPOSIT_REPORTED];
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
        <div
          key={i}
          className="flex-1 p-3 rounded-xl bg-card border border-border-subtle"
        >
          <Skeleton className="w-6 h-6 rounded-lg mb-2" />
          <Skeleton className="h-5 w-8 mb-1" />
          <Skeleton className="h-3 w-14" />
        </div>
      ))}
    </div>
  );
}

// ── Receipt Thumbnail ──────────────────────────────────────────────────────────
function ReceiptThumbnail({
  leadId,
  onView,
}: {
  leadId: string;
  onView: () => void;
}) {
  const [thumb, setThumb] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    attachmentsApi
      .findByLead(leadId)
      .then((res) => {
        if (cancelled) return;
        const attachments: Attachment[] = res.data?.data ?? [];
        const img = attachments.find((a) => a.mimeType?.startsWith("image/"));
        if (img) setThumb(img.fileUrl);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [leadId]);

  if (loading) {
    return <Skeleton className="w-11 h-11 rounded-lg shrink-0" />;
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onView();
      }}
      className="relative w-11 h-11 rounded-lg bg-elevated overflow-hidden shrink-0 active:scale-95 transition-transform"
    >
      {thumb ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumb}
            alt="Receipt"
            className="w-full h-full object-cover"
          />
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
            <span className="font-sans text-[14px] text-text-muted">
              No receipts uploaded
            </span>
          </div>
        ) : (
          attachments.map((att) => (
            <div
              key={att.id}
              className="rounded-xl border border-border-subtle overflow-hidden bg-card"
            >
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
  onViewLead,
}: {
  item: VerificationItem;
  onApprove: () => void;
  onReject: () => void;
  onAskMore: () => void;
  onViewReceipt: () => void;
  onViewLead: () => void;
}) {
  const meta =
    STATUS_META[item.status] ?? STATUS_META[LeadStatus.DEPOSIT_REPORTED];
  const isPending = item.status === LeadStatus.DEPOSIT_REPORTED;
  const isApproved = item.status === LeadStatus.DEPOSIT_CONFIRMED;
  const isRejected = item.status === LeadStatus.REJECTED;

  return (
    <div
      className={cn(
        "relative rounded-3xl border bg-card/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden group",
        isPending && "border-amber-500/20",
        isApproved && "border-emerald-500/20",
        isRejected && "border-rose-500/20",
        !isPending && !isApproved && !isRejected && "border-white/10",
      )}
    >
      {/* Subtle glass reflection */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* Top glowing accent for status */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-[1px] opacity-60",
          isPending &&
            "bg-gradient-to-r from-transparent via-amber-500 to-transparent",
          isApproved &&
            "bg-gradient-to-r from-transparent via-emerald-500 to-transparent",
          isRejected &&
            "bg-gradient-to-r from-transparent via-rose-500 to-transparent",
        )}
      />

      {/* Header row: avatar + name + status badge */}
      <button
        className="flex items-center gap-3 p-4 pb-0 w-full text-left active:opacity-80 transition-opacity"
        onClick={onViewLead}
      >
        <div
          className={cn(
            "w-11 h-11 rounded-full flex items-center justify-center shrink-0",
            isPending && "bg-amber-500/10",
            isApproved && "bg-emerald-500/10",
            isRejected && "bg-rose-500/10",
            !isPending && !isApproved && !isRejected && "bg-crimson-subtle",
          )}
        >
          <span className="font-sans font-bold text-[15px] text-text-primary">
            {item.initials}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-sans font-semibold text-[15px] text-text-primary truncate">
            {item.leadName}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="font-mono text-[11px] text-text-muted">
              {item.leadId}
            </span>
            <span className="text-text-muted">·</span>
            <span className="font-mono text-[11px] text-text-muted">
              HFM: {item.hfmId}
            </span>
          </div>
        </div>
        <Badge
          variant="secondary"
          className={cn(
            "text-[10px] font-semibold shrink-0 uppercase tracking-wider border",
            isPending && "bg-amber-500/10 text-amber-600 border-amber-500/20",
            isApproved &&
              "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
            isRejected && "bg-rose-500/10 text-rose-600 border-rose-500/20",
          )}
        >
          {meta.label}
        </Badge>
      </button>

      {/* Deposit + date + receipt */}
      <div className="px-4 pt-3 pb-3">
        <div className="h-px bg-white/5 mb-3" />
        <div className="flex items-center justify-between">
          <div>
            <div className="font-mono font-bold text-[22px] text-text-primary leading-none">
              {item.depositAmount}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <Clock size={12} className="text-text-muted" />
              <span className="font-sans text-[11px] text-text-muted">
                {item.submittedAt}
              </span>
            </div>
          </div>
          <ReceiptThumbnail leadId={item.id} onView={onViewReceipt} />
        </div>
      </div>

      {/* Action buttons — colored for pending items */}
      {isPending && (
        <div className="flex gap-2 px-4 pb-4">
          <button
            onClick={onApprove}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 h-11 rounded-xl font-sans font-semibold text-[13px]",
              "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
              "active:scale-[0.97] active:bg-emerald-500/20 transition-all",
            )}
          >
            <CheckCircle size={16} weight="bold" />
            Approve
          </button>
          <button
            onClick={onReject}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 h-11 rounded-xl font-sans font-semibold text-[13px]",
              "bg-rose-500/10 text-rose-600 border border-rose-500/20",
              "active:scale-[0.97] active:bg-rose-500/20 transition-all",
            )}
          >
            <XCircle size={16} weight="bold" />
            Reject
          </button>
          <button
            onClick={onAskMore}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 h-11 rounded-xl font-sans font-semibold text-[13px]",
              "bg-blue-500/10 text-blue-600 border border-blue-500/20",
              "active:scale-[0.97] active:bg-blue-500/20 transition-all",
            )}
          >
            <ChatCircleDots size={16} weight="bold" />
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
      <span className="font-sans font-bold text-[22px] text-text-primary">
        All caught up!
      </span>
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
  const router = useRouter();
  const verificationStatuses = `${LeadStatus.DEPOSIT_REPORTED},${LeadStatus.DEPOSIT_CONFIRMED},${LeadStatus.REJECTED}`;
  const { data: leadsResult, isLoading } = useLeadsList({
    skip: 0,
    take: 50,
    statuses: verificationStatuses,
  });
  // 3 separate queries for accurate counts (mirrors desktop)
  const { data: pendingResult } = useLeadsList({
    skip: 0,
    take: 1,
    status: LeadStatus.DEPOSIT_REPORTED,
  });
  const { data: approvedResult } = useLeadsList({
    skip: 0,
    take: 1,
    status: LeadStatus.DEPOSIT_CONFIRMED,
  });
  const { data: rejectedResult } = useLeadsList({
    skip: 0,
    take: 1,
    status: LeadStatus.REJECTED,
  });
  const leads = useMemo(() => leadsResult?.data ?? [], [leadsResult?.data]);
  const verifyMutation = useVerifyLead();
  const updateStatusMutation = useUpdateLeadStatus();
  const [filter, setFilter] = useState<FilterTab>("PENDING");
  const [askMoreLeadId, setAskMoreLeadId] = useState<string | null>(null);
  const [askMoreMsg, setAskMoreMsg] = useState("");
  const [askMoreFile, setAskMoreFile] = useState<File | null>(null);
  const [askMoreError, setAskMoreError] = useState<string | null>(null);
  const [askMoreSending, setAskMoreSending] = useState(false);
  const askMoreFileInputRef = useRef<HTMLInputElement>(null);
  const askMoreFilePreviewUrl = useMemo(
    () => (askMoreFile ? URL.createObjectURL(askMoreFile) : null),
    [askMoreFile],
  );

  useEffect(() => {
    return () => {
      if (askMoreFilePreviewUrl) URL.revokeObjectURL(askMoreFilePreviewUrl);
    };
  }, [askMoreFilePreviewUrl]);

  const [receiptPreview, setReceiptPreview] = useState<{
    id: string;
    name: string;
  } | null>(null);

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

  const localPendingCount = useMemo(
    () => pendingLeads.filter((l) => !processedIds.has(l.id)).length,
    [pendingLeads, processedIds],
  );
  const pendingCount = pendingResult?.total ?? localPendingCount;

  const approvedToday =
    approvedResult?.total ??
    leads.filter((l) => l.status === LeadStatus.DEPOSIT_CONFIRMED).length;
  const rejectedToday =
    rejectedResult?.total ??
    leads.filter((l) => l.status === LeadStatus.REJECTED).length;

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleApprove = useCallback(
    async (id: string) => {
      setProcessedIds((prev) => new Set(prev).add(id));
      setTodayCount((c) => c + 1);
      toast.success("Lead approved");
      onApprove?.(id);
      if (typeof navigator !== "undefined" && navigator.vibrate)
        navigator.vibrate([8, 40, 8]);
      try {
        verifyMutation.mutate(id);
      } catch {
        /* noop */
      }
    },
    [onApprove, verifyMutation],
  );

  const handleReject = useCallback(
    async (id: string) => {
      setProcessedIds((prev) => new Set(prev).add(id));
      toast.error("Lead rejected");
      onReject?.(id);
      if (typeof navigator !== "undefined" && navigator.vibrate)
        navigator.vibrate(30);
      try {
        updateStatusMutation.mutate({ id, data: { status: "REJECTED" } });
      } catch {
        /* noop */
      }
    },
    [onReject, updateStatusMutation],
  );

  const handleAskMore = useCallback((id: string) => {
    setAskMoreLeadId(id);
    setAskMoreMsg("");
    setAskMoreFile(null);
    setAskMoreError(null);
  }, []);

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border-subtle">
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <div className="flex items-center gap-2.5">
            <ShieldCheck
              size={22}
              className="text-text-secondary"
              weight="fill"
            />
            <h1 className="font-sans font-bold text-[18px] text-text-primary">
              Verification
            </h1>
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
                "shrink-0 rounded-full h-8 px-4 font-sans text-[13px] font-semibold transition-all duration-200 border",
                filter === tab.id
                  ? "bg-crimson/10 text-crimson border-crimson/20 shadow-sm"
                  : "bg-card text-text-secondary border-border-subtle active:text-text-primary",
              )}
            >
              {tab.label}
              {tab.id === "PENDING" && pendingCount > 0 && (
                <span className="ml-1.5 font-mono text-[11px]">
                  ({pendingCount})
                </span>
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
            {/* Pending — amber */}
            <div className="flex-1 p-3 rounded-2xl bg-amber-500/5 border border-amber-500/15 shadow-sm">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/10">
                <Clock size={16} className="text-amber-500" weight="fill" />
              </span>
              <p className="font-mono text-[22px] font-bold text-text-primary leading-none mt-2">
                {pendingCount}
              </p>
              <p className="font-sans text-[11px] text-amber-600 font-medium mt-0.5">
                Pending
              </p>
            </div>
            {/* Approved — emerald */}
            <div className="flex-1 p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 shadow-sm">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/10">
                <CheckCircle
                  size={16}
                  className="text-emerald-500"
                  weight="fill"
                />
              </span>
              <p className="font-mono text-[22px] font-bold text-text-primary leading-none mt-2">
                {approvedToday + todayCount}
              </p>
              <p className="font-sans text-[11px] text-emerald-600 font-medium mt-0.5">
                Approved
              </p>
            </div>
            {/* Rejected — rose */}
            <div className="flex-1 p-3 rounded-2xl bg-rose-500/5 border border-rose-500/15 shadow-sm">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-rose-500/10">
                <XCircle size={16} className="text-rose-500" weight="fill" />
              </span>
              <p className="font-mono text-[22px] font-bold text-text-primary leading-none mt-2">
                {rejectedToday}
              </p>
              <p className="font-sans text-[11px] text-rose-600 font-medium mt-0.5">
                Rejected
              </p>
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
              onViewReceipt={() =>
                setReceiptPreview({ id: item.id, name: item.leadName })
              }
              onViewLead={() => router.push(`/leads/detail?id=${item.id}`)}
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

      {/* ── Ask More Sheet ───────────────────────────────────────────────────── */}
      <Sheet
        open={!!askMoreLeadId}
        onOpenChange={(open) => {
          if (!open) {
            setAskMoreLeadId(null);
            setAskMoreMsg("");
            setAskMoreFile(null);
            setAskMoreError(null);
          }
        }}
      >
        <SheetContent
          side="bottom"
          className="rounded-t-xl px-4 pb-[calc(24px+env(safe-area-inset-bottom))] pt-0"
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-4">
            <div className="w-10 h-1 rounded-full bg-border-subtle" />
          </div>
          <p className="font-sans font-semibold text-[16px] text-text-primary mb-3">
            Ask for more info
          </p>
          <input
            ref={askMoreFileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const selected = e.target.files?.[0] ?? null;
              if (!selected) return;
              const error = validateReplyAttachmentFile(selected);
              if (error) {
                setAskMoreError(error);
                e.currentTarget.value = "";
                return;
              }
              setAskMoreError(null);
              setAskMoreFile(selected);
            }}
          />
          <Textarea
            placeholder="Type your message…"
            value={askMoreMsg}
            onChange={(e) => {
              setAskMoreMsg(e.target.value);
              if (askMoreError) setAskMoreError(null);
            }}
            rows={4}
            className="resize-none mb-3"
          />
          <div className="mb-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => askMoreFileInputRef.current?.click()}
              className="h-9 px-3 rounded-lg bg-elevated text-text-secondary text-[13px] font-sans font-medium flex items-center gap-1"
            >
              <Paperclip size={14} />
              Attach file
            </button>
            {askMoreFile && (
              <div className="flex min-w-0 items-center gap-2">
                {askMoreFile.type.startsWith("image/") && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={askMoreFilePreviewUrl ?? undefined}
                    alt={askMoreFile.name}
                    className="h-10 w-10 shrink-0 rounded-md border border-border-subtle object-cover"
                  />
                )}
                <button
                  type="button"
                  onClick={() => {
                    setAskMoreFile(null);
                    if (askMoreFileInputRef.current)
                      askMoreFileInputRef.current.value = "";
                  }}
                  className="truncate text-[12px] text-text-muted"
                >
                  {askMoreFile.name} (remove)
                </button>
              </div>
            )}
          </div>
          {askMoreError && (
            <p className="font-sans text-[13px] text-danger mb-2">
              {askMoreError}
            </p>
          )}
          <button
            disabled={askMoreSending}
            onClick={async () => {
              if (!askMoreLeadId) return;
              const message = normalizeLeadReplyMessage(askMoreMsg);
              if (!canSendLeadReply(message, askMoreFile)) {
                setAskMoreError(LEAD_REPLY_REQUIRED_MESSAGE);
                return;
              }
              setAskMoreSending(true);
              setAskMoreError(null);
              try {
                await leadsApi.reply(askMoreLeadId, {
                  message,
                  file: askMoreFile,
                });
                toast.success("Message sent");
                setAskMoreLeadId(null);
                setAskMoreMsg("");
                setAskMoreFile(null);
              } catch (err) {
                setAskMoreError(
                  err instanceof Error ? err.message : "Failed to send message",
                );
              } finally {
                setAskMoreSending(false);
              }
            }}
            className={cn(
              "w-full h-[48px] rounded-xl font-sans font-semibold text-[15px] flex items-center justify-center gap-2 transition-colors",
              canSendLeadReply(askMoreMsg, askMoreFile) && !askMoreSending
                ? "bg-crimson text-white active:scale-[0.97]"
                : "bg-elevated text-text-muted cursor-not-allowed",
            )}
          >
            {askMoreSending ? (
              <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              "Send"
            )}
          </button>
        </SheetContent>
      </Sheet>
    </div>
  );
}

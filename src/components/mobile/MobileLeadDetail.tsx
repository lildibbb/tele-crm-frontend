"use client";

import React, { useCallback, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CaretLeft,
  DotsThree,
  CurrencyDollar,
  UserSwitch,
  CheckCircle,
  XCircle,
  Phone,
  EnvelopeSimple,
  CalendarBlank,
  IdentificationBadge,
  TelegramLogo,
  ChatCircleDots,
  PaperclipHorizontal,
  Clock,
  ShieldCheck,
  ArrowsClockwise,
  ArrowCounterClockwise,
  ArrowClockwise,
  Copy,
  Star,
  Robot,
  X,
  File,
} from "@phosphor-icons/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Lead } from "@/queries/useLeadsQuery";
import { useSetHandover } from "@/queries/useLeadsQuery";
import { useAuthStore } from "@/store/authStore";
import { attachmentsApi, leadsApi } from "@/lib/api";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatDateTime, timeAgo, getInitials } from "@/lib/format";
import { LEAD_STATUS_BADGE } from "@/lib/badge-config";
import MobileAttachmentAnnotationDialog from "@/components/chat/MobileAttachmentAnnotationDialog";
import { toast } from "sonner";
import MobileImageViewerDialog from "@/components/mobile/MobileImageViewerDialog";

// ── Types ──────────────────────────────────────────────────────────────────────
type MediaItem = {
  url: string;
  type: "image" | "video" | "file";
  name: string;
  mimeType?: string | null;
  size?: number | null;
};

export interface MobileLeadDetailProps {
  readonly lead?: Partial<Lead>;
  readonly isLoading?: boolean;
  readonly onVerify?: () => void;
  readonly onReject?: () => void;
  readonly onRevert?: () => void;
  readonly onReopen?: () => void;
  readonly onUpdateStatus?: () => void;
  readonly onBack?: () => void;
  readonly onSendMessage?: (message: string) => void;
}

interface InfoCardData {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
  copyable?: boolean;
}

interface TimelineEntry {
  id: string;
  color: string;
  icon: React.ReactNode;
  description: string;
  time: string;
  type: "system" | "action" | "milestone";
}

// ── Skeleton Pulse Block ──────────────────────────────────────────────────────
function Pulse({ className }: { className?: string }) {
  return <Skeleton className={cn("rounded-lg", className)} />;
}

// ── Info Card ─────────────────────────────────────────────────────────────────
function InfoCard({ card }: { card: InfoCardData }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (!card.copyable || card.value === "—") return;
    navigator.clipboard?.writeText(card.value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [card.copyable, card.value]);

  return (
    <button
      type="button"
      onClick={card.copyable ? handleCopy : undefined}
      className={cn(
        "relative flex items-start gap-3 p-3.5 rounded-2xl bg-card/60 backdrop-blur-xl border border-white/10 shadow-[0_4px_20px_rgb(0,0,0,0.04)]",
        "transition-all duration-150 text-left w-full overflow-hidden group",
        card.copyable && "active:scale-[0.97] active:bg-elevated/40",
      )}
    >
      {/* Subtle glass reflection */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <div className="w-8 h-8 rounded-lg bg-elevated flex items-center justify-center shrink-0 mt-0.5">
        {card.icon}
      </div>
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span className="font-sans text-[11px] text-text-muted uppercase tracking-wider">
          {card.label}
        </span>
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "text-[14px] text-text-primary truncate",
              card.mono ? "font-mono" : "font-sans font-medium",
            )}
          >
            {card.value}
          </span>
          {card.copyable && card.value !== "—" && (
            <span className="shrink-0 text-text-muted">
              {copied ? (
                <CheckCircle
                  size={13}
                  weight="fill"
                  className="text-text-secondary"
                />
              ) : (
                <Copy size={13} />
              )}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ── Timeline Bubble ───────────────────────────────────────────────────────────
function TimelineBubble({
  entry,
  isLast,
}: {
  entry: TimelineEntry;
  isLast: boolean;
}) {
  return (
    <div className="flex gap-3">
      {/* Vertical track */}
      <div className="flex flex-col items-center w-5 shrink-0">
        <div className="w-[10px] h-[10px] rounded-full mt-1.5 ring-2 ring-background bg-border-default shrink-0" />
        {!isLast && (
          <div
            className="w-px flex-1 bg-border-subtle mt-1"
            style={{ minHeight: 24 }}
          />
        )}
      </div>
      {/* Bubble */}
      <div
        className={cn(
          "flex-1 rounded-2xl px-3.5 py-2.5 mb-2 shadow-sm border",
          entry.type === "milestone"
            ? "bg-elevated/60 backdrop-blur-xl border-white/5"
            : "bg-card/60 backdrop-blur-xl border-white/10",
        )}
      >
        <div className="flex items-start gap-2">
          <span className="shrink-0 mt-0.5 text-text-muted">{entry.icon}</span>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="font-sans text-[13px] text-text-primary leading-snug">
              {entry.description}
            </span>
            <span className="font-mono text-[11px] text-text-muted">
              {entry.time}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Loading Skeleton ──────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-background text-text-primary font-sans">
      <div className="pt-[env(safe-area-inset-top)]" />

      {/* Accent bar skeleton */}
      <div className="h-1 bg-elevated/40 animate-pulse" />

      {/* Header */}
      <header className="flex items-center justify-between px-4 h-14 bg-card/80 border-b border-border-subtle">
        <Pulse className="w-16 h-5" />
        <Pulse className="w-24 h-5" />
        <Pulse className="w-8 h-8 rounded-full" />
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-5">
        {/* Avatar hero */}
        <div className="flex flex-col items-center gap-3 py-6">
          <Pulse className="w-20 h-20 rounded-full" />
          <Pulse className="w-36 h-6" />
          <Pulse className="w-24 h-4" />
          <div className="flex gap-2 mt-1">
            <Pulse className="w-20 h-7 rounded-full" />
            <Pulse className="w-20 h-7 rounded-full" />
          </div>
        </div>

        {/* Info cards */}
        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Pulse key={i} className="h-[62px] rounded-xl" />
          ))}
        </div>

        {/* Timeline skeleton */}
        <div className="flex flex-col gap-2 mt-2">
          <Pulse className="w-32 h-5 mb-1" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center w-5">
                <Pulse className="w-[10px] h-[10px] rounded-full" />
                {i < 3 && <div className="w-px flex-1 bg-border-subtle mt-1" />}
              </div>
              <Pulse className="flex-1 h-16 rounded-xl mb-2" />
            </div>
          ))}
        </div>
      </main>

      {/* Bottom action skeleton */}
      <div className="px-4 pt-3 pb-[calc(16px+env(safe-area-inset-bottom))] border-t border-border-subtle bg-background">
        <div className="flex gap-3">
          <Pulse className="flex-1 h-[52px] rounded-xl" />
          <Pulse className="flex-1 h-[52px] rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function MobileLeadDetail({
  lead,
  isLoading = false,
  onVerify,
  onReject,
  onRevert,
  onReopen,
  onUpdateStatus,
  onBack,
  onSendMessage,
}: MobileLeadDetailProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const role = user?.role ?? "STAFF";
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<MediaItem | null>(null);
  const [annotationTarget, setAnnotationTarget] = useState<{
    sourceUrl: string;
    sourceFileName: string;
  } | null>(null);
  const handoverMutation = useSetHandover();
  const [menuOpen, setMenuOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [handover, setHandover] = useState(lead?.handoverMode ?? false);

  useEffect(() => {
    if (lead) setHandover(lead.handoverMode ?? false);
  }, [lead?.handoverMode]);

  const { data: attachmentsData } = useQuery({
    queryKey: ["lead-attachments", lead?.id],
    queryFn: () =>
      attachmentsApi.findByLead(lead!.id!).then((r) => r.data.data ?? []),
    enabled: !!lead?.id,
    staleTime: 30_000,
  });
  const attachments = attachmentsData ?? [];

  const { data: interactionsData } = useQuery({
    queryKey: ["lead-interactions", lead?.id],
    queryFn: () =>
      leadsApi
        .getInteractions(lead!.id!, { skip: 0, take: 30 })
        .then((r) => r.data.data ?? []),
    enabled: !!lead?.id,
    refetchInterval: 5000,
    staleTime: 0,
  });
  const interactions = interactionsData ?? [];

  // Auto-scroll chat to latest message
  useEffect(() => {
    if (chatEndRef.current && interactions.length > 0) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [interactions]);

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
      return;
    }
    router.back();
  }, [onBack, router]);

  if (isLoading || !lead) return <LoadingSkeleton />;

  const status = lead.status ?? "NEW";
  const cfg = LEAD_STATUS_BADGE[status] ?? LEAD_STATUS_BADGE.NEW;
  const name = lead.displayName ?? lead.username ?? "Unknown";
  const initials = getInitials(name);

  // Build timeline
  const timeline: TimelineEntry[] = [];
  if (lead.createdAt) {
    timeline.push({
      id: "created",
      color: "var(--info)",
      icon: <Star size={14} weight="fill" className="text-text-secondary" />,
      description: "Lead created via Telegram bot",
      time: formatDateTime(lead.createdAt),
      type: "milestone",
    });
  }
  if (lead.contactedAt) {
    timeline.push({
      id: "contacted",
      color: "#3b82f6",
      icon: (
        <IdentificationBadge
          size={14}
          weight="fill"
          className="text-text-secondary"
        />
      ),
      description: "Lead first contacted by team",
      time: formatDateTime(lead.contactedAt),
      type: "milestone",
    });
  }
  if (lead.registeredAt) {
    timeline.push({
      id: "registered",
      color: "#A855F7",
      icon: (
        <IdentificationBadge
          size={14}
          weight="fill"
          className="text-text-secondary"
        />
      ),
      description: `Account registered on HFM${lead.hfmBrokerId ? ` (ID: ${lead.hfmBrokerId})` : ""}`,
      time: formatDateTime(lead.registeredAt),
      type: "milestone",
    });
  }
  if (lead.depositBalance && status !== "NEW") {
    timeline.push({
      id: "deposit",
      color: "var(--warning)",
      icon: (
        <CurrencyDollar
          size={14}
          weight="fill"
          className="text-text-secondary"
        />
      ),
      description: `Deposit proof submitted — ${lead.depositBalance}`,
      time: formatDateTime(lead.depositReportedAt ?? lead.updatedAt),
      type: "action",
    });
  }
  if (lead.verifiedAt) {
    timeline.push({
      id: "verified",
      color: "var(--success)",
      icon: (
        <ShieldCheck size={14} weight="fill" className="text-text-secondary" />
      ),
      description: "Deposit verified by team",
      time: formatDateTime(lead.verifiedAt),
      type: "milestone",
    });
  }
  if (status === "REJECTED") {
    timeline.push({
      id: "rejected",
      color: "var(--danger)",
      icon: <XCircle size={14} weight="fill" className="text-text-secondary" />,
      description: "Lead status set to Rejected",
      time: formatDateTime(lead.updatedAt),
      type: "action",
    });
  }

  const infoCards: InfoCardData[] = [
    {
      icon: (
        <IdentificationBadge
          size={16}
          weight="duotone"
          className="text-text-secondary"
        />
      ),
      label: "Lead ID",
      value: `#${lead.id?.slice(-8) ?? "—"}`,
      mono: true,
      copyable: true,
    },
    {
      icon: (
        <IdentificationBadge
          size={16}
          weight="duotone"
          className="text-text-secondary"
        />
      ),
      label: "HFM Broker ID",
      value: lead.hfmBrokerId ?? "—",
      mono: true,
      copyable: true,
    },
    {
      icon: (
        <TelegramLogo
          size={16}
          weight="duotone"
          className="text-text-secondary"
        />
      ),
      label: "Telegram ID",
      value: lead.telegramUserId ?? "—",
      mono: true,
      copyable: true,
    },
    {
      icon: (
        <CalendarBlank
          size={16}
          weight="duotone"
          className="text-text-secondary"
        />
      ),
      label: "Registered",
      value: lead.registeredAt ? formatDate(lead.registeredAt) : "Not yet",
    },
    {
      icon: (
        <EnvelopeSimple
          size={16}
          weight="duotone"
          className="text-text-secondary"
        />
      ),
      label: "Email",
      value: lead.email ?? "—",
      copyable: !!lead.email,
    },
    {
      icon: (
        <Phone size={16} weight="duotone" className="text-text-secondary" />
      ),
      label: "Phone",
      value: lead.phoneNumber ?? "—",
      copyable: !!lead.phoneNumber,
    },
  ];

  const canVerify =
    status === "DEPOSIT_REPORTED" &&
    (role === "OWNER" || role === "ADMIN" || role === "STAFF");

  const hasDeposit =
    (status === "DEPOSIT_REPORTED" || status === "DEPOSIT_CONFIRMED") &&
    !!lead.depositBalance;

  // Mock attachments from deposit proof (placeholder thumbnails)
  const hasAttachments = attachments.length > 0;

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background text-text-primary font-sans">
      <div className="pt-[env(safe-area-inset-top)]" />

      {/* ── Status accent bar ─────────────────────────────────────────── */}
      <div className="h-1 shrink-0 bg-border-subtle" />

      {/* ── Header ────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-4 h-14 bg-card/80 backdrop-blur-xl border-b border-border-subtle shrink-0 sticky top-0 z-30">
        <button
          onClick={handleBack}
          className="flex items-center gap-1 min-w-[44px] min-h-[44px] text-crimson active:opacity-70 transition-opacity"
          aria-label="Go back"
        >
          <CaretLeft size={20} weight="bold" />
          <span className="font-sans text-[14px] font-semibold">Back</span>
        </button>
        <div className="flex flex-col items-center">
          <span className="font-sans font-bold text-[16px] text-text-primary leading-tight">
            Lead Detail
          </span>
          <span className="font-mono text-[10px] text-text-muted leading-tight">
            {timeAgo(lead.updatedAt)}
          </span>
        </div>
        <button
          onClick={() => setMenuOpen(true)}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-text-secondary active:opacity-70 transition-opacity"
          aria-label="More options"
        >
          <DotsThree size={24} weight="bold" />
        </button>
      </header>

      {/* ── Scrollable content ────────────────────────────────────────── */}
      <main
        className="flex-1 overflow-y-auto overscroll-contain"
        style={{
          WebkitOverflowScrolling: "touch",
          paddingBottom: "calc(80px + env(safe-area-inset-bottom))",
        }}
      >
        {/* ── Quick Action Bar — Chat CTA ───────────────────────────── */}
        {lead.id && (
          <div className="px-4 py-3 border-b border-border-subtle bg-card/50">
            <button
              onClick={() => router.push(`/leads/chat?id=${lead.id}`)}
              className="w-full h-[48px] rounded-xl bg-crimson text-white flex items-center justify-center gap-2.5 font-sans font-bold text-[14px] active:scale-[0.97] transition-transform shadow-md shadow-crimson/15"
            >
              <ChatCircleDots size={18} weight="bold" />
              Open Chat
              {interactions.length > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-white/20 text-[11px] font-mono font-semibold">
                  {interactions.length}
                </span>
              )}
            </button>
          </div>
        )}
        {/* ── Avatar Hero ──────────────────────────────────────────────── */}
        <section className="relative px-4 pt-6 pb-5">
          <div className="relative flex flex-col items-center gap-3">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="w-20 h-20 shrink-0">
                <AvatarFallback className="bg-elevated text-text-primary text-[28px] font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {/* Status dot */}
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full border-[3px] border-background bg-border-default" />
            </div>

            {/* Name + username */}
            <div className="text-center">
              <h1 className="font-sans font-bold text-[22px] text-text-primary leading-tight">
                {name}
              </h1>
              {lead.username && (
                <p className="font-mono text-[13px] text-text-secondary mt-0.5">
                  @{lead.username}
                </p>
              )}
            </div>

            {/* Status badge + Handover badge */}
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <Badge
                variant="secondary"
                className={cn(
                  "text-[11px] font-bold uppercase tracking-wider",
                  cfg.cls,
                )}
              >
                {status.replace(/_/g, " ")}
              </Badge>

              {handover ? (
                <Badge
                  variant="secondary"
                  className="text-[11px] font-semibold gap-1"
                >
                  <UserSwitch
                    size={13}
                    weight="bold"
                    className="text-text-secondary"
                  />
                  Handover
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="text-[11px] font-semibold gap-1 bg-crimson/10 text-crimson border-crimson/20"
                >
                  <Robot size={13} weight="bold" />
                  Bot Active
                </Badge>
              )}
            </div>

            {/* Quick contact chips */}
            <div className="flex items-center gap-2 mt-1">
              {lead.phoneNumber && (
                <a
                  href={`tel:${lead.phoneNumber}`}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-card border border-border-subtle text-text-secondary text-[12px] font-medium active:scale-[0.96] transition-transform"
                >
                  <Phone
                    size={14}
                    weight="bold"
                    className="text-text-secondary"
                  />
                  {lead.phoneNumber}
                </a>
              )}
              {lead.email && (
                <a
                  href={`mailto:${lead.email}`}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-card border border-border-subtle text-text-secondary text-[12px] font-medium active:scale-[0.96] transition-transform"
                >
                  <EnvelopeSimple
                    size={14}
                    weight="bold"
                    className="text-text-secondary"
                  />
                  Email
                </a>
              )}
            </div>
          </div>
        </section>

        {/* ── Deposit Banner ───────────────────────────────────────────── */}
        {hasDeposit && (
          <section className="px-4 mb-4">
            <div
              className={cn(
                "relative flex flex-col items-center gap-2 rounded-3xl p-5 bg-card/60 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden",
              )}
            >
              {/* Subtle glass reflection */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 pointer-events-none" />

              <div className="relative flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <CurrencyDollar
                    size={20}
                    weight="fill"
                    className="text-text-secondary"
                  />
                  <span className="font-sans font-semibold text-[14px] text-text-primary">
                    Deposit
                  </span>
                </div>
                <Badge variant="secondary" className="text-[11px] font-bold">
                  {status === "DEPOSIT_CONFIRMED" ? "✓ Verified" : "⏳ Pending"}
                </Badge>
              </div>
              <span className="relative font-mono font-bold text-[36px] leading-none text-text-primary mt-1">
                {lead.depositBalance}
              </span>
              <span className="relative font-sans text-[12px] text-text-muted">
                Last updated {timeAgo(lead.updatedAt)}
              </span>
            </div>
          </section>
        )}

        {/* ── Info Cards ───────────────────────────────────────────────── */}
        <section className="px-4 mb-5">
          <h2 className="font-sans font-bold text-[13px] text-text-muted uppercase tracking-wider mb-3">
            Lead Information
          </h2>
          <div className="flex flex-col gap-2">
            {infoCards.map((card) => (
              <InfoCard key={card.label} card={card} />
            ))}
          </div>
        </section>

        {/* ── Attachment Previews ───────────────────────────────────────── */}
        {hasAttachments && (
          <section className="px-4 mb-5">
            <h2 className="font-sans font-bold text-[13px] text-text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <PaperclipHorizontal size={14} weight="bold" />
              Attachments
              <span className="text-[10px] font-mono ml-1 text-text-muted">
                {attachments.length}
              </span>
            </h2>
            <div
              className="max-h-[260px] overflow-y-auto pr-1"
              style={{ scrollbarWidth: "thin" }}
            >
              <div className="grid grid-cols-2 gap-2">
                {attachments.map((file) => {
                  const isImg = file.mimeType?.startsWith("image/");
                  const isVid = file.mimeType?.startsWith("video/");
                  const fileName =
                    file.fileKey?.split("/").pop() ??
                    file.fileUrl?.split("/").pop() ??
                    "File";
                  return (
                    <button
                      key={file.id}
                      onClick={() =>
                        setMediaPreview({
                          url: file.fileUrl,
                          type: isImg ? "image" : isVid ? "video" : "file",
                          name: fileName,
                          mimeType: file.mimeType,
                          size: file.size,
                        })
                      }
                      className="relative h-[100px] overflow-hidden rounded-xl border border-border-subtle bg-elevated active:scale-[0.95] transition-transform group"
                    >
                      {isImg ? (
                        <img
                          src={file.fileUrl}
                          alt={fileName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-text-muted">
                          <File size={24} weight="duotone" />
                          <span className="max-w-[90px] truncate px-1 text-[9px] font-sans">
                            {fileName}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── Activity Timeline ────────────────────────────────────────── */}
        {timeline.length > 0 && (
          <section className="px-4 mb-5">
            <h2 className="font-sans font-bold text-[13px] text-text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Clock size={14} weight="bold" />
              Activity Timeline
            </h2>
            <div className="flex flex-col">
              {timeline.map((entry, idx) => (
                <TimelineBubble
                  key={entry.id}
                  entry={entry}
                  isLast={idx === timeline.length - 1}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* ── Sticky Action Bar — status-dependent ──────────────────────── */}
      {(canVerify || onRevert || onReopen) && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border-subtle px-4 pt-3 pb-[calc(16px+env(safe-area-inset-bottom))]">
          <div className="flex gap-3">
            {/* DEPOSIT_REPORTED → Verify + Reject */}
            {canVerify && (
              <>
                <button
                  onClick={onVerify}
                  className="flex-1 h-[52px] rounded-xl font-sans font-bold text-[15px] bg-crimson text-white flex items-center justify-center gap-2 active:scale-[0.96] transition-transform shadow-lg shadow-crimson/20"
                >
                  <CheckCircle size={20} weight="bold" />
                  Verify
                </button>
                <button
                  onClick={onReject}
                  className="flex-1 h-[52px] rounded-xl font-sans font-bold text-[15px] bg-elevated text-text-secondary border border-border-subtle flex items-center justify-center gap-2 active:scale-[0.96] transition-transform"
                >
                  <XCircle
                    size={20}
                    weight="bold"
                    className="text-text-secondary"
                  />
                  Reject
                </button>
              </>
            )}
            {/* DEPOSIT_CONFIRMED → Revert */}
            {!canVerify && onRevert && (
              <button
                onClick={onRevert}
                className="flex-1 h-[52px] rounded-xl font-sans font-bold text-[15px] bg-elevated text-warning border border-warning/30 flex items-center justify-center gap-2 active:scale-[0.96] transition-transform"
              >
                <ArrowCounterClockwise size={20} weight="bold" />
                Revert Verification
              </button>
            )}
            {/* REJECTED → Reopen */}
            {!canVerify && !onRevert && onReopen && (
              <button
                onClick={onReopen}
                className="flex-1 h-[52px] rounded-xl font-sans font-bold text-[15px] bg-elevated text-info border border-info/30 flex items-center justify-center gap-2 active:scale-[0.96] transition-transform"
              >
                <ArrowClockwise size={20} weight="bold" />
                Reopen for Review
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── 3-dots Action Sheet ───────────────────────────────────────── */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl px-4 pb-[env(safe-area-inset-bottom)]"
        >
          <SheetHeader className="pb-3">
            <SheetTitle className="text-text-primary">Lead Actions</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-2">
            {/* Handover toggle */}
            {role !== "STAFF" && (
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-elevated">
                <div className="flex items-center gap-2">
                  <UserSwitch
                    size={18}
                    weight="bold"
                    className="text-text-secondary"
                  />
                  <span className="font-sans text-[14px] font-medium text-text-primary">
                    Handover Mode
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {handoverMutation.isPending && (
                    <div className="w-4 h-4 rounded-full border-2 border-crimson border-t-transparent animate-spin" />
                  )}
                  <Switch
                    checked={handover}
                    onCheckedChange={(checked) => {
                      setHandover(checked);
                      if (lead)
                        handoverMutation.mutate({
                          id: lead.id!,
                          mode: checked,
                        });
                    }}
                    disabled={handoverMutation.isPending}
                    className={
                      handover
                        ? "data-[state=checked]:bg-crimson"
                        : "data-[state=checked]:bg-success"
                    }
                  />
                </div>
              </div>
            )}

            {/* Revert */}
            {onRevert && (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onRevert();
                }}
                className="w-full min-h-[50px] flex items-center justify-center gap-2 rounded-xl bg-elevated font-sans font-semibold text-[15px] text-warning active:opacity-70 transition-opacity"
              >
                <ArrowCounterClockwise size={18} weight="bold" />
                Revert Verification
              </button>
            )}

            {/* Reopen */}
            {onReopen && (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onReopen();
                }}
                className="w-full min-h-[50px] flex items-center justify-center gap-2 rounded-xl bg-elevated font-sans font-semibold text-[15px] text-info active:opacity-70 transition-opacity"
              >
                <ArrowClockwise size={18} weight="bold" />
                Reopen for Review
              </button>
            )}

            {/* Update Status */}
            {onUpdateStatus && (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onUpdateStatus();
                }}
                className="w-full min-h-[50px] flex items-center justify-center gap-2 rounded-xl bg-crimson text-white font-sans font-semibold text-[15px] active:opacity-70 transition-opacity"
              >
                <ArrowsClockwise size={18} weight="bold" />
                Update Status
              </button>
            )}

            <button
              onClick={() => setMenuOpen(false)}
              className="w-full min-h-[50px] flex items-center justify-center rounded-xl bg-elevated font-sans font-semibold text-[15px] text-text-secondary active:bg-card transition-colors mt-1"
            >
              Cancel
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Media Lightbox ── */}
      <MobileImageViewerDialog
        open={Boolean(mediaPreview)}
        item={
          mediaPreview
            ? {
                url: mediaPreview.url,
                name: mediaPreview.name,
                type: mediaPreview.type,
                mimeType: mediaPreview.mimeType,
              }
            : null
        }
        onClose={() => setMediaPreview(null)}
        onEdit={(item) => {
          if (!item.url?.trim()) return;
          setAnnotationTarget({
            sourceUrl: item.url.trim(),
            sourceFileName: item.name || "image",
          });
          setMediaPreview(null);
        }}
      />
      <MobileAttachmentAnnotationDialog
        open={Boolean(annotationTarget)}
        sourceUrl={annotationTarget?.sourceUrl ?? null}
        sourceFileName={annotationTarget?.sourceFileName ?? "image"}
        onClose={() => setAnnotationTarget(null)}
        onSave={(editedFile) => {
          const objectUrl = URL.createObjectURL(editedFile);
          const link = document.createElement("a");
          link.href = objectUrl;
          link.download = editedFile.name;
          link.click();
          URL.revokeObjectURL(objectUrl);
          toast.success("Edited image ready for sharing.");
        }}
      />
    </div>
  );
}

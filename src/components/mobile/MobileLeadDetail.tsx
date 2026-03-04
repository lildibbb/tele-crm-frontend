"use client";

import React, { useCallback, useState } from "react";
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
  Image as ImageIcon,
  FileText,
  Clock,
  ShieldCheck,
  PaperPlaneTilt,
  ArrowsClockwise,
  ArrowCounterClockwise,
  ArrowClockwise,
  Copy,
  Star,
  Robot,
  X,
  DownloadSimple,
  File,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import type { Lead } from "@/queries/useLeadsQuery";
import { useSetHandover } from "@/queries/useLeadsQuery";
import { useAuthStore } from "@/store/authStore";
import { attachmentsApi, leadsApi } from "@/lib/api";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatDateTime, timeAgo, getInitials } from "@/lib/format";
import { LEAD_STATUS_BADGE } from "@/lib/badge-config";

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
        "flex items-start gap-3 p-3.5 rounded-xl bg-card border border-border-subtle",
        "transition-all duration-150 text-left w-full",
        card.copyable && "active:scale-[0.97] active:bg-elevated",
      )}
    >
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
          "flex-1 rounded-xl px-3.5 py-2.5 mb-2",
          entry.type === "milestone"
            ? "bg-elevated border border-border-subtle"
            : "bg-card border border-border-subtle",
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
  const { user } = useAuthStore();
  const role = user?.role ?? "STAFF";
  const [messageText, setMessageText] = useState("");
  const [mediaPreview, setMediaPreview] = useState<MediaItem | null>(null);
  const handoverMutation = useSetHandover();

  const { data: attachmentsData } = useQuery({
    queryKey: ["lead-attachments", lead?.id],
    queryFn: () => attachmentsApi.findByLead(lead!.id!).then((r) => r.data.data ?? []),
    enabled: !!lead?.id,
    staleTime: 30_000,
  });
  const attachments = attachmentsData ?? [];

  const { data: interactionsData } = useQuery({
    queryKey: ["lead-interactions", lead?.id],
    queryFn: () => leadsApi.getInteractions(lead!.id!, { skip: 0, take: 30 }).then((r) => r.data.data ?? []),
    enabled: !!lead?.id,
    refetchInterval: 5000,
    staleTime: 0,
  });
  const interactions = interactionsData ?? [];

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
      return;
    }
    router.back();
  }, [onBack, router]);

  const handleSend = useCallback(() => {
    const trimmed = messageText.trim();
    if (!trimmed || !onSendMessage) return;
    onSendMessage(trimmed);
    setMessageText("");
  }, [messageText, onSendMessage]);

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
          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-text-secondary active:opacity-70 transition-opacity"
          aria-label="More options"
        >
          <DotsThree size={24} weight="bold" />
        </button>
      </header>

      {/* ── Scrollable content ────────────────────────────────────────── */}
      <main
        className="flex-1 overflow-y-auto overscroll-contain"
        style={{ paddingBottom: "calc(100px + env(safe-area-inset-bottom))" }}
      >
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
                className={cn("text-[11px] font-bold uppercase tracking-wider", cfg.cls)}
              >
                {status.replace(/_/g, " ")}
              </Badge>

              {lead.handoverMode ? (
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
                "rounded-2xl p-5 flex flex-col items-center gap-2 bg-elevated",
              )}
            >
              <div className="flex items-center justify-between w-full">
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
              <span className="font-mono font-bold text-[36px] leading-none text-text-primary mt-1">
                {lead.depositBalance}
              </span>
              <span className="font-sans text-[12px] text-text-muted">
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
              <span className="text-[10px] font-mono ml-1 text-text-muted">{attachments.length}</span>
            </h2>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory scrollbar-none">
              {attachments.map((file) => {
                const isImg = file.mimeType?.startsWith("image/");
                const isVid = file.mimeType?.startsWith("video/");
                const fileName = file.fileKey?.split("/").pop() ?? file.fileUrl?.split("/").pop() ?? "File";
                return (
                  <button
                    key={file.id}
                    onClick={() => setMediaPreview({
                      url: file.fileUrl,
                      type: isImg ? "image" : isVid ? "video" : "file",
                      name: fileName,
                      mimeType: file.mimeType,
                      size: file.size,
                    })}
                    className="shrink-0 snap-start w-[110px] h-[80px] rounded-xl overflow-hidden bg-elevated border border-border-subtle active:scale-[0.95] transition-transform relative group"
                  >
                    {isImg ? (
                      <img
                        src={file.fileUrl}
                        alt={fileName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-text-muted">
                        <File size={24} weight="duotone" />
                        <span className="text-[9px] font-sans truncate max-w-[80px] px-1">{fileName}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  </button>
                );
              })}
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

        {/* ── Chat History ─────────────────────────────────────────────── */}
        {onSendMessage && (
          <section className="px-4 mb-5">
            <h2 className="font-sans font-bold text-[13px] text-text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ChatCircleDots size={14} weight="bold" />
              Conversation
              {interactions.length > 0 && (
                <span className="text-[10px] font-mono ml-1 text-text-muted">{interactions.length}</span>
              )}
            </h2>
            <div
              className="space-y-2 max-h-[300px] overflow-y-auto rounded-xl bg-card border border-border-subtle p-3"
              style={{ scrollbarWidth: "thin" }}
            >
              {interactions.length === 0 ? (
                <p className="text-[12px] font-sans text-text-muted text-center py-6">No messages yet</p>
              ) : (
                interactions.map((msg, i) => {
                  const isSystem = msg.type === "SYSTEM_STATUS_CHANGE";
                  const isBot = msg.type === "AUTO_REPLY_SENT";
                  const isUser = msg.type === "MESSAGE_RECEIVED";

                  if (isSystem) {
                    return (
                      <div key={msg.id ?? i} className="text-center">
                        <span className="text-[10px] font-sans italic text-text-muted bg-elevated px-3 py-1 rounded-full">
                          {msg.content ?? ""}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div key={msg.id ?? i} className={`flex ${isUser ? "justify-start" : "justify-end"}`}>
                      <div className={cn(
                        "max-w-[85%] rounded-2xl px-3 py-2",
                        isUser
                          ? "bg-elevated border border-border-default"
                          : isBot
                          ? "bg-success/10 border border-success/20"
                          : "bg-crimson/10 border border-crimson/20"
                      )}>
                        {!isUser && isBot && (
                          <p className="text-[9px] font-sans font-bold text-success uppercase tracking-wider mb-1">Bot</p>
                        )}
                        {!isUser && !isBot && (
                          <p className="text-[9px] font-sans font-bold text-crimson uppercase tracking-wider mb-1">Agent</p>
                        )}
                        {msg.content && (
                          <p className="text-[13px] font-sans text-text-primary leading-relaxed">{msg.content}</p>
                        )}
                        <p className="text-[10px] font-mono text-text-muted mt-1">
                          {new Date(msg.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        )}

        {/* ── Send Message Section ─────────────────────────────────────── */}
        {onSendMessage && (
          <section className="px-4 mb-5">
            <h2 className="font-sans font-bold text-[13px] text-text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ChatCircleDots size={14} weight="bold" />
              Send Message
            </h2>
            <div className="flex gap-2 items-end">
              <div className="flex-1 bg-card border border-border-subtle rounded-xl overflow-hidden transition-colors">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message…"
                  rows={2}
                  className="w-full bg-transparent px-3.5 py-3 text-[14px] text-text-primary placeholder:text-text-muted resize-none outline-none font-sans"
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!messageText.trim()}
                className={cn(
                  "shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-[0.93]",
                  messageText.trim()
                    ? "bg-crimson text-white shadow-lg"
                    : "bg-elevated text-text-muted",
                )}
                aria-label="Send message"
              >
                <PaperPlaneTilt size={20} weight="fill" />
              </button>
            </div>
          </section>
        )}
      </main>

      {/* ── Sticky Action Bar ──────────────────────────────────────────── */}
      {(canVerify || !!onUpdateStatus || role !== "STAFF") && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-xl border-t border-border-subtle px-4 pt-3 pb-[calc(16px+env(safe-area-inset-bottom))]">
          {/* Handover toggle — OWNER/ADMIN only */}
          {role !== "STAFF" && (
            <div className="flex items-center justify-between mb-3">
              <span className="font-sans text-[14px] font-medium text-text-primary">
                Handover
              </span>
              <div className="flex items-center gap-2">
                {handoverMutation.isPending && (
                  <div className="w-4 h-4 rounded-full border-2 border-crimson border-t-transparent animate-spin" />
                )}
                <Switch
                  checked={lead.handoverMode ?? false}
                  onCheckedChange={(checked) =>
                    handoverMutation.mutate({ id: lead.id!, mode: checked })
                  }
                  disabled={handoverMutation.isPending}
                />
              </div>
            </div>
          )}
          {canVerify ? (
            <div className="flex gap-3">
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
                <XCircle size={20} weight="bold" className="text-text-secondary" />
                Reject
              </button>
            </div>
          ) : onRevert ? (
            <button
              onClick={onRevert}
              className="w-full h-[52px] rounded-xl font-sans font-bold text-[15px] bg-elevated text-warning border border-warning/30 flex items-center justify-center gap-2 active:scale-[0.96] transition-transform"
            >
              <ArrowCounterClockwise size={18} weight="bold" />
              Revert Verification
            </button>
          ) : onReopen ? (
            <button
              onClick={onReopen}
              className="w-full h-[52px] rounded-xl font-sans font-bold text-[15px] bg-elevated text-info border border-info/30 flex items-center justify-center gap-2 active:scale-[0.96] transition-transform"
            >
              <ArrowClockwise size={18} weight="bold" />
              Reopen for Review
            </button>
          ) : onUpdateStatus ? (
            <button
              onClick={onUpdateStatus}
              className="w-full h-[52px] rounded-xl font-sans font-bold text-[15px] text-white bg-crimson flex items-center justify-center gap-2 active:scale-[0.96] transition-transform shadow-lg shadow-crimson/20"
            >
              <ArrowsClockwise size={18} weight="bold" />
              Update Status
            </button>
          ) : null}
        </div>
      )}

      {/* ── Media Lightbox ── */}
      {mediaPreview && (
        <Dialog open onOpenChange={() => setMediaPreview(null)}>
          <DialogContent className="max-w-sm mx-4 p-0 overflow-hidden rounded-2xl bg-[#0a0a0f] border-border-subtle">
            <div className="relative">
              <button
                onClick={() => setMediaPreview(null)}
                className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white/70 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
              <div className="flex items-center justify-center min-h-[200px] max-h-[60vh] overflow-hidden bg-black">
                {mediaPreview.type === "image" ? (
                  <img
                    src={mediaPreview.url}
                    alt={mediaPreview.name}
                    className="w-full max-h-[60vh] object-contain"
                  />
                ) : mediaPreview.type === "video" ? (
                  <video
                    src={mediaPreview.url}
                    controls
                    className="w-full max-h-[60vh] object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 p-10 text-white/60">
                    <File size={48} weight="duotone" />
                    <p className="text-sm">{mediaPreview.name}</p>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 bg-black/40">
                <p className="text-[12px] font-sans text-white/80 truncate flex-1 mr-3">
                  {mediaPreview.name}
                </p>
                {mediaPreview.url && (
                  <button
                    onClick={() => {
                      const a = document.createElement("a");
                      a.href = mediaPreview.url;
                      a.download = mediaPreview.name;
                      a.click();
                    }}
                    className="shrink-0 px-3 h-7 rounded-lg bg-white/10 border border-white/20 text-[11px] font-semibold text-white/70 flex items-center gap-1.5 hover:bg-white/20 transition-colors"
                  >
                    <DownloadSimple size={13} /> Download
                  </button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}


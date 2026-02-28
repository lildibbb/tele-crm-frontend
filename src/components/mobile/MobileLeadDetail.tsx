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
  Copy,
  Star,
} from "@phosphor-icons/react";
import type { Lead } from "@/store/leadsStore";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface MobileLeadDetailProps {
  readonly lead?: Partial<Lead>;
  readonly isLoading?: boolean;
  readonly onVerify?: () => void;
  readonly onReject?: () => void;
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

// ── Status helpers ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string }> = {
  NEW:               { label: "New" },
  CONTACTED:         { label: "Contacted" },
  REGISTERED:        { label: "Registered" },
  DEPOSIT_REPORTED:  { label: "Deposit Reported" },
  DEPOSIT_CONFIRMED: { label: "Confirmed" },
  REJECTED:          { label: "Rejected" },
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function fmt(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function fmtTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtRelative(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return fmt(dateStr);
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
                <CheckCircle size={13} weight="fill" className="text-text-secondary" />
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
function TimelineBubble({ entry, isLast }: { entry: TimelineEntry; isLast: boolean }) {
  return (
    <div className="flex gap-3">
      {/* Vertical track */}
      <div className="flex flex-col items-center w-5 shrink-0">
        <div className="w-[10px] h-[10px] rounded-full mt-1.5 ring-2 ring-background bg-border-default shrink-0" />
        {!isLast && (
          <div className="w-px flex-1 bg-border-subtle mt-1" style={{ minHeight: 24 }} />
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
            <span className="font-mono text-[11px] text-text-muted">{entry.time}</span>
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
  onUpdateStatus,
  onBack,
  onSendMessage,
}: MobileLeadDetailProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const role = user?.role ?? "STAFF";
  const [messageText, setMessageText] = useState("");

  const handleBack = useCallback(() => {
    if (onBack) { onBack(); return; }
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
  const cfg = STATUS_CONFIG[status] ?? { label: status };
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
      time: fmtTime(lead.createdAt),
      type: "milestone",
    });
  }
  if (lead.registeredAt) {
    timeline.push({
      id: "registered",
      color: "#A855F7",
      icon: <IdentificationBadge size={14} weight="fill" className="text-text-secondary" />,
      description: `Account registered on HFM${lead.hfmBrokerId ? ` (ID: ${lead.hfmBrokerId})` : ""}`,
      time: fmtTime(lead.registeredAt),
      type: "milestone",
    });
  }
  if (lead.depositBalance && status !== "NEW") {
    timeline.push({
      id: "deposit",
      color: "var(--warning)",
      icon: <CurrencyDollar size={14} weight="fill" className="text-text-secondary" />,
      description: `Deposit proof submitted — ${lead.depositBalance}`,
      time: fmtTime(lead.updatedAt),
      type: "action",
    });
  }
  if (lead.verifiedAt) {
    timeline.push({
      id: "verified",
      color: "var(--success)",
      icon: <ShieldCheck size={14} weight="fill" className="text-text-secondary" />,
      description: "Deposit verified by team",
      time: fmtTime(lead.verifiedAt),
      type: "milestone",
    });
  }
  if (status === "REJECTED") {
    timeline.push({
      id: "rejected",
      color: "var(--danger)",
      icon: <XCircle size={14} weight="fill" className="text-text-secondary" />,
      description: "Lead status set to Rejected",
      time: fmtTime(lead.updatedAt),
      type: "action",
    });
  }

  const infoCards: InfoCardData[] = [
    {
      icon: <IdentificationBadge size={16} weight="duotone" className="text-text-secondary" />,
      label: "Lead ID",
      value: `#${lead.id?.slice(-8) ?? "—"}`,
      mono: true,
      copyable: true,
    },
    {
      icon: <IdentificationBadge size={16} weight="duotone" className="text-text-secondary" />,
      label: "HFM Broker ID",
      value: lead.hfmBrokerId ?? "—",
      mono: true,
      copyable: true,
    },
    {
      icon: <TelegramLogo size={16} weight="duotone" className="text-text-secondary" />,
      label: "Telegram ID",
      value: lead.telegramUserId ?? "—",
      mono: true,
      copyable: true,
    },
    {
      icon: <CalendarBlank size={16} weight="duotone" className="text-text-secondary" />,
      label: "Registered",
      value: lead.registeredAt ? fmt(lead.registeredAt) : "Not yet",
    },
    {
      icon: <EnvelopeSimple size={16} weight="duotone" className="text-text-secondary" />,
      label: "Email",
      value: lead.email ?? "—",
      copyable: !!lead.email,
    },
    {
      icon: <Phone size={16} weight="duotone" className="text-text-secondary" />,
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
  const hasAttachments = hasDeposit;

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
            {fmtRelative(lead.updatedAt)}
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
                <p className="font-mono text-[13px] text-text-secondary mt-0.5">@{lead.username}</p>
              )}
            </div>

            {/* Status badge + Handover badge */}
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <Badge variant="secondary" className="text-[11px] font-bold uppercase tracking-wider">
                {cfg.label}
              </Badge>

              <Badge variant="secondary" className="text-[11px] font-semibold gap-1">
                <UserSwitch size={13} weight="bold" className="text-text-secondary" />
                {lead.handoverMode ? "Handover ON" : "Handover OFF"}
              </Badge>
            </div>

            {/* Quick contact chips */}
            <div className="flex items-center gap-2 mt-1">
              {lead.phoneNumber && (
                <a
                  href={`tel:${lead.phoneNumber}`}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-card border border-border-subtle text-text-secondary text-[12px] font-medium active:scale-[0.96] transition-transform"
                >
                  <Phone size={14} weight="bold" className="text-text-secondary" />
                  {lead.phoneNumber}
                </a>
              )}
              {lead.email && (
                <a
                  href={`mailto:${lead.email}`}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-card border border-border-subtle text-text-secondary text-[12px] font-medium active:scale-[0.96] transition-transform"
                >
                  <EnvelopeSimple size={14} weight="bold" className="text-text-secondary" />
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
                Last updated {fmtRelative(lead.updatedAt)}
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
            </h2>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory scrollbar-none">
              {/* Deposit proof placeholder */}
              <div className="shrink-0 w-[120px] h-[90px] rounded-xl bg-card border border-border-subtle flex flex-col items-center justify-center gap-1 snap-start active:scale-[0.96] transition-transform">
                <ImageIcon size={24} weight="duotone" className="text-text-muted" />
                <span className="text-[10px] font-sans text-text-muted">Deposit Proof</span>
              </div>
              {lead.hfmBrokerId && (
                <div className="shrink-0 w-[120px] h-[90px] rounded-xl bg-card border border-border-subtle flex flex-col items-center justify-center gap-1 snap-start active:scale-[0.96] transition-transform">
                  <FileText size={24} weight="duotone" className="text-text-muted" />
                  <span className="text-[10px] font-sans text-text-muted">HFM Statement</span>
                </div>
              )}
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
      {canVerify ? (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-xl border-t border-border-subtle px-4 pt-3 pb-[calc(16px+env(safe-area-inset-bottom))]">
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
        </div>
      ) : onUpdateStatus ? (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-xl border-t border-border-subtle px-4 pt-3 pb-[calc(16px+env(safe-area-inset-bottom))]">
          <button
            onClick={onUpdateStatus}
            className="w-full h-[52px] rounded-xl font-sans font-bold text-[15px] text-white bg-crimson flex items-center justify-center gap-2 active:scale-[0.96] transition-transform shadow-lg shadow-crimson/20"
          >
            <ArrowsClockwise size={18} weight="bold" />
            Update Status
          </button>
        </div>
      ) : null}
    </div>
  );
}

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
const STATUS_CONFIG: Record<string, { color: string; label: string; glow: string }> = {
  NEW:               { color: "var(--info)",    label: "NEW",              glow: "rgba(96,165,250,0.25)" },
  CONTACTED:         { color: "var(--info)",    label: "CONTACTED",        glow: "rgba(96,165,250,0.25)" },
  REGISTERED:        { color: "#A855F7",        label: "REGISTERED",       glow: "rgba(168,85,247,0.25)" },
  DEPOSIT_REPORTED:  { color: "var(--warning)", label: "DEPOSIT REPORTED", glow: "rgba(245,158,11,0.25)" },
  DEPOSIT_CONFIRMED: { color: "var(--success)", label: "CONFIRMED",        glow: "rgba(34,211,160,0.25)" },
  REJECTED:          { color: "var(--danger)",  label: "REJECTED",         glow: "rgba(239,68,68,0.25)" },
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
  return <div className={cn("rounded-lg bg-elevated/60 animate-pulse", className)} />;
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
                <CheckCircle size={13} weight="fill" className="text-success" />
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
        <div
          className="w-[10px] h-[10px] rounded-full mt-1.5 ring-2 ring-background shrink-0"
          style={{ background: entry.color }}
        />
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
  const cfg = STATUS_CONFIG[status] ?? { color: "#8888AA", label: status, glow: "transparent" };
  const name = lead.displayName ?? lead.username ?? "Unknown";
  const initials = getInitials(name);

  // Build timeline
  const timeline: TimelineEntry[] = [];
  if (lead.createdAt) {
    timeline.push({
      id: "created",
      color: "var(--info)",
      icon: <Star size={14} weight="fill" className="text-info" />,
      description: "Lead created via Telegram bot",
      time: fmtTime(lead.createdAt),
      type: "milestone",
    });
  }
  if (lead.registeredAt) {
    timeline.push({
      id: "registered",
      color: "#A855F7",
      icon: <IdentificationBadge size={14} weight="fill" style={{ color: "#A855F7" }} />,
      description: `Account registered on HFM${lead.hfmBrokerId ? ` (ID: ${lead.hfmBrokerId})` : ""}`,
      time: fmtTime(lead.registeredAt),
      type: "milestone",
    });
  }
  if (lead.depositBalance && status !== "NEW") {
    timeline.push({
      id: "deposit",
      color: "var(--warning)",
      icon: <CurrencyDollar size={14} weight="fill" className="text-warning" />,
      description: `Deposit proof submitted — ${lead.depositBalance}`,
      time: fmtTime(lead.updatedAt),
      type: "action",
    });
  }
  if (lead.verifiedAt) {
    timeline.push({
      id: "verified",
      color: "var(--success)",
      icon: <ShieldCheck size={14} weight="fill" className="text-success" />,
      description: "Deposit verified by team",
      time: fmtTime(lead.verifiedAt),
      type: "milestone",
    });
  }
  if (status === "REJECTED") {
    timeline.push({
      id: "rejected",
      color: "var(--danger)",
      icon: <XCircle size={14} weight="fill" className="text-danger" />,
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
      icon: <IdentificationBadge size={16} weight="duotone" className="text-gold" />,
      label: "HFM Broker ID",
      value: lead.hfmBrokerId ?? "—",
      mono: true,
      copyable: true,
    },
    {
      icon: <TelegramLogo size={16} weight="duotone" className="text-info" />,
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
      <div
        className="h-1 shrink-0"
        style={{
          background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}80, transparent)`,
        }}
      />

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
          {/* Ambient glow */}
          <div
            className="absolute inset-x-0 top-0 h-32 pointer-events-none opacity-30"
            style={{
              background: `radial-gradient(ellipse at 50% 0%, ${cfg.glow}, transparent 70%)`,
            }}
          />

          <div className="relative flex flex-col items-center gap-3">
            {/* Avatar */}
            <div className="relative">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center bg-elevated shadow-lg"
                style={{ boxShadow: `0 0 24px ${cfg.glow}` }}
              >
                <span className="font-sans font-bold text-[28px] text-text-primary select-none">
                  {initials}
                </span>
              </div>
              {/* Status dot */}
              <div
                className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full border-[3px] border-background"
                style={{ background: cfg.color }}
              />
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
              <span
                className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider"
                style={{
                  background: `color-mix(in srgb, ${cfg.color} 14%, transparent)`,
                  color: cfg.color,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: cfg.color }}
                />
                {cfg.label}
              </span>

              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold",
                  lead.handoverMode
                    ? "bg-success/12 text-success"
                    : "bg-elevated text-text-muted",
                )}
              >
                <UserSwitch size={13} weight="bold" />
                {lead.handoverMode ? "Handover ON" : "Handover OFF"}
              </span>
            </div>

            {/* Quick contact chips */}
            <div className="flex items-center gap-2 mt-1">
              {lead.phoneNumber && (
                <a
                  href={`tel:${lead.phoneNumber}`}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-card border border-border-subtle text-text-secondary text-[12px] font-medium active:scale-[0.96] transition-transform"
                >
                  <Phone size={14} weight="bold" className="text-success" />
                  {lead.phoneNumber}
                </a>
              )}
              {lead.email && (
                <a
                  href={`mailto:${lead.email}`}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-card border border-border-subtle text-text-secondary text-[12px] font-medium active:scale-[0.96] transition-transform"
                >
                  <EnvelopeSimple size={14} weight="bold" className="text-info" />
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
                    className={status === "DEPOSIT_CONFIRMED" ? "text-success" : "text-gold"}
                  />
                  <span className="font-sans font-semibold text-[14px] text-text-primary">
                    Deposit
                  </span>
                </div>
                <span
                  className={cn(
                    "text-[11px] font-bold px-2 py-0.5 rounded-full",
                    status === "DEPOSIT_CONFIRMED"
                      ? "bg-success/15 text-success"
                      : "bg-warning/15 text-warning",
                  )}
                >
                  {status === "DEPOSIT_CONFIRMED" ? "✓ Verified" : "⏳ Pending"}
                </span>
              </div>
              <span className="font-mono font-bold text-[36px] leading-none text-gold mt-1">
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
              className="flex-1 h-[52px] rounded-xl font-sans font-bold text-[15px] bg-success text-white flex items-center justify-center gap-2 active:scale-[0.96] transition-transform shadow-lg shadow-success/20"
            >
              <CheckCircle size={20} weight="bold" />
              Verify
            </button>
            <button
              onClick={onReject}
              className="flex-1 h-[52px] rounded-xl font-sans font-bold text-[15px] bg-danger/10 text-danger flex items-center justify-center gap-2 active:scale-[0.96] transition-transform"
            >
              <XCircle size={20} weight="bold" />
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

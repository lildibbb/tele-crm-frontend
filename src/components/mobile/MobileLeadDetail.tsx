"use client";

import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CaretLeft,
  DotsThree,
  CurrencyDollar,
  UserSwitch,
  CheckCircle,
  XCircle,
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
}

interface InfoCell {
  label: string;
  value: string;
  mono?: boolean;
}

interface TimelineEntry {
  id: string;
  color: string;
  description: string;
  time: string;
}

// ── Status helpers ─────────────────────────────────────────────────────────────
const STATUS_COLOR: Record<string, string> = {
  NEW: "var(--info)",
  CONTACTED: "var(--info)",
  REGISTERED: "#A855F7",
  DEPOSIT_REPORTED: "var(--warning)",
  DEPOSIT_CONFIRMED: "var(--success)",
  REJECTED: "var(--danger)",
};

const STATUS_LABEL: Record<string, string> = {
  NEW: "NEW",
  CONTACTED: "CONTACTED",
  REGISTERED: "REGISTERED",
  DEPOSIT_REPORTED: "DEPOSIT REPORTED",
  DEPOSIT_CONFIRMED: "DEPOSIT CONFIRMED",
  REJECTED: "REJECTED",
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

// ── Info cell ──────────────────────────────────────────────────────────────────
function InfoCell({ cell }: { cell: InfoCell }) {
  return (
    <div className="flex flex-col gap-1 p-3 rounded-[10px] bg-card border border-border-subtle shadow-sm">
      <span className="font-sans text-[11px] text-text-secondary uppercase tracking-wide">
        {cell.label}
      </span>
      <span
        className={cn(
          "text-[13px] text-text-primary truncate",
          cell.mono ? "font-mono" : "font-sans font-medium",
        )}
      >
        {cell.value}
      </span>
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="flex flex-col min-h-screen bg-void text-text-primary font-sans">
      <div className="pt-[env(safe-area-inset-top)]" />
      <header className="flex items-center justify-between px-4 h-[52px] bg-base border-b border-border-subtle">
        <div className="w-16 h-6 rounded bg-elevated animate-pulse" />
        <div className="w-24 h-5 rounded bg-elevated animate-pulse" />
        <div className="w-8 h-8 rounded bg-elevated animate-pulse" />
      </header>
      <main className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        <div className="rounded-2xl p-5 bg-elevated animate-pulse h-36" />
        <div className="grid grid-cols-2 gap-2">
          {[1,2,3,4,5,6].map((i) => (
            <div key={i} className="h-16 rounded-[10px] bg-card border border-border-subtle animate-pulse shadow-sm" />
          ))}
        </div>
        <div className="h-28 rounded-xl bg-card border border-border-subtle animate-pulse shadow-sm" />
      </main>
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
}: MobileLeadDetailProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const role = user?.role ?? "STAFF";

  const handleBack = useCallback(() => {
    if (onBack) { onBack(); return; }
    router.back();
  }, [onBack, router]);

  if (isLoading || !lead) return <LoadingSkeleton />;

  const status = lead.status ?? "NEW";
  const accentColor = STATUS_COLOR[status] ?? "#8888AA";
  const name = lead.displayName ?? lead.username ?? "Unknown";
  const initials = getInitials(name);

  // Build timeline from real data
  const timeline: TimelineEntry[] = [];
  if (lead.createdAt) {
    timeline.push({
      id: "created",
      color: "var(--info)",
      description: "Lead created via Telegram bot",
      time: fmtTime(lead.createdAt),
    });
  }
  if (lead.registeredAt) {
    timeline.push({
      id: "registered",
      color: "#A855F7",
      description: `Account registered on HFM${lead.hfmBrokerId ? ` (ID: ${lead.hfmBrokerId})` : ""}`,
      time: fmtTime(lead.registeredAt),
    });
  }
  if (lead.depositBalance && status !== "NEW") {
    timeline.push({
      id: "deposit",
      color: "var(--warning)",
      description: `Deposit proof submitted — ${lead.depositBalance}`,
      time: fmtTime(lead.updatedAt),
    });
  }
  if (lead.verifiedAt) {
    timeline.push({
      id: "verified",
      color: "var(--success)",
      description: "Deposit verified by team",
      time: fmtTime(lead.verifiedAt),
    });
  }
  if (status === "REJECTED") {
    timeline.push({
      id: "rejected",
      color: "var(--danger)",
      description: "Lead status set to Rejected",
      time: fmtTime(lead.updatedAt),
    });
  }

  const infoCells: InfoCell[] = [
    { label: "Lead ID", value: `#${lead.id?.slice(-8) ?? "—"}`, mono: true },
    { label: "HFM ID", value: lead.hfmBrokerId ?? "—", mono: true },
    { label: "Telegram ID", value: lead.telegramUserId ?? "—", mono: true },
    {
      label: "Registered",
      value: lead.registeredAt ? fmt(lead.registeredAt) : "Not yet",
    },
    { label: "Email", value: lead.email ?? "—" },
    { label: "Phone", value: lead.phoneNumber ?? "—" },
  ];

  const canVerify =
    status === "DEPOSIT_REPORTED" &&
    (role === "OWNER" || role === "ADMIN" || role === "STAFF");

  return (
    <div className="flex flex-col min-h-screen bg-void text-text-primary font-sans">
      <div className="pt-[env(safe-area-inset-top)]" />

      {/* Header */}
      <header className="flex items-center justify-between px-4 h-[52px] bg-base border-b border-border-subtle">
        <button
          onClick={handleBack}
          className="flex items-center gap-1 min-w-[44px] min-h-[44px] text-crimson"
        >
          <CaretLeft size={20} weight="bold" />
          <span className="font-sans text-[14px] font-medium">Leads</span>
        </button>
        <span className="font-sans font-semibold text-[17px] text-text-primary">
          Lead Detail
        </span>
        <button className="min-w-[44px] min-h-[44px] flex items-center justify-center text-text-secondary">
          <DotsThree size={22} weight="bold" />
        </button>
      </header>

      {/* Content */}
      <main
        className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4"
        style={{ paddingBottom: "calc(80px + env(safe-area-inset-bottom))" }}
      >
        {/* Hero card */}
        <div className="rounded-2xl p-5 flex flex-col items-center gap-2 bg-elevated">
          <div className="flex items-center justify-between w-full">
            <span
              className="rounded-full px-2 py-0.5 text-[11px] font-medium"
              style={{ background: `color-mix(in srgb, ${accentColor} 15%, transparent)`, color: accentColor }}
            >
              {STATUS_LABEL[status] ?? status}
            </span>
            <span className="font-mono text-[11px] text-text-muted">
              {fmt(lead.createdAt)}
            </span>
          </div>
          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-card shadow-sm">
            <span className="font-display font-bold text-[24px] text-text-primary">{initials}</span>
          </div>
          <div className="text-center">
            <div className="font-display font-bold text-[20px] text-text-primary">{name}</div>
            {lead.username && (
              <div className="font-mono text-[13px] text-text-secondary mt-0.5">@{lead.username}</div>
            )}
          </div>
          {/* Handover badge */}
          <div className={cn(
            "flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium",
            lead.handoverMode
              ? "bg-[color-mix(in_srgb,var(--success)_15%,transparent)] text-success"
              : "bg-elevated text-text-muted"
          )}>
            <UserSwitch size={12} />
            {lead.handoverMode ? "Handover ON" : "Handover OFF"}
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-2">
          {infoCells.map((cell) => <InfoCell key={cell.label} cell={cell} />)}
        </div>

        {/* Deposit section */}
        {(status === "DEPOSIT_REPORTED" || status === "DEPOSIT_CONFIRMED") && lead.depositBalance && (
          <div className="rounded-xl p-4 flex flex-col items-center gap-2 bg-card border border-border-subtle shadow-sm">
            <div className="flex items-center gap-2 w-full">
              <CurrencyDollar size={18} className="text-gold" weight="fill" />
              <span className="font-sans font-semibold text-[14px] text-text-primary">
                Deposit Information
              </span>
            </div>
            <span className="font-display font-bold text-[32px] text-gold">
              {lead.depositBalance}
            </span>
            <span className="font-sans text-[13px] text-text-secondary">
              {status === "DEPOSIT_CONFIRMED" ? "Verified" : "Pending verification"}
            </span>
          </div>
        )}

        {/* Activity timeline */}
        {timeline.length > 0 && (
          <div>
            <h2 className="font-sans font-semibold text-[14px] text-text-primary mb-3">
              Activity History
            </h2>
            <div className="relative flex flex-col gap-0">
              {timeline.map((entry, idx) => (
                <div key={entry.id} className="flex items-start gap-3 pb-4">
                  <div className="relative flex flex-col items-center">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 mt-0.5"
                      style={{ background: entry.color }}
                    />
                    {idx < timeline.length - 1 && (
                      <span className="w-px flex-1 bg-border-subtle mt-1" style={{ minHeight: 28 }} />
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5 pb-1">
                    <span className="font-sans text-[13px] text-text-secondary leading-snug">
                      {entry.description}
                    </span>
                    <span className="font-mono text-[11px] text-text-muted">{entry.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Sticky action buttons */}
      {canVerify ? (
        <div
          className="fixed bottom-0 left-0 right-0 z-40 flex gap-3 px-4 pt-3 pb-[calc(16px+env(safe-area-inset-bottom))] border-t border-border-subtle bg-void"
        >
          <button
            onClick={onVerify}
            className="flex-1 h-[52px] rounded-xl font-sans font-semibold text-[15px] bg-success text-white flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
          >
            <CheckCircle size={18} weight="bold" />
            Verify Deposit
          </button>
          <button
            onClick={onReject}
            className="flex-1 h-[52px] rounded-xl font-sans font-semibold text-[15px] border border-danger text-danger flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
          >
            <XCircle size={18} weight="bold" />
            Reject
          </button>
        </div>
      ) : onUpdateStatus ? (
        <div
          className="fixed bottom-0 left-0 right-0 z-40 px-4 pt-3 pb-[calc(16px+env(safe-area-inset-bottom))] border-t border-border-subtle bg-void"
        >
          <button
            onClick={onUpdateStatus}
            className="w-full h-[52px] rounded-xl font-sans font-semibold text-[15px] text-white bg-crimson active:scale-[0.97] transition-transform"
          >
            Update Status
          </button>
        </div>
      ) : null}
    </div>
  );
}

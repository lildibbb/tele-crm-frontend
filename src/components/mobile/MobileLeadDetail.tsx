"use client";

import React from "react";
import Link from "next/link";
import {
  CaretLeft,
  DotsThree,
  CurrencyDollar,
} from "@phosphor-icons/react";
import type { Lead } from "@/store/leadsStore";
import { UserRole } from "@/types/enums";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface MobileLeadDetailProps {
  readonly lead?: Partial<Lead>;
  readonly role?: UserRole;
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

// ── Mock data ──────────────────────────────────────────────────────────────────
const MOCK_LEAD: Partial<Lead> = {
  id: "TJ-1284",
  displayName: "Muhammad Hafiz Bin Ahmad",
  telegramUserId: "987654321",
  hfmBrokerId: "1029384",
  email: "hafiz@gmail.com",
  status: "DEPOSIT_REPORTED",
  depositBalance: "$500.00",
  handoverMode: true,
  createdAt: new Date("2026-01-20").toISOString(),
};

const TIMELINE: TimelineEntry[] = [
  {
    id: "t1",
    color: "#60A5FA",
    description: "Lead created via Telegram bot",
    time: "Jan 20, 14:30",
  },
  {
    id: "t2",
    color: "#A855F7",
    description: "Account registered on HFM (ID: 1029384)",
    time: "Jan 21, 09:00",
  },
  {
    id: "t3",
    color: "#F59E0B",
    description: "Deposit proof submitted — $500.00",
    time: "Jan 21, 11:32",
  },
];

// ── Status helpers ─────────────────────────────────────────────────────────────
const STATUS_COLOR: Record<string, string> = {
  NEW: "var(--info)",
  REGISTERED: "#A855F7",
  DEPOSIT_REPORTED: "var(--warning)",
  DEPOSIT_CONFIRMED: "var(--success)",
  REJECTED: "var(--danger)",
};

const STATUS_LABEL: Record<string, string> = {
  NEW: "NEW",
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

// ── Info cell ──────────────────────────────────────────────────────────────────
function InfoCell({ cell }: { cell: InfoCell }) {
  return (
    <div className="flex flex-col gap-1 p-3 rounded-[10px] bg-card border border-border-subtle">
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

// ── Main ───────────────────────────────────────────────────────────────────────
export default function MobileLeadDetail({
  lead,
  role = "OWNER",
  onVerify,
  onReject,
  onUpdateStatus,
  onBack,
}: MobileLeadDetailProps) {
  const l = lead ?? MOCK_LEAD;
  const status = l.status ?? "NEW";
  const accentColor = STATUS_COLOR[status] ?? "#8888AA";
  const initials = getInitials(l.displayName ?? "Unknown");

  const infoCells: InfoCell[] = [
    { label: "Lead ID", value: `#TJ-${l.id?.slice(-4) ?? "0000"}`, mono: true },
    { label: "HFM ID", value: l.hfmBrokerId ?? "—", mono: true },
    { label: "Telegram", value: l.telegramUserId ?? "—", mono: true },
    {
      label: "Registered",
      value: l.createdAt
        ? new Date(l.createdAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "—",
    },
    { label: "Assigned To", value: "Ahmad Razali" },
    { label: "Handover", value: l.handoverMode ? "ON" : "OFF" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-void text-text-primary font-sans">
      <div className="pt-[env(safe-area-inset-top)]" />

      {/* Header */}
      <header className="flex items-center justify-between px-4 h-[52px] bg-base border-b border-border-subtle">
        <button
          onClick={onBack}
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
        style={{ paddingBottom: "calc(72px + env(safe-area-inset-bottom))" }}
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
              {l.createdAt ? new Date(l.createdAt).toLocaleDateString("en-GB") : "—"}
            </span>
          </div>
          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-card">
            <span className="font-display font-bold text-[24px] text-text-primary">{initials}</span>
          </div>
          <div className="text-center">
            <div className="font-display font-bold text-[20px] text-text-primary">{l.displayName ?? "—"}</div>
            {l.telegramUserId && (
              <div className="font-mono text-[13px] text-text-secondary mt-0.5">@{l.telegramUserId}</div>
            )}
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-2">
          {infoCells.map((cell) => <InfoCell key={cell.label} cell={cell} />)}
        </div>

        {/* Deposit section */}
        {(status === "DEPOSIT_REPORTED" || status === "DEPOSIT_CONFIRMED") && (
          <div className="rounded-xl p-4 flex flex-col items-center gap-2 bg-card border border-border-subtle">
            <div className="flex items-center gap-2 w-full">
              <CurrencyDollar size={18} className="text-gold" weight="fill" />
              <span className="font-sans font-semibold text-[14px] text-text-primary">
                Deposit Information
              </span>
            </div>
            <span className="font-display font-bold text-[32px] text-gold">
              {l.depositBalance ?? "$0.00"}
            </span>
            <span className="font-sans text-[13px] text-text-secondary">
              Reported {l.createdAt ? new Date(l.createdAt).toLocaleDateString("en-GB") : "—"}
            </span>
            <div className="w-20 h-20 rounded-xl flex items-center justify-center bg-elevated">
              <span className="font-sans text-[10px] text-text-muted text-center leading-tight">Receipt</span>
            </div>
          </div>
        )}

        {/* Activity timeline */}
        <div>
          <h2 className="font-sans font-semibold text-[14px] text-text-primary mb-3">
            Activity History
          </h2>
          <div className="relative flex flex-col gap-0">
            {TIMELINE.map((entry, idx) => (
              <div key={entry.id} className="flex items-start gap-3 pb-4">
                <div className="relative flex flex-col items-center">
                  <span
                    className="w-3 h-3 rounded-full shrink-0 mt-0.5"
                    style={{ background: entry.color }}
                  />
                  {idx < TIMELINE.length - 1 && (
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
      </main>

      {/* Sticky action buttons */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 flex gap-3 px-4 pt-3 pb-[calc(16px+env(safe-area-inset-bottom))] border-t border-border-subtle bg-void"
      >
        {status === "DEPOSIT_REPORTED" ? (
          <>
            <button
              onClick={onVerify}
              className="flex-1 h-[52px] rounded-xl font-sans font-semibold text-[15px] bg-success text-void active:scale-[0.97] transition-transform"
            >
              Verify Deposit
            </button>
            <button
              onClick={onReject}
              className="flex-1 h-[52px] rounded-xl font-sans font-semibold text-[15px] border border-danger text-danger active:scale-[0.97] transition-transform"
            >
              Reject
            </button>
          </>
        ) : (
          <button
            onClick={onUpdateStatus}
            className="w-full h-[52px] rounded-xl font-sans font-semibold text-[15px] text-white bg-crimson active:scale-[0.97] transition-transform"
          >
            Update Status
          </button>
        )}
      </div>
    </div>
  );
}

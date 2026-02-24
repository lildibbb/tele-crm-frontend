"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MagnifyingGlass,
  Funnel,
  Plus,
  SortAscending,
} from "@phosphor-icons/react";
import MobileShell from "./MobileShell";
import { UserRole, LeadStatus } from "@/types/enums";
import type { Lead } from "@/store/leadsStore";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface MobileLeadsListProps {
  readonly role?: UserRole;
  readonly leads?: Lead[];
  readonly totalCount?: number;
  readonly onMoreOpen?: () => void;
  readonly onAddLead?: () => void;
}

type FilterTab = LeadStatus | "ALL";

// ── Status display helpers ─────────────────────────────────────────────────────
const STATUS_COLOR: Record<string, string> = {
  NEW: "#60A5FA",
  CONTACTED: "#8888AA",
  REGISTERED: "#A855F7",
  DEPOSIT_REPORTED: "#F59E0B",
  DEPOSIT_CONFIRMED: "#22D3A0",
  REJECTED: "#EF4444",
};

const STATUS_LABEL: Record<string, string> = {
  ALL: "ALL",
  NEW: "NEW",
  CONTACTED: "CONTACTED",
  REGISTERED: "REGISTERED",
  DEPOSIT_REPORTED: "DEPOSIT REPORTED",
  DEPOSIT_CONFIRMED: "VERIFIED",
};

// ── Mock leads (used when no leads prop passed) ────────────────────────────────
const MOCK_LEADS: Partial<Lead>[] = [
  {
    id: "1",
    displayName: "Muhammad Hafiz Bin Ahmad",
    hfmBrokerId: "1029384",
    status: "DEPOSIT_REPORTED",
    telegramUserId: "987654321",
    depositBalance: "$500.00",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "2",
    displayName: "Siti Aminah Binti Razak",
    hfmBrokerId: "HFM-77332",
    status: "REGISTERED",
    telegramUserId: "876543210",
    createdAt: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: "3",
    displayName: "Daniel Kumar",
    hfmBrokerId: "HFM-55231",
    status: "NEW",
    telegramUserId: "765432109",
    createdAt: new Date(Date.now() - 21600000).toISOString(),
  },
  {
    id: "4",
    displayName: "Wei Ling Chen",
    hfmBrokerId: "HFM-44120",
    status: "DEPOSIT_CONFIRMED",
    telegramUserId: "654321098",
    depositBalance: "$1,200.00",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hrs = Math.floor(diffMs / 3600000);
  if (hrs < 1) return "Just now";
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── Lead Card ──────────────────────────────────────────────────────────────────
function LeadCard({ lead }: { lead: Partial<Lead> }) {
  const status = lead.status ?? "NEW";
  const accentColor = STATUS_COLOR[status] ?? "#555570";

  return (
    <Link href={`/leads/${lead.id}`}>
      <div
        className="flex flex-col gap-2 p-4 rounded-xl bg-[#141422] border border-[#2A2A42]
                   active:scale-[0.97] transition-transform"
        style={{ borderLeft: `3px solid ${accentColor}` }}
      >
        {/* Row 1: name + status */}
        <div className="flex items-center justify-between">
          <span className="font-sans font-semibold text-[15px] text-[#F0F0FF] truncate flex-1 mr-2">
            {lead.displayName ?? "Unknown Lead"}
          </span>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0"
            style={{ background: `${accentColor}22`, color: accentColor }}
          >
            {STATUS_LABEL[status] ?? status}
          </span>
        </div>

        {/* Row 2: HFM ID + time */}
        <div className="flex items-center justify-between">
          <span className="font-mono text-[13px] text-[#8888AA]">
            HFM: {lead.hfmBrokerId ?? "—"}
          </span>
          <span className="font-sans text-[11px] text-[#555570]">
            {lead.createdAt ? timeAgo(lead.createdAt) : "—"}
          </span>
        </div>

        {/* Row 3: deposit */}
        {lead.depositBalance && (
          <div className="flex items-center gap-2">
            <span className="font-sans font-semibold text-[13px] text-[#E8B94F]">
              {lead.depositBalance}
            </span>
            <span className="font-sans text-[10px] uppercase tracking-wider text-[#555570]">
              DEPOSIT REPORTED
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

// ── Filter chips ───────────────────────────────────────────────────────────────
const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: "ALL", label: "All" },
  { id: LeadStatus.NEW, label: "NEW" },
  { id: LeadStatus.REGISTERED, label: "Registered" },
  { id: LeadStatus.DEPOSIT_REPORTED, label: "Deposit Reported" },
  { id: LeadStatus.DEPOSIT_CONFIRMED, label: "Verified" },
];

// ── Main ───────────────────────────────────────────────────────────────────────
export default function MobileLeadsList({
  role = "OWNER",
  leads,
  totalCount,
  onMoreOpen,
  onAddLead,
}: MobileLeadsListProps) {
  const [filter, setFilter] = useState<FilterTab>("ALL");
  const [search, setSearch] = useState("");

  const displayLeads = (leads ?? MOCK_LEADS) as Partial<Lead>[];
  const filtered = displayLeads.filter((l) => {
    const matchStatus = filter === "ALL" || l.status === filter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (l.displayName ?? "").toLowerCase().includes(q) ||
      (l.hfmBrokerId ?? "").toLowerCase().includes(q) ||
      (l.telegramUserId ?? "").toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const count = totalCount ?? displayLeads.length;

  return (
    <MobileShell
      role={role}
      activeTab="leads"
      pageTitle="Lead Intelligence"
      notificationCount={0}
      verifyBadgeCount={5}
      userInitials="TJ"
      onTabChange={(tab) => tab === "more" && onMoreOpen?.()}
    >
      <div className="pb-6">
        {/* Search bar */}
        <div className="mx-4 mt-4">
          <div
            className="flex items-center gap-2 px-3 h-11 rounded-xl border border-[#2A2A42]"
            style={{ background: "#1C1C2E" }}
          >
            <MagnifyingGlass size={16} color="#555570" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leads, IDs, names..."
              className="flex-1 bg-transparent outline-none font-sans text-[14px] text-[#F0F0FF]
                         placeholder:text-[#555570]"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-[#555570] text-[12px]"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 mt-3 pb-1">
          {FILTER_TABS.map((tab) => {
            const isActive = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={cn(
                  "shrink-0 rounded-full h-7 px-3 font-sans text-[12px] font-medium transition-colors",
                  isActive
                    ? "bg-[#C4232D1A] text-[#C4232D]"
                    : "bg-[#141422] text-[#8888AA] border border-[#2A2A42]",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Results header */}
        <div className="flex items-center justify-between px-4 mt-3 mb-2">
          <span className="font-sans text-[13px] text-[#8888AA]">
            {filtered.length} leads
          </span>
          <button className="flex items-center gap-1 font-sans text-[12px] text-[#8888AA]">
            <SortAscending size={14} />
            Newest
          </button>
        </div>

        {/* Lead cards */}
        <div className="flex flex-col gap-2 px-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <span className="font-display font-bold text-[20px] text-[#555570]">
                No leads found
              </span>
              <span className="font-sans text-[14px] text-[#555570]">
                Try adjusting your filters
              </span>
            </div>
          ) : (
            filtered.map((lead) => <LeadCard key={lead.id} lead={lead} />)
          )}
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={onAddLead}
        className="fixed right-5 flex items-center justify-center w-14 h-14 rounded-full bg-[#C4232D]
                   shadow-lg shadow-[#C4232D40] active:scale-95 transition-transform z-30"
        style={{ bottom: "calc(56px + env(safe-area-inset-bottom) + 20px)" }}
        aria-label="Add Lead"
      >
        <Plus size={24} color="white" weight="bold" />
      </button>
    </MobileShell>
  );
}

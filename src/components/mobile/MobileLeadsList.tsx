"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { MagnifyingGlass, Plus, SortAscending } from "@phosphor-icons/react";
import MobileShell from "./MobileShell";
import MobileMoreDrawer from "./MobileMoreDrawer";
import { useLeadsStore } from "@/store/leadsStore";
import { LeadStatus } from "@/types/enums";
import type { Lead } from "@/store/leadsStore";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface MobileLeadsListProps {
  readonly onMoreOpen?: () => void;
  readonly onAddLead?: () => void;
}

type FilterTab = LeadStatus | "ALL";

// ── Status display helpers ─────────────────────────────────────────────────────
const STATUS_CSS: Record<string, string> = {
  NEW:               "var(--info)",
  REGISTERED:        "#A855F7",
  DEPOSIT_REPORTED:  "var(--warning)",
  DEPOSIT_CONFIRMED: "var(--success)",
  REJECTED:          "var(--danger)",
};

const STATUS_LABEL: Record<string, string> = {
  NEW:               "NEW",
  REGISTERED:        "REGISTERED",
  DEPOSIT_REPORTED:  "DEPOSIT REPORTED",
  DEPOSIT_CONFIRMED: "VERIFIED",
  REJECTED:          "REJECTED",
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hrs = Math.floor(diffMs / 3600000);
  if (hrs < 1) return "Just now";
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── Lead Card ──────────────────────────────────────────────────────────────────
function LeadCard({ lead }: { lead: Lead }) {
  const status = lead.status ?? "NEW";
  const color = STATUS_CSS[status] ?? "var(--text-muted)";

  return (
    <Link href={`/leads/${lead.id}`}>
      <div
        className="flex flex-col gap-2 p-4 rounded-xl bg-card border border-border-subtle active:scale-[0.97] transition-transform shadow-sm"
        style={{ borderLeft: `3px solid ${color}` }}
      >
        <div className="flex items-center justify-between">
          <span className="font-sans font-semibold text-[15px] text-text-primary truncate flex-1 mr-2">
            {lead.displayName ?? "Unknown Lead"}
          </span>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0"
            style={{ background: `color-mix(in srgb, ${color} 15%, transparent)`, color }}
          >
            {STATUS_LABEL[status] ?? status}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-[13px] text-text-secondary">
            HFM: {lead.hfmBrokerId ?? "—"}
          </span>
          <span className="font-sans text-[11px] text-text-muted">
            {lead.createdAt ? timeAgo(lead.createdAt) : "—"}
          </span>
        </div>
        {lead.depositBalance && (
          <div className="flex items-center gap-2">
            <span className="font-sans font-semibold text-[13px] text-gold">
              {lead.depositBalance}
            </span>
            <span className="font-sans text-[10px] uppercase tracking-wider text-text-muted">
              DEPOSIT
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
  { id: LeadStatus.NEW, label: "New" },
  { id: LeadStatus.REGISTERED, label: "Registered" },
  { id: LeadStatus.DEPOSIT_REPORTED, label: "Deposit" },
  { id: LeadStatus.DEPOSIT_CONFIRMED, label: "Verified" },
];

const PAGE_SIZE = 20;

// ── Main ───────────────────────────────────────────────────────────────────────
export default function MobileLeadsList({ onMoreOpen, onAddLead }: MobileLeadsListProps) {
  const { leads, total, isLoading, fetchLeads } = useLeadsStore();
  const [filter, setFilter] = useState<FilterTab>("ALL");
  const [search, setSearch] = useState("");
  const [skip, setSkip] = useState(0);
  const [moreOpen, setMoreOpen] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const load = useCallback(
    (newSkip: number, newSearch: string, newFilter: FilterTab) => {
      fetchLeads({
        skip: newSkip,
        take: PAGE_SIZE,
        status: newFilter === "ALL" ? undefined : newFilter,
        search: newSearch || undefined,
        orderBy: "createdAt",
        order: "desc",
      });
    },
    [fetchLeads],
  );

  useEffect(() => {
    load(0, "", "ALL");
  }, [load]);

  const handleFilter = (tab: FilterTab) => {
    setFilter(tab);
    setSkip(0);
    load(0, search, tab);
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setSkip(0);
      load(0, val, filter);
    }, 400);
  };

  const loadMore = () => {
    const next = skip + PAGE_SIZE;
    setSkip(next);
    load(next, search, filter);
  };

  return (
    <>
      <MobileShell
        activeTab="leads"
        pageTitle="Lead Intelligence"
        onTabChange={(tab) => {
          if (tab === "more") { setMoreOpen(true); onMoreOpen?.(); }
        }}
      >
      <div className="pb-6">
        {/* Search bar */}
        <div className="mx-4 mt-4">
          <div className="flex items-center gap-2 px-3 h-11 rounded-xl border border-border-subtle bg-elevated">
            <MagnifyingGlass size={16} className="text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search leads, IDs, names..."
              className="flex-1 bg-transparent outline-none font-sans text-[14px] text-text-primary placeholder:text-text-muted"
            />
            {search && (
              <button onClick={() => handleSearch("")} className="text-text-muted text-[14px]">
                ×
              </button>
            )}
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 mt-3 pb-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleFilter(tab.id)}
              className={cn(
                "shrink-0 rounded-full h-7 px-3 font-sans text-[12px] font-medium transition-colors",
                filter === tab.id
                  ? "bg-crimson-subtle text-crimson"
                  : "bg-card text-text-secondary border border-border-subtle",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Results header */}
        <div className="flex items-center justify-between px-4 mt-3 mb-2">
          <span className="font-sans text-[13px] text-text-secondary">
            {isLoading ? "Loading…" : `${total} leads`}
          </span>
          <span className="flex items-center gap-1 font-sans text-[12px] text-text-muted">
            <SortAscending size={14} />
            Newest
          </span>
        </div>

        {/* Lead cards */}
        <div className="flex flex-col gap-2 px-4">
          {isLoading && leads.length === 0 ? (
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-card animate-pulse shadow-sm" />
            ))
          ) : leads.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <span className="font-display font-bold text-[20px] text-text-muted">No leads found</span>
              <span className="font-sans text-[14px] text-text-muted">Try adjusting your filters</span>
            </div>
          ) : (
            leads.map((lead) => <LeadCard key={lead.id} lead={lead as Lead} />)
          )}
        </div>

        {/* Load more */}
        {!isLoading && leads.length > 0 && leads.length < total && (
          <button
            onClick={loadMore}
            className="mx-4 mt-3 w-[calc(100%-32px)] h-10 rounded-xl bg-card border border-border-subtle font-sans text-[13px] text-text-secondary shadow-sm"
          >
            Load more ({total - leads.length} remaining)
          </button>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={onAddLead}
        className="fixed right-5 flex items-center justify-center w-14 h-14 rounded-full bg-crimson shadow-lg active:scale-95 transition-transform z-30"
        style={{ bottom: "calc(56px + env(safe-area-inset-bottom) + 20px)" }}
        aria-label="Add Lead"
      >
        <Plus size={24} color="white" weight="bold" />
      </button>
      </MobileShell>
      <MobileMoreDrawer open={moreOpen} onClose={() => setMoreOpen(false)} />
    </>
  );
}

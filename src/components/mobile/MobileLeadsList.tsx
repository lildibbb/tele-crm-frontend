"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  MagnifyingGlass,
  Plus,
  SortAscending,
  X,
  FunnelSimple,
} from "@phosphor-icons/react";
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
const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  NEW:               { color: "text-info",    bg: "bg-info/10",    label: "New" },
  CONTACTED:         { color: "text-info",    bg: "bg-info/10",    label: "Contacted" },
  REGISTERED:        { color: "text-[#A855F7]", bg: "bg-[#A855F7]/10", label: "Registered" },
  DEPOSIT_REPORTED:  { color: "text-warning", bg: "bg-warning/10", label: "Deposit" },
  DEPOSIT_CONFIRMED: { color: "text-success", bg: "bg-success/10", label: "Verified" },
  REJECTED:          { color: "text-danger",  bg: "bg-danger/10",  label: "Rejected" },
};

const STATUS_DOT_COLOR: Record<string, string> = {
  NEW:               "bg-info",
  CONTACTED:         "bg-info",
  REGISTERED:        "bg-[#A855F7]",
  DEPOSIT_REPORTED:  "bg-warning",
  DEPOSIT_CONFIRMED: "bg-success",
  REJECTED:          "bg-danger",
};


function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

function getInitials(name: string | null | undefined): string {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function formatDeposit(val: string): string {
  const num = parseFloat(val);
  if (isNaN(num)) return val;
  return `$${num.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

// ── Skeleton Card ──────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-card border border-border-subtle animate-pulse">
      {/* Avatar skeleton */}
      <div className="shrink-0 w-11 h-11 rounded-full bg-elevated" />
      {/* Content skeleton */}
      <div className="flex-1 min-w-0 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="h-4 w-28 rounded bg-elevated" />
          <div className="h-5 w-16 rounded-full bg-elevated" />
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="h-3 w-24 rounded bg-elevated" />
          <div className="h-3 w-14 rounded bg-elevated" />
        </div>
      </div>
    </div>
  );
}

// ── Empty State ────────────────────────────────────────────────────────────────
function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 px-6 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-elevated mb-1">
        <FunnelSimple size={32} className="text-text-muted" weight="duotone" />
      </div>
      <span className="font-sans font-semibold text-[17px] text-text-secondary">
        No leads found
      </span>
      <span className="font-sans text-[14px] text-text-muted leading-relaxed max-w-[260px]">
        {hasFilters
          ? "Try clearing your search or adjusting filters to see results."
          : "Leads will appear here once they start coming in."}
      </span>
    </div>
  );
}

// ── Lead Card ──────────────────────────────────────────────────────────────────
function LeadCard({ lead }: { lead: Lead }) {
  const status = lead.status ?? "NEW";
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.NEW;
  const dotColor = STATUS_DOT_COLOR[status] ?? "bg-text-muted";
  const initials = getInitials(lead.displayName);

  return (
    <Link href={`/leads/${lead.id}`} className="block">
      <div
        className={cn(
          "flex items-start gap-3 p-3.5 rounded-xl bg-card border border-border-subtle",
          "active:scale-[0.98] active:bg-elevated transition-all duration-150",
          "shadow-[0_1px_3px_rgba(0,0,0,0.2)]",
        )}
      >
        {/* Avatar with status dot */}
        <div className="relative shrink-0">
          <div className="flex items-center justify-center w-11 h-11 rounded-full bg-elevated">
            <span className="font-sans font-semibold text-[13px] text-text-primary select-none">
              {initials}
            </span>
          </div>
          {/* Status indicator dot */}
          <span
            className={cn(
              "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card",
              dotColor,
            )}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Row 1: Name + Status badge */}
          <div className="flex items-center justify-between gap-2">
            <span className="font-sans font-semibold text-[15px] text-text-primary truncate">
              {lead.displayName ?? "Unknown Lead"}
            </span>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                cfg.bg,
                cfg.color,
              )}
            >
              {cfg.label}
            </span>
          </div>

          {/* Row 2: Phone / Broker ID + Time */}
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[12px] text-text-secondary truncate">
              {lead.phoneNumber
                ? lead.phoneNumber
                : lead.hfmBrokerId
                  ? `HFM ${lead.hfmBrokerId}`
                  : lead.username
                    ? `@${lead.username}`
                    : "—"}
            </span>
            <span className="shrink-0 font-sans text-[11px] text-text-muted">
              {lead.createdAt ? timeAgo(lead.createdAt) : "—"}
            </span>
          </div>

          {/* Row 3: Deposit amount (if exists) */}
          {lead.depositBalance && (
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className="font-mono font-semibold text-[13px] text-gold">
                {formatDeposit(lead.depositBalance)}
              </span>
              <span className="font-sans text-[10px] font-medium uppercase tracking-widest text-text-muted">
                deposit
              </span>
            </div>
          )}
        </div>
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
  { id: LeadStatus.REJECTED, label: "Rejected" },
];

const PAGE_SIZE = 20;

// ── Pull-to-refresh indicator ──────────────────────────────────────────────────
function PullIndicator({ visible }: { visible: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden transition-all duration-300",
        visible ? "h-10 opacity-100" : "h-0 opacity-0",
      )}
    >
      <div className="w-5 h-5 rounded-full border-2 border-crimson border-t-transparent animate-spin" />
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function MobileLeadsList({ onMoreOpen, onAddLead }: MobileLeadsListProps) {
  const { leads, total, isLoading, fetchLeads } = useLeadsStore();
  const [filter, setFilter] = useState<FilterTab>("ALL");
  const [search, setSearch] = useState("");
  const [skip, setSkip] = useState(0);
  const [moreOpen, setMoreOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);

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

  // ── Pull-to-refresh handlers ─────────────────────────────────────────────
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const delta = e.changedTouches[0].clientY - touchStartY.current;
      const atTop = scrollRef.current ? scrollRef.current.scrollTop <= 0 : true;
      if (delta > 80 && atTop && !isRefreshing) {
        setIsRefreshing(true);
        load(0, search, filter);
        setSkip(0);
        setTimeout(() => setIsRefreshing(false), 800);
      }
    },
    [isRefreshing, load, search, filter],
  );

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

  const clearSearch = () => {
    setSearch("");
    if (searchTimer.current) clearTimeout(searchTimer.current);
    setSkip(0);
    load(0, "", filter);
  };

  const loadMore = () => {
    const next = skip + PAGE_SIZE;
    setSkip(next);
    load(next, search, filter);
  };

  const hasFilters = search !== "" || filter !== "ALL";
  const showSkeleton = isLoading && leads.length === 0;
  const showEmpty = !isLoading && leads.length === 0;
  const showLoadMore = !isLoading && leads.length > 0 && leads.length < total;

  return (
    <>
      <MobileShell
        activeTab="leads"
        pageTitle="Lead Intelligence"
        onTabChange={(tab) => {
          if (tab === "more") { setMoreOpen(true); onMoreOpen?.(); }
        }}
      >
        <div
          ref={scrollRef}
          className="pb-6"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Pull-to-refresh indicator */}
          <PullIndicator visible={isRefreshing} />

          {/* Search bar */}
          <div className="mx-4 mt-3">
            <div
              className="flex items-center gap-2.5 px-3.5 h-12 rounded-xl border border-border-subtle bg-elevated transition-colors focus-within:border-border-default"
            >
              <MagnifyingGlass
                size={18}
                className="shrink-0 text-text-muted"
                weight="bold"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search leads, IDs, names…"
                className={cn(
                  "flex-1 bg-transparent outline-none",
                  "font-sans text-[14px] text-text-primary",
                  "placeholder:text-text-muted",
                )}
              />
              {search && (
                <button
                  onClick={clearSearch}
                  className={cn(
                    "shrink-0 flex items-center justify-center",
                    "w-7 h-7 rounded-full bg-border-subtle/60",
                    "active:bg-border-default transition-colors",
                  )}
                  aria-label="Clear search"
                >
                  <X size={14} className="text-text-secondary" weight="bold" />
                </button>
              )}
            </div>
          </div>

          {/* Filter chips — horizontal scroll */}
          <div className="relative mt-3">
            <div
              className={cn(
                "flex gap-2 overflow-x-auto px-4 pb-1",
                "scrollbar-hide snap-x snap-mandatory",
                /* fade-out gradient on right edge */
                "[mask-image:linear-gradient(to_right,black_calc(100%-24px),transparent)]",
              )}
            >
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleFilter(tab.id)}
                  className={cn(
                    "shrink-0 snap-start rounded-full h-8 px-4",
                    "font-sans text-[12px] font-semibold tracking-wide",
                    "transition-all duration-150 min-w-[44px]",
                    filter === tab.id
                      ? "bg-crimson/15 text-crimson"
                      : "text-text-muted active:text-text-secondary",
                  )}
                >
                  {tab.label}
                </button>
              ))}
              {/* Scroll padding */}
              <div className="shrink-0 w-4" aria-hidden />
            </div>
          </div>

          {/* Results header */}
          <div className="flex items-center justify-between px-4 mt-3 mb-2">
            <span className="font-sans text-[13px] text-text-secondary tabular-nums">
              {isLoading ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-crimson animate-pulse" />
                  Loading…
                </span>
              ) : (
                <span>
                  <span className="font-mono font-semibold text-text-primary">{total}</span>
                  {" "}leads
                </span>
              )}
            </span>
            <span className="flex items-center gap-1 font-sans text-[12px] text-text-muted">
              <SortAscending size={14} />
              Newest
            </span>
          </div>

          {/* Lead cards / Skeleton / Empty */}
          <div className="flex flex-col gap-2.5 px-4">
            {showSkeleton && (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            )}

            {showEmpty && <EmptyState hasFilters={hasFilters} />}

            {leads.length > 0 &&
              leads.map((lead) => <LeadCard key={lead.id} lead={lead as Lead} />)}
          </div>

          {/* Load more */}
          {showLoadMore && (
            <div className="px-4 mt-3">
              <button
                onClick={loadMore}
                className={cn(
                  "w-full h-11 rounded-xl font-sans text-[13px] font-medium",
                  "bg-card border border-border-subtle text-text-secondary",
                  "active:bg-elevated transition-colors",
                )}
              >
                Load more
                <span className="ml-1.5 font-mono text-[12px] text-text-muted">
                  ({total - leads.length})
                </span>
              </button>
            </div>
          )}
        </div>

        {/* FAB */}
        <button
          onClick={onAddLead}
          className={cn(
            "fixed right-5 flex items-center justify-center",
            "w-14 h-14 rounded-full bg-crimson z-30",
            "shadow-[0_4px_20px_rgba(196,35,45,0.4)]",
            "active:scale-90 transition-transform duration-150",
          )}
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

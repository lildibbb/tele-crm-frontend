"use client";

import React, { useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  MagnifyingGlass,
  Plus,
  SortAscending,
  X,
  FunnelSimple,
  DownloadSimple,
  UserSwitch,
} from "@phosphor-icons/react";
import { ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import { leadsApi } from "@/lib/api/leads";
import { LeadStatus } from "@/types/enums";
import type { Lead } from "@/queries/useLeadsQuery";
import { useLeadsList, useBulkSetHandover } from "@/queries/useLeadsQuery";
import { useAuthStore } from "@/store/authStore";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { timeAgo, getInitials } from "@/lib/format";
import { LEAD_STATUS_BADGE } from "@/lib/badge-config";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface MobileLeadsListProps {
  readonly onAddLead?: () => void;
}

type FilterTab = LeadStatus | "ALL";

function formatDeposit(val: string): string {
  const num = parseFloat(val);
  if (isNaN(num)) return val;
  return `$${num.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

// ── Skeleton Card ──────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-card border border-border-subtle">
      <Skeleton className="shrink-0 w-11 h-11 rounded-full" />
      <div className="flex-1 min-w-0 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-4 w-28 rounded" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="h-3 w-14 rounded" />
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
  const cfg = LEAD_STATUS_BADGE[status] ?? LEAD_STATUS_BADGE.NEW;
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
        {/* Avatar */}
        <Avatar className="w-11 h-11 shrink-0">
          <AvatarFallback className="bg-elevated text-text-primary text-sm font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Row 1: Name + Status badge */}
          <div className="flex items-center justify-between gap-2">
            <span className="font-sans font-semibold text-[15px] text-text-primary truncate">
              {lead.displayName ?? "Unknown Lead"}
            </span>
            <Badge
              variant="secondary"
              className={cn("shrink-0 text-[10px] font-medium", cfg.cls)}
            >
              {status.replace(/_/g, " ")}
            </Badge>
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
              <span className="font-mono font-semibold text-[13px] text-text-secondary">
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
  { id: LeadStatus.CONTACTED, label: "Contacted" },
  { id: LeadStatus.DEPOSIT_REPORTED, label: "Deposit" },
  { id: LeadStatus.DEPOSIT_CONFIRMED, label: "Verified" },
  { id: LeadStatus.REJECTED, label: "Rejected" },
];

const PAGE_SIZE = 20;

// ── Sort options ───────────────────────────────────────────────────────────────
type SortOption = "newest" | "oldest" | "status";
const SORT_OPTIONS: { id: SortOption; label: string; orderBy: string; order: "asc" | "desc" }[] = [
  { id: "newest", label: "Newest First", orderBy: "createdAt", order: "desc" },
  { id: "oldest", label: "Oldest First", orderBy: "createdAt", order: "asc" },
  { id: "status", label: "Status", orderBy: "status", order: "asc" },
];

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
export default function MobileLeadsList({ onAddLead }: MobileLeadsListProps) {
  const { user } = useAuthStore();
  const role = user?.role ?? "STAFF";
  const canHandover = role === "OWNER" || role === "ADMIN";
  const [filter, setFilter] = useState<FilterTab>("ALL");
  const [search, setSearch] = useState("");
  const [skip, setSkip] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [showSortSheet, setShowSortSheet] = useState(false);
  const [exporting, setExporting] = useState(false);
  const bulkHandoverMutation = useBulkSetHandover();
  const scrollRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);

  const activeSort = SORT_OPTIONS.find((s) => s.id === sortOption)!;

  const { data: leadsResult, isLoading, refetch } = useLeadsList({
    skip,
    take: PAGE_SIZE,
    status: filter === "ALL" ? undefined : filter,
    search: search || undefined,
    orderBy: activeSort.orderBy,
    order: activeSort.order,
  });
  const leads = leadsResult?.data ?? [];
  const total = leadsResult?.total ?? 0;

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
        setSkip(0);
        setSearch("");
        setFilter("ALL");
        void refetch();
        setTimeout(() => setIsRefreshing(false), 800);
      }
    },
    [isRefreshing, refetch],
  );

  const handleFilter = (tab: FilterTab) => {
    setFilter(tab);
    setSkip(0);
  };

  const debouncedLoad = useDebouncedCallback(() => {
    setSkip(0);
  }, 300);

  const handleSearch = (val: string) => {
    setSearch(val);
    debouncedLoad();
  };

  const clearSearch = () => {
    setSearch("");
    setSkip(0);
  };

  const loadMore = () => {
    setSkip(skip + PAGE_SIZE);
  };

  async function handleExport() {
    setExporting(true);
    try {
      const res = await leadsApi.exportExcel();
      const blob = new Blob([res.data as BlobPart], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const date = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `leads_export_${date}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Export downloaded");
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  }

  const hasFilters = search !== "" || filter !== "ALL";
  const showSkeleton = isLoading && leads.length === 0;
  const showEmpty = !isLoading && leads.length === 0;
  const showLoadMore = !isLoading && leads.length > 0 && leads.length < total;

  return (
    <div>
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
          <div className="flex items-center gap-2.5 px-3.5 h-12 rounded-xl border border-border-subtle bg-elevated transition-colors focus-within:border-border-default">
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
                    ? "bg-elevated text-text-primary"
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
                <span className="w-1.5 h-1.5 rounded-full bg-border-default animate-pulse" />
                Loading…
              </span>
            ) : (
              <span>
                <span className="font-mono font-semibold text-text-primary">
                  {total}
                </span>{" "}
                leads
              </span>
            )}
          </span>
          <div className="flex items-center gap-2">
            {canHandover && (
              <div className="flex items-center gap-1.5 border border-border-subtle rounded-lg px-2.5 h-9 bg-elevated">
                <UserSwitch size={14} className="text-text-secondary" />
                <span className="font-sans text-[12px] text-text-secondary">Handover</span>
                <Switch
                  checked={false}
                  onCheckedChange={(mode) => bulkHandoverMutation.mutate(mode)}
                  disabled={bulkHandoverMutation.isPending}
                  className="scale-75"
                />
              </div>
            )}
            <button
              onClick={() => setShowSortSheet(true)}
              className={cn(
                "flex items-center gap-1 font-sans text-[12px] transition-colors",
                sortOption !== "newest" ? "text-crimson font-semibold" : "text-text-muted",
              )}
              aria-label="Sort leads"
            >
              <ArrowUpDown size={14} />
              {sortOption !== "newest" ? activeSort.label : "Newest"}
            </button>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="w-9 h-9 rounded-xl bg-elevated flex items-center justify-center active:scale-[0.93] transition-transform disabled:opacity-50"
              aria-label="Export XLSX"
            >
              {exporting ? (
                <div className="w-4 h-4 border-2 border-crimson border-t-transparent rounded-full animate-spin" />
              ) : (
                <DownloadSimple size={18} className="text-text-secondary" />
              )}
            </button>
          </div>
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
        style={{ bottom: "calc(60px + env(safe-area-inset-bottom) + 20px)" }}
        aria-label="Add Lead"
      >
        <Plus size={24} className="text-white" weight="bold" />
      </button>

      {/* Sort sheet */}
      <Sheet open={showSortSheet} onOpenChange={setShowSortSheet}>
        <SheetContent side="bottom" className="rounded-t-2xl px-0 pb-[env(safe-area-inset-bottom)]">
          <SheetHeader className="px-4 pb-2">
            <SheetTitle className="text-left text-[17px]">Sort By</SheetTitle>
          </SheetHeader>
          <div className="divide-y divide-border-subtle">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => { setSortOption(opt.id); setSkip(0); setShowSortSheet(false); }}
                className="flex items-center justify-between w-full px-5 min-h-[52px] active:bg-elevated/60 transition-colors"
              >
                <span className={cn(
                  "font-sans text-[15px]",
                  sortOption === opt.id ? "text-crimson font-semibold" : "text-text-primary",
                )}>{opt.label}</span>
                {sortOption === opt.id && (
                  <span className="w-2 h-2 rounded-full bg-crimson shrink-0" />
                )}
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

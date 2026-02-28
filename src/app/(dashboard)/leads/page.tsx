"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { MobileLeadsList } from "@/components/mobile";
import {
  DownloadSimple,
  UploadSimple,
  CheckCircle,
  SpinnerGap,
  Plus,
  UserSwitch,
  Robot,
  MagnifyingGlass,
  X,
} from "@phosphor-icons/react";
import { useT } from "@/i18n";
import { useLeadsStore, type LeadStatus, LeadStatus as LeadStatusEnum } from "@/store/leadsStore";
import { leadsApi } from "@/lib/api/leads";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { useDataTable } from "@/lib/hooks/use-data-table";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { getLeadsColumns } from "./_components/leads-columns";
import { Input } from "@/components/ui/input";
import { useIsMaintenanceBlocked } from "@/hooks/useIsMaintenanceBlocked";
import { showToast } from "@/lib/toast";

gsap.registerPlugin(useGSAP);

export default function LeadsPage() {
  const t = useT();
  const isMobile = useIsMobile();
  const tableRef = useRef<HTMLDivElement>(null);
  const isBlocked = useIsMaintenanceBlocked();

  const leads = useLeadsStore((s) => s.leads);
  const total = useLeadsStore((s) => s.total);
  const isLoading = useLeadsStore((s) => s.isLoading);
  const fetchLeads = useLeadsStore((s) => s.fetchLeads);
  const setHandover = useLeadsStore((s) => s.setHandover);
  const bulkSetHandover = useLeadsStore((s) => s.bulkSetHandover);
  const pageCount = useLeadsStore((s) => s.pageCount);

  const [statusFilter, setStatusFilter] = useState<LeadStatus | "ALL">("ALL");
  const [exportStatus, setExportStatus] = useState<"idle" | "loading" | "done">(
    "idle",
  );
  const [showImportModal, setShowImportModal] = useState(false);
  const [bulkHandoverPending, setBulkHandoverPending] = useState(false);
  const [searchRaw, setSearchRaw] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [bulkStatusValue, setBulkStatusValue] = useState<LeadStatus>("NEW");
  const [bulkStatusPending, setBulkStatusPending] = useState(false);

  // Derived tri-state for global handover
  const handoverCount = leads.filter((l) => l.handoverMode).length;
  const globalHandoverOn = handoverCount > 0 && handoverCount === leads.length;
  const globalHandoverPartial =
    handoverCount > 0 && handoverCount < leads.length;

  const handleBulkHandover = useCallback(
    async (checked: boolean) => {
      setBulkHandoverPending(true);
      await bulkSetHandover(checked).catch(() => showToast.error("Couldn't update the lead. Please try again."));
      setBulkHandoverPending(false);
    },
    [bulkSetHandover],
  );

  const onHandoverToggle = useCallback(
    (id: string, current: boolean) => {
      void setHandover(id, !current);
    },
    [setHandover],
  );

  const columns = useMemo(
    () => getLeadsColumns({ onHandoverToggle }),
    [onHandoverToggle],
  );

  const { table } = useDataTable({
    data: leads,
    columns,
    pageCount,
    initialState: { pagination: { pageSize: 20, pageIndex: 0 } },
  });

  const { pageIndex, pageSize } = table.getState().pagination;

  // Map TanStack column IDs to backend orderBy field names
  const ORDER_BY_MAP: Record<string, string> = {
    lead: "displayName",
    registeredAt: "registeredAt",
    depositBalance: "depositBalance",
  };
  const firstSort = table.getState().sorting[0];
  const orderBy = firstSort
    ? (ORDER_BY_MAP[firstSort.id] ?? firstSort.id)
    : undefined;
  const order = firstSort
    ? ((firstSort.desc ? "desc" : "asc") as "asc" | "desc")
    : undefined;

  const debouncedSetSearch = useDebouncedCallback((val: string) => {
    setSearchValue(val);
    table.setPageIndex(0);
  }, 400);

  const handleSearch = useCallback(
    (val: string) => {
      setSearchRaw(val);
      debouncedSetSearch(val);
    },
    [debouncedSetSearch],
  );

  const clearSearch = useCallback(() => {
    setSearchRaw("");
    setSearchValue("");
    table.setPageIndex(0);
    // Mount-only effect — table is a stable ref from useDataTable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void fetchLeads({
      skip: pageIndex * pageSize,
      take: pageSize,
      status: statusFilter === "ALL" ? undefined : statusFilter,
      search: searchValue || undefined,
      orderBy,
      order,
    });
  }, [
    pageIndex,
    pageSize,
    statusFilter,
    searchValue,
    orderBy,
    order,
    fetchLeads,
  ]);

  useGSAP(
    () => {
      if (isMobile) return;
      const rows = tableRef.current?.querySelectorAll("tbody tr");
      if (rows && rows.length > 0) {
        gsap.fromTo(
          rows,
          { opacity: 0, y: 10 },
          {
            opacity: 1,
            y: 0,
            duration: 0.3,
            stagger: 0.03,
            ease: "power2.out",
            clearProps: "all",
          },
        );
      }
    },
    { scope: tableRef, dependencies: [leads, statusFilter, isMobile] },
  );

  // ── Must be declared BEFORE the isMobile early return to satisfy Rules of Hooks ──
  const handleBulkStatus = useCallback(async () => {
    const selected = table.getSelectedRowModel().rows;
    if (selected.length === 0 || bulkStatusPending) return;
    setBulkStatusPending(true);
    try {
      const ids = selected.map((r) => r.original.id);
      await leadsApi.bulkStatus({ ids, status: bulkStatusValue });
      table.resetRowSelection();
      await fetchLeads({
        skip: pageIndex * pageSize,
        take: pageSize,
        status: statusFilter === "ALL" ? undefined : statusFilter,
        search: searchValue || undefined,
        orderBy,
        order,
      });
    } catch { showToast.error("Couldn't update the status. Please try again."); } finally {
      setBulkStatusPending(false);
    }
  }, [table, bulkStatusValue, bulkStatusPending, pageIndex, pageSize, statusFilter, searchValue, orderBy, order, fetchLeads]);

  if (isMobile) {
    return <MobileLeadsList />;
  }

  const TAB_FILTERS = [
    { key: "ALL" as const, label: t("leads.filter.all") },
    { key: "NEW" as const, label: t("leads.filter.new") },
    { key: "REGISTERED" as const, label: t("leads.filter.registered") },
    { key: "DEPOSIT_REPORTED" as const, label: t("leads.filter.proof") },
    { key: "DEPOSIT_CONFIRMED" as const, label: t("leads.filter.confirmed") },
  ];

  const handleExport = async () => {
    if (exportStatus !== "idle") return;
    setExportStatus("loading");
    try {
      const res = await leadsApi.exportCsv(
        statusFilter !== "ALL" ? { status: statusFilter } : undefined,
      );
      const blob = new Blob([res.data as BlobPart], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leads_export_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setExportStatus("done");
    } catch {
      setExportStatus("idle");
    }
    setTimeout(() => setExportStatus("idle"), 3000);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value as LeadStatus | "ALL");
    table.setPageIndex(0);
  };

  return (
    <TooltipProvider>
      <>
        <div className="space-y-4 animate-in-up">
          {/* ── Page Header ── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">
                {t("nav.leadIntelligence")}
              </h1>
              <p className="text-sm text-text-secondary font-sans mt-0.5">
                {total.toLocaleString()} total leads
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* ── Global Handover Switch ── */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (!bulkHandoverPending) void handleBulkHandover(!globalHandoverOn);
                      }
                    }}
                    className={`flex items-center gap-2 px-3 h-8 rounded-lg border transition-colors cursor-pointer select-none ${
                      globalHandoverOn
                        ? "bg-crimson/10 border-crimson/30"
                        : globalHandoverPartial
                          ? "bg-warning/10 border-warning/30"
                          : "bg-elevated border-border-default"
                    }`}
                    onClick={() =>
                      !bulkHandoverPending &&
                      void handleBulkHandover(!globalHandoverOn)
                    }
                  >
                    {globalHandoverOn ? (
                      <UserSwitch className="h-3.5 w-3.5 text-crimson flex-shrink-0" />
                    ) : (
                      <Robot className="h-3.5 w-3.5 text-text-muted flex-shrink-0" />
                    )}
                    <span
                      className={`text-xs font-sans font-medium whitespace-nowrap ${
                        globalHandoverOn
                          ? "text-crimson"
                          : globalHandoverPartial
                            ? "text-warning"
                            : "text-text-secondary"
                      }`}
                    >
                      {globalHandoverPartial
                        ? `Handover (${handoverCount})`
                        : globalHandoverOn
                          ? "All Handover"
                          : "Global Handover"}
                    </span>
                    <Switch
                      size="sm"
                      checked={globalHandoverOn}
                      disabled={bulkHandoverPending}
                      className={`pointer-events-none flex-shrink-0 ${globalHandoverOn ? "data-[state=checked]:bg-crimson" : ""}`}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="text-xs max-w-[180px] text-center"
                >
                  {globalHandoverOn
                    ? "Click to return all leads to bot mode"
                    : globalHandoverPartial
                      ? `${handoverCount} leads in human mode — click to toggle all`
                      : "Click to put all leads into human handover mode"}
                </TooltipContent>
              </Tooltip>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowImportModal(true)}
                className="h-8 gap-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-elevated border-border-default"
              >
                <UploadSimple className="h-3.5 w-3.5" /> {t("common.import")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void handleExport()}
                disabled={exportStatus === "loading"}
                className="h-8 gap-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-elevated border-border-default"
              >
                {exportStatus === "loading" ? (
                  <SpinnerGap className="h-3.5 w-3.5 animate-spin" />
                ) : exportStatus === "done" ? (
                  <CheckCircle className="h-3.5 w-3.5 text-success" />
                ) : (
                  <DownloadSimple className="h-3.5 w-3.5" />
                )}
                {exportStatus === "loading"
                  ? t("common.exporting")
                  : exportStatus === "done"
                    ? t("common.exportReady")
                    : t("common.export")}
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      size="sm"
                      disabled={isBlocked}
                      className="h-8 gap-1.5 text-xs bg-crimson hover:bg-crimson-hover text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="h-3.5 w-3.5 font-bold" /> Add Lead
                    </Button>
                  </span>
                </TooltipTrigger>
                {isBlocked && (
                  <TooltipContent>Read-only during maintenance</TooltipContent>
                )}
              </Tooltip>
            </div>
          </div>

          {/* ── Main Panel ── */}
          <div className="bg-elevated rounded-xl overflow-hidden">
            {/* Panel header: tabs + search */}
            <div className="px-5 py-3.5 bg-card border-b border-border-subtle flex items-center justify-between gap-3 flex-wrap shadow-sm">
              <div
                className="bg-elevated p-1 flex items-center gap-0.5 rounded-xl overflow-x-auto scrollbar-none"
                role="tablist"
                aria-label="Lead status filter"
              >
                {TAB_FILTERS.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    role="tab"
                    aria-selected={statusFilter === f.key}
                    onClick={() => handleStatusChange(f.key)}
                    className={
                      "px-3.5 py-1.5 rounded-lg text-xs font-sans font-medium transition-all cursor-pointer whitespace-nowrap flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-crimson/40 " +
                      (statusFilter === f.key
                        ? "bg-crimson text-white"
                        : "text-text-secondary hover:text-text-primary")
                    }
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Search bar */}
              <div className="relative flex-shrink-0 w-full sm:w-[320px]">
                <MagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted pointer-events-none" />
                <Input
                  type="text"
                  value={searchRaw}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search name, @username, email, HFM ID…"
                  className="pl-9 pr-12 h-9 w-full bg-elevated/50 hover:bg-elevated border-border-default/50 hover:border-border-default text-sm shadow-none transition-all placeholder:text-text-muted rounded-xl focus-visible:bg-background focus-visible:border-crimson/50 focus-visible:ring-[3px] focus-visible:ring-crimson/10"
                />
                <div className="absolute inset-y-0 right-1.5 flex items-center justify-center">
                  {searchRaw ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={clearSearch}
                      className="h-6 w-6 text-text-muted hover:text-text-primary hover:bg-border-subtle rounded-lg transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  ) : (
                    <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded-[6px] border border-border-subtle bg-background px-1.5 font-mono text-[10px] font-medium text-text-muted">
                      <span className="text-xs">⌘</span>K
                    </kbd>
                  )}
                </div>
              </div>
            </div>

            <div className="px-4 pt-3 pb-4" ref={tableRef}>
              {isLoading ? (
                <DataTableSkeleton columnCount={6} rowCount={20} shrinkZero />
              ) : (
                <DataTable table={table} className="border-transparent">
                  <DataTableToolbar table={table} />
                </DataTable>
              )}
            </div>
          </div>
        </div>

        <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-bold text-xl text-text-primary">
                {t("leads.import.title")}
              </DialogTitle>
            </DialogHeader>
            <div className="border-2 border-dashed border-border-default hover:border-crimson/40 rounded-xl p-8 flex flex-col items-center gap-3 transition-colors cursor-pointer group">
              <div className="w-12 h-12 rounded-xl bg-crimson/10 flex items-center justify-center group-hover:bg-crimson/15 transition-colors">
                <UploadSimple className="h-6 w-6 text-crimson" />
              </div>
              <p className="font-sans font-medium text-text-primary text-sm">
                {t("leads.import.drop")}
              </p>
              <p className="font-sans text-xs text-text-muted">
                {t("leads.import.or")}{" "}
                <span className="text-crimson cursor-pointer">
                  {t("leads.import.browse")}
                </span>{" "}
                &middot; {t("leads.import.size")}
              </p>
            </div>
            <p className="text-xs font-sans text-text-muted">
              {t("leads.import.required")}{" "}
              <span className="font-mono text-text-secondary">
                telegram_id, name, phone, hfm_id, status
              </span>
            </p>
            <div className="flex gap-3 pt-1">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowImportModal(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button
                className="flex-1 gap-2 bg-crimson hover:bg-crimson/90 text-white"
                onClick={() => setShowImportModal(false)}
              >
                <UploadSimple className="h-4 w-4" /> {t("leads.import.title")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* ── Bulk Status Floating Action Bar ── */}
        {table.getSelectedRowModel().rows.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-card border border-border-default rounded-2xl px-4 py-2.5 animate-in slide-in-from-bottom-4 duration-200 shadow-sm">
            <span className="text-sm font-sans font-medium text-text-primary whitespace-nowrap">
              {table.getSelectedRowModel().rows.length} selected
            </span>
            <div className="h-4 w-px bg-border-default" />
            <Select
              value={bulkStatusValue}
              onValueChange={(v) => setBulkStatusValue(v as LeadStatus)}
            >
              <SelectTrigger className="h-8 w-[160px] text-xs border-border-default bg-elevated">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(LeadStatusEnum).map((s) => (
                  <SelectItem key={s} value={s} className="text-xs">
                    {s.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              className="h-8 text-xs bg-crimson hover:bg-crimson/90 text-white gap-1.5"
              disabled={bulkStatusPending}
              onClick={() => void handleBulkStatus()}
            >
              {bulkStatusPending ? (
                <SpinnerGap className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle className="h-3.5 w-3.5" />
              )}
              Apply
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-text-muted hover:text-text-primary"
              onClick={() => table.resetRowSelection()}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </>
    </TooltipProvider>
  );
}

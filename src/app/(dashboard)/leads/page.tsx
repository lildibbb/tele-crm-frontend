"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
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
import { K } from "@/i18n/keys";
import {
  useLeadsStore,
  type LeadStatus,
  LeadStatus as LeadStatusEnum,
} from "@/store/leadsStore";
import { leadsApi } from "@/lib/api/leads";
import type { ImportResult } from "@/lib/schemas/lead.schema";
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
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { useDataTable } from "@/lib/hooks/use-data-table";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { getLeadsColumns } from "./_components/leads-columns";
import { Input } from "@/components/ui/input";
import { useIsMaintenanceBlocked } from "@/hooks/useIsMaintenanceBlocked";
import { toast } from "sonner";

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
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<
    "idle" | "uploading" | "done" | "error"
  >("idle");
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
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
      await bulkSetHandover(checked).catch(() =>
        toast.error(t(K.common.error.updateLead)),
      );
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
    () => getLeadsColumns({ onHandoverToggle, t }),
    [onHandoverToggle, t],
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
    } catch {
      toast.error(t(K.common.error.updateStatus));
    } finally {
      setBulkStatusPending(false);
    }
  }, [
    table,
    bulkStatusValue,
    bulkStatusPending,
    pageIndex,
    pageSize,
    statusFilter,
    searchValue,
    orderBy,
    order,
    fetchLeads,
  ]);

  if (isMobile) {
    return <MobileLeadsList />;
  }

  const TAB_FILTERS = [
    { key: "ALL" as const, label: t("leads.filter.all") },
    { key: "NEW" as const, label: t("leads.filter.new") },
    { key: "CONTACTED" as const, label: t(K.leads.filter.contacted) },
    { key: "DEPOSIT_REPORTED" as const, label: t("leads.filter.proof") },
    { key: "DEPOSIT_CONFIRMED" as const, label: t("leads.filter.confirmed") },
  ];

  const handleExport = async () => {
    if (exportStatus !== "idle") return;
    setExportStatus("loading");
    try {
      const res = await leadsApi.exportExcel(
        statusFilter !== "ALL" ? { status: statusFilter } : undefined,
      );
      const blob = new Blob([res.data as BlobPart], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leads_export_${new Date().toISOString().split("T")[0]}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      setExportStatus("done");
    } catch {
      setExportStatus("idle");
    }
    setTimeout(() => setExportStatus("idle"), 3000);
  };

  const handleImportFileChange = (file: File | null) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Only CSV files are accepted (.csv)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 5 MB.");
      return;
    }
    setImportFile(file);
    setImportResult(null);
    setImportStatus("idle");
  };

  const handleImportUpload = async () => {
    if (!importFile || importStatus === "uploading") return;
    setImportStatus("uploading");
    try {
      const res = await leadsApi.importCsv(importFile);
      const result = res.data.data;
      setImportResult(result);
      setImportStatus("done");
      if (result.imported > 0 || result.updated > 0) {
        toast.success(
          `Import complete: ${result.imported} created, ${result.updated} updated${result.skipped > 0 ? `, ${result.skipped} skipped` : ""}`,
        );
        // Refresh the table
        void fetchLeads({
          skip: pageIndex * pageSize,
          take: pageSize,
          status: statusFilter === "ALL" ? undefined : statusFilter,
          search: searchValue || undefined,
          orderBy,
          order,
        });
      }
    } catch {
      setImportStatus("error");
      toast.error("Import failed. Please check your file and try again.");
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await leadsApi.downloadTemplate();
      const blob = new Blob([res.data as BlobPart], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "leads-import-template.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download template.");
    }
  };

  const resetImportModal = () => {
    setImportFile(null);
    setImportResult(null);
    setImportStatus("idle");
    setIsDragOver(false);
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
                {total.toLocaleString()} {t("leads.totalLeads")}
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
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        if (!bulkHandoverPending)
                          void handleBulkHandover(!globalHandoverOn);
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
                        ? t("leads.handover.partial", {
                            count: handoverCount.toString(),
                          })
                        : globalHandoverOn
                          ? t("leads.handover.all")
                          : t("leads.handover.global")}
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
                    ? t("leads.handover.globalTooltipOn")
                    : globalHandoverPartial
                      ? t("leads.handover.globalTooltipPartial", {
                          count: handoverCount.toString(),
                        })
                      : t("leads.handover.globalTooltipOff")}
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
            </div>
          </div>

          {/* ── Status Tabs + Search ── */}
          <div className="flex flex-wrap items-center justify-between gap-2">
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
                      ? "bg-crimson text-white shadow-sm"
                      : "text-text-secondary hover:text-text-primary hover:bg-card")
                  }
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-[260px]">
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted pointer-events-none" />
                <Input
                  type="text"
                  value={searchRaw}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder={t("leads.search")}
                  className="pl-8 pr-10 h-8 w-full bg-background hover:bg-elevated border-border-default text-[11.5px] shadow-sm transition-all placeholder:text-text-muted rounded-[10px] focus-visible:bg-background focus-visible:border-crimson/40 focus-visible:ring-[2px] focus-visible:ring-crimson/10 font-sans"
                />
                <div className="absolute inset-y-0 right-1.5 flex items-center justify-center">
                  {searchRaw ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={clearSearch}
                      className="h-5 w-5 text-text-muted hover:text-text-primary hover:bg-border-subtle rounded flex items-center justify-center transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  ) : (
                    <kbd className="pointer-events-none hidden sm:inline-flex h-4.5 select-none items-center gap-0.5 rounded-[4px] border border-border-default bg-elevated px-1 font-mono text-[9px] font-medium text-text-muted shadow-sm">
                      <span className="text-[10px]">⌘</span>K
                    </kbd>
                  )}
                </div>
              </div>
              <DataTableViewOptions
                table={table}
                className="h-8 text-[11.5px] font-sans px-2.5 rounded-[10px]"
              />
            </div>
          </div>

          {/* ── Table ── */}
          <div ref={tableRef}>
            {isLoading ? (
              <DataTableSkeleton columnCount={6} rowCount={20} shrinkZero />
            ) : (
              <DataTable table={table} />
            )}
          </div>
        </div>

        <Dialog
          open={showImportModal}
          onOpenChange={(open) => {
            setShowImportModal(open);
            if (!open) resetImportModal();
          }}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-bold text-xl text-text-primary">
                {t("leads.import.title")}
              </DialogTitle>
            </DialogHeader>

            {/* Drop zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                const file = e.dataTransfer.files[0];
                if (file) handleImportFileChange(file);
              }}
              onClick={() => document.getElementById("csv-file-input")?.click()}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 transition-colors cursor-pointer group ${
                isDragOver
                  ? "border-crimson/60 bg-crimson/5"
                  : importFile
                    ? "border-success/40 bg-success/5"
                    : "border-border-default hover:border-crimson/40"
              }`}
            >
              <input
                id="csv-file-input"
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) =>
                  handleImportFileChange(e.target.files?.[0] ?? null)
                }
              />
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                  importFile
                    ? "bg-success/10"
                    : "bg-crimson/10 group-hover:bg-crimson/15"
                }`}
              >
                {importFile ? (
                  <CheckCircle className="h-6 w-6 text-success" />
                ) : (
                  <UploadSimple className="h-6 w-6 text-crimson" />
                )}
              </div>
              {importFile ? (
                <div className="text-center">
                  <p className="font-sans font-semibold text-text-primary text-sm">
                    {importFile.name}
                  </p>
                  <p className="font-sans text-xs text-text-muted mt-0.5">
                    {(importFile.size / 1024).toFixed(1)} KB · Click to change
                  </p>
                </div>
              ) : (
                <>
                  <p className="font-sans font-medium text-text-primary text-sm">
                    {t("leads.import.drop")}
                  </p>
                  <p className="font-sans text-xs text-text-muted">
                    {t("leads.import.or")}{" "}
                    <span className="text-crimson">
                      {t("leads.import.browse")}
                    </span>{" "}
                    &middot; {t("leads.import.size")}
                  </p>
                </>
              )}
            </div>

            {/* Required fields note + template download */}
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-sans text-text-muted flex-1">
                Required:{" "}
                <span className="font-mono text-text-secondary">
                  telegram_id
                </span>{" "}
                &middot; optional: username, display_name, email, phone, hfm_id,
                status, deposit_balance
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDownloadTemplate}
                className="h-7 gap-1.5 text-xs text-crimson hover:text-crimson/80 hover:bg-crimson/5 flex-shrink-0"
              >
                <DownloadSimple className="h-3.5 w-3.5" />
                Template
              </Button>
            </div>

            {/* Import result */}
            {importResult && (
              <div className="rounded-xl bg-elevated border border-border-subtle p-4 space-y-2">
                <div className="flex items-center gap-4 text-sm font-sans">
                  <span className="text-success font-semibold">
                    +{importResult.imported} created
                  </span>
                  <span className="text-text-secondary">
                    {importResult.updated} updated
                  </span>
                  {importResult.skipped > 0 && (
                    <span className="text-warning">
                      {importResult.skipped} skipped
                    </span>
                  )}
                </div>
                {importResult.errors.length > 0 && (
                  <div className="max-h-[140px] overflow-y-auto rounded-lg bg-card border border-border-subtle p-2 space-y-1">
                    {importResult.errors.map((err, i) => (
                      <p
                        key={i}
                        className="text-xs font-mono text-crimson leading-relaxed"
                      >
                        {err}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowImportModal(false);
                  resetImportModal();
                }}
              >
                {importStatus === "done"
                  ? t("common.close")
                  : t("common.cancel")}
              </Button>
              {importStatus !== "done" && (
                <Button
                  className="flex-1 gap-2 bg-crimson hover:bg-crimson/90 text-white"
                  disabled={!importFile || importStatus === "uploading"}
                  onClick={() => void handleImportUpload()}
                >
                  {importStatus === "uploading" ? (
                    <SpinnerGap className="h-4 w-4 animate-spin" />
                  ) : (
                    <UploadSimple className="h-4 w-4" />
                  )}
                  {importStatus === "uploading"
                    ? "Importing..."
                    : t("leads.import.title")}
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* ── Bulk Status Floating Action Bar ── */}
        {table.getSelectedRowModel().rows.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-card border border-border-default rounded-2xl px-4 py-2.5 animate-in slide-in-from-bottom-4 duration-200 shadow-sm">
            <span className="text-sm font-sans font-medium text-text-primary whitespace-nowrap">
              {table.getSelectedRowModel().rows.length}{" "}
              {t("leads.bulk.selected")}
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
                {Object.values(LeadStatusEnum).map((s) => {
                  const labelKey =
                    s === "NEW"
                      ? "status.new"
                      : s === "CONTACTED"
                        ? "status.contacted"
                        : s === "DEPOSIT_REPORTED"
                          ? "status.proofPending"
                          : s === "DEPOSIT_CONFIRMED"
                            ? "status.confirmed"
                            : `status.${s.toLowerCase()}`;

                  let label = t(labelKey);
                  if (label === labelKey) {
                    label = s.replace(/_/g, " ");
                  }

                  return (
                    <SelectItem key={s} value={s} className="text-xs">
                      {label}
                    </SelectItem>
                  );
                })}
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
              {t("leads.bulk.apply")}
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

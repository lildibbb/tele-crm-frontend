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
} from "@phosphor-icons/react";
import { useT } from "@/i18n";
import { useLeadsStore, type LeadStatus } from "@/store/leadsStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { useDataTable } from "@/lib/hooks/use-data-table";
import { getLeadsColumns } from "./_components/leads-columns";

gsap.registerPlugin(useGSAP);

export default function LeadsPage() {
  const t = useT();
  const isMobile = useIsMobile();
  const tableRef = useRef<HTMLDivElement>(null);

  const {
    leads,
    total,
    isLoading,
    fetchLeads,
    setHandover,
    verifyLead,
    pageCount,
  } = useLeadsStore();

  const [statusFilter, setStatusFilter] = useState<LeadStatus | "ALL">("ALL");
  const [exportStatus, setExportStatus] = useState<"idle" | "loading" | "done">(
    "idle",
  );
  const [showImportModal, setShowImportModal] = useState(false);

  const onHandoverToggle = useCallback(
    (id: string, current: boolean) => {
      void setHandover(id, !current);
    },
    [setHandover],
  );

  const onApprove = useCallback(
    (id: string) => {
      void verifyLead(id);
    },
    [verifyLead],
  );

  const columns = useMemo(
    () => getLeadsColumns({ onHandoverToggle, onApprove }),
    [onHandoverToggle, onApprove],
  );

  const { table } = useDataTable({
    data: leads,
    columns,
    pageCount,
    initialState: { pagination: { pageSize: 20, pageIndex: 0 } },
  });

  const { pageIndex, pageSize } = table.getState().pagination;

  useEffect(() => {
    void fetchLeads({
      skip: pageIndex * pageSize,
      take: pageSize,
      status: statusFilter === "ALL" ? undefined : statusFilter,
    });
  }, [pageIndex, pageSize, statusFilter, fetchLeads]);

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

  if (isMobile) {
    return <MobileLeadsList leads={leads} totalCount={total} />;
  }

  const TAB_FILTERS = [
    { key: "ALL" as const, label: t("leads.filter.all") },
    { key: "NEW" as const, label: t("leads.filter.new") },
    { key: "REGISTERED" as const, label: t("leads.filter.registered") },
    { key: "DEPOSIT_REPORTED" as const, label: t("leads.filter.proof") },
    { key: "DEPOSIT_CONFIRMED" as const, label: t("leads.filter.confirmed") },
  ];

  const handleExport = () => {
    if (exportStatus !== "idle") return;
    setExportStatus("loading");
    const headers = [
      "ID",
      "Name",
      "Telegram ID",
      "HFM ID",
      "Phone",
      "Email",
      "Status",
      "Registered At",
      "Balance",
      "Handover",
    ];
    const rows = leads.map((l) => [
      l.id,
      l.displayName ?? "",
      l.telegramUserId,
      l.hfmBrokerId ?? "",
      l.phoneNumber ?? "",
      l.email ?? "",
      l.status,
      l.registeredAt ?? "",
      l.depositBalance ?? "",
      l.handoverMode ? "Yes" : "No",
    ]);
    const csv = [headers, ...rows]
      .map((row) =>
        row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads_export_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExportStatus("done");
    setTimeout(() => setExportStatus("idle"), 3000);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value as LeadStatus | "ALL");
    table.setPageIndex(0);
  };

  return (
    <>
      <div className="space-y-4 animate-in-up">
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="font-display font-extrabold text-2xl text-text-primary">
                {t("nav.leadIntelligence")}
              </CardTitle>
              <CardDescription className="mt-0.5">
                {total.toLocaleString()} total leads
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
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
                onClick={handleExport}
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
              <Button
                size="sm"
                className="h-8 gap-1.5 text-xs bg-crimson hover:bg-crimson-hover text-white sm:ml-2 font-medium"
              >
                <Plus className="h-3.5 w-3.5 font-bold" /> Add Lead
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Tabs value={statusFilter} onValueChange={handleStatusChange}>
              <div className="px-5 pt-3 border-b border-border-subtle">
                <TabsList
                  variant="line"
                  className="h-auto flex-wrap gap-6 p-0 w-auto bg-transparent justify-start"
                >
                  {TAB_FILTERS.map((f) => (
                    <TabsTrigger
                      key={f.key}
                      value={f.key}
                      className="flex-none h-auto rounded-none text-sm px-0 py-3 font-sans font-medium whitespace-nowrap border-b-2 border-transparent data-[state=active]:text-text-primary data-[state=active]:border-crimson data-[state=inactive]:text-text-secondary data-[state=inactive]:border-transparent hover:text-text-primary transition-colors focus:outline-none"
                    >
                      {f.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
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
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-xl text-text-primary">
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
    </>
  );
}

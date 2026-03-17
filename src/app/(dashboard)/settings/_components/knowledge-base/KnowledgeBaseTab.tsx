"use client";

import { useState, useCallback, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useKbList,
  useRetryKb,
  useUpdateKb,
  useRemoveKb,
} from "@/queries/useKbQuery";
import { useKbUploadStatus } from "@/queries/useKbUploadStatus";
import { useMaintenanceConfig } from "@/queries/useMaintenanceQuery";
import { FeatureDisabledBanner } from "@/components/maintenance/FeatureDisabledBanner";
import { toast } from "sonner";
import type { KbEntry } from "@/lib/schemas/kb.schema";
import { FILTER_CHIPS, type KbFilterChip } from "./kb.constants";
import { KbEntryCard } from "./KbEntryCard";
import { KbAddEditDialog } from "./KbAddEditDialog";
import { useT } from "@/i18n";

export function KnowledgeBaseTab() {
  const t = useT();
  const { data: maintenanceConfig } = useMaintenanceConfig();
  const kbEnabled = maintenanceConfig?.featureFlags.knowledgeBase ?? true;

  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<KbEntry | null>(null);

  const { data: entries = [], isLoading } = useKbList();
  const retryMutation = useRetryKb();
  const updateMutation = useUpdateKb();
  const removeMutation = useRemoveKb();
  useKbUploadStatus(entries);

  // ── Actions ──────────────────────────────────────────────────────────────

  const openAdd = useCallback(() => {
    setEditingEntry(null);
    setShowModal(true);
  }, []);

  const openEdit = useCallback((entry: KbEntry) => {
    setEditingEntry(entry);
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setEditingEntry(null);
  }, []);

  const handleToggleActive = useCallback(
    async (id: string, isActive: boolean) => {
      try {
        await updateMutation.mutateAsync({ id, data: { isActive: !isActive } });
      } catch {
        toast.error(t("settings.kb.toast.updateError"));
      }
    },
    [t, updateMutation],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await removeMutation.mutateAsync(id);
        toast.success(t("settings.kb.toast.deleteSuccess"));
      } catch {
        toast.error(t("settings.kb.toast.deleteError"));
      }
    },
    [removeMutation, t],
  );

  const handleRetry = useCallback(
    async (id: string) => {
      try {
        await retryMutation.mutateAsync(id);
        toast.success(t("settings.kb.toast.retrySuccess"));
      } catch {
        toast.error(t("settings.kb.toast.retryError"));
      }
    },
    [retryMutation, t],
  );

  // ── Filtered list ────────────────────────────────────────────────────────

  const displayed = useMemo(() => {
    const searchLower = search.toLowerCase();
    return entries.filter((e: KbEntry) => {
      const matchFilter =
        filter === "All" ||
        e.type === filter.toUpperCase() ||
        e.fileType === filter.toUpperCase();
      const matchSearch =
        !search || e.title.toLowerCase().includes(searchLower);
      return matchFilter && matchSearch;
    });
  }, [entries, filter, search]);

  return (
    <div data-testid="knowledge-base-tab" className="space-y-5 animate-in-up">
      {!kbEnabled && (
        <FeatureDisabledBanner feature={t("settings.kb.feature")} />
      )}

      {/* Page header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-text-primary">
            {t("settings.kb.title")}
          </h2>
          <p className="text-text-secondary text-sm font-sans mt-1">
            {t("settings.kb.subtitle")}
          </p>
        </div>
        <Button data-testid="kb-add-btn" onClick={openAdd} className="gap-1.5">
          <Plus className="h-4 w-4" /> {t("settings.kb.addContent")}
        </Button>
      </div>

      {/* Filter + search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex items-center gap-1.5 flex-wrap">
          {FILTER_CHIPS.map((chip: KbFilterChip) => (
            <button
              key={chip.label}
              onClick={() => setFilter(chip.label)}
              className={`px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-colors ${
                filter === chip.label
                  ? "bg-crimson text-white"
                  : "bg-elevated text-text-secondary hover:text-text-primary"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
        <div className="relative sm:ml-auto w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted pointer-events-none" />
          <Input
            placeholder={t("settings.kb.searchEntries")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-full sm:w-56"
          />
        </div>
      </div>

      {/* Entry cards */}
      <div data-testid="kb-entries-list" className="space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[100px] rounded-xl" />
          ))
        ) : displayed.length === 0 ? (
          <div className="bg-elevated rounded-xl p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-text-muted/10 flex items-center justify-center mx-auto mb-3">
              <Search className="h-5 w-5 text-text-muted" />
            </div>
            <p className="font-sans text-sm text-text-secondary">
              {t("settings.kb.noEntries")}
            </p>
            <Button
              variant="link"
              className="text-crimson p-0 h-auto mt-2"
              onClick={() => {
                setFilter("All");
                setSearch("");
              }}
            >
              {t("settings.kb.clearFilters")}
            </Button>
          </div>
        ) : (
          displayed.map((entry: KbEntry, i: number) => (
            <KbEntryCard
              key={entry.id}
              entry={entry}
              index={i}
              onEdit={openEdit}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
              onRetry={handleRetry}
              isRetrying={
                retryMutation.isPending && retryMutation.variables === entry.id
              }
            />
          ))
        )}
      </div>

      {/* Add / Edit modal */}
      <KbAddEditDialog
        open={showModal}
        onClose={closeModal}
        editingEntry={editingEntry}
      />
    </div>
  );
}

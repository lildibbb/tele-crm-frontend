"use client";

import React, { useState, useRef } from "react";
import {
  Brain,
  Plus,
  Trash,
  FileText,
  TextT,
  ArrowsClockwise,
} from "@phosphor-icons/react";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/types/enums";
import { KbFileType, KbStatus } from "@/types/enums";
import {
  useKbList,
  useUpdateKb,
  useRemoveKb,
  useCreateKbText,
  useUploadKbFile,
} from "@/queries/useKbQuery";
import type { KbEntry } from "@/lib/schemas/kb.schema";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isFileEntry(entry: KbEntry): boolean {
  return entry.fileType !== KbFileType.TEXT_MANUAL;
}

function typeChipLabel(entry: KbEntry): string {
  return isFileEntry(entry) ? "FILE" : "TEXT";
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function KbSkeleton() {
  return (
    <div className="rounded-2xl bg-card border border-border-subtle overflow-hidden divide-y divide-border-subtle mx-4 mt-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-40 rounded-md" />
            <Skeleton className="h-3 w-24 rounded-md" />
          </div>
          <Skeleton className="h-5 w-9 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function KbEmpty() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 px-8">
      <span className="w-20 h-20 rounded-2xl bg-elevated flex items-center justify-center">
        <Brain size={40} weight="duotone" className="text-text-muted" />
      </span>
      <div className="text-center space-y-1.5">
        <h2 className="font-sans font-bold text-[20px] text-text-primary">
          No knowledge entries
        </h2>
        <p className="font-sans text-[14px] text-text-muted leading-relaxed max-w-[240px] mx-auto">
          Add text entries or upload files to build your knowledge base.
        </p>
      </div>
    </div>
  );
}

// ── Delete confirmation sheet ─────────────────────────────────────────────────

function DeleteSheet({
  open,
  title,
  onClose,
  onConfirm,
  isPending,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}) {
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="bottom"
        className="p-0 border-t border-border-subtle rounded-t-[20px] bg-base focus:outline-none"
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-8 h-1 rounded-full bg-border-default" />
        </div>
        <div className="px-5 pt-2 pb-6">
          <SheetHeader className="mb-4 text-left">
            <SheetTitle className="font-sans font-bold text-[18px] text-text-primary">
              Delete entry?
            </SheetTitle>
            <p className="font-sans text-[14px] text-text-muted mt-1">
              &ldquo;{title}&rdquo; will be permanently removed from the
              knowledge base.
            </p>
          </SheetHeader>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="w-full h-[52px] rounded-2xl bg-danger text-white font-sans font-semibold text-[15px] flex items-center justify-center gap-2 active:opacity-80 transition-opacity disabled:opacity-50"
          >
            {isPending ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Trash size={18} weight="bold" />
                Delete
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="w-full h-[48px] mt-2 rounded-2xl font-sans text-[15px] text-text-secondary active:opacity-70 transition-opacity"
          >
            Cancel
          </button>
        </div>
        <div style={{ height: "max(8px, env(safe-area-inset-bottom))" }} />
      </SheetContent>
    </Sheet>
  );
}

// ── Add entry sheet ───────────────────────────────────────────────────────────

type AddMode = "text" | "file" | null;

function AddEntrySheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<AddMode>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [fileTitle, setFileTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createText = useCreateKbText();
  const uploadFile = useUploadKbFile();

  const handleClose = () => {
    setMode(null);
    setTitle("");
    setContent("");
    setFileTitle("");
    setFile(null);
    onClose();
  };

  const handleAddText = async () => {
    if (!title.trim() || !content.trim()) return;
    await createText.mutateAsync({ title: title.trim(), content: content.trim(), type: "TEXT" });
    handleClose();
  };

  const handleUploadFile = async () => {
    if (!file || !fileTitle.trim()) return;
    await uploadFile.mutateAsync({ file, title: fileTitle.trim() });
    handleClose();
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && handleClose()}>
      <SheetContent
        side="bottom"
        className="p-0 border-t border-border-subtle rounded-t-[20px] bg-base focus:outline-none"
        style={{ maxHeight: "90dvh" }}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-8 h-1 rounded-full bg-border-default" />
        </div>

        {mode === null && (
          <div className="px-5 pt-2 pb-6">
            <SheetHeader className="mb-5 text-left">
              <SheetTitle className="font-sans font-bold text-[18px] text-text-primary">
                Add Knowledge Entry
              </SheetTitle>
            </SheetHeader>
            <div className="space-y-2">
              <button
                onClick={() => setMode("text")}
                className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl bg-card border border-border-subtle active:bg-elevated transition-colors text-left"
              >
                <span className="w-10 h-10 rounded-xl bg-elevated flex items-center justify-center shrink-0">
                  <TextT size={20} className="text-text-secondary" />
                </span>
                <div>
                  <p className="font-sans font-semibold text-[14px] text-text-primary">
                    Add Text Entry
                  </p>
                  <p className="font-sans text-[12px] text-text-muted mt-0.5">
                    Paste or type content directly
                  </p>
                </div>
              </button>
              <button
                onClick={() => setMode("file")}
                className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl bg-card border border-border-subtle active:bg-elevated transition-colors text-left"
              >
                <span className="w-10 h-10 rounded-xl bg-elevated flex items-center justify-center shrink-0">
                  <FileText size={20} className="text-text-secondary" />
                </span>
                <div>
                  <p className="font-sans font-semibold text-[14px] text-text-primary">
                    Upload File
                  </p>
                  <p className="font-sans text-[12px] text-text-muted mt-0.5">
                    PDF, DOCX, or image file
                  </p>
                </div>
              </button>
            </div>
            <div style={{ height: "max(8px, env(safe-area-inset-bottom))" }} />
          </div>
        )}

        {mode === "text" && (
          <div className="px-5 pt-2 pb-6 flex flex-col gap-3 overflow-y-auto">
            <SheetHeader className="mb-1 text-left">
              <SheetTitle className="font-sans font-bold text-[18px] text-text-primary">
                Add Text Entry
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-[12px] font-semibold text-text-muted uppercase tracking-wider">
                Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Entry title"
                className="w-full h-[44px] px-3.5 rounded-xl bg-card border border-border-subtle font-sans text-[14px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-crimson/40 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-[12px] font-semibold text-text-muted uppercase tracking-wider">
                Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter knowledge content…"
                rows={6}
                className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border-subtle font-sans text-[14px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-crimson/40 transition-colors resize-none"
              />
            </div>
            <button
              onClick={handleAddText}
              disabled={
                !title.trim() || !content.trim() || createText.isPending
              }
              className="w-full h-[52px] rounded-2xl bg-crimson text-white font-sans font-semibold text-[15px] flex items-center justify-center gap-2 active:opacity-80 transition-opacity disabled:opacity-40 mt-1"
            >
              {createText.isPending ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Save Entry"
              )}
            </button>
            <button
              onClick={() => setMode(null)}
              className="w-full h-[44px] rounded-2xl font-sans text-[14px] text-text-secondary active:opacity-70 transition-opacity"
            >
              Back
            </button>
            <div style={{ height: "max(8px, env(safe-area-inset-bottom))" }} />
          </div>
        )}

        {mode === "file" && (
          <div className="px-5 pt-2 pb-6 flex flex-col gap-3">
            <SheetHeader className="mb-1 text-left">
              <SheetTitle className="font-sans font-bold text-[18px] text-text-primary">
                Upload File
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-[12px] font-semibold text-text-muted uppercase tracking-wider">
                Title
              </label>
              <input
                value={fileTitle}
                onChange={(e) => setFileTitle(e.target.value)}
                placeholder="File title"
                className="w-full h-[44px] px-3.5 rounded-xl bg-card border border-border-subtle font-sans text-[14px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-crimson/40 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-[12px] font-semibold text-text-muted uppercase tracking-wider">
                File
              </label>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-[52px] rounded-xl bg-card border border-dashed border-border-default flex items-center justify-center gap-2 active:bg-elevated transition-colors"
              >
                <FileText size={18} className="text-text-muted" />
                <span className="font-sans text-[14px] text-text-secondary">
                  {file ? file.name : "Choose file…"}
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.png,.jpg,.jpeg"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <button
              onClick={handleUploadFile}
              disabled={!file || !fileTitle.trim() || uploadFile.isPending}
              className="w-full h-[52px] rounded-2xl bg-crimson text-white font-sans font-semibold text-[15px] flex items-center justify-center gap-2 active:opacity-80 transition-opacity disabled:opacity-40 mt-1"
            >
              {uploadFile.isPending ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Upload"
              )}
            </button>
            <button
              onClick={() => setMode(null)}
              className="w-full h-[44px] rounded-2xl font-sans text-[14px] text-text-secondary active:opacity-70 transition-opacity"
            >
              Back
            </button>
            <div style={{ height: "max(8px, env(safe-area-inset-bottom))" }} />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ── Entry row ─────────────────────────────────────────────────────────────────

function EntryRow({
  entry,
  canEdit,
  onDelete,
}: {
  entry: KbEntry;
  canEdit: boolean;
  onDelete: (entry: KbEntry) => void;
}) {
  const updateKb = useUpdateKb();
  const isFile = isFileEntry(entry);
  const isProcessing = entry.status === KbStatus.PROCESSING || entry.status === KbStatus.PENDING;

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex-1 min-w-0">
        <p className="font-sans text-[13px] font-semibold text-text-primary truncate">
          {entry.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-elevated text-text-muted font-mono">
            {typeChipLabel(entry)}
          </span>
          {isProcessing && isFile && (
            <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-warning/15 text-warning font-mono">
              <ArrowsClockwise size={10} className="animate-spin" />
              {entry.status}
            </span>
          )}
          {entry.status === KbStatus.FAILED && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-danger/15 text-danger font-mono">
              FAILED
            </span>
          )}
          <span
            className={cn(
              "text-[10px] px-1.5 py-0.5 rounded font-mono",
              entry.isActive
                ? "bg-success/15 text-success"
                : "bg-elevated text-text-muted",
            )}
          >
            {entry.isActive ? "active" : "inactive"}
          </span>
          <span className="text-[11px] text-text-muted">
            {formatDate(entry.createdAt)}
          </span>
        </div>
      </div>

      {canEdit && (
        <div className="flex items-center gap-2 shrink-0">
          <Switch
            checked={entry.isActive}
            disabled={updateKb.isPending}
            onCheckedChange={(checked) =>
              updateKb.mutate({ id: entry.id, data: { isActive: checked } })
            }
            className="data-[state=checked]:bg-crimson data-[state=unchecked]:bg-border-default"
          />
          <button
            onClick={() => onDelete(entry)}
            className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg active:bg-elevated transition-colors"
            aria-label="Delete entry"
          >
            <Trash size={16} className="text-text-muted" weight="regular" />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Props & main ──────────────────────────────────────────────────────────────

export interface MobileKnowledgeBaseProps {}

export default function MobileKnowledgeBase({}: MobileKnowledgeBaseProps) {
  const { user } = useAuthStore();
  const role = (user?.role as UserRole) ?? "STAFF";
  const canEdit = role === "OWNER" || role === "ADMIN";

  const { data: entries, isLoading, isError, refetch } = useKbList();

  const removeKb = useRemoveKb();

  const [deleteTarget, setDeleteTarget] = useState<KbEntry | null>(null);
  const [addSheetOpen, setAddSheetOpen] = useState(false);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await removeKb.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="flex flex-col pb-24">
      {/* ── Loading ──────────────────────────────────────────────────── */}
      {isLoading && <KbSkeleton />}

      {/* ── Error ────────────────────────────────────────────────────── */}
      {isError && !isLoading && (
        <div className="mx-4 mt-4 flex items-center gap-3 px-4 py-3 rounded-2xl bg-danger/10">
          <span className="flex-1 font-sans text-[13px] text-danger">
            Failed to load knowledge base
          </span>
          <button
            onClick={() => refetch()}
            className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg active:bg-danger/10"
          >
            <ArrowsClockwise size={16} className="text-danger" />
          </button>
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────────────────── */}
      {!isLoading && !isError && entries?.length === 0 && <KbEmpty />}

      {/* ── Entry list ────────────────────────────────────────────────── */}
      {!isLoading && entries && entries.length > 0 && (
        <div className="rounded-2xl bg-card border border-border-subtle overflow-hidden divide-y divide-border-subtle mx-4 mt-4">
          {entries.map((entry) => (
            <EntryRow
              key={entry.id}
              entry={entry}
              canEdit={canEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* ── FAB ───────────────────────────────────────────────────────── */}
      {canEdit && (
        <button
          onClick={() => setAddSheetOpen(true)}
          className="fixed bottom-[calc(76px+env(safe-area-inset-bottom))] right-5 w-14 h-14 rounded-full bg-crimson shadow-lg flex items-center justify-center active:opacity-80 transition-opacity z-30"
          aria-label="Add knowledge entry"
        >
          <Plus size={24} weight="bold" className="text-white" />
        </button>
      )}

      {/* ── Delete confirmation ───────────────────────────────────────── */}
      <DeleteSheet
        open={deleteTarget !== null}
        title={deleteTarget?.title ?? ""}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        isPending={removeKb.isPending}
      />

      {/* ── Add entry sheet ───────────────────────────────────────────── */}
      <AddEntrySheet
        open={addSheetOpen}
        onClose={() => setAddSheetOpen(false)}
      />
    </div>
  );
}

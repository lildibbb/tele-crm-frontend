"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Search,
  RotateCcw,
  Trash2,
  Edit3,
  FileText,
  Link2,
  FileCode2,
  FileVideo,
  CheckCircle2,
  Loader2,
  AlertCircle,
  PencilLine,
  Eye,
} from "lucide-react";
import { FileTypeBadge, FileTypeChip } from "@/components/ui/file-type-badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { TelegramPreview } from "@/components/ui/telegram-preview";
import { useKbStore } from "@/store/kbStore";
import { CreateKbSchema, type CreateKbInput } from "@/lib/schemas/kb.schema";
import { KbType, KbStatus } from "@/types/enums";
import { toast } from "sonner";
import { useMaintenanceStore } from "@/store/maintenanceStore";
import { FeatureDisabledBanner } from "@/components/maintenance/FeatureDisabledBanner";

const TYPE_CONFIG: Record<
  string,
  {
    label: string;
    icon: React.ElementType;
    badgeCls: string;
    iconBg: string;
    iconColor: string;
  }
> = {
  TEMPLATE: {
    label: "Template",
    icon: FileCode2,
    badgeCls: "badge badge-registered",
    iconBg: "color-mix(in srgb, #a855f7 14%, transparent)",
    iconColor: "#a855f7",
  },
  LINK: {
    label: "Link",
    icon: Link2,
    badgeCls: "badge badge-admin",
    iconBg: "color-mix(in srgb, #60a5fa 14%, transparent)",
    iconColor: "#60a5fa",
  },
  TEXT: {
    label: "Text",
    icon: FileText,
    badgeCls: "badge badge-staff",
    iconBg: "color-mix(in srgb, #8888aa 14%, transparent)",
    iconColor: "#8888aa",
  },
  PDF: {
    label: "PDF",
    icon: FileText,
    badgeCls: "badge badge-pending",
    iconBg: "color-mix(in srgb, #f59e0b 14%, transparent)",
    iconColor: "#f59e0b",
  },
  VIDEO_LINK: {
    label: "Video",
    icon: FileVideo,
    badgeCls: "badge badge-confirmed",
    iconBg: "color-mix(in srgb, #22d3a0 14%, transparent)",
    iconColor: "#22d3a0",
  },
};

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  READY: { label: "Ready", cls: "badge-confirmed" },
  PROCESSING: { label: "Processing", cls: "badge-warning" },
  FAILED: { label: "Failed", cls: "badge-failed" },
  PENDING: { label: "Pending", cls: "badge-pending" },
};

/** Maps KB file types to MIME types for FileTypeBadge rendering */
const KB_TYPE_MIME: Record<string, string> = {
  PDF: "application/pdf",
  VIDEO_LINK: "video/mp4",
  TEXT: "text/plain",
};

type ModalTab = "text" | "upload" | "link";

export function KnowledgeBaseTab() {
  const kbEnabled = useMaintenanceStore((s) => s.featureFlags.knowledgeBase);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState<ModalTab>("text");
  const [kbPane, setKbPane] = useState<"edit" | "preview">("edit");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDragging, setUploadDragging] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const { entries, isLoading, error, fetchAll, createText, update, remove, uploadFile: storeUpload } =
    useKbStore();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const form = useForm<CreateKbInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(CreateKbSchema as any),
    defaultValues: { title: "", content: "", type: KbType.TEXT },
  });

  const openAdd = () => {
    setEditingId(null);
    form.reset({ title: "", content: "", type: KbType.TEXT });
    setModalTab("text");
    setShowModal(true);
  };

  const openEdit = (entry: typeof entries[0]) => {
    setEditingId(entry.id);
    form.reset({
      title: entry.title,
      content: entry.content ?? "",
      type: (entry.type as KbType) ?? KbType.TEXT,
      url: entry.url ?? undefined,
    });
    setModalTab(entry.type === KbType.LINK ? "link" : "text");
    setKbPane("edit");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setKbPane("edit");
    form.reset();
  };

  const onSubmit = async (data: CreateKbInput) => {
    try {
      if (editingId) {
        await update(editingId, { title: data.title, content: data.content, url: data.url });
        toast.success("Content updated");
      } else {
        await createText(data);
        toast.success("Content added");
      }
      closeModal();
      await fetchAll();
    } catch {
      toast.error(editingId ? "Failed to update content" : "Failed to add content");
    }
  };

  const handleUploadFile = async () => {
    if (!uploadFile || !uploadTitle.trim()) return;
    setUploadLoading(true);
    try {
      await storeUpload(uploadFile, uploadTitle.trim());
      setUploadSuccess(true);
      setTimeout(() => {
        setUploadSuccess(false);
        setUploadFile(null);
        setUploadTitle("");
        setShowModal(false);
      }, 1500);
    } catch {
      toast.error("Upload failed. Check file type and size.");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setUploadDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setUploadFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadFile(file);
    e.target.value = "";
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await update(id, { isActive: !isActive });
      await fetchAll();
    } catch {
      toast.error("Failed to update entry");
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      await remove(id);
      toast.success("Entry deleted");
    } catch {
      toast.error("Failed to delete entry");
    }
  };

  const FILTER_CHIPS = [
    { label: "All" },
    { label: "Text", type: KbType.TEXT },
    { label: "Link", type: KbType.LINK },
    { label: "Template", type: KbType.TEMPLATE },
    { label: "PDF" },
    { label: "DOCX" },
  ];

  const displayed = entries.filter((e) => {
    const matchFilter =
      filter === "All" ||
      e.type === filter.toUpperCase() ||
      e.fileType === filter.toUpperCase();
    const matchSearch =
      !search || e.title.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-5 animate-in-up">
      {!kbEnabled && (
        <FeatureDisabledBanner feature="Knowledge Base Processing" />
      )}
      {/* Page header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-text-primary">
            Knowledge Base
          </h2>
          <p className="text-text-secondary text-sm font-sans mt-1">
            Templates, guides, and links the bot uses to answer questions
          </p>
        </div>
        <Button onClick={openAdd} className="gap-1.5">
          <Plus className="h-4 w-4" /> Add Content
        </Button>
      </div>

      {/* Filter + search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex items-center gap-1.5 flex-wrap">
          {FILTER_CHIPS.map((chip) => (
            <button
              key={chip.label}
              onClick={() => setFilter(chip.label)}
              className={`px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-colors ${filter === chip.label ? "bg-crimson text-white" : "bg-elevated text-text-secondary hover:text-text-primary"}`}
            >
              {chip.label}
            </button>
          ))}
        </div>
        <div className="relative sm:ml-auto w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted pointer-events-none" />
          <Input
            placeholder="Search entries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-full sm:w-56"
          />
        </div>
      </div>

      {/* Entry cards */}
      <div className="space-y-3">
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
              No entries match your filter.
            </p>
            <Button
              variant="link"
              className="text-crimson p-0 h-auto mt-2"
              onClick={() => {
                setFilter("All");
                setSearch("");
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          displayed.map((entry, i) => {
            const typeConf =
              TYPE_CONFIG[entry.fileType] ??
              TYPE_CONFIG[entry.type] ??
              TYPE_CONFIG.TEXT;
            const statusConf = STATUS_CONFIG[entry.status] ?? {
              label: entry.status,
              cls: "badge-pending",
            };
            const TypeIcon = typeConf.icon;

            return (
              <div
                key={entry.id}
                className={`bg-elevated rounded-xl p-5 transition-all duration-200 animate-in-up`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  {/* Icon: FileTypeBadge for PDF/VIDEO/TEXT; Lucide icon for TEMPLATE/LINK */}
                  {KB_TYPE_MIME[entry.fileType ?? entry.type] ? (
                    <div className="flex-shrink-0 mt-0.5">
                      <FileTypeBadge
                        mimeType={KB_TYPE_MIME[entry.fileType ?? entry.type]}
                        size={36}
                      />
                    </div>
                  ) : (
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: typeConf.iconBg }}
                    >
                      <TypeIcon
                        className="h-4 w-4"
                        style={{ color: typeConf.iconColor }}
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className={`badge ${statusConf.cls} flex items-center gap-1`}
                      >
                        {entry.status === KbStatus.PROCESSING && (
                          <Loader2 className="h-2.5 w-2.5 animate-spin" />
                        )}
                        {entry.status === KbStatus.READY && (
                          <CheckCircle2 className="h-2.5 w-2.5" />
                        )}
                        {entry.status === KbStatus.FAILED && (
                          <AlertCircle className="h-2.5 w-2.5" />
                        )}
                        {statusConf.label}
                      </span>
                      {/* Type chip: FileTypeChip for MIME-mapped types; text badge for others */}
                      {KB_TYPE_MIME[entry.fileType ?? entry.type] ? (
                        <FileTypeChip
                          mimeType={KB_TYPE_MIME[entry.fileType ?? entry.type]}
                          size={20}
                        />
                      ) : (
                        <span className={typeConf.badgeCls}>
                          {typeConf.label}
                        </span>
                      )}
                    </div>
                    <h3 className="font-sans font-semibold text-[14px] text-text-primary mb-1">
                      {entry.title}
                    </h3>
                    <p className="text-xs font-sans text-text-secondary line-clamp-2 leading-relaxed">
                      {entry.content}
                    </p>

                    <div className="flex items-center justify-between gap-4 mt-3 pt-3 border-t border-border-subtle/50">
                      <p className="data-mono text-[11px]">
                        Created {new Date(entry.createdAt).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-2">
                        {entry.status === KbStatus.FAILED ? (
                          <Button
                            size="xs"
                            className="gap-1"
                            onClick={() => fetchAll()}
                          >
                            <RotateCcw className="h-3 w-3" /> Retry
                          </Button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-sans text-text-secondary">
                              {entry.isActive ? "Active" : "Inactive"}
                            </span>
                            <Switch
                              checked={entry.isActive}
                              onCheckedChange={() =>
                                entry.status !== KbStatus.PROCESSING &&
                                toggleActive(entry.id, entry.isActive)
                              }
                              disabled={entry.status === KbStatus.PROCESSING}
                              size="sm"
                            />
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => deleteEntry(entry.id)}
                          className="text-text-muted hover:text-danger hover:bg-danger/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                        {entry.status !== KbStatus.FAILED && (
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => openEdit(entry)}
                            className="text-text-muted hover:text-text-primary hover:bg-elevated"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Content Dialog */}
      <Dialog open={showModal} onOpenChange={(open) => { if (!open) closeModal(); }}>
        <DialogContent className="w-full sm:max-w-[640px] lg:max-w-[880px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-bold text-xl text-text-primary">
              {editingId ? "Edit Knowledge Base Content" : "Add Knowledge Base Content"}
            </DialogTitle>
          </DialogHeader>

          {/* Modal tabs — hide upload when editing */}
          <div className="flex gap-1 p-1 bg-card rounded-lg">
            {(["text", ...(editingId ? [] : ["upload"]), "link"] as ModalTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setModalTab(tab)}
                className={`flex-1 py-2 rounded-md text-xs font-sans font-medium transition-colors capitalize ${modalTab === tab ? "bg-elevated text-text-primary" : "text-text-secondary hover:text-text-primary"}`}
              >
                {tab === "text"
                  ? "Text / Template"
                  : tab === "upload"
                    ? "Upload File"
                    : "Add Link"}
              </button>
            ))}
          </div>

          {modalTab === "text" && (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-text-secondary">
                        Title
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Entry title…" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Edit/Preview toggle — visible only on mobile */}
                <div className="sm:hidden flex items-center gap-0.5 bg-elevated p-1 rounded-xl w-fit">
                  <button
                    type="button"
                    onClick={() => setKbPane("edit")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                      kbPane === "edit"
                        ? "bg-card text-text-primary shadow-sm"
                        : "text-text-muted hover:text-text-secondary",
                    )}
                  >
                    <PencilLine className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setKbPane("preview")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                      kbPane === "preview"
                        ? "bg-card text-text-primary shadow-sm"
                        : "text-text-muted hover:text-text-secondary",
                    )}
                  >
                    <Eye className="h-3.5 w-3.5" /> Preview
                  </button>
                </div>

                {/* Split-panel: editor + preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem
                        className={cn(
                          kbPane === "preview" ? "hidden sm:block" : "block",
                        )}
                      >
                        <FormLabel className="text-xs font-medium text-text-secondary">
                          Content
                        </FormLabel>
                        <FormControl>
                          <RichTextEditor
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            placeholder="Paste your guide, FAQ, or template here…"
                            minHeight={240}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div
                    className={cn(
                      "space-y-2",
                      kbPane === "edit" ? "hidden sm:block" : "block",
                    )}
                  >
                    <p className="text-xs font-medium text-text-secondary">
                      Telegram Preview
                    </p>
                    <TelegramPreview
                      markdown={form.watch("content") ?? ""}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting
                      ? "Saving…"
                      : editingId
                        ? "Update Content"
                        : "Save Content"}
                  </Button>
                </div>
              </form>
            </Form>
          )}

          {modalTab === "upload" && (
            <div className="space-y-4">
              {/* Hidden file input */}
              <input
                id="kb-file-input"
                type="file"
                accept=".pdf,.docx,.txt"
                className="hidden"
                onChange={handleFileInput}
              />

              {/* Drop zone */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                  uploadDragging
                    ? "border-crimson bg-crimson/5"
                    : uploadFile
                    ? "border-success/60 bg-success/5"
                    : "border-border-default hover:border-crimson/40"
                }`}
                onDragOver={(e) => { e.preventDefault(); setUploadDragging(true); }}
                onDragLeave={() => setUploadDragging(false)}
                onDrop={handleFileDrop}
                onClick={() => document.getElementById("kb-file-input")?.click()}
              >
                {uploadFile ? (
                  <div className="space-y-1">
                    <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    </div>
                    <p className="font-sans text-sm font-semibold text-text-primary">{uploadFile.name}</p>
                    <p className="font-sans text-xs text-text-muted">
                      {(uploadFile.size / 1024).toFixed(0)} KB · Click to change
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-crimson/10 flex items-center justify-center mx-auto mb-3">
                      <Plus className="h-5 w-5 text-crimson" />
                    </div>
                    <p className="font-sans text-sm font-medium text-text-primary">
                      Click to upload or drag &amp; drop
                    </p>
                    <p className="font-sans text-xs text-text-secondary mt-1">
                      PDF, DOCX, TXT — max 10 MB
                    </p>
                  </>
                )}
              </div>

              {/* Title field */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-secondary block">
                  Title <span className="text-danger">*</span>
                </label>
                <Input
                  placeholder="e.g. Product FAQ PDF"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="text-sm"
                />
              </div>

              {uploadSuccess && (
                <div className="flex items-center gap-2 text-xs text-success font-medium">
                  <CheckCircle2 className="h-4 w-4" /> Uploaded! Processing in background…
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => { setShowModal(false); setUploadFile(null); setUploadTitle(""); }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 gap-1.5"
                  disabled={!uploadFile || !uploadTitle.trim() || uploadLoading}
                  onClick={() => void handleUploadFile()}
                >
                  {uploadLoading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</>
                  ) : (
                    "Upload File"
                  )}
                </Button>
              </div>
            </div>
          )}

          {modalTab === "link" && (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((d) =>
                  onSubmit({ ...d, type: KbType.LINK }),
                )}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-text-secondary">
                        Title
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Entry title…" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-text-secondary">
                        URL
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://…"
                          className="font-mono"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-text-secondary">
                        Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Short description…"
                          rows={3}
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-3 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? "Saving…" : "Save Link"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

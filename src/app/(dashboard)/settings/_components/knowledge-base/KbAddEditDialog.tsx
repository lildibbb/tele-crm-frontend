"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { KbType } from "@/types/enums";
import { isKbInFlightStatus, useUploadKbFile } from "@/queries/useKbQuery";
import { toast } from "sonner";
import type { KbEntry, CreateKbInput } from "@/lib/schemas/kb.schema";
import type { ModalTab } from "./kb.types";
import { KbTextForm } from "./KbTextForm";
import { KbLinkForm } from "./KbLinkForm";
import { KbUploadZone } from "./KbUploadZone";

interface KbAddEditDialogProps {
  open: boolean;
  onClose: () => void;
  editingEntry: KbEntry | null;
  onUploadCreated?: (entry: KbEntry) => void;
}

const TAB_LABELS: Record<ModalTab, string> = {
  text: "Text / Template",
  upload: "Upload File",
  link: "Add Link",
};

export function KbAddEditDialog({
  open,
  onClose,
  editingEntry,
  onUploadCreated,
}: KbAddEditDialogProps) {
  const isEditing = editingEntry !== null;

  const [modalTab, setModalTab] = useState<ModalTab>(
    editingEntry?.type === KbType.LINK ? "link" : "text",
  );

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDragging, setUploadDragging] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadAccepted, setUploadAccepted] = useState(false);

  const uploadFileMutation = useUploadKbFile();

  const handleClose = useCallback(() => {
    setUploadFile(null);
    setUploadTitle("");
    setUploadDragging(false);
    setUploadLoading(false);
    setUploadAccepted(false);
    onClose();
  }, [onClose]);

  const handleUpload = useCallback(async () => {
    if (!uploadFile || !uploadTitle.trim()) return;
    setUploadLoading(true);
    try {
      const uploadedEntry = await uploadFileMutation.mutateAsync({
        file: uploadFile,
        title: uploadTitle.trim(),
      });
      onUploadCreated?.(uploadedEntry);

      const acceptedForProcessing = isKbInFlightStatus(uploadedEntry.status);
      setUploadAccepted(acceptedForProcessing);
      if (acceptedForProcessing) {
        toast("Upload accepted. Processing has started in the background.");
      }

      setTimeout(() => {
        setUploadAccepted(false);
        setUploadFile(null);
        setUploadTitle("");
        handleClose();
      }, acceptedForProcessing ? 1500 : 250);
    } catch {
      toast.error("Upload failed. Check file type and size.");
    } finally {
      setUploadLoading(false);
    }
  }, [uploadFile, uploadTitle, uploadFileMutation, handleClose, onUploadCreated]);

  // Default form values — populated when editing
  const defaultValues: CreateKbInput = editingEntry
    ? {
        title: editingEntry.title,
        content: editingEntry.content ?? "",
        type: editingEntry.type ?? KbType.TEXT,
        url: editingEntry.url ?? undefined,
      }
    : { title: "", content: "", type: KbType.TEXT };

  // Tabs visible — hide "upload" when editing (can't re-upload)
  const visibleTabs: ModalTab[] = isEditing
    ? ["text", "link"]
    : ["text", "upload", "link"];

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose();
      }}
    >
      <DialogContent className="w-full sm:max-w-[640px] lg:max-w-[880px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-bold text-xl text-text-primary">
            {isEditing
              ? "Edit Knowledge Base Content"
              : "Add Knowledge Base Content"}
          </DialogTitle>
        </DialogHeader>

        {/* Tab switcher */}
        <div className="flex gap-1 p-1 bg-card rounded-lg shadow-sm">
          {visibleTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setModalTab(tab)}
              className={`flex-1 py-2 rounded-md text-xs font-sans font-medium transition-colors capitalize ${
                modalTab === tab
                  ? "bg-elevated text-text-primary"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {modalTab === "text" && (
          <KbTextForm
            isEditing={isEditing}
            editingId={editingEntry?.id ?? null}
            defaultValues={defaultValues}
            onClose={handleClose}
          />
        )}

        {modalTab === "upload" && (
          <KbUploadZone
            file={uploadFile}
            title={uploadTitle}
            isDragging={uploadDragging}
            isLoading={uploadLoading}
            isAccepted={uploadAccepted}
            onFileChange={setUploadFile}
            onDragChange={setUploadDragging}
            onTitleChange={setUploadTitle}
            onUpload={handleUpload}
            onCancel={handleClose}
          />
        )}

        {modalTab === "link" && (
          <KbLinkForm
            isEditing={isEditing}
            editingId={editingEntry?.id ?? null}
            defaultValues={defaultValues}
            onClose={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

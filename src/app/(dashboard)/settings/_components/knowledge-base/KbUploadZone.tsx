"use client";

import { useRef, useCallback } from "react";
import {
  Plus,
  CheckCircle2,
  Loader2,
  FileText,
  Image as ImageIcon,
  FileVideo,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { KbUploadZoneProps } from "./kb.types";
import {
  ACCEPTED_FILE_EXTENSIONS,
  ACCEPTED_FILE_TYPES_LABEL,
  MAX_UPLOAD_SIZE_LABEL,
  detectUploadCategory,
  formatFileSize,
} from "./kb.constants";

const CATEGORY_ICON = {
  image: ImageIcon,
  video: FileVideo,
  document: FileText,
} as const;

const CATEGORY_COLOR = {
  image: { bg: "border-sky-500/60 bg-sky-500/5", icon: "text-sky-500" },
  video: {
    bg: "border-emerald-500/60 bg-emerald-500/5",
    icon: "text-emerald-500",
  },
  document: {
    bg: "border-amber-500/60 bg-amber-500/5",
    icon: "text-amber-500",
  },
} as const;

export function KbUploadZone({
  file,
  title,
  isDragging,
  isLoading,
  isAccepted,
  onFileChange,
  onDragChange,
  onTitleChange,
  onUpload,
  onCancel,
}: KbUploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      onDragChange(false);
      const dropped = e.dataTransfer.files?.[0];
      if (dropped) onFileChange(dropped);
    },
    [onDragChange, onFileChange],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (selected) onFileChange(selected);
      e.target.value = "";
    },
    [onFileChange],
  );

  const category = file ? detectUploadCategory(file) : null;
  const CategoryIcon = category ? CATEGORY_ICON[category] : null;
  const categoryColors = category ? CATEGORY_COLOR[category] : null;

  return (
    <div className="space-y-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        id="kb-file-input"
        type="file"
        accept={ACCEPTED_FILE_EXTENSIONS}
        className="hidden"
        onChange={handleFileInput}
      />

      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
          isDragging
            ? "border-crimson bg-crimson/5"
            : file && categoryColors
              ? categoryColors.bg
              : "border-border-default hover:border-crimson/40"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          onDragChange(true);
        }}
        onDragLeave={() => onDragChange(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {file ? (
          <div className="space-y-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto ${
                categoryColors ? `bg-current/10` : "bg-success/10"
              }`}
              style={{
                backgroundColor:
                  category === "image"
                    ? "rgba(14, 165, 233, 0.1)"
                    : category === "video"
                      ? "rgba(16, 185, 129, 0.1)"
                      : "rgba(245, 158, 11, 0.1)",
              }}
            >
              {CategoryIcon ? (
                <CategoryIcon
                  className={`h-5 w-5 ${categoryColors?.icon ?? "text-success"}`}
                />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-success" />
              )}
            </div>
            <p className="font-sans text-sm font-semibold text-text-primary">
              {file.name}
            </p>
            <p className="font-sans text-xs text-text-muted">
              {formatFileSize(file.size)} · Click to change
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
              {ACCEPTED_FILE_TYPES_LABEL} — max {MAX_UPLOAD_SIZE_LABEL}
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
          placeholder="e.g. Product FAQ PDF, Tutorial Video"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="text-sm"
        />
      </div>

      {isAccepted && (
        <div className="flex items-center gap-2 text-xs text-text-secondary font-medium">
          <Loader2 className="h-4 w-4 animate-spin text-warning" /> Upload
          accepted. Processing in background…
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <Button variant="outline" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          className="flex-1 gap-1.5"
          disabled={!file || !title.trim() || isLoading}
          onClick={onUpload}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Uploading…
            </>
          ) : (
            "Upload File"
          )}
        </Button>
      </div>
    </div>
  );
}

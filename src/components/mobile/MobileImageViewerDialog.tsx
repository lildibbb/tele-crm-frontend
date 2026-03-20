"use client";

import { DownloadSimple, PencilSimple, X } from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useT } from "@/i18n";

export type MobileImageViewerItem = {
  url: string;
  name: string;
  type: "image" | "video" | "file";
  mimeType?: string | null;
};

type MobileImageViewerDialogProps = {
  open: boolean;
  item: MobileImageViewerItem | null;
  onClose: () => void;
  onEdit?: (item: MobileImageViewerItem) => void;
};

async function downloadItem(item: MobileImageViewerItem) {
  const fallback = () => {
    const link = document.createElement("a");
    link.href = item.url;
    link.download = item.name || "attachment";
    link.click();
  };

  try {
    const response = await fetch(item.url, {
      mode: "cors",
      credentials: "omit",
      cache: "no-store",
    });
    if (!response.ok) {
      fallback();
      return;
    }
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = item.name || "attachment";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
  } catch {
    fallback();
  }
}

function MobileImageViewerMedia({ item }: { item: MobileImageViewerItem }) {
  if (item.type === "image") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={item.url}
        alt={item.name}
        className="h-full w-full object-contain"
      />
    );
  }

  if (item.type === "video") {
    return (
      <video src={item.url} controls className="h-full w-full object-contain" />
    );
  }

  return <p className="px-6 text-center text-sm text-white/70">{item.name}</p>;
}

export default function MobileImageViewerDialog({
  open,
  item,
  onClose,
  onEdit,
}: MobileImageViewerDialogProps) {
  const t = useT();
  if (!item) return null;

  const canEdit = item.type === "image" && Boolean(onEdit);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="!inset-0 !left-0 !top-0 !z-[90] !m-0 !h-[100dvh] !max-h-[100dvh] !w-[100dvw] !max-w-[100dvw] !translate-x-0 !translate-y-0 overflow-hidden rounded-none border-0 bg-[#05060b] !p-0 sm:!rounded-none sm:!max-w-none"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{item.name}</DialogTitle>
          <DialogDescription>
            {t("pending.attachmentPreview")}
          </DialogDescription>
        </DialogHeader>
        <div className="flex h-full min-h-0 flex-col overscroll-contain touch-manipulation">
          <div
            className="flex items-center gap-2 border-b border-white/10 px-3 pb-2 pt-2.5"
            style={{ paddingTop: "max(0.625rem, env(safe-area-inset-top))" }}
          >
            <p className="min-w-0 flex-1 truncate text-xs font-medium text-white/80">
              {item.name}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/55 text-white/80 transition-colors hover:text-white"
              aria-label={t("common.close")}
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-black px-1 py-1">
            <MobileImageViewerMedia item={item} />
          </div>

          <div
            className="border-t border-white/10 bg-black/55 px-3 py-3"
            style={{
              paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
            }}
          >
            <div className="flex flex-col gap-2">
              {canEdit && (
                <button
                  type="button"
                  onClick={() => onEdit?.(item)}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-black hover:bg-white/90"
                >
                  <PencilSimple size={15} /> {t("lead.annotation.editAttach")}
                </button>
              )}
              <button
                type="button"
                onClick={() => void downloadItem(item)}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 text-sm font-semibold text-white hover:bg-white/20"
              >
                <DownloadSimple size={15} /> {t("common.download")}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

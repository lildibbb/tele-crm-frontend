"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CaretLeft,
  DownloadSimple,
  PencilSimple,
  PaperPlaneTilt,
  Paperclip,
  Robot,
  X,
} from "@phosphor-icons/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { leadsApi } from "@/lib/api";
import { LEAD_REPLY_REQUIRED_MESSAGE } from "@/lib/api/leads";
import {
  canSendLeadReply,
  normalizeLeadReplyMessage,
} from "@/lib/reply/leadReplyContract";
import { useLeadDetail } from "@/queries/useLeadsQuery";
import { queryKeys } from "@/queries/queryKeys";
import { parseApiData } from "@/lib/api/parseResponse";
import type { Interaction } from "@/lib/schemas/lead.schema";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { validateReplyAttachmentFile } from "@/lib/replyAttachmentPolicy";
import { FileTypeChip } from "@/components/ui/file-type-badge";
import {
  getAttachmentDisplayName,
  parseInteractionAttachmentMetadata,
} from "@/lib/chat-media";
import MobileAttachmentAnnotationDialog from "@/components/chat/MobileAttachmentAnnotationDialog";

/* ── Image Lightbox ───────────────────────────────────────────────── */
function ImageLightbox({
  src,
  fileName,
  onClose,
  onEdit,
}: {
  src: string;
  fileName: string;
  onClose: () => void;
  onEdit: () => void;
}) {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = src;
    link.download = fileName || "image";
    link.click();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 px-2"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white active:bg-white/20"
        style={{ paddingTop: "max(0px, env(safe-area-inset-top))" }}
        aria-label="Close preview"
      >
        <X size={22} weight="bold" />
      </button>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={fileName}
        className="max-h-[76dvh] max-w-[95vw] rounded-xl object-contain"
        onClick={(e) => e.stopPropagation()}
      />

      <div
        className="absolute inset-x-3 bottom-3 z-20 flex items-center gap-2 rounded-2xl border border-white/15 bg-black/55 p-2 backdrop-blur"
        style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onEdit}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-white/10 px-3 text-sm font-semibold text-white active:bg-white/20"
          aria-label="Edit image"
        >
          <PencilSimple size={16} />
          Edit
        </button>
        <button
          type="button"
          onClick={handleDownload}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-info px-3 text-sm font-semibold text-white active:opacity-90"
          aria-label="Download image"
        >
          <DownloadSimple size={16} />
          Download
        </button>
      </div>
    </div>
  );
}

/* ── Build optimistic interaction ─────────────────────────────────── */
function buildOptimisticInteraction({
  leadId,
  message,
  file,
  filePreviewUrl,
}: {
  leadId: string;
  message: string;
  file?: File | null;
  filePreviewUrl?: string | null;
}): Interaction {
  return {
    id: `optimistic-${Date.now()}`,
    leadId,
    type: "MANUAL_REPLY_SENT",
    content: message.trim(),
    metadata: file
      ? ({
          fileName: file.name,
          mimeType: file.type,
          size: file.size,
          ...(filePreviewUrl ? { fileUrl: filePreviewUrl } : {}),
        } as Record<string, unknown>)
      : null,
    createdAt: new Date().toISOString(),
  };
}

// ── Component ────────────────────────────────────────────────────────────────

export default function MobileLeadChat() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const leadId = searchParams.get("id") ?? "";

  const { data: lead } = useLeadDetail(leadId);

  // Poll interactions every 5s
  const { data: interactionsData } = useQuery({
    queryKey: [...queryKeys.leads.detail(leadId), "interactions"],
    queryFn: async () => {
      const res = await leadsApi.getInteractions(leadId, {
        skip: 0,
        take: 100,
      });
      return parseApiData<Interaction[]>(res.data) ?? [];
    },
    refetchInterval: 5000,
    enabled: !!leadId,
  });
  const interactions = useMemo(
    () => interactionsData ?? [],
    [interactionsData],
  );

  const [messageText, setMessageText] = useState("");
  const [replyFile, setReplyFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [lightboxItem, setLightboxItem] = useState<{
    src: string;
    fileName: string;
  } | null>(null);
  const [annotationTarget, setAnnotationTarget] = useState<{
    sourceUrl: string;
    sourceFileName: string;
  } | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const replyFileInputRef = useRef<HTMLInputElement>(null);

  // File preview URL tracking
  const objectUrlsRef = useRef<Set<string>>(new Set());

  const filePreviewUrl = useMemo(() => {
    if (replyFile) {
      const url = URL.createObjectURL(replyFile);
      objectUrlsRef.current.add(url);
      return url;
    }
    return null;
  }, [replyFile]);

  useEffect(() => {
    // Only revoke on component unmount
    const objectUrls = objectUrlsRef.current;
    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const isImageFile = replyFile?.type.startsWith("image/");

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [interactions]);

  const handleSend = useCallback(async () => {
    const text = normalizeLeadReplyMessage(messageText);
    const file = replyFile;
    if (!canSendLeadReply(text, file)) {
      toast.error(LEAD_REPLY_REQUIRED_MESSAGE);
      return;
    }
    if (isSending) return;

    // Optimistic update — add message immediately
    const optimistic = buildOptimisticInteraction({
      leadId,
      message: text,
      file,
      filePreviewUrl,
    });

    const queryKey = [...queryKeys.leads.detail(leadId), "interactions"];
    queryClient.setQueryData<Interaction[]>(queryKey, (old) => {
      if (!old) return [optimistic];
      return [...old, optimistic];
    });

    setMessageText("");
    setReplyFile(null);
    setIsSending(true);
    try {
      await leadsApi.reply(leadId, { message: text, file });
      // Refetch to get real server data
      void queryClient.invalidateQueries({ queryKey });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send message",
      );
      // Roll back optimistic update
      queryClient.setQueryData<Interaction[]>(queryKey, (old) =>
        old ? old.filter((i) => i.id !== optimistic.id) : old,
      );
      if (file) setReplyFile(file);
    } finally {
      setIsSending(false);
    }
  }, [messageText, isSending, leadId, replyFile, filePreviewUrl, queryClient]);

  const displayName = lead?.displayName ?? "Chat";

  // Reversed for display (oldest first)
  const displayMessages = useMemo(
    () => [...interactions].reverse(),
    [interactions],
  );

  return (
    <>
      <div className="flex flex-col h-[100dvh] bg-background text-text-primary font-sans">
        {/* Safe area top — handles notch/status bar since global layout is bypassed */}
        <div style={{ height: "env(safe-area-inset-top)" }} aria-hidden />
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="flex items-center gap-3 px-4 h-14 bg-card/90 backdrop-blur-xl border-b border-border-subtle shrink-0 sticky top-0 z-30">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 min-w-[44px] min-h-[44px] text-crimson active:opacity-70 transition-opacity"
            aria-label="Go back"
          >
            <CaretLeft size={20} weight="bold" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-sans font-bold text-[16px] text-text-primary truncate">
              {displayName}
            </p>
            <p className="text-[11px] font-sans text-text-muted">
              {interactions.length} messages
            </p>
          </div>
        </header>

        {/* ── Chat Messages ─────────────────────────────────────────────── */}
        <main
          className="flex-1 overflow-y-auto px-3 py-3 space-y-2"
          style={{
            WebkitOverflowScrolling: "touch",
            overscrollBehavior: "contain",
          }}
        >
          {displayMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-text-muted">
              <Robot size={40} weight="duotone" className="opacity-40" />
              <p className="text-[13px] font-sans">No messages yet</p>
            </div>
          ) : (
            displayMessages.map((msg, i) => {
              const isSystem = msg.type === "SYSTEM_STATUS_CHANGE";
              const isBot = msg.type === "AUTO_REPLY_SENT";
              const isUser = msg.type === "MESSAGE_RECEIVED";
              const isOwnerSide = !isUser && !isSystem;
              const isOptimistic = msg.id.startsWith("optimistic-");

              if (isSystem) {
                return (
                  <div key={msg.id ?? i} className="flex justify-center py-1">
                    <span className="text-[10px] font-sans italic text-text-muted bg-elevated px-3 py-1 rounded-full max-w-[90%] text-center">
                      {msg.content ?? ""}
                    </span>
                  </div>
                );
              }

              return (
                <div key={msg.id ?? i}>
                  <p
                    className={`mb-0.5 text-[9px] font-medium uppercase tracking-wider text-text-muted ${
                      isOwnerSide ? "text-right" : "text-left"
                    }`}
                  >
                    {isUser ? "User Message" : isBot ? "Bot" : "Owner Message"}
                  </p>
                  <div
                    className={cn(
                      "flex",
                      isOwnerSide ? "justify-end" : "justify-start",
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-3 py-2",
                        isOptimistic && "opacity-70",
                        isUser
                          ? "rounded-bl-md bg-elevated/80"
                          : isBot
                            ? "rounded-br-md bg-success/10"
                            : "rounded-br-md bg-crimson/10",
                      )}
                    >
                      {(() => {
                        const attachmentMeta =
                          parseInteractionAttachmentMetadata(msg.metadata);
                        const hasInlineMedia = Boolean(
                          attachmentMeta.previewType && attachmentMeta.fileUrl,
                        );
                        if (hasInlineMedia && attachmentMeta.fileUrl) {
                          const attachmentName = getAttachmentDisplayName(
                            attachmentMeta.fileName,
                            attachmentMeta.fileUrl,
                          );
                          if (attachmentMeta.previewType === "image") {
                            return (
                              <button
                                type="button"
                                onClick={() => {
                                  const fileName = getAttachmentDisplayName(
                                    attachmentMeta.fileName,
                                    attachmentMeta.fileUrl,
                                  );
                                  setLightboxItem({
                                    src: attachmentMeta.fileUrl!,
                                    fileName,
                                  });
                                }}
                                className="mb-1.5 overflow-hidden rounded-lg border border-border-subtle/80 block focus:outline-none"
                                aria-label="View full image"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={attachmentMeta.fileUrl}
                                  alt={attachmentName}
                                  className="w-full max-h-56 object-cover active:opacity-80"
                                />
                              </button>
                            );
                          }
                          return (
                            <div className="mb-1.5 overflow-hidden rounded-lg border border-border-subtle/80 bg-black">
                              <video
                                src={attachmentMeta.fileUrl}
                                controls
                                preload="metadata"
                                className="w-full max-h-64 object-contain"
                              />
                            </div>
                          );
                        }

                        if (!attachmentMeta.hasAttachment) return null;
                        const attachmentName = getAttachmentDisplayName(
                          attachmentMeta.fileName,
                          attachmentMeta.fileUrl,
                        );
                        return (
                          <div className="mb-1.5 flex items-center gap-1.5 rounded-lg bg-card/60 px-2 py-1.5">
                            <FileTypeChip mimeType={attachmentMeta.mimeType} />
                            <span className="max-w-[140px] truncate text-[11px] text-text-secondary">
                              {attachmentName}
                            </span>
                          </div>
                        );
                      })()}
                      {msg.content && (
                        <p className="text-[13px] font-sans text-text-primary leading-relaxed">
                          {msg.content}
                        </p>
                      )}
                      <p className="text-[9px] font-mono text-text-muted mt-1 text-right">
                        {isOptimistic
                          ? "Sending…"
                          : new Date(msg.createdAt).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </main>

        {/* ── Send Message Bar ────────────────────────────────────────── */}
        <div
          className="shrink-0 border-t border-border-subtle bg-background/95 backdrop-blur-xl"
          style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
        >
          <input
            ref={replyFileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const selected = e.target.files?.[0] ?? null;
              if (!selected) return;
              const error = validateReplyAttachmentFile(selected);
              if (error) {
                toast.error(error);
                e.currentTarget.value = "";
                return;
              }
              setReplyFile(selected);
            }}
          />

          {/* File preview strip — with image thumbnail */}
          {replyFile && (
            <div className="flex items-center gap-2.5 border-b border-border-subtle px-3 py-2">
              {isImageFile && filePreviewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={filePreviewUrl}
                  alt={replyFile.name}
                  className="h-12 w-12 shrink-0 rounded-lg border border-border-subtle object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border-subtle bg-elevated">
                  <Paperclip size={16} className="text-text-muted" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-medium text-text-primary">
                  {replyFile.name}
                </p>
                <p className="text-[10px] text-text-muted">
                  {(replyFile.size / 1024).toFixed(0)} KB
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setReplyFile(null);
                  if (replyFileInputRef.current)
                    replyFileInputRef.current.value = "";
                }}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full active:bg-elevated"
                aria-label="Remove file"
              >
                <X size={14} className="text-text-muted" />
              </button>
              {isImageFile && filePreviewUrl && (
                <button
                  type="button"
                  onClick={() =>
                    setAnnotationTarget({
                      sourceUrl: filePreviewUrl,
                      sourceFileName: replyFile.name,
                    })
                  }
                  className="flex h-7 items-center gap-1 rounded-full bg-elevated px-2 text-[11px] text-text-secondary active:bg-card"
                  aria-label="Edit selected image"
                >
                  <PencilSimple size={13} />
                  Edit
                </button>
              )}
            </div>
          )}

          {/* Input row — compact WhatsApp-style */}
          <div className="flex items-end gap-2 px-3 py-2">
            <button
              type="button"
              onClick={() => replyFileInputRef.current?.click()}
              disabled={isSending}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-elevated active:bg-card disabled:opacity-50"
              aria-label="Attach file"
            >
              <Paperclip size={18} className="text-text-secondary" />
            </button>
            <div className="min-w-0 flex-1">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend();
                  }
                }}
                placeholder="Type a message…"
                className="h-10 w-full rounded-full border border-border-subtle bg-elevated/60 px-4 text-[14px] text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-crimson/30"
                disabled={isSending}
                style={{ fontSize: "16px" /* prevent iOS zoom */ }}
              />
            </div>
            <button
              onClick={() => void handleSend()}
              disabled={isSending || !canSendLeadReply(messageText, replyFile)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-crimson text-white active:bg-crimson-hover disabled:opacity-40"
              aria-label="Send"
            >
              {isSending ? (
                <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
              ) : (
                <PaperPlaneTilt size={18} weight="fill" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Image Lightbox ───────────────────────────────────────── */}
      {lightboxItem && (
        <ImageLightbox
          src={lightboxItem.src}
          fileName={lightboxItem.fileName}
          onClose={() => setLightboxItem(null)}
          onEdit={() => {
            if (!lightboxItem.src?.trim()) {
              toast.error("No image source available for editing.");
              return;
            }
            setAnnotationTarget({
              sourceUrl: lightboxItem.src.trim(),
              sourceFileName: lightboxItem.fileName,
            });
            setLightboxItem(null);
          }}
        />
      )}
      <MobileAttachmentAnnotationDialog
        open={Boolean(annotationTarget)}
        sourceUrl={annotationTarget?.sourceUrl ?? null}
        sourceFileName={annotationTarget?.sourceFileName ?? "image"}
        onClose={() => setAnnotationTarget(null)}
        onSave={(editedFile) => {
          const validationError = validateReplyAttachmentFile(editedFile);
          if (validationError) {
            toast.error(validationError);
            return;
          }
          setReplyFile(editedFile);
        }}
      />
    </>
  );
}

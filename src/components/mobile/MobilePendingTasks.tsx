"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type TouchEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowsClockwise,
  CaretRight,
  CheckCircle,
  ClipboardText,
  Crown,
  DotsThree,
  Paperclip,
  PaperPlaneTilt,
  TelegramLogo,
  X,
  XCircle,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { leadsApi } from "@/lib/api";
import { LEAD_REPLY_REQUIRED_MESSAGE } from "@/lib/api/leads";
import {
  canSendLeadReply,
  normalizeLeadReplyMessage,
} from "@/lib/reply/leadReplyContract";
import { parseApiData } from "@/lib/api/parseResponse";
import { timeAgo } from "@/lib/format";
import { validateReplyAttachmentFile } from "@/lib/replyAttachmentPolicy";
import {
  getAttachmentDisplayName,
  parseInteractionAttachmentMetadata,
} from "@/lib/chat-media";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  usePendingTasksGroupedByLead,
  useUpdatePendingTaskStatus,
  usePendingTasksList,
} from "@/queries/usePendingTasksQuery";
import { PendingTaskStatus } from "@/types/enums";
import type { Interaction } from "@/lib/schemas/lead.schema";
import type {
  PendingTask,
  PendingTaskLeadGroup,
} from "@/lib/schemas/pendingTask.schema";
import MobileAttachmentAnnotationDialog from "@/components/chat/MobileAttachmentAnnotationDialog";
import MobileImageViewerDialog from "@/components/mobile/MobileImageViewerDialog";
import { useT } from "@/i18n";

export interface MobilePendingTasksProps {
  readonly pageSize?: number;
}
const CONTEXT_WINDOW_BEFORE = 24;
const CONTEXT_WINDOW_AFTER = 24;

type UpdatableStatus = Exclude<
  PendingTask["status"],
  typeof PendingTaskStatus.PENDING
>;
type ContextChatSelection = {
  group: PendingTaskLeadGroup;
  task: PendingTask | null;
};

const STATUS_FILTERS: { value: PendingTask["status"] }[] = [
  { value: PendingTaskStatus.PENDING },
  { value: PendingTaskStatus.RESOLVED },
  { value: PendingTaskStatus.DISMISSED },
];

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function taskStatusBadge(status: PendingTask["status"]) {
  if (status === PendingTaskStatus.RESOLVED)
    return "bg-success/10 text-success border-success/20";
  if (status === PendingTaskStatus.DISMISSED)
    return "bg-danger/10 text-danger border-danger/20";
  return "bg-warning/10 text-warning border-warning/20";
}

function leadStatusBadge(status: PendingTaskLeadGroup["lead"]["status"]) {
  switch (status) {
    case "NEW":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "CONTACTED":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "DEPOSIT_REPORTED":
      return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    case "DEPOSIT_CONFIRMED":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    case "REJECTED":
      return "bg-danger/10 text-danger border-danger/20";
    default:
      return "bg-muted text-muted-foreground border-border-subtle";
  }
}

function formatLeadName(group: PendingTaskLeadGroup) {
  return (
    group.lead.displayName ??
    group.lead.username ??
    group.lead.email ??
    group.leadId
  );
}

function formatLeadIdentity(group: PendingTaskLeadGroup) {
  const parts = [
    group.lead.username ? `@${group.lead.username}` : null,
    group.lead.email,
    group.lead.hfmBrokerId ? `HFM ${group.lead.hfmBrokerId}` : null,
  ].filter(Boolean);
  if (!parts.length) return "No contact details";
  return parts.join(" · ");
}

function getInitials(name: string) {
  return name
    .split(/[\s_-]+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function TaskAttachmentPreview({
  task,
  compact,
  onImageTap,
  viewImageLabel = "View full image",
  unknownFileLabel = "File",
}: {
  task: PendingTask;
  compact?: boolean;
  onImageTap?: (url: string, fileName?: string) => void;
  viewImageLabel?: string;
  unknownFileLabel?: string;
}) {
  const attachment = task.attachment;
  if (!attachment?.fileUrl) return null;
  const fileUrl = attachment.fileUrl;
  const mimeType = attachment.mimeType ?? "";
  const mediaContainerClass = compact
    ? "h-16 w-16 shrink-0"
    : "w-full max-w-full shrink-0";
  const fileName = getAttachmentDisplayName(attachment.fileKey, fileUrl);

  if (mimeType.startsWith("image/")) {
    if (!onImageTap) {
      return (
        <div
          className={`${mediaContainerClass} overflow-hidden rounded-xl border border-border-subtle bg-black/10`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fileUrl}
            alt={fileName}
            className={`block w-full ${compact ? "h-full object-cover" : "h-auto max-h-[50dvh] min-h-32 object-cover"}`}
          />
        </div>
      );
    }

    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onImageTap(fileUrl, fileName);
        }}
        className={`${mediaContainerClass} overflow-hidden rounded-xl border border-border-subtle bg-black/10 focus:outline-none`}
        aria-label={viewImageLabel}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={fileUrl}
          alt={fileName}
          className={`block w-full active:opacity-80 ${compact ? "h-full object-cover" : "h-auto max-h-[50dvh] min-h-32 object-cover"}`}
        />
      </button>
    );
  }
  if (mimeType.startsWith("video/")) {
    return (
      <video
        src={fileUrl}
        controls
        preload="metadata"
        playsInline
        className={`${mediaContainerClass} rounded-xl border border-border-subtle bg-black ${compact ? "h-full object-cover" : "h-auto max-h-[50dvh] min-h-32 object-contain"}`}
      />
    );
  }
  return (
    <div
      className={`${compact ? "h-16 w-16" : "h-24 w-full max-w-full"} flex shrink-0 items-center justify-center rounded-xl border border-border-subtle bg-elevated px-2 text-center text-[10px] text-text-secondary`}
    >
      {mimeType || unknownFileLabel}
    </div>
  );
}

function buildOptimisticContextInteraction({
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
    id: `optimistic-reply-${Date.now()}`,
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

/* ════════════════════════════════════════════════════════════
   Main Component
   ════════════════════════════════════════════════════════════ */
export default function MobilePendingTasks({
  pageSize = 20,
}: MobilePendingTasksProps) {
  const t = useT();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<PendingTask["status"]>(
    PendingTaskStatus.PENDING,
  );
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [expandedLeadIds, setExpandedLeadIds] = useState<Set<string>>(
    new Set(),
  );
  const [chatSelection, setChatSelection] =
    useState<ContextChatSelection | null>(null);
  const [contextReplyText, setContextReplyText] = useState("");
  const [contextReplyFile, setContextReplyFile] = useState<File | null>(null);
  const [isSendingContextReply, setIsSendingContextReply] = useState(false);
  const [lightboxItem, setLightboxItem] = useState<{
    src: string;
    fileName: string;
  } | null>(null);
  const [annotationTarget, setAnnotationTarget] = useState<{
    sourceUrl: string;
    sourceFileName: string;
  } | null>(null);
  const router = useRouter();
  const contextChatContainerRef = useRef<HTMLDivElement>(null);
  const contextReplyFileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlsRef = useRef<Set<string>>(new Set());
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);

  const contextReplyFilePreviewUrl = useMemo(() => {
    if (contextReplyFile) {
      const url = URL.createObjectURL(contextReplyFile);
      objectUrlsRef.current.add(url);
      return url;
    }
    return null;
  }, [contextReplyFile]);

  useEffect(() => {
    // Only revoke on component unmount
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const openImageLightbox = (url: string, fileName?: string) => {
    const normalizedUrl = url?.trim();
    if (!normalizedUrl) return;
    const viewerPayload = {
      src: normalizedUrl,
      fileName:
        fileName?.trim() || getAttachmentDisplayName(undefined, normalizedUrl),
    };
    setLightboxItem(viewerPayload);
  };

  const openAnnotationEditor = (sourceUrl: string, sourceFileName?: string) => {
    const normalizedSourceUrl = sourceUrl?.trim();
    if (!normalizedSourceUrl) {
      toast.error(t("lead.annotation.noSource"));
      return;
    }

    const editorPayload = {
      sourceUrl: normalizedSourceUrl,
      sourceFileName: sourceFileName?.trim() || "image",
    };

    setLightboxItem(null);
    setAnnotationTarget(editorPayload);
  };
  const isMediaOverlayOpen = Boolean(lightboxItem || annotationTarget);

  const handleContextTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    if (isMediaOverlayOpen) return;
    const touch = event.touches[0];
    if (!touch) return;
    swipeStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleContextTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (isMediaOverlayOpen) return;
    const start = swipeStartRef.current;
    swipeStartRef.current = null;
    const touch = event.changedTouches[0];
    if (!start || !touch) return;

    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    const startedFromLeftEdge = start.x <= 40;

    if (startedFromLeftEdge && deltaX > 72 && Math.abs(deltaY) < 48) {
      setChatSelection(null);
    }
  };

  const queryParams = useMemo(() => ({ status: statusFilter }), [statusFilter]);

  const {
    data: groupedResult,
    isLoading,
    isFetching,
    refetch,
  } = usePendingTasksGroupedByLead(queryParams);

  // 3 separate queries for accurate overall counts across all tabs
  const { data: pendingCountResult } = usePendingTasksList({
    skip: 0,
    take: 1,
    status: PendingTaskStatus.PENDING,
  });
  const { data: resolvedCountResult } = usePendingTasksList({
    skip: 0,
    take: 1,
    status: PendingTaskStatus.RESOLVED,
  });
  const { data: dismissedCountResult } = usePendingTasksList({
    skip: 0,
    take: 1,
    status: PendingTaskStatus.DISMISSED,
  });

  const overallCounts = useMemo(
    () => ({
      pending: pendingCountResult?.total ?? 0,
      resolved: resolvedCountResult?.total ?? 0,
      dismissed: dismissedCountResult?.total ?? 0,
    }),
    [
      pendingCountResult?.total,
      resolvedCountResult?.total,
      dismissedCountResult?.total,
    ],
  );

  const statusCountByFilter = useMemo(
    () => ({
      [PendingTaskStatus.PENDING]: overallCounts.pending,
      [PendingTaskStatus.RESOLVED]: overallCounts.resolved,
      [PendingTaskStatus.DISMISSED]: overallCounts.dismissed,
    }),
    [overallCounts.dismissed, overallCounts.pending, overallCounts.resolved],
  );
  const getStatusLabel = (status: PendingTask["status"]) => {
    switch (status) {
      case PendingTaskStatus.PENDING:
        return t("pending.pending");
      case PendingTaskStatus.RESOLVED:
        return t("pending.resolved");
      case PendingTaskStatus.DISMISSED:
        return t("pending.dismissed");
      default:
        return status;
    }
  };

  const updateStatusMutation = useUpdatePendingTaskStatus();

  const groups = useMemo(
    () => groupedResult?.groups ?? [],
    [groupedResult?.groups],
  );
  const allTasks = useMemo(
    () => groups.flatMap((group) => group.tasks),
    [groups],
  );
  const selectedTask = selectedTaskId
    ? (allTasks.find((task) => task.id === selectedTaskId) ?? null)
    : null;
  const selectedGroup = selectedTask
    ? (groups.find((group) => group.leadId === selectedTask.leadId) ?? null)
    : null;

  useEffect(() => {
    if (!selectedTaskId) return;
    if (!allTasks.some((task) => task.id === selectedTaskId))
      setSelectedTaskId(null);
  }, [allTasks, selectedTaskId]);

  useEffect(() => {
    setExpandedLeadIds((prev) => {
      const availableIds = new Set(groups.map((g) => g.leadId));
      const next = new Set<string>();
      prev.forEach((id) => {
        if (availableIds.has(id)) next.add(id);
      });
      if (groups.length > 0 && next.size === 0) next.add(groups[0].leadId);
      return next;
    });
  }, [groups]);

  /* ── Context chat data ──────────────────────────────────────── */
  const contextLeadId = chatSelection?.group.leadId ?? null;
  const highlightedInteractionId = chatSelection?.task?.interactionId ?? null;
  const contextQueryKey = useMemo(
    () =>
      [
        "pendingTaskContextChat",
        contextLeadId,
        highlightedInteractionId ?? "latest",
      ] as const,
    [contextLeadId, highlightedInteractionId],
  );

  const { data: contextInteractions, isLoading: isLoadingContextInteractions } =
    useQuery({
      queryKey: contextQueryKey,
      enabled: Boolean(contextLeadId),
      queryFn: async () => {
        const leadId = contextLeadId;
        if (!leadId) return [];
        const res = await leadsApi.getInteractions(
          leadId,
          highlightedInteractionId
            ? {
                skip: 0,
                take: pageSize,
                anchorInteractionId: highlightedInteractionId,
                before: CONTEXT_WINDOW_BEFORE,
                after: CONTEXT_WINDOW_AFTER,
              }
            : {
                skip: 0,
                take: pageSize,
              },
        );
        return parseApiData<Interaction[]>(res.data) ?? [];
      },
    });
  const contextChatInteractions = useMemo(
    () => [...(contextInteractions ?? [])].reverse(),
    [contextInteractions],
  );

  useEffect(() => {
    setContextReplyText("");
    setContextReplyFile(null);
    setIsSendingContextReply(false);
    if (contextReplyFileInputRef.current)
      contextReplyFileInputRef.current.value = "";
  }, [contextLeadId, chatSelection?.task?.id]);

  useEffect(() => {
    const container = contextChatContainerRef.current;
    if (!container || contextChatInteractions.length === 0) return;
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }, [contextChatInteractions]);

  /* ── Handlers ───────────────────────────────────────────────── */
  const handleUpdateStatus = async (
    task: PendingTask,
    status: UpdatableStatus,
  ) => {
    try {
      await updateStatusMutation.mutateAsync({ id: task.id, data: { status } });
      toast.success(
        status === PendingTaskStatus.RESOLVED
          ? t("pending.taskMarkedResolved")
          : t("pending.taskMarkedDismissed"),
      );
    } catch {
      toast.error(t("pending.failedUpdateStatus"));
    }
  };

  const handleSendContextReply = async () => {
    if (!contextLeadId || isSendingContextReply) return;
    const text = normalizeLeadReplyMessage(contextReplyText);
    const file = contextReplyFile;
    if (!canSendLeadReply(text, file)) {
      toast.error(LEAD_REPLY_REQUIRED_MESSAGE);
      return;
    }

    const previousInteractions =
      queryClient.getQueryData<Interaction[]>(contextQueryKey) ?? [];
    const optimisticInteraction = buildOptimisticContextInteraction({
      leadId: contextLeadId,
      message: text,
      file,
      filePreviewUrl: contextReplyFilePreviewUrl,
    });

    setContextReplyText("");
    setContextReplyFile(null);
    if (contextReplyFileInputRef.current)
      contextReplyFileInputRef.current.value = "";
    setIsSendingContextReply(true);
    queryClient.setQueryData<Interaction[]>(contextQueryKey, [
      optimisticInteraction,
      ...previousInteractions,
    ]);

    try {
      await leadsApi.reply(contextLeadId, { message: text, file });
      await queryClient.invalidateQueries({ queryKey: contextQueryKey });
    } catch (error) {
      queryClient.setQueryData(contextQueryKey, previousInteractions);
      setContextReplyText(text);
      if (file) setContextReplyFile(file);
      toast.error(
        error instanceof Error ? error.message : t("pending.failedSendMessage"),
      );
    } finally {
      setIsSendingContextReply(false);
    }
  };

  const toggleGroup = (leadId: string) => {
    setExpandedLeadIds((prev) => {
      const next = new Set(prev);
      if (next.has(leadId)) next.delete(leadId);
      else next.add(leadId);
      return next;
    });
  };

  /* ════════════════════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════════════════════ */

  /* ── Full-screen chat overlay (absolute positioned, covers parent) ── */
  if (chatSelection) {
    const leadName = formatLeadName(chatSelection.group);
    return (
      <>
        <div
          className="fixed inset-0 z-50 flex flex-col bg-background"
          data-testid="mobile-pending-tasks-chat"
          onTouchStart={handleContextTouchStart}
          onTouchEnd={handleContextTouchEnd}
          style={{ touchAction: "pan-y" }}
        >
          {/* ── Chat header ─────────────────────────────────── */}
          <header
            className="flex items-center gap-3 border-b border-border-subtle bg-base px-3 py-2.5"
            style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}
          >
            <button
              onClick={() => setChatSelection(null)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full active:bg-elevated"
              aria-label={t("pending.goBack")}
            >
              <ArrowLeft size={20} className="text-text-primary" />
            </button>
            <Avatar size="sm">
              <AvatarFallback className="bg-crimson-subtle text-crimson text-[10px] font-bold">
                {getInitials(leadName)}
              </AvatarFallback>
            </Avatar>
            <p className="min-w-0 flex-1 truncate text-[15px] font-semibold text-text-primary">
              {leadName}
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full active:bg-elevated"
                  aria-label={t("pending.options")}
                >
                  <DotsThree
                    size={20}
                    weight="bold"
                    className="text-text-secondary"
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[170px]">
                <DropdownMenuItem asChild>
                  <Link href={`/leads/detail?id=${chatSelection.group.leadId}`}>
                    {t("pending.viewLeadDetails")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/leads/chat?id=${chatSelection.group.leadId}`}>
                    {t("pending.openFullChat")}
                  </Link>
                </DropdownMenuItem>
                {chatSelection.task?.status === PendingTaskStatus.PENDING && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() =>
                        chatSelection.task &&
                        void handleUpdateStatus(
                          chatSelection.task,
                          PendingTaskStatus.RESOLVED,
                        )
                      }
                    >
                      <CheckCircle size={14} className="text-success" />
                      {t("pending.resolve")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        chatSelection.task &&
                        void handleUpdateStatus(
                          chatSelection.task,
                          PendingTaskStatus.DISMISSED,
                        )
                      }
                    >
                      <XCircle size={14} className="text-danger" />
                      {t("pending.dismiss")}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          {/* ── Pinned task (compact) ───────────────────────── */}
          {chatSelection.task && (
            <div className="flex items-center gap-2.5 border-b border-border-subtle bg-elevated/30 px-4 py-2">
              <TaskAttachmentPreview
                task={chatSelection.task}
                compact
                onImageTap={openImageLightbox}
                viewImageLabel={t("pending.viewImage")}
                unknownFileLabel={t("pending.file")}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-text-primary">
                  {t("pending.attachmentReceived")}
                  {chatSelection.task.caption?.trim()
                    ? `: ${chatSelection.task.caption.trim()}`
                    : ""}
                </p>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className="text-[10px] text-text-muted">
                    {formatDateTime(chatSelection.task.createdAt)}
                  </span>
                  <Badge
                    className={`border text-[8px] px-1 py-0 uppercase ${taskStatusBadge(chatSelection.task.status)}`}
                  >
                    {chatSelection.task.status}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* ── Messages ────────────────────────────────────── */}
          <div
            ref={contextChatContainerRef}
            className="flex-1 space-y-3 overflow-y-auto px-3 py-3"
            style={{
              WebkitOverflowScrolling: "touch",
              overscrollBehavior: "contain",
            }}
          >
            {isLoadingContextInteractions ? (
              <div className="space-y-3 py-8">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
                  >
                    <div className="h-10 w-3/5 animate-pulse rounded-2xl bg-elevated" />
                  </div>
                ))}
              </div>
            ) : contextChatInteractions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <PaperPlaneTilt size={24} className="mb-2 text-text-muted" />
                <p className="text-xs text-text-secondary">
                  {t("pending.noInteractionsYet")}
                </p>
              </div>
            ) : (
              <>
                <p className="text-center text-[9px] font-medium uppercase tracking-widest text-text-muted">
                  {t("pending.conversation")}
                </p>
                {contextChatInteractions.map((interaction) => {
                  const attachmentMeta = parseInteractionAttachmentMetadata(
                    interaction.metadata,
                  );
                  const attachmentName = getAttachmentDisplayName(
                    attachmentMeta.fileName,
                    attachmentMeta.fileUrl,
                  );
                  const hasInlineMedia = Boolean(
                    attachmentMeta.previewType && attachmentMeta.fileUrl,
                  );
                  const isLeadMessage = interaction.type === "MESSAGE_RECEIVED";
                  const isAgentMessage =
                    interaction.type === "MANUAL_REPLY_SENT";
                  const senderLabel = isLeadMessage
                    ? t("pending.userMessage")
                    : isAgentMessage
                      ? t("pending.ownerMessage")
                      : interaction.type === "AUTO_REPLY_SENT"
                        ? t("pending.bot")
                        : interaction.type;
                  const isOwnerSide = !isLeadMessage;
                  const isHighlighted =
                    interaction.id === highlightedInteractionId;

                  return (
                    <div key={interaction.id}>
                      <p
                        className={`mb-0.5 text-[9px] font-medium uppercase tracking-wider text-text-muted ${isOwnerSide ? "text-right" : "text-left"}`}
                      >
                        {senderLabel}
                      </p>
                      <div
                        className={`flex ${isOwnerSide ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                            isHighlighted ? "ring-2 ring-crimson/30" : ""
                          } ${
                            isLeadMessage
                              ? "rounded-bl-md bg-elevated/80"
                              : isAgentMessage
                                ? "rounded-br-md bg-crimson/10"
                                : "rounded-br-md bg-success/10"
                          }`}
                        >
                          {hasInlineMedia && attachmentMeta.fileUrl && (
                            <div className="mb-1.5 overflow-hidden rounded-lg">
                              {attachmentMeta.previewType === "image" ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    openImageLightbox(
                                      attachmentMeta.fileUrl!,
                                      attachmentName,
                                    )
                                  }
                                  className="block w-full focus:outline-none"
                                  aria-label={t("pending.viewImage")}
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={attachmentMeta.fileUrl}
                                    alt={attachmentName}
                                    className="max-h-[50dvh] w-full object-cover active:opacity-80 transition-opacity rounded-lg"
                                  />
                                </button>
                              ) : (
                                <video
                                  src={attachmentMeta.fileUrl}
                                  controls
                                  preload="metadata"
                                  className="max-h-[50dvh] w-full bg-black object-contain rounded-lg"
                                />
                              )}
                            </div>
                          )}
                          {attachmentMeta.hasAttachment && !hasInlineMedia && (
                            <p className="mb-1 text-[10px] text-text-secondary">
                              📎 {attachmentName}
                            </p>
                          )}
                          {interaction.content?.trim() && (
                            <p className="text-[13px] leading-relaxed text-text-primary">
                              {interaction.content.trim()}
                            </p>
                          )}
                          <p className="mt-1 text-[9px] text-text-muted">
                            {timeAgo(interaction.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* ── Compact reply composer ──────────────────────── */}
          <div
            className="border-t border-border-subtle bg-base"
            style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
          >
            {/* File attachment input (hidden) */}
            <input
              ref={contextReplyFileInputRef}
              type="file"
              className="hidden"
              onChange={(event) => {
                const selected = event.target.files?.[0] ?? null;
                if (!selected) return;
                const validationError = validateReplyAttachmentFile(selected);
                if (validationError) {
                  toast.error(validationError);
                  event.currentTarget.value = "";
                  return;
                }
                setContextReplyFile(selected);
              }}
            />

            {/* File preview strip */}
            {contextReplyFile && (
              <div className="flex items-center gap-2 border-b border-border-subtle px-3 py-1.5">
                <Paperclip size={12} className="shrink-0 text-text-muted" />
                <p className="min-w-0 flex-1 truncate text-[11px] text-text-secondary">
                  {contextReplyFile.name}
                </p>
                <button
                  onClick={() => {
                    setContextReplyFile(null);
                    if (contextReplyFileInputRef.current)
                      contextReplyFileInputRef.current.value = "";
                  }}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full active:bg-elevated"
                  aria-label={t("pending.removeFile")}
                >
                  <X size={12} className="text-text-muted" />
                </button>
              </div>
            )}

            {/* Input row — compact WhatsApp-style */}
            <div className="flex items-end gap-2 px-3 py-2">
              <button
                onClick={() => contextReplyFileInputRef.current?.click()}
                disabled={isSendingContextReply}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-elevated active:bg-card disabled:opacity-50"
                aria-label={t("pending.attachFile")}
              >
                <Paperclip size={18} className="text-text-secondary" />
              </button>
              <div className="min-w-0 flex-1">
                <input
                  type="text"
                  value={contextReplyText}
                  onChange={(e) => setContextReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void handleSendContextReply();
                    }
                  }}
                  placeholder={t("pending.replyPlaceholder")}
                  className="h-10 w-full rounded-full border border-border-subtle bg-elevated/60 px-4 text-[14px] text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-crimson/30"
                  disabled={isSendingContextReply}
                  style={{ fontSize: "16px" /* prevent iOS zoom */ }}
                />
              </div>
              <button
                onClick={() => void handleSendContextReply()}
                disabled={
                  isSendingContextReply ||
                  !canSendLeadReply(contextReplyText, contextReplyFile)
                }
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-crimson text-white active:bg-crimson-hover disabled:opacity-40"
                aria-label={t("pending.send")}
              >
                <TelegramLogo size={18} weight="fill" />
              </button>
            </div>
          </div>
        </div>

        {/* Lightbox in chat view */}
        <MobileImageViewerDialog
          open={Boolean(lightboxItem)}
          item={
            lightboxItem
              ? {
                  url: lightboxItem.src,
                  name: lightboxItem.fileName,
                  type: "image",
                  mimeType: "image/jpeg",
                }
              : null
          }
          onClose={() => setLightboxItem(null)}
          onEdit={(item) => {
            openAnnotationEditor(item.url, item.name);
          }}
        />
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
            setContextReplyFile(editedFile);
          }}
        />
      </>
    );
  }

  /* ── Main leads list view (fits inside MobileShell) ───────── */
  return (
    <div
      className="space-y-3 px-4 pb-4"
      data-testid="mobile-pending-tasks-page"
    >
      {/* Status filter chips */}
      <div
        className="flex items-center gap-2 overflow-x-auto pt-1"
        style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}
      >
        {STATUS_FILTERS.map((filter) => {
          const active = filter.value === statusFilter;
          const count = statusCountByFilter[filter.value] ?? 0;
          return (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                active
                  ? "border-crimson/40 bg-crimson/10 text-crimson"
                  : "border-border-subtle bg-card text-text-secondary active:bg-elevated"
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                <span>{getStatusLabel(filter.value)}</span>
                <span
                  className={`rounded-full px-1.5 py-[1px] text-[10px] ${
                    active
                      ? "bg-crimson/15 text-crimson"
                      : "bg-elevated text-text-muted"
                  }`}
                >
                  {count}
                </span>
              </span>
            </button>
          );
        })}
        <Button
          size="sm"
          variant="ghost"
          className="h-7 shrink-0 gap-1 px-2 text-[11px] text-text-secondary"
          onClick={() => void refetch()}
          disabled={isFetching}
        >
          <ArrowsClockwise
            size={12}
            className={isFetching ? "animate-spin" : undefined}
          />
        </Button>
      </div>

      {/* Summary bar */}
      <div className="flex items-center gap-2 text-[11px] text-text-secondary">
        <span>
          {groupedResult?.totalLeads ?? 0} leads ·{" "}
          {groupedResult?.totalTasks ?? 0} tasks
        </span>
        <span className="ml-auto text-[10px] text-text-muted">
          {t("pending.swipeRightHint")}
        </span>
      </div>

      {/* Lead groups */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-border-subtle bg-card p-3"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-elevated" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-24 rounded bg-elevated" />
                  <div className="h-2.5 w-36 rounded bg-elevated" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <CheckCircle size={24} className="mb-2 text-text-muted" />
          <p className="text-sm text-text-secondary">
            {t("pending.noTasksFound")}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => {
            const isExpanded = expandedLeadIds.has(group.leadId);
            const leadName = formatLeadName(group);
            return (
              <article
                key={group.leadId}
                className="relative overflow-hidden rounded-3xl border bg-card/60 backdrop-blur-xl border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
              >
                {/* Subtle glass reflection */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 transition-opacity pointer-events-none" />
                {/* Lead header */}
                <button
                  onClick={() => toggleGroup(group.leadId)}
                  className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left active:bg-elevated/40"
                >
                  <Avatar size="sm">
                    <AvatarFallback className="bg-crimson-subtle text-crimson text-[10px] font-bold">
                      {getInitials(leadName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <p className="truncate text-[13px] font-semibold text-text-primary">
                        {leadName}
                      </p>
                      {group.lead.hfmBrokerId && (
                        <Crown
                          size={12}
                          weight="fill"
                          className="shrink-0 text-gold"
                        />
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-[11px] text-text-muted">
                      {group.lead.hfmBrokerId
                        ? `${t("pending.hfm")} ID: ${group.lead.hfmBrokerId}`
                        : formatLeadIdentity(group)}
                    </p>
                  </div>
                  <Badge
                    className={`shrink-0 border text-[8px] uppercase tracking-wider ${leadStatusBadge(group.lead.status)}`}
                  >
                    {group.lead.status ?? "UNKNOWN"}
                  </Badge>
                  <CaretRight
                    size={14}
                    className={`shrink-0 text-text-muted transition-transform ${isExpanded ? "rotate-90" : ""}`}
                  />
                </button>

                {/* Expanded section */}
                {isExpanded && (
                  <div className="space-y-1.5 border-t border-border-subtle px-3 pb-3 pt-2">
                    {/* Lead context — compact */}
                    <div className="rounded-lg bg-elevated/40 px-2.5 py-1.5 text-[11px] text-text-secondary leading-relaxed">
                      <span>
                        {t("pending.username")}:{" "}
                        {group.lead.username ? `@${group.lead.username}` : "—"}
                      </span>
                      <span className="mx-1.5">·</span>
                      <span>
                        {t("pending.email")}: {group.lead.email ?? "—"}
                      </span>
                      <span className="mx-1.5">·</span>
                      <span>
                        {t("pending.hfm")}: {group.lead.hfmBrokerId ?? "—"}
                      </span>
                    </div>

                    {/* Task cards */}
                    {group.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="relative flex min-h-[84px] w-full items-center gap-3 rounded-2xl border border-white/5 bg-elevated/40 px-3 py-2.5 transition-colors"
                      >
                        <TaskAttachmentPreview
                          task={task}
                          compact
                          viewImageLabel={t("pending.viewImage")}
                          unknownFileLabel={t("pending.file")}
                        />
                        <button
                          type="button"
                          onClick={() => setSelectedTaskId(task.id)}
                          aria-label={
                            task.caption?.trim() || t("pending.attachmentReceived")
                          }
                          className="min-w-0 flex-1 text-left active:opacity-80"
                        >
                          <p className="text-xs font-medium text-text-primary">
                            {t("pending.attachmentReceived")}
                          </p>
                          {task.caption?.trim() && (
                            <p className="mt-0.5 line-clamp-1 text-[11px] text-text-secondary">
                              {task.caption.trim()}
                            </p>
                          )}
                          <div className="mt-1 flex items-center gap-1.5">
                            <span className="text-[10px] text-text-muted">
                              {formatDateTime(task.createdAt)}
                            </span>
                            <Badge
                              className={`border text-[8px] px-1 py-0 uppercase ${taskStatusBadge(task.status)}`}
                            >
                              {task.status}
                            </Badge>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedTaskId(task.id)}
                          aria-label={t("pending.taskDetail")}
                          className="shrink-0 rounded-md p-1 text-text-muted active:bg-elevated/70"
                        >
                          <CaretRight size={14} />
                        </button>
                      </div>
                    ))}

                    {/* Quick action */}
                    <button
                      onClick={() =>
                        setChatSelection({
                          group,
                          task: group.tasks[0] ?? null,
                        })
                      }
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-crimson/20 bg-crimson/5 py-2 text-xs font-semibold text-crimson active:bg-crimson/10"
                    >
                      <PaperPlaneTilt size={13} />
                      {t("pending.contextChat")}
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* ── Task Detail Bottom Sheet ──────────────────────── */}
      <Sheet
        open={Boolean(selectedTask)}
        onOpenChange={(open) => {
          if (!open) setSelectedTaskId(null);
        }}
      >
        <SheetContent
          side="bottom"
          className="max-h-[80dvh] overflow-y-auto rounded-t-2xl"
        >
          {!selectedTask && (
            <SheetHeader className="sr-only">
              <SheetTitle>{t("pending.taskDetail")}</SheetTitle>
              <SheetDescription>
                {t("pending.reviewTaskDetails")}
              </SheetDescription>
            </SheetHeader>
          )}
          {selectedTask && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 text-base">
                  <ClipboardText size={16} />
                  {t("pending.taskDetail")}
                </SheetTitle>
                <SheetDescription>
                  {t("pending.reviewTaskDetails")}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-3 px-4 pb-5 pt-1">
                {/* Lead context card — tappable, navigates to detail */}
                {selectedGroup && (
                  <button
                    onClick={() => {
                      setSelectedTaskId(null);
                      router.push(`/leads/detail?id=${selectedTask.leadId}`);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl border border-border-subtle bg-elevated/30 px-3 py-2.5 text-left active:bg-elevated/60"
                  >
                    <Avatar size="sm">
                      <AvatarFallback className="bg-crimson-subtle text-crimson text-[10px] font-bold">
                        {getInitials(formatLeadName(selectedGroup))}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-text-primary">
                        {formatLeadName(selectedGroup)}
                      </p>
                      <p className="text-[11px] text-text-secondary">
                        {formatLeadIdentity(selectedGroup)}
                      </p>
                      <div className="mt-1 text-[10px] text-text-muted leading-relaxed">
                        <span>
                          {t("pending.username")}:{" "}
                          {selectedGroup.lead.username
                            ? `@${selectedGroup.lead.username}`
                            : "—"}
                        </span>
                        <span className="mx-1">·</span>
                        <span>
                          {t("pending.email")}:{" "}
                          {selectedGroup.lead.email ?? "—"}
                        </span>
                        <span className="mx-1">·</span>
                        <span>
                          {t("pending.hfm")}:{" "}
                          {selectedGroup.lead.hfmBrokerId ?? "—"}
                        </span>
                      </div>
                    </div>
                    <Badge
                      className={`shrink-0 border text-[8px] uppercase ${leadStatusBadge(selectedGroup.lead.status)}`}
                    >
                      {selectedGroup.lead.status ?? "UNKNOWN"}
                    </Badge>
                    <CaretRight
                      size={14}
                      className="shrink-0 text-text-muted"
                    />
                  </button>
                )}

                {/* Message */}
                <div>
                  <p className="text-[11px] text-text-muted">
                    {t("pending.customerMessage")}
                  </p>
                  <p className="text-[13px] text-text-primary">
                    {selectedTask.caption?.trim() ||
                      t("pending.attachmentReceived")}
                  </p>
                </div>

                {/* Attachment — larger preview (view/edit in contextual chat) */}
                {selectedTask.attachment && (
                  <div>
                    <p className="text-[11px] text-text-muted mb-1.5">
                      {t("pending.uploadedProof")}
                    </p>
                    <TaskAttachmentPreview
                      task={selectedTask}
                      viewImageLabel={t("pending.viewImage")}
                      unknownFileLabel={t("pending.file")}
                    />
                  </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[11px] text-text-muted">
                      {t("pending.created")}
                    </p>
                    <p className="text-xs text-text-primary">
                      {formatDateTime(selectedTask.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-text-muted">
                      {t("pending.resolved")}
                    </p>
                    <p className="text-xs text-text-primary">
                      {formatDateTime(selectedTask.resolvedAt)}
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-elevated/30 px-3 py-2">
                  <span className="text-[11px] text-text-muted">
                    {t("pending.status")}
                  </span>
                  <Badge
                    className={`border text-[9px] ${taskStatusBadge(selectedTask.status)}`}
                  >
                    {selectedTask.status}
                  </Badge>
                </div>

                {/* Actions */}
                <Button
                  variant="outline"
                  className="w-full gap-1.5 rounded-xl text-xs"
                  onClick={() => {
                    if (!selectedGroup) return;
                    setChatSelection({
                      group: selectedGroup,
                      task: selectedTask,
                    });
                    setSelectedTaskId(null);
                  }}
                  style={{ minHeight: 44 }}
                >
                  <PaperPlaneTilt size={14} />
                  {t("pending.openContextChat")}
                </Button>

                {selectedTask.status === PendingTaskStatus.PENDING && (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      className="gap-1.5 rounded-xl text-xs"
                      onClick={() =>
                        void handleUpdateStatus(
                          selectedTask,
                          PendingTaskStatus.RESOLVED,
                        )
                      }
                      disabled={updateStatusMutation.isPending}
                      style={{ minHeight: 44 }}
                    >
                      <CheckCircle size={14} weight="fill" />
                      {t("pending.resolve")}
                    </Button>
                    <Button
                      variant="destructive"
                      className="gap-1.5 rounded-xl text-xs"
                      onClick={() =>
                        void handleUpdateStatus(
                          selectedTask,
                          PendingTaskStatus.DISMISSED,
                        )
                      }
                      disabled={updateStatusMutation.isPending}
                      style={{ minHeight: 44 }}
                    >
                      <XCircle size={14} weight="fill" />
                      {t("pending.dismiss")}
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* ── Image Lightbox ──────────────────────────────── */}
      <MobileImageViewerDialog
        open={Boolean(lightboxItem)}
        item={
          lightboxItem
            ? {
                url: lightboxItem.src,
                name: lightboxItem.fileName,
                type: "image",
                mimeType: "image/jpeg",
              }
            : null
        }
        onClose={() => setLightboxItem(null)}
        onEdit={(item) => {
          openAnnotationEditor(item.url, item.name);
        }}
      />
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
          setContextReplyFile(editedFile);
        }}
      />
    </div>
  );
}

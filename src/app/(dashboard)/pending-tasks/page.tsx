"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowsClockwise,
  CaretDown,
  CaretRight,
  Check,
  CheckCircle,
  Crown,
  DownloadSimple,
  DotsThree,
  Paperclip,
  PaperPlaneTilt,
  PencilSimple,
  TelegramLogo,
  X,
  XCircle,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { MobilePendingTasks } from "@/components/mobile";
import { leadsApi } from "@/lib/api";
import { LEAD_REPLY_REQUIRED_MESSAGE } from "@/lib/api/leads";
import {
  canSendLeadReply,
  normalizeLeadReplyMessage,
} from "@/lib/reply/leadReplyContract";
import { parseApiData } from "@/lib/api/parseResponse";
import { validateReplyAttachmentFile } from "@/lib/replyAttachmentPolicy";
import { timeAgo } from "@/lib/format";
import {
  getAttachmentDisplayName,
  parseInteractionAttachmentMetadata,
} from "@/lib/chat-media";
import { PendingTaskStatus } from "@/types/enums";
import type { Interaction } from "@/lib/schemas/lead.schema";
import type {
  PendingTask,
  PendingTaskLeadGroup,
} from "@/lib/schemas/pendingTask.schema";
import {
  usePendingTasksGroupedByLead,
  useUpdatePendingTaskStatus,
  usePendingTasksList,
} from "@/queries/usePendingTasksQuery";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { buildOptimisticContextInteraction } from "./contextChatReplyUtils";
import AttachmentAnnotationDialog from "@/components/chat/AttachmentAnnotationDialog";
import { useT } from "@/i18n";

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

const PAGE_SIZE = 20;
const CONTEXT_WINDOW_BEFORE = 24;
const CONTEXT_WINDOW_AFTER = 24;

type ContextLightboxItem = {
  src: string;
  fileName: string;
};

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
  if (status === PendingTaskStatus.RESOLVED) {
    return "bg-success/10 text-success border-success/20";
  }
  if (status === PendingTaskStatus.DISMISSED) {
    return "bg-danger/10 text-danger border-danger/20";
  }
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

function ContextImageLightbox({
  item,
  onClose,
  onEdit,
}: {
  item: ContextLightboxItem;
  onClose: () => void;
  onEdit: (item: ContextLightboxItem) => void;
}) {
  const t = useT();
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = item.src;
    link.download = item.fileName || "image";
    link.click();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="!left-0 !top-0 !m-0 !h-[100dvh] !w-screen !max-w-none !translate-x-0 !translate-y-0 overflow-hidden rounded-none border-border-subtle bg-[#0a0a0f] p-0 sm:!left-1/2 sm:!top-1/2 sm:!h-auto sm:!w-full sm:!max-w-4xl sm:!translate-x-[-50%] sm:!translate-y-[-50%] sm:rounded-2xl"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{item.fileName}</DialogTitle>
          <DialogDescription>{t("pending.attachmentPreview")}</DialogDescription>
        </DialogHeader>
        <div className="relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/65 text-white/80 transition-colors hover:bg-black/80 hover:text-white"
          >
            <X size={18} />
          </button>

          <div className="flex min-h-[280px] items-center justify-center overflow-hidden bg-black max-h-[72vh]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.src}
              alt={item.fileName}
              className="w-full max-h-[72vh] object-contain"
            />
          </div>

          <div
            className="border-t border-white/10 bg-[#101520] px-3 py-3 sm:px-5"
            style={{
              paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
            }}
          >
            <div className="mb-2 min-w-0 sm:mb-0">
              <p className="truncate text-sm font-sans font-medium text-white">
                {item.fileName}
              </p>
              <p className="truncate text-[11px] font-sans text-white/60 capitalize">
                image
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:mt-2 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                size="sm"
                className="h-10 gap-2 border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white sm:h-8 sm:text-xs"
                onClick={handleDownload}
              >
                <DownloadSimple className="h-3.5 w-3.5" />
                {t("common.download")}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="h-10 gap-2 bg-white text-black hover:bg-white/90 sm:h-8 sm:text-xs"
                onClick={() => onEdit(item)}
              >
                <PencilSimple className="h-3.5 w-3.5" />
                {t("lead.annotation.editAttach")}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function renderTaskAttachmentPreview(
  task: PendingTask,
  options?: { compact?: boolean },
) {
  if (!task.attachment?.fileUrl) return null;
  const mimeType = task.attachment.mimeType ?? "";
  const compactClass = options?.compact ? "h-14 w-14" : "h-20 w-20";
  const fileName = getAttachmentDisplayName(
    task.attachment.fileKey,
    task.attachment.fileUrl,
  );

  if (mimeType.startsWith("image/")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={task.attachment.fileUrl}
        alt={fileName}
        className={`${compactClass} shrink-0 rounded-lg border border-border-subtle object-cover`}
      />
    );
  }

  if (mimeType.startsWith("video/")) {
    return (
      <video
        src={task.attachment.fileUrl}
        className={`${compactClass} shrink-0 rounded-lg border border-border-subtle bg-black object-cover`}
      />
    );
  }

  return (
    <div
      className={`${compactClass} flex shrink-0 items-center justify-center rounded-lg border border-border-subtle bg-elevated px-2 text-center text-[10px] text-text-secondary`}
    >
      {mimeType || "File"}
    </div>
  );
}

export default function PendingTasksPage() {
  const t = useT();
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
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
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
  const [contextLightboxItem, setContextLightboxItem] =
    useState<ContextLightboxItem | null>(null);
  const [contextAnnotationTarget, setContextAnnotationTarget] = useState<{
    sourceUrl: string;
    sourceFileName: string;
  } | null>(null);
  const [isSendingContextReply, setIsSendingContextReply] = useState(false);
  const contextChatContainerRef = useRef<HTMLDivElement>(null);
  const contextReplyFileInputRef = useRef<HTMLInputElement>(null);
  const interactionNodeRefs = useRef(new Map<string, HTMLDivElement>());
  const isInitialContextLoad = useRef(true);
  const lastHighlightAlignmentKey = useRef<string | null>(null);
  const contextReplyFilePreviewUrl = useMemo(
    () => (contextReplyFile ? URL.createObjectURL(contextReplyFile) : null),
    [contextReplyFile],
  );

  useEffect(() => {
    return () => {
      if (contextReplyFilePreviewUrl)
        URL.revokeObjectURL(contextReplyFilePreviewUrl);
    };
  }, [contextReplyFilePreviewUrl]);

  const queryParams = useMemo(
    () => ({
      status: statusFilter,
    }),
    [statusFilter],
  );

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

  const updateStatusMutation = useUpdatePendingTaskStatus();

  const groups = useMemo(
    () => groupedResult?.groups ?? [],
    [groupedResult?.groups],
  );
  const allTasks = useMemo(
    () => groups.flatMap((group) => group.tasks),
    [groups],
  );
  const selectedTask =
    allTasks.find((task) => task.id === selectedTaskId) ?? allTasks[0] ?? null;
  const selectedGroup = selectedTask
    ? (groups.find((group) => group.leadId === selectedTask.leadId) ?? null)
    : null;

  // Auto-select first task when data loads
  useEffect(() => {
    if (!selectedTaskId && allTasks.length > 0) {
      setSelectedTaskId(allTasks[0].id);
      return;
    }
    if (
      selectedTaskId &&
      !allTasks.some((task) => task.id === selectedTaskId)
    ) {
      setSelectedTaskId(allTasks[0]?.id ?? null);
    }
  }, [allTasks, selectedTaskId]);

  // Auto-expand first group, clean stale expansions
  useEffect(() => {
    setExpandedLeadIds((prev) => {
      const availableIds = new Set(groups.map((group) => group.leadId));
      const next = new Set<string>();
      prev.forEach((leadId) => {
        if (availableIds.has(leadId)) next.add(leadId);
      });
      if (groups.length > 0 && next.size === 0) {
        next.add(groups[0].leadId);
      }
      return next;
    });
  }, [groups]);

  // Auto-open context chat when task is selected
  useEffect(() => {
    if (selectedTask && selectedGroup) {
      setChatSelection({ group: selectedGroup, task: selectedTask });
    }
  }, [selectedTask, selectedGroup]);

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
                take: PAGE_SIZE,
                anchorInteractionId: highlightedInteractionId,
                before: CONTEXT_WINDOW_BEFORE,
                after: CONTEXT_WINDOW_AFTER,
              }
            : {
                skip: 0,
                take: PAGE_SIZE,
              },
        );
        return parseApiData<Interaction[]>(res.data) ?? [];
      },
    });
  const contextChatInteractions = useMemo(
    () => [...(contextInteractions ?? [])].reverse(),
    [contextInteractions],
  );

  // Reset reply state on context change
  useEffect(() => {
    setContextReplyText("");
    setContextReplyFile(null);
    setContextLightboxItem(null);
    setContextAnnotationTarget(null);
    setIsSendingContextReply(false);
    isInitialContextLoad.current = true;
    lastHighlightAlignmentKey.current = null;
    interactionNodeRefs.current.clear();
    if (contextReplyFileInputRef.current) {
      contextReplyFileInputRef.current.value = "";
    }
  }, [contextLeadId, chatSelection?.task?.id]);

  // Scroll to highlighted interaction
  useEffect(() => {
    if (!highlightedInteractionId) return;
    const highlightAlignmentKey = `${contextLeadId ?? ""}:${highlightedInteractionId}`;
    if (lastHighlightAlignmentKey.current === highlightAlignmentKey) return;
    const node = interactionNodeRefs.current.get(highlightedInteractionId);
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "center" });
    lastHighlightAlignmentKey.current = highlightAlignmentKey;
    isInitialContextLoad.current = false;
  }, [contextLeadId, highlightedInteractionId, contextChatInteractions]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    const container = contextChatContainerRef.current;
    if (!container || contextChatInteractions.length === 0) return;
    const highlightAlignmentKey = highlightedInteractionId
      ? `${contextLeadId ?? ""}:${highlightedInteractionId}`
      : null;
    if (
      highlightAlignmentKey &&
      lastHighlightAlignmentKey.current !== highlightAlignmentKey
    ) {
      return;
    }

    if (isInitialContextLoad.current) {
      container.scrollTop = container.scrollHeight;
      isInitialContextLoad.current = false;
      return;
    }

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    if (distanceFromBottom <= 100) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  }, [contextChatInteractions, contextLeadId, highlightedInteractionId]);

  const handleUpdateStatus = async (
    task: PendingTask,
    status: UpdatableStatus,
  ) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: task.id,
        data: { status },
      });
      toast.success(`Task marked as ${status.toLowerCase()}.`);
    } catch {
      toast.error("Failed to update task status.");
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
    if (contextReplyFileInputRef.current) {
      contextReplyFileInputRef.current.value = "";
    }
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
        error instanceof Error ? error.message : "Failed to send message.",
      );
    } finally {
      setIsSendingContextReply(false);
    }
  };

  const toggleGroup = (leadId: string) => {
    setExpandedLeadIds((prev) => {
      const next = new Set(prev);
      if (next.has(leadId)) {
        next.delete(leadId);
      } else {
        next.add(leadId);
      }
      return next;
    });
  };

  const handleSelectTask = (group: PendingTaskLeadGroup, task: PendingTask) => {
    setSelectedTaskId(task.id);
    setChatSelection({ group, task });
    if (!expandedLeadIds.has(group.leadId)) {
      toggleGroup(group.leadId);
    }
  };

  const jumpToTaskInteraction = (
    group: PendingTaskLeadGroup,
    task: PendingTask,
  ) => {
    handleSelectTask(group, task);
    if (!task.interactionId) return;

    const alignmentKey = `${group.leadId}:${task.interactionId}`;
    const tryScrollToInteraction = () => {
      const node = interactionNodeRefs.current.get(task.interactionId!);
      if (!node) return false;
      node.scrollIntoView({ behavior: "smooth", block: "center" });
      lastHighlightAlignmentKey.current = alignmentKey;
      return true;
    };

    if (!tryScrollToInteraction()) {
      window.setTimeout(() => {
        void tryScrollToInteraction();
      }, 80);
    }
  };

  if (isMobile) return <MobilePendingTasks pageSize={PAGE_SIZE} />;

  return (
    <div className="space-y-5" data-testid="pending-tasks-page">
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-bold text-text-primary">
            {t("pending.title")}
          </h1>
          <p className="mt-0.5 text-sm text-text-secondary">
            {t("pending.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="ios-segment">
            {STATUS_FILTERS.map((filter) => {
              const active = filter.value === statusFilter;
              const count = statusCountByFilter[filter.value] ?? 0;
              return (
                <button
                  key={filter.value}
                  onClick={() => setStatusFilter(filter.value)}
                  className={`ios-segment-item ${active ? "active" : ""}`}
                >
                  <span className="flex items-center gap-2">
                    <span>{getStatusLabel(filter.value)}</span>
                    <span
                      className={`inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] leading-none ${
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
          </div>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            <ArrowsClockwise
              size={14}
              className={isFetching ? "animate-spin" : undefined}
            />
            {t("pending.refresh")}
          </Button>
        </div>
      </div>

      {/* ── Two-Panel Layout ─────────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-[1fr,1fr] xl:grid-cols-[1.1fr,1fr]">
        {/* ═══════════ LEFT PANEL — Leads & Tasks ═══════════ */}
        <section className="surface-card flex flex-col overflow-hidden">
          {/* Panel header */}
          <div className="flex items-center justify-between border-b border-border-subtle px-5 py-3.5">
            <div>
              <h2 className="text-sm font-semibold text-text-primary">Leads</h2>
              <p className="mt-0.5 text-[11px] text-text-secondary">
                {groupedResult?.totalLeads ?? 0} lead(s) ·{" "}
                {groupedResult?.totalTasks ?? 0} task(s)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-elevated hover:text-text-primary">
                    <DotsThree size={18} weight="bold" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[160px]">
                    <DropdownMenuItem onClick={() => void refetch()}>
                      <ArrowsClockwise size={14} />
                      {t("pending.refreshAll")}
                    </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Lead groups list */}
          <div
            className="flex-1 overflow-y-auto"
            style={{ maxHeight: "calc(100vh - 220px)", scrollbarWidth: "thin" }}
          >
            {isLoading ? (
              <div className="space-y-3 p-5">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse space-y-2 rounded-xl border border-border-subtle bg-elevated/40 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-elevated" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3.5 w-28 rounded bg-elevated" />
                        <div className="h-2.5 w-40 rounded bg-elevated" />
                      </div>
                    </div>
                    <div className="h-16 rounded-lg bg-elevated" />
                  </div>
                ))}
              </div>
            ) : groups.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
                <div className="ios-icon-sm mb-3 bg-elevated">
                  <CheckCircle size={20} className="text-text-muted" />
                </div>
                <p className="text-sm font-medium text-text-secondary">
                  {t("pending.noTasks")}
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  {t("pending.allCaughtUp")}
                </p>
              </div>
            ) : (
              <div className="space-y-1 p-3">
                {groups.map((group, groupIndex) => {
                  const isExpanded = expandedLeadIds.has(group.leadId);
                  const leadName = formatLeadName(group);
                  const initials = getInitials(leadName);
                  return (
                    <article
                      key={group.leadId}
                      className={`animate-in-up rounded-xl border border-border-subtle bg-card/60 transition-all duration-200 hover:bg-card`}
                      style={{ animationDelay: `${groupIndex * 50}ms` }}
                    >
                      {/* Lead header row */}
                      <div className="flex items-center gap-3 px-4 py-3">
                        <button
                          onClick={() => toggleGroup(group.leadId)}
                          className="flex min-w-0 flex-1 items-center gap-3 text-left"
                        >
                          <Avatar size="default">
                            <AvatarFallback className="bg-crimson-subtle text-crimson text-xs font-semibold">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <p className="truncate text-sm font-semibold text-text-primary">
                                {leadName}
                              </p>
                              {group.lead.hfmBrokerId && (
                                <Crown
                                  size={14}
                                  weight="fill"
                                  className="shrink-0 text-gold"
                                />
                              )}
                            </div>
                            <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-text-secondary">
                              {group.lead.hfmBrokerId && (
                                <span className="font-mono text-[11px] text-text-muted">
                                  HFM ID: {group.lead.hfmBrokerId}
                                </span>
                              )}
                              {!group.lead.hfmBrokerId && (
                                <>
                                  <TelegramLogo
                                    size={12}
                                    className="shrink-0 text-[#229ED9]"
                                  />
                                  <span className="truncate">
                                    {formatLeadIdentity(group)}
                                  </span>
                                </>
                              )}
                            </p>
                          </div>
                          <span className="ml-auto text-text-muted">
                            {isExpanded ? (
                              <CaretDown size={14} />
                            ) : (
                              <CaretRight size={14} />
                            )}
                          </span>
                        </button>
                        <Badge
                          className={`shrink-0 border text-[10px] uppercase tracking-wide ${leadStatusBadge(group.lead.status)}`}
                        >
                          {group.lead.status ?? "UNKNOWN"}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-elevated hover:text-text-primary">
                              <DotsThree size={16} weight="bold" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="min-w-[180px]"
                          >
                            <DropdownMenuItem
                              onClick={() =>
                                setChatSelection({
                                  group,
                                  task: group.tasks[0] ?? null,
                                })
                              }
                            >
                              <PaperPlaneTilt size={14} />
                              {t("pending.openContextChat")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/leads/detail?id=${group.leadId}`}>
                                {t("pending.viewLeadDetails")}
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/leads/chat?id=${group.leadId}`}>
                                {t("pending.openFullChat")}
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Task cards (expanded) */}
                      {isExpanded && (
                        <div className="space-y-2 border-t border-border-subtle px-3 pb-3 pt-2">
                          {group.tasks.map((task) => {
                            const active = selectedTask?.id === task.id;
                            return (
                              <button
                                key={task.id}
                                onClick={() =>
                                  jumpToTaskInteraction(group, task)
                                }
                                className={`group relative w-full rounded-xl border px-3 py-2.5 text-left transition-all duration-200 ${
                                  active
                                    ? "border-crimson/30 bg-crimson/5 shadow-[0_0_0_1px_var(--crimson-glow)]"
                                    : "border-border-subtle bg-elevated/30 hover:border-border-default hover:bg-elevated/60"
                                }`}
                              >
                                {active && (
                                  <div className="absolute right-2.5 top-2.5">
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-crimson">
                                      <Check
                                        size={12}
                                        weight="bold"
                                        className="text-white"
                                      />
                                    </div>
                                  </div>
                                )}
                                <div className="flex items-start gap-3">
                                  {renderTaskAttachmentPreview(task, {
                                    compact: true,
                                  })}
                                  <div className="min-w-0 flex-1">
                                    <div className="mb-1 flex items-center gap-2">
                                      <Badge
                                        className={`border text-[9px] uppercase tracking-wider ${taskStatusBadge(task.status)}`}
                                      >
                                        {task.status}
                                      </Badge>
                                    </div>
                                    <p className="line-clamp-2 text-sm font-medium text-text-primary">
                                      {t("pending.attachmentReceived")}
                                    </p>
                                    {task.caption?.trim() && (
                                      <p className="mt-0.5 line-clamp-1 text-xs text-text-secondary">
                                        {task.caption.trim()}
                                      </p>
                                    )}
                                    <p className="mt-1 text-[11px] text-text-muted">
                                      {formatDateTime(task.createdAt)}
                                    </p>
                                  </div>
                                </div>
                                {/* Task actions dropdown */}
                                <div className="absolute bottom-2.5 right-2.5">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <span
                                        role="button"
                                        tabIndex={0}
                                        onClick={(e) => e.stopPropagation()}
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter")
                                            e.stopPropagation();
                                        }}
                                        className="inline-flex rounded-lg p-1 text-text-muted opacity-0 transition-all hover:bg-card hover:text-text-primary group-hover:opacity-100"
                                      >
                                        <DotsThree size={16} weight="bold" />
                                      </span>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                      align="end"
                                      className="min-w-[160px]"
                                    >
                                      <DropdownMenuItem
                                        onClick={() =>
                                          setChatSelection({ group, task })
                                        }
                                      >
                                        <PaperPlaneTilt size={14} />
                                        {t("pending.contextChat")}
                                      </DropdownMenuItem>
                                      {task.status ===
                                        PendingTaskStatus.PENDING && (
                                        <>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem
                                            onClick={() =>
                                              void handleUpdateStatus(
                                                task,
                                                PendingTaskStatus.RESOLVED,
                                              )
                                            }
                                          >
                                            <CheckCircle
                                              size={14}
                                              className="text-success"
                                            />
                                            {t("pending.resolve")}
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            onClick={() =>
                                              void handleUpdateStatus(
                                                task,
                                                PendingTaskStatus.DISMISSED,
                                              )
                                            }
                                          >
                                            <XCircle
                                              size={14}
                                              className="text-danger"
                                            />
                                            {t("pending.dismiss")}
                                          </DropdownMenuItem>
                                        </>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ═══════════ RIGHT PANEL — Contextual Chat ═══════════ */}
        <section
          className="surface-card flex flex-col overflow-hidden"
          style={{ maxHeight: "calc(100vh - 160px)" }}
        >
          {chatSelection ? (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 border-b border-border-subtle px-5 py-3.5">
                <h2 className="font-display text-sm font-bold text-text-primary">
                  {t("pending.contextualChat")}
                </h2>
                <div className="ml-auto flex items-center gap-2">
                  <Avatar size="sm">
                    <AvatarFallback className="bg-crimson-subtle text-crimson text-[10px] font-semibold">
                      {getInitials(formatLeadName(chatSelection.group))}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-text-primary">
                    {formatLeadName(chatSelection.group)}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-elevated hover:text-text-primary">
                        <DotsThree size={16} weight="bold" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-[180px]">
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/leads/detail?id=${chatSelection.group.leadId}`}
                        >
                          {t("pending.viewLeadDetails")}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/leads/chat?id=${chatSelection.group.leadId}`}
                        >
                          {t("pending.openFullChat")}
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Pinned selected task */}
              {chatSelection.task && (
                <div className="border-b border-border-subtle bg-elevated/30 px-5 py-3">
                  <div className="flex items-start gap-3">
                    {renderTaskAttachmentPreview(chatSelection.task, {
                      compact: true,
                    })}
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <Badge
                          className={`border text-[9px] uppercase tracking-wider ${taskStatusBadge(chatSelection.task.status)}`}
                        >
                          {chatSelection.task.status}
                        </Badge>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          jumpToTaskInteraction(
                            chatSelection.group,
                            chatSelection.task!,
                          )
                        }
                        className="text-left text-sm font-medium text-text-primary underline-offset-2 hover:underline"
                      >
                        {t("pending.attachmentReceived")}
                      </button>
                      {chatSelection.task.caption?.trim() && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-text-secondary">
                          {chatSelection.task.caption.trim()}
                        </p>
                      )}
                      <p className="mt-1 text-[11px] text-text-muted">
                        {formatDateTime(chatSelection.task.createdAt)}
                      </p>
                    </div>
                    {/* Resolve / Dismiss inline */}
                    {chatSelection.task.status ===
                      PendingTaskStatus.PENDING && (
                      <div className="flex shrink-0 items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 gap-1 px-2.5 text-[11px] text-success hover:bg-success/10 hover:text-success"
                          onClick={() =>
                            void handleUpdateStatus(
                              chatSelection.task!,
                              PendingTaskStatus.RESOLVED,
                            )
                          }
                          disabled={updateStatusMutation.isPending}
                        >
                          <CheckCircle size={13} weight="fill" />
                          {t("pending.resolve")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 gap-1 px-2.5 text-[11px] text-danger hover:bg-danger/10 hover:text-danger"
                          onClick={() =>
                            void handleUpdateStatus(
                              chatSelection.task!,
                              PendingTaskStatus.DISMISSED,
                            )
                          }
                          disabled={updateStatusMutation.isPending}
                        >
                          <XCircle size={13} weight="fill" />
                          {t("pending.dismiss")}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Chat messages */}
              <div
                ref={contextChatContainerRef}
                className="flex-1 space-y-3 overflow-y-auto px-5 py-4"
                style={{ scrollbarWidth: "thin" }}
              >
                {isLoadingContextInteractions ? (
                  <div className="space-y-3 py-6">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
                      >
                        <div className="h-14 w-2/3 animate-pulse rounded-2xl bg-elevated" />
                      </div>
                    ))}
                  </div>
                ) : contextChatInteractions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <PaperPlaneTilt
                      size={28}
                      className="mb-2 text-text-muted"
                    />
                    <p className="text-sm text-text-secondary">
                      No interactions yet
                    </p>
                    <p className="mt-1 text-xs text-text-muted">
                      Send the first message below.
                    </p>
                  </div>
                ) : (
                  contextChatInteractions.map((interaction) => {
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
                    const isLeadMessage =
                      interaction.type === "MESSAGE_RECEIVED";
                    const isAgentMessage =
                      interaction.type === "MANUAL_REPLY_SENT";
                    const senderLabel = isLeadMessage
                      ? "User"
                      : isAgentMessage
                        ? "Owner"
                        : interaction.type === "AUTO_REPLY_SENT"
                          ? "Bot"
                          : interaction.type;
                    const isOwnerSide = !isLeadMessage;
                    return (
                      <div
                        key={interaction.id}
                        id={`context-interaction-${interaction.id}`}
                        ref={(node) => {
                          if (node) {
                            interactionNodeRefs.current.set(
                              interaction.id,
                              node,
                            );
                          } else {
                            interactionNodeRefs.current.delete(interaction.id);
                          }
                        }}
                      >
                        {/* Sender label */}
                        <p
                          className={`mb-1 text-[10px] font-medium uppercase tracking-wider text-text-muted ${isOwnerSide ? "text-right" : "text-left"}`}
                        >
                          {senderLabel}
                        </p>
                        <div
                          className={`flex ${isOwnerSide ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl px-4 py-2.5 transition-all ${
                              interaction.id === highlightedInteractionId
                                ? "ring-2 ring-crimson/30"
                                : ""
                            } ${
                              isLeadMessage
                                ? "rounded-bl-md border border-border-default bg-elevated/60"
                                : isAgentMessage
                                  ? "rounded-br-md border border-crimson/20 bg-crimson/10"
                                  : "rounded-br-md border border-success/20 bg-success/10"
                            }`}
                          >
                            {hasInlineMedia && attachmentMeta.fileUrl && (
                              <div className="mb-2 overflow-hidden rounded-xl border border-border-subtle bg-card/40">
                                {attachmentMeta.previewType === "image" ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setContextLightboxItem({
                                        src: attachmentMeta.fileUrl!,
                                        fileName: attachmentName,
                                      })
                                    }
                                    className="block w-full text-left"
                                    aria-label={t("pending.viewImage")}
                                  >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={attachmentMeta.fileUrl}
                                      alt={attachmentName}
                                      className="max-h-52 w-full object-cover"
                                    />
                                  </button>
                                ) : (
                                  <video
                                    src={attachmentMeta.fileUrl}
                                    controls
                                    preload="metadata"
                                    className="max-h-52 w-full bg-black object-contain"
                                  />
                                )}
                              </div>
                            )}
                            {attachmentMeta.hasAttachment &&
                              !hasInlineMedia && (
                                <p className="mb-1 text-[11px] text-text-secondary">
                                  📎 {attachmentName}
                                </p>
                              )}
                            {interaction.content?.trim() && (
                              <p className="text-[13px] leading-relaxed text-text-primary">
                                {interaction.content.trim()}
                              </p>
                            )}
                            <p className="mt-1.5 text-[10px] text-text-muted">
                              {timeAgo(interaction.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* ── Docked Reply Composer ─────────────────── */}
              <div className="border-t border-border-subtle bg-card/80 px-4 py-3">
                {/* File attachment input (hidden) */}
                <input
                  ref={contextReplyFileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(event) => {
                    const selected = event.target.files?.[0] ?? null;
                    if (!selected) return;
                    const validationError =
                      validateReplyAttachmentFile(selected);
                    if (validationError) {
                      toast.error(validationError);
                      event.currentTarget.value = "";
                      return;
                    }
                    setContextReplyFile(selected);
                  }}
                />

                {/* File preview */}
                {contextReplyFile && (
                  <div className="mb-2 flex items-start justify-between gap-2 rounded-lg border border-border-subtle bg-elevated/60 px-3 py-2">
                    <div className="flex min-w-0 items-center gap-2">
                      {contextReplyFile.type.startsWith("image/") && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={contextReplyFilePreviewUrl ?? undefined}
                          alt={contextReplyFile.name}
                          className="h-10 w-10 shrink-0 rounded-lg border border-border-subtle object-cover"
                        />
                      )}
                      {!contextReplyFile.type.startsWith("image/") &&
                        contextReplyFile.type.startsWith("video/") && (
                          <video
                            src={contextReplyFilePreviewUrl ?? undefined}
                            className="h-10 w-10 shrink-0 rounded-lg border border-border-subtle bg-black object-cover"
                          />
                        )}
                      <p className="truncate text-xs text-text-secondary">
                        {contextReplyFile.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {contextReplyFile.type.startsWith("image/") &&
                        contextReplyFilePreviewUrl && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1 px-2 text-[11px]"
                            onClick={() =>
                              setContextAnnotationTarget({
                                sourceUrl: contextReplyFilePreviewUrl,
                                sourceFileName: contextReplyFile.name,
                              })
                            }
                          >
                            <PencilSimple size={13} />
                            Edit
                          </Button>
                        )}
                      <button
                        type="button"
                        onClick={() => {
                          setContextReplyFile(null);
                          if (contextReplyFileInputRef.current) {
                            contextReplyFileInputRef.current.value = "";
                          }
                        }}
                        className="rounded-md p-0.5 text-text-muted hover:text-text-primary"
                        aria-label="Remove selected reply file"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-end gap-2 rounded-xl border border-border-subtle bg-elevated/30 px-2 py-2">
                  <button
                    type="button"
                    onClick={() => contextReplyFileInputRef.current?.click()}
                    disabled={isSendingContextReply}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-elevated hover:text-text-primary disabled:opacity-50"
                    aria-label="Attach file"
                  >
                    <Paperclip size={16} />
                  </button>
                  <textarea
                    rows={2}
                    value={contextReplyText}
                    onChange={(event) =>
                      setContextReplyText(event.target.value)
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        void handleSendContextReply();
                      }
                    }}
                    placeholder={t("pending.replyPlaceholder")}
                    className="min-h-[36px] flex-1 resize-none rounded-lg border-0 bg-transparent px-1 py-1.5 text-sm text-text-primary placeholder:text-text-muted outline-none"
                    disabled={isSendingContextReply}
                  />
                  <Button
                    type="button"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={() => void handleSendContextReply()}
                    disabled={
                      isSendingContextReply ||
                      !canSendLeadReply(contextReplyText, contextReplyFile)
                    }
                    aria-label="Send context reply"
                  >
                    <PaperPlaneTilt size={15} weight="fill" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            /* Empty state — no chat selected */
            <div className="flex flex-1 flex-col items-center justify-center px-5 py-16 text-center">
              <div className="ios-icon mb-4 bg-elevated">
                <PaperPlaneTilt size={22} className="text-text-muted" />
              </div>
              <h3 className="text-sm font-semibold text-text-primary">
                {t("pending.contextualChat")}
              </h3>
              <p className="mt-1.5 max-w-xs text-xs text-text-secondary">
                Select a pending task from the left panel to view the
                conversation context and reply directly.
              </p>
            </div>
          )}
        </section>
      </div>
      {contextLightboxItem && (
        <ContextImageLightbox
          item={contextLightboxItem}
          onClose={() => setContextLightboxItem(null)}
          onEdit={(item) => {
            if (!item.src?.trim()) {
              toast.error(t("lead.annotation.noSource"));
              return;
            }
            setContextLightboxItem(null);
            setContextAnnotationTarget({
              sourceUrl: item.src.trim(),
              sourceFileName: item.fileName,
            });
          }}
        />
      )}
      <AttachmentAnnotationDialog
        open={Boolean(contextAnnotationTarget)}
        sourceUrl={contextAnnotationTarget?.sourceUrl ?? null}
        sourceFileName={contextAnnotationTarget?.sourceFileName ?? "image"}
        onClose={() => setContextAnnotationTarget(null)}
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

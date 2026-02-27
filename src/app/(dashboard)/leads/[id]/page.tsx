"use client";
import React, { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { MobileLeadDetail } from "@/components/mobile";
import {
  CaretLeft,
  CheckCircle,
  XCircle,
  Link as LinkIcon,
  PencilSimple,
  PaperPlaneRight,
  Play,
  Robot,
  UserCircle,
  Chat,
  Lightning,
  Check,
  Warning,
  ArrowSquareOut,
  DownloadSimple,
  X,
  Fingerprint,
  EnvelopeSimple,
  Phone,
  CalendarCheck,
  CurrencyDollar,
  UserSwitch,
  Paperclip,
  CaretRight,
  Hash,
} from "@phosphor-icons/react";
import { attachmentsApi, type Attachment } from "@/lib/api/attachments";
import { useT } from "@/i18n";
import { useLeadsStore } from "@/store/leadsStore";
import { leadsApi } from "@/lib/api/leads";
import type { Interaction } from "@/lib/schemas/lead.schema";
import { LeadStatus } from "@/types/enums";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  getFileBadgeConfig,
  FileTypeBadge,
  FileTypeChip,
} from "@/components/ui/file-type-badge";

gsap.registerPlugin(useGSAP);

// ── Interaction → display mappings ───────────────────────────────────────────

const INTERACTION_META = {
  MESSAGE_RECEIVED:    { Icon: Chat,        color: "text-info" },
  AUTO_REPLY_SENT:     { Icon: Robot,       color: "text-text-muted" },
  MANUAL_REPLY_SENT:   { Icon: UserCircle,  color: "text-crimson" },
  SYSTEM_STATUS_CHANGE:{ Icon: Lightning,   color: "text-success" },
} as const;

function mapToMessage(ix: Interaction) {
  const side =
    ix.type === "MESSAGE_RECEIVED"  ? "user"   :
    ix.type === "AUTO_REPLY_SENT"   ? "bot"    :
    ix.type === "MANUAL_REPLY_SENT" ? "agent"  : "system";
  return {
    id: ix.id,
    side,
    time: new Date(ix.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    content: ix.content ?? "",
    metadata: ix.metadata,
  };
}

function mapToTimelineEvent(ix: Interaction, idx: number) {
  const meta = INTERACTION_META[ix.type as keyof typeof INTERACTION_META]
    ?? { Icon: Lightning, color: "text-text-muted" };
  const dt = new Date(ix.createdAt);
  return {
    id: idx,
    type: ix.type,
    time: dt.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) + " " +
          dt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    msg: ix.content ?? ix.type.replace(/_/g, " "),
    Icon: meta.Icon,
    color: meta.color,
  };
}

function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function getFileName(attachment: Attachment): string {
  const key = attachment.fileKey ?? "";
  const parts = key.split("/");
  return parts[parts.length - 1] ?? `file-${attachment.id.slice(0, 8)}`;
}

function isImage(mimeType: string | null | undefined): boolean {
  return !!mimeType?.startsWith("image/");
}

function isVideo(mimeType: string | null | undefined): boolean {
  return !!mimeType?.startsWith("video/");
}

// ── Toast component ──────────────────────────────────────────────────────────

function ToastMsg({
  msg,
  type,
}: {
  msg: string;
  type: "success" | "danger" | "info";
}) {
  const styles = {
    success: "border-success/30 text-success",
    danger: "border-danger/30 text-danger",
    info: "border-info/30 text-info",
  };
  const Icon =
    type === "success" ? CheckCircle : type === "danger" ? XCircle : Warning;
  return (
    <div
      className={`fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-4 py-3 rounded-xl border bg-elevated shadow-xl animate-in-up font-sans text-sm font-medium ${styles[type]}`}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      {msg}
    </div>
  );
}

// ── Media Lightbox ───────────────────────────────────────────────────────────

type MediaItem = { url: string; type: "image" | "video" | "file"; name: string; mimeType?: string | null; size?: number | null };

function MediaLightbox({
  item,
  onClose,
}: {
  item: MediaItem;
  onClose: () => void;
}) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-2xl bg-[#0a0a0f] border-border-subtle">
        <div className="relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-black/80 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          {/* Media content */}
          <div className="flex items-center justify-center min-h-[280px] max-h-[70vh] overflow-hidden">
            {item.type === "video" ? (
              <video
                src={item.url || undefined}
                controls
                autoPlay
                className="w-full max-h-[70vh] object-contain"
                style={{ background: "#000" }}
              >
                <p className="text-white/60 p-8 text-center text-sm">
                  No video URL — this is a placeholder
                </p>
              </video>
            ) : item.type === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={
                  item.url ||
                  "https://placehold.co/800x500/1a1a2e/555?text=Proof+Image"
                }
                alt={item.name}
                className="w-full max-h-[70vh] object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-4 p-12 text-text-muted">
                <FileTypeBadge mimeType={item.mimeType} size={56} />
                <p className="text-sm font-sans text-text-secondary">{item.name}</p>
                {item.size && <p className="text-xs text-text-muted">{formatFileSize(item.size)}</p>}
                <p className="text-xs text-text-muted">Preview not available</p>
              </div>
            )}
          </div>
          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-3 bg-elevated/80 backdrop-blur-sm border-t border-border-subtle">
            <div>
              <p className="text-sm font-sans font-medium text-text-primary">
                {item.name}
              </p>
              <p className="text-[11px] font-sans text-text-muted capitalize">
                {item.mimeType ?? item.type}{item.size ? ` · ${formatFileSize(item.size)}` : ""}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-7"
              onClick={() => {
                if (item.url) {
                  const a = document.createElement("a");
                  a.href = item.url;
                  a.download = item.name;
                  a.click();
                }
              }}
            >
              <DownloadSimple className="h-3.5 w-3.5" /> Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = useT();
  const { id } = React.use(params);
  const {
    updateStatus,
    setHandover: storeSetHandover,
    fetchLead,
    isLoading,
  } = useLeadsStore();
  const lead = useLeadsStore((s) => s.leads.find((l) => l.id === id));

  useEffect(() => {
    if (!lead && !isLoading) {
      fetchLead(id);
    }
  }, [id, lead, isLoading, fetchLead]);

  // Poll interaction history every 5 seconds
  useEffect(() => {
    let cancelled = false;
    const loadInteractions = async () => {
      try {
        const res = await leadsApi.getInteractions(id, { skip: 0, take: 50 });
        const items: Interaction[] = (res.data as unknown as { data: Interaction[] }).data ?? [];
        const sorted = [...items].reverse(); // API returns newest-first; we show oldest-first
        if (!cancelled) {
          setMessages(sorted.map(mapToMessage));
          setTimeline(sorted.map(mapToTimelineEvent));
        }
      } catch { /* silent */ }
    };
    void loadInteractions();
    const interval = setInterval(() => void loadInteractions(), 5000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [id]);

  // Load attachments once
  useEffect(() => {
    attachmentsApi.findByLead(id)
      .then((res) => {
        const items = (res.data as unknown as { data: Attachment[] }).data ?? [];
        setAttachments(items);
      })
      .catch(() => { /* silent */ });
  }, [id]);
  const isMobile = useIsMobile();

  const [handover, setHandover] = useState(lead?.handoverMode ?? false);
  const [replyText, setReplyText] = useState("");
  const [messages, setMessages] = useState<ReturnType<typeof mapToMessage>[]>([]);
  const [timeline, setTimeline] = useState<ReturnType<typeof mapToTimelineEvent>[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "danger" | "info";
  } | null>(null);
  const [mediaPreview, setMediaPreview] = useState<MediaItem | null>(null);

  const timelineRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const verifyRef = useRef<HTMLDivElement>(null);
  const rejectRef = useRef<HTMLDivElement>(null);
  const editRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (isMobile) return;
      const items = timelineRef.current?.querySelectorAll(".timeline-item");
      if (items && items.length > 0) {
        gsap.from(items, {
          opacity: 0,
          x: -8,
          duration: 0.25,
          stagger: 0.06,
          ease: "power2.out",
        });
      }
    },
    { scope: timelineRef, dependencies: [timeline.length, isMobile] },
  );

  useEffect(() => {
    if (isMobile) return;
    if (showVerifyModal && verifyRef.current)
      gsap.fromTo(
        verifyRef.current,
        { opacity: 0, scale: 0.95, y: 8 },
        { opacity: 1, scale: 1, y: 0, duration: 0.2, ease: "power2.out" },
      );
  }, [showVerifyModal, isMobile]);

  useEffect(() => {
    if (isMobile) return;
    if (showRejectModal && rejectRef.current)
      gsap.fromTo(
        rejectRef.current,
        { opacity: 0, scale: 0.95, y: 8 },
        { opacity: 1, scale: 1, y: 0, duration: 0.2, ease: "power2.out" },
      );
  }, [showRejectModal, isMobile]);

  useEffect(() => {
    if (isMobile) return;
    if (showEditModal && editRef.current)
      gsap.fromTo(
        editRef.current,
        { opacity: 0, scale: 0.95, y: 8 },
        { opacity: 1, scale: 1, y: 0, duration: 0.2, ease: "power2.out" },
      );
  }, [showEditModal, isMobile]);

  // ── Mobile view ──
  if (isMobile) {
    return (
      <MobileLeadDetail
        lead={lead}
        isLoading={isLoading}
        onVerify={() =>
          lead &&
          updateStatus(lead.id, { status: LeadStatus.DEPOSIT_CONFIRMED })
        }
        onReject={() =>
          lead && updateStatus(lead.id, { status: LeadStatus.NEW })
        }
      />
    );
  }

  const showToastMsg = (
    msg: string,
    type: "success" | "danger" | "info" = "success",
  ) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const handleVerify = () => {
    if (lead) updateStatus(lead.id, { status: LeadStatus.DEPOSIT_CONFIRMED });
    setShowVerifyModal(false);
    showToastMsg(t("lead.toast.verified"), "success");
  };

  const handleReject = () => {
    if (lead) updateStatus(lead.id, { status: LeadStatus.NEW });
    setShowRejectModal(false);
    setRejectReason("");
    showToastMsg(t("lead.toast.rejected"), "danger");
  };

  const handleCopyLink = async () => {
    const ref = lead?.telegramUserId ?? id;
    const link = `https://app.titanjournal.com/tma/register?ref=${ref}`;
    await navigator.clipboard.writeText(link).catch(() => {});
    setCopied(true);
    showToastMsg(t("lead.toast.copied"), "info");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSend = async () => {
    if (!replyText.trim()) return;
    const text = replyText.trim();
    setReplyText("");
    // Optimistic update
    const now = new Date();
    const optimisticMsg = {
      id: `opt-${Date.now()}`,
      side: "agent" as const,
      time: now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      content: text,
      metadata: null as Record<string, unknown> | null,
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    try {
      await leadsApi.reply(id, text);
    } catch {
      showToastMsg(t("lead.toast.sendFailed") === "lead.toast.sendFailed" ? "Failed to send message" : t("lead.toast.sendFailed"), "danger");
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
    }
  };

  if (isLoading && !lead) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-crimson border-t-transparent animate-spin" />
        <p className="text-text-secondary font-sans">Loading lead details...</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-text-secondary font-sans">
          {t("lead.notFound") === "lead.notFound"
            ? "Lead not found:"
            : t("lead.notFound")}{" "}
          {id}
        </p>
        <Button variant="ghost" asChild className="gap-1.5 text-sm">
          <Link href="/leads">
            <CaretLeft className="h-4 w-4" />{" "}
            {t("nav.leads") === "nav.leads" ? "Back to Leads" : t("nav.leads")}
          </Link>
        </Button>
      </div>
    );
  }

  const initials = (lead.displayName ?? "")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2);
  const depositBalance = Number(lead.depositBalance ?? 0) || 0;

  // Status badge mapping
  const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
    NEW: { label: "New", cls: "badge-new" },
    CONTACTED: { label: "Contacted", cls: "badge-contacted" },
    REGISTERED: { label: "Registered", cls: "badge-registered" },
    DEPOSIT_REPORTED: { label: "Proof Submitted", cls: "badge-pending" },
    DEPOSIT_CONFIRMED: { label: "Verified", cls: "badge-confirmed" },
  };
  const statusBadge = STATUS_BADGE[lead.status] ?? {
    label: lead.status,
    cls: "",
  };

  return (
    <TooltipProvider>
      <div className="space-y-5 animate-in-up">
        {/* ── Breadcrumb ── */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="gap-1.5 text-text-secondary hover:text-text-primary h-8 px-2"
          >
            <Link href="/leads">
              <CaretLeft className="h-3.5 w-3.5" /> {t("nav.leadIntelligence")}
            </Link>
          </Button>
          <span className="text-text-muted text-sm">/</span>
          <span className="text-text-primary text-sm font-sans">
            {lead.displayName}
          </span>
        </div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-4">
          {/* ════ LEFT COLUMN ════ */}
          <div className="space-y-4">
            {/* ── Profile Panel ── */}
            <div className="bg-elevated rounded-xl overflow-hidden">
              {/* Header strip */}
              <div className="px-5 py-4 bg-card border-b border-border-subtle">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Avatar + name */}
                  <div className="flex items-center gap-4">
                    <Avatar className="w-14 h-14 flex-shrink-0 border-2 border-crimson/30">
                      <AvatarFallback className="bg-crimson/15 text-crimson font-bold text-xl">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-xl font-bold text-text-primary leading-tight mb-1">
                        {lead.displayName}
                      </h2>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`badge ${statusBadge.cls}`}>
                          {statusBadge.label}
                        </span>
                        <span className="badge badge-live flex items-center gap-1">
                          <Robot className="h-3 w-3" /> Bot Active
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Balance KPI */}
                  <div className="sm:text-right flex-shrink-0">
                    <p className="text-[10px] font-sans font-semibold text-text-muted uppercase tracking-wider mb-0.5">
                      {t("lead.depositBalance")}
                    </p>
                    <p className="text-2xl font-bold text-gold leading-none">
                      {lead.depositBalance && lead.depositBalance !== "—"
                        ? lead.depositBalance
                        : `$${depositBalance.toFixed(2)}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Info grid + actions */}
              <div className="p-5 space-y-4">
                {/* 4-field info grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      label: "HFM ID",
                      value: lead.hfmBrokerId ?? "—",
                      Icon: Fingerprint,
                    },
                    {
                      label: "Email",
                      value: lead.email ?? "—",
                      Icon: EnvelopeSimple,
                    },
                    {
                      label: "Phone",
                      value: lead.phoneNumber ?? "—",
                      Icon: Phone,
                    },
                    {
                      label: "Registered",
                      value: lead.registeredAt ?? "—",
                      Icon: CalendarCheck,
                    },
                  ].map(({ label, value, Icon: FieldIcon }) => (
                    <div
                      key={label}
                      className="flex items-start gap-3 p-3 bg-card rounded-lg"
                    >
                      <FieldIcon className="h-4 w-4 text-text-muted flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-sans font-semibold text-text-muted uppercase tracking-wider mb-0.5">
                          {label}
                        </p>
                        <p className="data-mono text-[12px] text-text-primary truncate">
                          {value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Telegram ID */}
                <div className="flex items-center gap-3 p-3 bg-card rounded-lg">
                  <CurrencyDollar className="h-4 w-4 text-text-muted flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-sans font-semibold text-text-muted uppercase tracking-wider mb-0.5">
                      Telegram ID
                    </p>
                    <p className="data-mono text-[12px] text-text-primary">
                      {lead.telegramUserId}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-text-muted hover:text-text-primary flex-shrink-0"
                    onClick={handleCopyLink}
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-success" />
                    ) : (
                      <ArrowSquareOut className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>

                {/* Group Thread Topic */}
                {lead.groupTopicId != null && (
                  <div className="flex items-center gap-3 p-3 bg-card rounded-lg">
                    <Hash className="h-4 w-4 text-text-muted flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-sans font-semibold text-text-muted uppercase tracking-wider mb-0.5">
                        Group Thread
                      </p>
                      <p className="data-mono text-[12px] text-text-primary">
                        Topic #{lead.groupTopicId}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                      Active
                    </span>
                  </div>
                )}

                {/* Action buttons */}
                <div className="pt-1 flex items-center gap-2 flex-wrap">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        className="gap-1.5 text-xs bg-success/12 hover:bg-success/20 border border-success/20 text-success hover:text-success"
                        onClick={() => setShowVerifyModal(true)}
                      >
                        <CheckCircle className="h-3.5 w-3.5" />{" "}
                        {t("lead.verify")}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Verify deposit proof</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs"
                        onClick={() => setShowEditModal(true)}
                      >
                        <PencilSimple className="h-3.5 w-3.5" />{" "}
                        {t("lead.edit")}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit lead details</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs"
                        onClick={handleCopyLink}
                      >
                        {copied ? (
                          <Check className="h-3.5 w-3.5 text-success" />
                        ) : (
                          <LinkIcon className="h-3.5 w-3.5" />
                        )}
                        {copied ? t("lead.copied") : t("lead.copyLink")}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy referral link</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        className="gap-1.5 text-xs bg-danger/12 hover:bg-danger/20 border border-danger/20 text-danger hover:text-danger"
                        onClick={() => setShowRejectModal(true)}
                      >
                        <XCircle className="h-3.5 w-3.5" /> {t("lead.reject")}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Reject deposit</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>

            {/* ── Attachments Panel ── */}
            <div className="bg-elevated rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 bg-card border-b border-border-subtle flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Paperclip size={14} className="text-text-muted" />
                  <h3 className="font-sans font-semibold text-[14px] text-text-primary">
                    {t("lead.proof")}
                  </h3>
                </div>
                <span className="badge badge-pending">
                  {attachments.length} file{attachments.length !== 1 ? "s" : ""}
                </span>
              </div>
              {attachments.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-text-muted">
                  <Paperclip size={28} className="opacity-20" />
                  <p className="text-xs font-sans">No attachments yet</p>
                </div>
              ) : (
                <div className="p-4">
                  {/* Horizontal scroll carousel */}
                  <div className="flex gap-3 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory" style={{ scrollbarWidth: "none" }}>
                    {attachments.map((file) => {
                      const name = getFileName(file);
                      const img = isImage(file.mimeType);
                      const vid = isVideo(file.mimeType);
                      const mediaType: "image" | "video" | "file" = img ? "image" : vid ? "video" : "file";
                      return (
                        <button
                          key={file.id}
                          type="button"
                          onClick={() => setMediaPreview({
                            url: file.fileUrl,
                            type: mediaType,
                            name,
                            mimeType: file.mimeType,
                            size: file.size,
                          })}
                          className="group flex-shrink-0 snap-start w-44 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded-xl"
                        >
                          {/* Thumbnail / icon area */}
                          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-card border border-border-subtle group-hover:border-accent/40 transition-all mb-2.5">
                            {img && file.fileUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={file.fileUrl}
                                alt={name}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            ) : vid && file.fileUrl ? (
                              <div className="w-full h-full flex items-center justify-center bg-black/50">
                                <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                                  <Play size={14} className="text-white ml-0.5" weight="fill" />
                                </div>
                              </div>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-card/60">
                                <FileTypeBadge mimeType={file.mimeType} size={36} />
                              </div>
                            )}
                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded-full p-1.5">
                                <ArrowSquareOut size={12} className="text-white" />
                              </div>
                            </div>
                          </div>
                          {/* File info */}
                          <div className="px-0.5">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <FileTypeChip mimeType={file.mimeType} />
                              <p className="text-[11px] font-sans font-medium text-text-primary truncate flex-1">{name}</p>
                            </div>
                            <div className="flex items-center justify-between">
                              {file.size && (
                                <span className="text-[10px] font-mono text-text-muted">{formatFileSize(file.size)}</span>
                              )}
                              <span className="text-[10px] font-mono text-text-muted ml-auto">
                                {new Date(file.uploadedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {attachments.length > 3 && (
                    <p className="text-[10px] text-text-muted font-sans text-center mt-1.5 flex items-center justify-center gap-1">
                      <CaretRight size={10} /> Scroll to see {attachments.length - 3} more
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* ── Activity Timeline ── */}
            <div className="bg-elevated rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 bg-card border-b border-border-subtle flex items-center justify-between">
                <h3 className="font-sans font-semibold text-[14px] text-text-primary">
                  {t("lead.history")}
                </h3>
                {timeline.length > 0 && (
                  <span className="text-[10px] font-mono text-text-muted">{timeline.length} events</span>
                )}
              </div>
              <div className="p-5">
                <div
                  className="overflow-y-auto pr-1"
                  style={{ maxHeight: 256, scrollbarWidth: "thin" }}
                >
                <div className="relative" ref={timelineRef}>
                  <div className="absolute left-[11px] top-0 bottom-0 w-px bg-border-subtle" />
                  <div className="space-y-4">
                    {timeline.length === 0 ? (
                      <p className="text-xs font-sans text-text-muted pl-8">No activity yet.</p>
                    ) : (
                      timeline.map((event) => {
                        const Icon = event.Icon;
                        return (
                          <div
                            key={event.id}
                            className="timeline-item flex gap-4 relative"
                          >
                            <div className="w-[22px] h-[22px] rounded-full bg-card border border-border-default flex items-center justify-center flex-shrink-0 z-10">
                              <Icon className={`h-3 w-3 ${event.color}`} />
                            </div>
                            <div className="flex-1 pb-1">
                              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                <span
                                  className={`text-[10px] font-mono font-semibold uppercase tracking-wider ${event.color}`}
                                >
                                  {event.type.replace(/_/g, " ")}
                                </span>
                                <span className="data-mono text-[10px] text-text-muted">
                                  {event.time}
                                </span>
                              </div>
                              <p className="text-sm font-sans text-text-secondary">
                                {event.msg}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
                </div>
              </div>
            </div>
          </div>
          {/* end left column */}

          {/* ════ RIGHT COLUMN — Chat ════ */}
          <div className="bg-elevated rounded-xl overflow-hidden flex flex-col h-[640px] min-h-[500px]">
            {/* Handover control */}
            <div className="p-4 bg-card border-b border-border-subtle space-y-3">
              <p className="text-[11px] font-sans font-semibold text-text-muted uppercase tracking-wider">
                {t("lead.botControl")}
              </p>
              {/* Switch row */}
              <div
                className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                  handover
                    ? "bg-crimson/8 border-crimson/20"
                    : "bg-success/8 border-success/20"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {handover ? (
                    <div className="w-8 h-8 rounded-full bg-crimson/15 flex items-center justify-center flex-shrink-0">
                      <UserSwitch className="h-4 w-4 text-crimson" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-success/15 flex items-center justify-center flex-shrink-0">
                      <Robot className="h-4 w-4 text-success" />
                    </div>
                  )}
                  <div>
                    <p
                      className={`text-[13px] font-sans font-semibold leading-tight ${handover ? "text-crimson" : "text-success"}`}
                    >
                      {handover ? t("lead.humanActive") : t("lead.botActive")}
                    </p>
                    <p className="text-[11px] font-sans text-text-muted">
                      {handover ? t("lead.botPaused") : t("lead.clickTakeover")}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={handover}
                  onCheckedChange={(next) => {
                    setHandover(next);
                    if (lead) void storeSetHandover(lead.id, next);
                  }}
                  className={
                    handover
                      ? "data-[state=checked]:bg-crimson"
                      : "data-[state=checked]:bg-success"
                  }
                />
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 min-h-0 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
              <div className="p-4 space-y-3">
                {messages.map((msg, i) => {
                  if (msg.side === "system")
                    return (
                      <div key={i} className="text-center py-1">
                        <span className="text-[11px] font-sans italic text-text-muted bg-card px-3 py-1 rounded-full">
                          {msg.content}
                        </span>
                      </div>
                    );
                  const isUser = msg.side === "user";
                  const isAgent = msg.side === "agent";
                  const isBot = msg.side === "bot";

                  // Detect attachment in metadata
                  const meta = msg.metadata as Record<string, unknown> | null | undefined;
                  const attachMime = meta?.mimeType as string | undefined;
                  const attachName = (meta?.fileName ?? meta?.file_name ?? meta?.caption) as string | undefined;
                  const hasAttachment = !!(attachMime ?? attachName);

                  return (
                    <div
                      key={i}
                      className={`flex ${isUser ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 ${
                          isUser
                            ? "bg-card border border-border-default"
                            : isAgent
                              ? "bg-crimson/10 border border-crimson/20"
                              : "bg-success/10 border border-success/20"
                        }`}
                      >
                        {isAgent && (
                          <p className="text-[10px] font-sans font-semibold text-crimson mb-1 uppercase tracking-wider">
                            Agent
                          </p>
                        )}
                        {isBot && (
                          <p className="text-[10px] font-sans font-semibold text-success mb-1 uppercase tracking-wider">
                            Bot
                          </p>
                        )}
                        {/* Attachment chip */}
                        {hasAttachment && (
                          <div className={`flex items-center gap-1.5 mb-1.5 px-2 py-1.5 rounded-lg ${isUser ? "bg-elevated" : "bg-card/40"}`}>
                            <FileTypeChip mimeType={attachMime} />
                            <span className="text-[11px] font-sans text-text-secondary truncate max-w-[140px]">
                              {attachName ?? attachMime ?? "Attachment"}
                            </span>
                          </div>
                        )}
                        {msg.content && (
                          <p className="text-sm font-sans text-text-primary leading-relaxed">
                            {msg.content}
                          </p>
                        )}
                        <p className="data-mono text-[10px] text-text-muted mt-1">
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Reply input */}
            <div
              className={`p-4 border-t border-border-subtle ${!handover ? "opacity-50 pointer-events-none" : ""}`}
            >
              <div className="flex gap-2">
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void handleSend();
                    }
                  }}
                  placeholder={
                    handover
                      ? t("lead.replyPlaceholder", {
                          name: lead.displayName ?? "",
                        })
                      : t("lead.replyDisabled")
                  }
                  rows={2}
                  className="flex-1 resize-none text-sm"
                />
                <Button
                  onClick={() => void handleSend()}
                  disabled={!replyText.trim()}
                  size="icon"
                  className="bg-crimson hover:bg-crimson/90 text-white self-end flex-shrink-0 h-9 w-9"
                >
                  <PaperPlaneRight className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-[10px] font-sans text-text-muted mt-1.5">
                {t("lead.replySent")}
              </p>
            </div>
          </div>
        </div>

        {/* ── Verify Modal ── */}
        <Dialog open={showVerifyModal} onOpenChange={setShowVerifyModal}>
          <DialogContent className="max-w-sm rounded-3xl">
            <div ref={verifyRef}>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-success/15 border border-success/25 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-success" />
                  </div>
                  <DialogTitle className="font-bold text-xl text-text-primary">
                    {t("lead.verify.title")}
                  </DialogTitle>
                </div>
                <DialogDescription className="font-sans text-sm text-text-secondary">
                  {t("lead.verify.confirm", {
                    name: lead.displayName ?? "",
                    amount: `$${depositBalance.toFixed(2)}`,
                  })}
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center gap-1.5 p-3 rounded-lg bg-warning/10 border border-warning/20 my-4">
                <Warning className="h-3.5 w-3.5 text-warning flex-shrink-0" />
                <p className="text-xs font-sans text-warning">
                  {t("lead.verify.warning")}
                </p>
              </div>
              <DialogFooter className="flex gap-3 sm:flex-row">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowVerifyModal(false)}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  className="flex-1 gap-2 bg-success hover:bg-success/90 text-white font-semibold"
                  onClick={handleVerify}
                >
                  <CheckCircle className="h-4 w-4" /> {t("lead.verify.btn")}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* ── Reject Modal ── */}
        <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
          <DialogContent className="max-w-sm rounded-3xl">
            <div ref={rejectRef}>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-danger/15 border border-danger/25 flex items-center justify-center flex-shrink-0">
                    <XCircle className="h-5 w-5 text-danger" />
                  </div>
                  <DialogTitle className="font-bold text-xl text-text-primary">
                    {t("lead.reject.title")}
                  </DialogTitle>
                </div>
                <DialogDescription className="font-sans text-sm text-text-secondary">
                  {t("lead.reject.desc", { name: lead.displayName ?? "" })}
                </DialogDescription>
              </DialogHeader>
              <div className="my-4">
                <label className="block text-xs font-sans font-medium text-text-secondary mb-1.5">
                  {t("lead.reject.reason")}
                </label>
                <Textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder={t("lead.reject.placeholder")}
                  rows={3}
                  className="resize-none"
                />
              </div>
              <DialogFooter className="flex gap-3 sm:flex-row">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowRejectModal(false)}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  className="flex-1 gap-2 bg-danger hover:bg-danger/90 text-white font-semibold"
                  onClick={handleReject}
                >
                  <XCircle className="h-4 w-4" /> {t("common.reject")}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* ── Edit Modal ── */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-md rounded-3xl">
            <div ref={editRef}>
              <DialogHeader>
                <DialogTitle className="font-bold text-xl text-text-primary">
                  {t("lead.edit.title")}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 my-4">
                {[
                  {
                    label: t("lead.edit.hfm"),
                    defaultValue: lead.hfmBrokerId ?? "",
                    placeholder: "HFM-XXXXX",
                  },
                  {
                    label: t("lead.edit.email"),
                    defaultValue: lead.email ?? "",
                    placeholder: "email@domain.com",
                  },
                  {
                    label: t("lead.edit.phone"),
                    defaultValue: lead.phoneNumber ?? "",
                    placeholder: "+60XXXXXXXXX",
                  },
                ].map(({ label, defaultValue, placeholder }) => (
                  <div key={label}>
                    <label className="block text-xs font-sans font-medium text-text-secondary mb-1.5">
                      {label}
                    </label>
                    <Input
                      defaultValue={defaultValue}
                      placeholder={placeholder}
                      className="text-sm"
                    />
                  </div>
                ))}
              </div>
              <DialogFooter className="flex gap-3 sm:flex-row">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowEditModal(false)}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  className="flex-1 gap-2 bg-crimson hover:bg-crimson/90 text-white font-semibold"
                  onClick={() => {
                    setShowEditModal(false);
                    showToastMsg(t("lead.toast.edited"), "success");
                  }}
                >
                  {t("common.save")}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* ── Media Lightbox ── */}
        {mediaPreview && (
          <MediaLightbox
            item={mediaPreview}
            onClose={() => setMediaPreview(null)}
          />
        )}

        {toast && <ToastMsg msg={toast.msg} type={toast.type} />}
      </div>
    </TooltipProvider>
  );
}

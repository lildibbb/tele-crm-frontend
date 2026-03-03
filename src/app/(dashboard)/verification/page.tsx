"use client";

import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { MobileVerification } from "@/components/mobile";
import {
  Clock,
  CheckCircle,
  XCircle,
  Chat,
  Image as PhosphorImage,
  X,
  Warning,
  ShieldCheck,
  Check,
  Hash,
  CalendarBlank,
  ArrowSquareOut,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { useDataTable } from "@/lib/hooks/use-data-table";
import { useVerificationStore } from "@/store/verificationStore";
import { Lead } from "@/store/leadsStore";
import { LeadStatus } from "@/types/enums";
import { leadsApi } from "@/lib/api/leads";
import { useLeadsStore } from "@/store/leadsStore";
import { useT, K } from "@/i18n";
import { getVerificationColumns } from "./_components/verification-columns";
import { attachmentsApi, type Attachment } from "@/lib/api/attachments";
import { FileTypeBadge } from "@/components/ui/file-type-badge";

const TAB_FILTERS = ["PENDING", "ALL"] as const;

// ── Avatar ──────────────────────────────────────────────────────────────────
function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const sz = `${size}px`;
  return (
    <div
      className="rounded-full bg-elevated border border-border-default flex items-center justify-center text-text-secondary font-semibold select-none flex-shrink-0"
      style={{ width: sz, height: sz, fontSize: size * 0.28 }}
    >
      {initials}
    </div>
  );
}

// ── Approve Dialog ───────────────────────────────────────────────────────────
function ApproveDialog() {
  const t = useT();
  const { modalKind, closeModal, verify, activeId, getActiveRequest } =
    useVerificationStore();
  const req = getActiveRequest();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = async () => {
    if (!activeId) return;
    setIsSubmitting(true);
    try {
      await verify(activeId);
      toast.success("Deposit verified — lead status updated to Confirmed.");
    } catch {
      toast.error("Failed to verify deposit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={modalKind === "approve"}
      onOpenChange={(open) => !open && closeModal()}
    >
      <DialogContent className="sm:max-w-sm rounded-3xl border-border-subtle bg-card shadow-sm">
        <DialogHeader className="pb-0">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-success/12 border border-success/25 flex items-center justify-center flex-shrink-0">
              <CheckCircle
                weight="duotone"
                size={20}
                className="text-success"
              />
            </div>
            <DialogTitle className="font-bold text-[18px] text-text-primary leading-tight">
              {t("verification.approveDeposit")}
            </DialogTitle>
          </div>
          <DialogDescription className="sr-only">
            Confirm approval of this deposit submission
          </DialogDescription>
        </DialogHeader>

        {req && (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-elevated border border-border-subtle">
              <Avatar name={req.displayName ?? req.username ?? "—"} size={38} />
              <div className="flex-1 min-w-0">
                <p className="font-sans font-semibold text-[13px] text-text-primary">
                  {req.displayName ?? req.username ?? "—"}
                </p>
                <p className="data-mono text-[11px]">
                  {req.hfmBrokerId ?? "—"}
                </p>
              </div>
              <p className="font-bold text-gold data-mono text-[13px]">
                ${Number(req.depositBalance ?? 0).toLocaleString()}{" "}
                <span className="text-[10px] text-text-muted font-normal tracking-wide">
                  USD
                </span>
              </p>
              <Warning
                weight="duotone"
                size={14}
                className="text-warning flex-shrink-0 mt-0.5"
              />
              <p className="text-[12px] font-sans text-warning leading-snug">
                {t("verification.notifyUser")}
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 pt-2">
          <Button
            variant="outline"
            className="flex-1 rounded-xl h-11"
            onClick={closeModal}
            disabled={isSubmitting}
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={() => void handleApprove()}
            disabled={isSubmitting}
            className="flex-1 rounded-xl h-11 bg-success hover:bg-success/90 text-white font-semibold gap-2"
          >
            {isSubmitting ? (
              <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <Check size={15} weight="bold" />
            )}
            {t("verification.confirmApproval")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Reject Dialog ────────────────────────────────────────────────────────────
function RejectDialog() {
  const t = useT();
  const {
    modalKind,
    closeModal,
    activeId,
    getActiveRequest,
    rejectReason,
    setRejectReason,
  } = useVerificationStore();
  const updateStatus = useLeadsStore((s) => s.updateStatus);
  const req = getActiveRequest();

  const handleReject = () => {
    if (!activeId) return;
    updateStatus(activeId, { status: LeadStatus.REJECTED, rejectReason });
    closeModal();
    toast.error("Submission rejected. Lead has been notified.");
  };

  return (
    <Dialog
      open={modalKind === "reject"}
      onOpenChange={(open) => !open && closeModal()}
    >
      <DialogContent className="sm:max-w-sm rounded-3xl border-border-subtle bg-card shadow-sm">
        <DialogHeader className="pb-0">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-danger/12 border border-danger/25 flex items-center justify-center flex-shrink-0">
              <XCircle weight="duotone" size={20} className="text-danger" />
            </div>
            <DialogTitle className="font-bold text-[18px] text-text-primary leading-tight">
              {t("verification.rejectSubmission")}
            </DialogTitle>
          </div>
          <DialogDescription className="sr-only">
            Reject this deposit submission and notify the lead
          </DialogDescription>
        </DialogHeader>

        {req && (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-elevated border border-border-subtle">
              <Avatar name={req.displayName ?? req.username ?? "—"} size={38} />
              <div className="flex-1 min-w-0">
                <p className="font-sans font-semibold text-[13px] text-text-primary">
                  {req.displayName ?? req.username ?? "—"}
                </p>
                <p className="data-mono text-[11px]">
                  {req.hfmBrokerId ?? "—"}
                </p>
              </div>
              <p className="font-bold data-mono text-[13px] text-text-primary">
                ${Number(req.depositBalance ?? 0).toLocaleString()}{" "}
                <span className="text-[10px] text-text-muted font-normal tracking-wide">
                  USD
                </span>
              </p>
            </div>
            <div>
              <label className="block text-[12px] font-sans font-medium text-text-secondary mb-1.5">
                {t("verification.rejectionReason")}
              </label>
              <p className="text-[11px] font-sans text-warning mb-1.5 flex items-center gap-1">
                <span>⚠</span> This message will be sent directly to the
                customer via Telegram.
              </p>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Receipt image is blurry, amount doesn't match…"
                rows={3}
                className="resize-none rounded-xl text-sm bg-elevated border-border-default focus:border-danger"
              />
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 pt-2">
          <DialogClose asChild>
            <Button variant="outline" className="flex-1 rounded-xl h-11">
              {t("common.cancel")}
            </Button>
          </DialogClose>
          <Button
            onClick={handleReject}
            variant="destructive"
            className="flex-1 rounded-xl h-11 gap-2 font-semibold"
          >
            <XCircle weight="duotone" size={15} />
            {t("verification.confirmRejection")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Ask More Dialog ──────────────────────────────────────────────────────────
function AskMoreDialog() {
  const t = useT();
  const {
    modalKind,
    closeModal,
    getActiveRequest,
    askMoreText,
    setAskMoreText,
  } = useVerificationStore();
  const req = getActiveRequest();

  const handleSend = () => {
    closeModal();
    toast.success(
      `Message sent to ${req?.displayName ?? req?.username ?? "lead"}.`,
    );
  };

  return (
    <Dialog
      open={modalKind === "askMore"}
      onOpenChange={(open) => !open && closeModal()}
    >
      <DialogContent className="sm:max-w-sm rounded-3xl border-border-subtle bg-card shadow-sm">
        <DialogHeader className="pb-0">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-info/12 border border-info/25 flex items-center justify-center flex-shrink-0">
              <Chat weight="duotone" size={20} className="text-info" />
            </div>
            <DialogTitle className="font-bold text-[18px] text-text-primary leading-tight">
              {t("verification.askMoreInfo")}
            </DialogTitle>
          </div>
          <DialogDescription className="sr-only">
            Send a message requesting additional information from the lead
          </DialogDescription>
        </DialogHeader>

        {req && (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2 px-1">
              <Avatar name={req.displayName ?? req.username ?? "—"} size={28} />
              <p className="text-[13px] font-sans text-text-secondary">
                Sending to{" "}
                <span className="text-text-primary font-medium">
                  {req.displayName ?? req.username ?? "—"}
                </span>
              </p>
            </div>
            <Textarea
              value={askMoreText}
              onChange={(e) => setAskMoreText(e.target.value)}
              placeholder={t("verification.askMorePlaceholder")}
              rows={4}
              className="resize-none rounded-xl text-sm bg-elevated border-border-default focus:border-info"
            />
          </div>
        )}

        <DialogFooter className="gap-2 pt-2">
          <DialogClose asChild>
            <Button variant="outline" className="flex-1 rounded-xl h-11">
              {t("common.cancel")}
            </Button>
          </DialogClose>
          <Button
            onClick={handleSend}
            disabled={!askMoreText.trim()}
            className="flex-1 rounded-xl h-11 gap-2 font-semibold bg-info hover:bg-info/90 text-white"
          >
            <Chat weight="duotone" size={15} />
            {t("verification.send")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Attachment Preview ────────────────────────────────────────────────────────
function AttachmentPreviewDialog({
  open,
  onClose,
  req,
}: {
  open: boolean;
  onClose: () => void;
  req: Lead | undefined;
}) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loadingAtts, setLoadingAtts] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [slideDir, setSlideDir] = useState<"left" | "right">("right");
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!open || !req?.id) return;
    setLoadingAtts(true);
    setActiveIdx(0);
    attachmentsApi
      .findByLead(req.id)
      .then((r) => setAttachments(r.data?.data ?? []))
      .catch(() => setAttachments([]))
      .finally(() => setLoadingAtts(false));
  }, [open, req?.id]);

  const goNext = useCallback(() => {
    if (attachments.length <= 1 || isAnimating) return;
    setSlideDir("right");
    setIsAnimating(true);
    setActiveIdx((i) => (i + 1) % attachments.length);
    setTimeout(() => setIsAnimating(false), 300);
  }, [attachments.length, isAnimating]);

  const goPrev = useCallback(() => {
    if (attachments.length <= 1 || isAnimating) return;
    setSlideDir("left");
    setIsAnimating(true);
    setActiveIdx((i) => (i - 1 + attachments.length) % attachments.length);
    setTimeout(() => setIsAnimating(false), 300);
  }, [attachments.length, isAnimating]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, goNext, goPrev]);

  const active = attachments[activeIdx];
  const isImg = active?.mimeType?.startsWith("image/");
  const hasMultiple = attachments.length > 1;

  return (
    <Dialog open={open} onOpenChange={(o: boolean) => !o && onClose()}>
      <DialogPortal>
        <DialogOverlay className="bg-black/60 backdrop-blur-[8px]" />
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-md bg-transparent border-0 shadow-none p-0 gap-0"
        >
          <DialogTitle className="sr-only">Attachment Preview</DialogTitle>
          <DialogDescription className="sr-only">
            Full preview of the uploaded proof attachment
          </DialogDescription>
          <div className="relative flex flex-col items-center gap-3 px-1">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute -top-1 -right-1 z-20 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15 backdrop-blur-sm transition-all"
            >
              <X size={14} weight="bold" />
            </Button>

            {/* Main preview area */}
            <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-black/50 border border-white/10 flex items-center justify-center">
              {loadingAtts ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                  <p className="text-white/40 text-xs font-sans">Loading…</p>
                </div>
              ) : !active ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center">
                    <PhosphorImage
                      weight="duotone"
                      size={36}
                      className="text-white/50"
                    />
                  </div>
                  <p className="font-sans text-sm text-white/50">
                    No attachments yet
                  </p>
                </div>
              ) : isImg ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={activeIdx}
                  src={active.fileUrl}
                  alt="Proof attachment"
                  className="w-full h-full object-contain"
                  style={{
                    animation: hasMultiple
                      ? `${slideDir === "right" ? "slideInRight" : "slideInLeft2"} 0.28s cubic-bezier(0.22,1,0.36,1) forwards`
                      : undefined,
                  }}
                />
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <FileTypeBadge mimeType={active.mimeType} size={64} />
                  <a
                    href={active.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-300 underline text-xs font-sans"
                  >
                    Open file ↗
                  </a>
                </div>
              )}

              {/* Counter badge */}
              {hasMultiple && (
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-white/15 text-white text-[11px] font-mono font-medium">
                  {activeIdx + 1} / {attachments.length}
                </div>
              )}

              {/* Prev / Next nav */}
              {hasMultiple && !loadingAtts && (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm border border-white/15 flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95"
                    aria-label="Previous attachment"
                  >
                    <CaretLeft size={14} weight="bold" />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm border border-white/15 flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95"
                    aria-label="Next attachment"
                  >
                    <CaretRight size={14} weight="bold" />
                  </button>
                </>
              )}
            </div>

            {/* Dot indicators */}
            {hasMultiple && (
              <div className="flex items-center gap-1.5">
                {attachments.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setSlideDir(i > activeIdx ? "right" : "left");
                      setActiveIdx(i);
                    }}
                    className={`rounded-full transition-all ${
                      i === activeIdx
                        ? "w-4 h-1.5 bg-white"
                        : "w-1.5 h-1.5 bg-white/30 hover:bg-white/50"
                    }`}
                    aria-label={`Go to attachment ${i + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Thumbnail strip */}
            {hasMultiple && (
              <div
                className="flex gap-1.5 overflow-x-auto max-w-full pb-0.5"
                style={{ scrollbarWidth: "none" }}
              >
                {attachments.map((att, i) => (
                  <button
                    key={att.id}
                    onClick={() => {
                      setSlideDir(i > activeIdx ? "right" : "left");
                      setActiveIdx(i);
                    }}
                    className={`w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all hover:opacity-100 ${
                      i === activeIdx
                        ? "border-white/80 scale-105 shadow-lg"
                        : "border-white/15 opacity-50 hover:border-white/40"
                    }`}
                  >
                    {att.mimeType?.startsWith("image/") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={att.fileUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-white/10 flex items-center justify-center">
                        <FileTypeBadge mimeType={att.mimeType} size={20} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Lead info bar */}
            {req && (
              <div className="w-full flex items-center justify-between px-1 pb-1">
                <div className="flex items-center gap-2.5">
                  <Avatar
                    name={req.displayName ?? req.username ?? "—"}
                    size={32}
                  />
                  <div>
                    <p className="font-sans font-semibold text-[13px] text-white leading-snug">
                      {req.displayName ?? req.username ?? "—"}
                    </p>
                    <p className="data-mono text-[11px] text-white/50">
                      {req.hfmBrokerId ?? "—"}
                    </p>
                  </div>
                </div>
                <p className="font-bold text-gold data-mono text-[13px]">
                  ${Number(req.depositBalance ?? 0).toLocaleString()}{" "}
                  <span className="text-[10px] text-white/40 font-normal tracking-wide">
                    USD
                  </span>
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}

// ── Receipt Dialog ───────────────────────────────────────────────────────────
function ReceiptDialog() {
  const t = useT();
  const { modalKind, closeModal, openModal, getActiveRequest } =
    useVerificationStore();
  const req = getActiveRequest();
  const [attachmentOpen, setAttachmentOpen] = useState(false);

  const isVerified = req?.status === LeadStatus.DEPOSIT_CONFIRMED;
  const isPending = req?.status === LeadStatus.DEPOSIT_REPORTED;

  const submittedDisplay = req?.updatedAt
    ? new Date(req.updatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  return (
    <>
      <Dialog
        open={modalKind === "receipt"}
        onOpenChange={(open) => !open && closeModal()}
      >
        <DialogContent className="sm:max-w-[400px] rounded-3xl border border-border-subtle bg-card gap-0 p-0 overflow-hidden shadow-[var(--shadow-modal)]">
          <DialogDescription className="sr-only">
            View deposit receipt details for this submission
          </DialogDescription>

          {/* ── Header bar ── */}
          <div className="flex items-center justify-between px-5 pt-5 pb-4">
            <DialogTitle className="font-bold text-[15px] text-text-primary leading-tight">
              {t(K.verification.depositReceipt)}
            </DialogTitle>
            {isVerified && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/8 border border-success/20 text-success text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-success flex-shrink-0" />
                Verified
              </span>
            )}
          </div>

          {req && (
            <>
              {/* ── Lead identity row ── */}
              <div className="mx-5 mb-4 flex items-center gap-3 p-3 rounded-2xl bg-elevated border border-border-subtle">
                <Avatar
                  name={req.displayName ?? req.username ?? "—"}
                  size={36}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[13px] text-text-primary truncate">
                    {req.displayName ?? req.username ?? "—"}
                  </p>
                  <p className="data-mono text-[11px] text-text-muted truncate">
                    @{req.username ?? req.telegramUserId ?? "—"}
                  </p>
                </div>
              </div>

              {/* ── Hero amount panel ── */}
              <div className="mx-5 mb-4 rounded-2xl bg-elevated border border-border-subtle p-4 flex flex-col items-center gap-1">
                <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                  {t(K.verification.amount)}
                </p>
                <p className="font-display font-bold text-[28px] text-gold data-mono leading-none tracking-tight">
                  ${Number(req.depositBalance ?? 0).toLocaleString()}
                </p>
                <span className="text-[10px] font-semibold text-text-muted tracking-widest uppercase">
                  USD
                </span>
              </div>

              {/* ── Meta rows ── */}
              <div className="mx-5 mb-4 rounded-2xl bg-elevated border border-border-subtle overflow-hidden divide-y divide-border-subtle">
                <div className="flex items-center gap-3 px-4 py-3">
                  <Hash
                    size={13}
                    weight="regular"
                    className="text-text-muted flex-shrink-0"
                  />
                  <span className="text-[12px] text-text-secondary flex-1">
                    {t(K.verification.hfmAccount)}
                  </span>
                  <span className="data-mono text-[12px] text-text-primary font-medium">
                    {req.hfmBrokerId ?? "—"}
                  </span>
                </div>
                <div className="flex items-center gap-3 px-4 py-3">
                  <CalendarBlank
                    size={13}
                    weight="regular"
                    className="text-text-muted flex-shrink-0"
                  />
                  <span className="text-[12px] text-text-secondary flex-1">
                    {t(K.verification.submitted)}
                  </span>
                  <span className="data-mono text-[12px] text-text-primary font-medium">
                    {submittedDisplay}
                  </span>
                </div>
              </div>

              {/* ── View proof CTA ── */}
              <div className="mx-5 mb-5">
                <button
                  onClick={() => setAttachmentOpen(true)}
                  className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-card border border-border-default text-text-secondary hover:text-text-primary hover:border-border-default transition-colors text-[12px] font-medium"
                >
                  <PhosphorImage weight="duotone" size={15} />
                  {t(K.verification.viewReceipt)}
                  <ArrowSquareOut
                    size={12}
                    weight="regular"
                    className="ml-0.5 opacity-60"
                  />
                </button>
              </div>
            </>
          )}

          {/* ── Footer ── */}
          <div className="px-5 pb-5 flex gap-2 border-t border-border-subtle pt-4">
            <DialogClose asChild>
              <Button
                variant="outline"
                className="flex-1 rounded-xl h-10 text-[13px]"
              >
                {t(K.common.close)}
              </Button>
            </DialogClose>
            {isPending ? (
              <Button
                onClick={() => {
                  closeModal();
                  openModal(req?.id ?? "", "approve");
                }}
                className="flex-1 rounded-xl h-10 bg-success hover:bg-success/90 text-white font-semibold gap-1.5 text-[13px]"
              >
                <CheckCircle weight="duotone" size={14} />
                {t(K.verification.approve)}
              </Button>
            ) : (
              <div className="flex-1 flex items-center justify-center gap-2 rounded-xl h-10 bg-elevated border border-border-subtle text-text-muted text-[13px] font-medium">
                <ShieldCheck
                  size={14}
                  weight="duotone"
                  className="text-success"
                />
                {t(K.verification.alreadyVerified)}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AttachmentPreviewDialog
        open={attachmentOpen}
        onClose={() => setAttachmentOpen(false)}
        req={req}
      />
    </>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function VerificationPage() {
  const t = useT();
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const filter = useVerificationStore((s) => s.filter);
  const openModal = useVerificationStore((s) => s.openModal);
  const setFilter = useVerificationStore((s) => s.setFilter);
  const leads = useLeadsStore((s) => s.leads);
  const total = useLeadsStore((s) => s.total);
  const isLoading = useLeadsStore((s) => s.isLoading);
  const fetchLeads = useLeadsStore((s) => s.fetchLeads);
  const pageCount = useLeadsStore((s) => s.pageCount);
  const updateStatus = useLeadsStore((s) => s.updateStatus);

  // Stat card totals — fetched from API on mount for accuracy
  const [pendingTotal, setPendingTotal] = useState(0);
  const [allTotal, setAllTotal] = useState(0);
  const [approvedTotal, setApprovedTotal] = useState(0);
  const [rejectedTotal, setRejectedTotal] = useState(0);

  const onApprove = useCallback(
    (id: string) => {
      openModal(id, "approve");
    },
    [openModal],
  );
  const onReject = useCallback(
    (id: string) => {
      openModal(id, "reject");
    },
    [openModal],
  );
  const onAskMore = useCallback(
    (id: string) => {
      openModal(id, "askMore");
    },
    [openModal],
  );
  const onViewReceipt = useCallback(
    (id: string) => {
      openModal(id, "receipt");
    },
    [openModal],
  );

  const columns = useMemo(
    () =>
      getVerificationColumns({
        onApprove,
        onReject,
        onAskMore,
        onViewReceipt,
        t,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onApprove, onReject, onAskMore, onViewReceipt],
  );

  const { table } = useDataTable({
    data: leads,
    columns,
    pageCount,
    initialState: { pagination: { pageSize: 20, pageIndex: 0 } },
  });

  const { pageIndex, pageSize } = table.getState().pagination;

  const VERIFICATION_STATUSES = `${LeadStatus.DEPOSIT_REPORTED},${LeadStatus.DEPOSIT_CONFIRMED},${LeadStatus.REJECTED}`;

  useEffect(() => {
    void fetchLeads({
      skip: pageIndex * pageSize,
      take: pageSize,
      ...(filter === "PENDING"
        ? { status: LeadStatus.DEPOSIT_REPORTED }
        : { statuses: VERIFICATION_STATUSES }),
    });
  }, [pageIndex, pageSize, filter, fetchLeads]);

  // Sync tab-specific totals from active API response
  useEffect(() => {
    if (filter === "PENDING") {
      setPendingTotal(total);
    } else {
      setAllTotal(total);
    }
  }, [total, filter]);

  // Fetch all stat totals on mount so counts are accurate regardless of active tab
  useEffect(() => {
    const extractTotal = (r: { data: unknown }): number | undefined => {
      const outer = r.data as {
        data?: { data?: unknown; meta?: { total?: number } };
      };
      return outer?.data?.meta?.total;
    };
    leadsApi
      .list({ take: 1, skip: 0, status: LeadStatus.DEPOSIT_REPORTED })
      .then((r) => {
        const n = extractTotal(r);
        if (n != null) setPendingTotal(n);
      })
      .catch(() => {});
    leadsApi
      .list({ take: 1, skip: 0, statuses: VERIFICATION_STATUSES })
      .then((r) => {
        const n = extractTotal(r);
        if (n != null) setAllTotal(n);
      })
      .catch(() => {});
    leadsApi
      .list({ take: 1, skip: 0, status: LeadStatus.DEPOSIT_CONFIRMED })
      .then((r) => {
        const n = extractTotal(r);
        if (n != null) setApprovedTotal(n);
      })
      .catch(() => {});
    leadsApi
      .list({ take: 1, skip: 0, status: LeadStatus.REJECTED })
      .then((r) => {
        const n = extractTotal(r);
        if (n != null) setRejectedTotal(n);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isMobile) {
    return <MobileVerification />;
  }

  return (
    <TooltipProvider>
      <div ref={containerRef} className="space-y-4 animate-in-up">
        {/* ── Page Header ── */}
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold text-text-primary leading-none">
                {t("verification.title")}
              </h1>
              {pendingTotal > 0 && (
                <Badge className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card border border-border-default text-text-secondary text-[11px] font-semibold shadow-none">
                  <span
                    className="rounded-full bg-warning inline-block flex-shrink-0"
                    style={{
                      width: 5,
                      height: 5,
                      animation: "pulse-live 2.4s ease-in-out infinite",
                    }}
                  />
                  {pendingTotal} {t("verification.pendingReview")}
                </Badge>
              )}
            </div>
            <p className="text-text-secondary text-sm font-sans mt-0.5">
              {t("verify.subtitle")}
            </p>
          </div>
        </div>

        {/* ── Stats Strip ── */}
        <div className="grid grid-cols-3 gap-3">
          <div className="verify-stat kpi-stat-card bg-elevated rounded-xl p-5 shadow-sm border border-border-subtle">
            <div className="flex items-start justify-between mb-4">
              <Clock size={22} weight="duotone" className="text-text-muted" />
              <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-card border border-border-subtle text-text-secondary">
                <span
                  className="rounded-full bg-warning inline-block flex-shrink-0"
                  style={{
                    width: 5,
                    height: 5,
                    animation: "pulse-live 2.4s ease-in-out infinite",
                  }}
                />
                Live
              </span>
            </div>
            <p className="text-2xl font-bold data-mono text-text-primary leading-none mb-1.5 tracking-tight">
              {pendingTotal}
            </p>
            <p className="text-[11px] font-sans font-semibold text-text-secondary uppercase tracking-wider">
              {t(K.verification.stats.pending)}
            </p>
          </div>

          <div className="verify-stat kpi-stat-card bg-elevated rounded-xl p-5 shadow-sm border border-border-subtle">
            <div className="flex items-start justify-between mb-4">
              <CheckCircle
                size={22}
                weight="duotone"
                className="text-text-muted"
              />
            </div>
            <p className="text-2xl font-bold data-mono text-text-primary leading-none mb-1.5 tracking-tight">
              {approvedTotal}
            </p>
            <p className="text-[11px] font-sans font-semibold text-text-secondary uppercase tracking-wider">
              {t(K.verification.stats.totalApproved)}
            </p>
          </div>

          <div className="verify-stat kpi-stat-card bg-elevated rounded-xl p-5 shadow-sm border border-border-subtle">
            <div className="flex items-start justify-between mb-4">
              <XCircle size={22} weight="duotone" className="text-text-muted" />
            </div>
            <p className="text-2xl font-bold data-mono text-text-primary leading-none mb-1.5 tracking-tight">
              {rejectedTotal}
            </p>
            <p className="text-[11px] font-sans font-semibold text-text-secondary uppercase tracking-wider">
              {t(K.verification.stats.totalRejected)}
            </p>
          </div>
        </div>

        {/* ── Queue filter tabs ── */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div
            className="bg-elevated p-1 flex items-center gap-0.5 rounded-xl overflow-x-auto scrollbar-none"
            role="tablist"
            aria-label="Queue filter"
          >
            {TAB_FILTERS.map((f) => (
              <Button
                key={f}
                type="button"
                variant="ghost"
                role="tab"
                aria-selected={filter === f}
                onClick={() => {
                  setFilter(f);
                  table.setPageIndex(0);
                }}
                className={
                  "px-3.5 py-1.5 h-auto rounded-lg text-xs font-sans font-medium transition-all cursor-pointer whitespace-nowrap flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-crimson/40 " +
                  (filter === f
                    ? "bg-crimson hover:bg-crimson-hover text-white shadow-sm"
                    : "text-text-secondary hover:text-text-primary hover:bg-card")
                }
              >
                {f === "PENDING"
                  ? `${t("verification.tabs.pending")} (${pendingTotal})`
                  : `${t("verification.tabs.all")} (${allTotal})`}
              </Button>
            ))}
          </div>

          <p className="text-[11px] font-sans text-text-muted">
            {(filter === "PENDING" ? pendingTotal : allTotal).toLocaleString()}{" "}
            {t(K.verification.tabs.entries)}
          </p>
        </div>

        {/* ── Table ── */}
        {isLoading ? (
          <DataTableSkeleton columnCount={6} rowCount={10} shrinkZero />
        ) : (
          <DataTable table={table} />
        )}

        {/* ── Portaled Dialogs ── */}
        <ApproveDialog />
        <RejectDialog />
        <AskMoreDialog />
        <ReceiptDialog />
      </div>
    </TooltipProvider>
  );
}

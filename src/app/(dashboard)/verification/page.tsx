"use client";

import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { toast } from "sonner";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { MobileVerification } from "@/components/mobile";
import {
  Clock,
  CheckCircle,
  XCircle,
  Chat,
  MagnifyingGlass,
  Image as PhosphorImage,
  X,
  Warning,
  ShieldCheck,
  Check,
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
import { useLeadsStore } from "@/store/leadsStore";
import { useT, K } from "@/i18n";
import { getVerificationColumns } from "./_components/verification-columns";
import { attachmentsApi, type Attachment } from "@/lib/api/attachments";
import { FileTypeBadge } from "@/components/ui/file-type-badge";

// Register GSAP plugin
gsap.registerPlugin(useGSAP);

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
      className="rounded-full bg-crimson/12 border border-crimson/20 flex items-center justify-center text-crimson font-bold select-none flex-shrink-0"
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
      <DialogContent className="sm:max-w-sm rounded-3xl border-border-subtle bg-card shadow-2xl">
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
              <p className="font-bold text-gold data-mono text-[18px]">
                ${Number(req.depositBalance ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-warning/8 border border-warning/18">
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
  const { updateStatus } = useLeadsStore();
  const req = getActiveRequest();

  const handleReject = () => {
    if (!activeId) return;
    updateStatus(activeId, { status: LeadStatus.NEW });
    closeModal();
    toast.error("Submission rejected. Lead has been notified.");
  };

  return (
    <Dialog
      open={modalKind === "reject"}
      onOpenChange={(open) => !open && closeModal()}
    >
      <DialogContent className="sm:max-w-sm rounded-3xl border-border-subtle bg-card shadow-2xl">
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
              <p className="font-bold data-mono text-[18px] text-text-primary">
                ${Number(req.depositBalance ?? 0).toLocaleString()}
              </p>
            </div>
            <div>
              <label className="block text-[12px] font-sans font-medium text-text-secondary mb-1.5">
                {t("verification.rejectionReason")}
              </label>
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
      <DialogContent className="sm:max-w-sm rounded-3xl border-border-subtle bg-card shadow-2xl">
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

  const active = attachments[activeIdx];
  const isImg = active?.mimeType?.startsWith("image/");

  return (
    <Dialog open={open} onOpenChange={(o: boolean) => !o && onClose()}>
      <DialogPortal>
        <DialogOverlay className="bg-black/55 backdrop-blur-[6px]" />
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-lg bg-transparent border-0 shadow-none p-0 gap-0"
        >
          <DialogTitle className="sr-only">Attachment Preview</DialogTitle>
          <DialogDescription className="sr-only">
            Full preview of the uploaded proof attachment
          </DialogDescription>
          <div className="relative flex flex-col items-center gap-4 px-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute -top-2 -right-2 z-10 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm"
            >
              <X size={15} weight="bold" />
            </Button>

            {/* Main preview area */}
            <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center">
              {loadingAtts ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                  <p className="text-white/40 text-xs font-sans">Loading…</p>
                </div>
              ) : !active ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center">
                    <PhosphorImage weight="duotone" size={36} className="text-white/50" />
                  </div>
                  <p className="font-sans text-sm text-white/50">No attachments yet</p>
                </div>
              ) : isImg ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={active.fileUrl}
                  alt="Proof attachment"
                  className="w-full h-full object-contain"
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
            </div>

            {/* Thumbnail strip when multiple attachments */}
            {attachments.length > 1 && (
              <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                {attachments.map((att, i) => (
                  <button
                    key={att.id}
                    onClick={() => setActiveIdx(i)}
                    className={`w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                      i === activeIdx ? "border-white/70" : "border-white/15 opacity-60"
                    }`}
                  >
                    {att.mimeType?.startsWith("image/") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={att.fileUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-white/10 flex items-center justify-center">
                        <FileTypeBadge mimeType={att.mimeType} size={24} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {req && (
              <div className="w-full flex items-center justify-between px-1">
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
                <p className="font-bold text-gold data-mono text-[18px]">
                  ${Number(req.depositBalance ?? 0).toLocaleString()}
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

  return (
    <>
      <Dialog
        open={modalKind === "receipt"}
        onOpenChange={(open) => !open && closeModal()}
      >
        <DialogContent className="sm:max-w-md rounded-3xl border-border-subtle bg-card shadow-2xl gap-0">
          <DialogHeader className="p-5 pb-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-info/12 border border-info/25 flex items-center justify-center flex-shrink-0">
                <PhosphorImage
                  weight="duotone"
                  size={20}
                  className="text-info"
                />
              </div>
              <div>
                <DialogTitle className="font-bold text-[18px] text-text-primary leading-tight">
                  {t(K.verification.depositReceipt)}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  View deposit receipt details for this submission
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {req && (
            <div className="p-5 space-y-4">
              <button
                onClick={() => setAttachmentOpen(true)}
                className="w-full rounded-2xl bg-elevated border border-border-subtle overflow-hidden flex items-center justify-center aspect-video hover:border-info/40 transition-colors group"
              >
                <div className="flex flex-col items-center gap-2 text-text-muted group-hover:text-info transition-colors">
                  <PhosphorImage weight="duotone" size={32} />
                  <span className="text-[12px] font-sans">
                    {t(K.verification.viewReceipt)}
                  </span>
                </div>
              </button>
              <div className="space-y-2 text-[13px] font-sans text-text-secondary">
                <div className="flex justify-between">
                  <span>{t(K.verification.amount)}</span>
                  <span className="font-bold text-gold data-mono">
                    ${Number(req.depositBalance ?? 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{t(K.verification.hfmAccount)}</span>
                  <span className="data-mono text-text-primary">
                    {req.hfmBrokerId ?? "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{t(K.verification.submitted)}</span>
                  <span className="data-mono text-text-primary">
                    {req.updatedAt ?? "—"}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="p-5 pt-0 gap-2">
            <DialogClose asChild>
              <Button variant="outline" className="flex-1 rounded-xl h-11">
                {t(K.common.close)}
              </Button>
            </DialogClose>
            {req?.status === LeadStatus.DEPOSIT_REPORTED ? (
              <Button
                onClick={() => {
                  closeModal();
                  openModal(req?.id ?? "", "approve");
                }}
                className="flex-1 rounded-xl h-11 bg-success hover:bg-success/90 text-white font-semibold gap-2"
              >
                <CheckCircle weight="duotone" size={15} />
                {t(K.verification.approve)}
              </Button>
            ) : (
              <div className="flex-1 flex items-center justify-center gap-2 rounded-xl h-11 bg-elevated border border-border-subtle text-text-muted text-sm font-medium">
                <ShieldCheck size={15} weight="duotone" className="text-success" />
                {t(K.verification.alreadyVerified)}
              </div>
            )}
          </DialogFooter>
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

  const {
    filter,
    openModal,
    setFilter,
    getPendingVerifications,
    getVerifiedCount,
  } = useVerificationStore();
  const { leads, total, isLoading, fetchLeads, pageCount } = useLeadsStore();
  const { updateStatus } = useLeadsStore();

  const pending = getPendingVerifications();
  const approvedCount = getVerifiedCount();

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
      getVerificationColumns({ onApprove, onReject, onAskMore, onViewReceipt }),
    [onApprove, onReject, onAskMore, onViewReceipt],
  );

  const { table } = useDataTable({
    data: leads,
    columns,
    pageCount,
    initialState: { pagination: { pageSize: 20, pageIndex: 0 } },
  });

  const { pageIndex, pageSize } = table.getState().pagination;

  useEffect(() => {
    void fetchLeads({
      skip: pageIndex * pageSize,
      take: pageSize,
      status: filter === "PENDING" ? LeadStatus.DEPOSIT_REPORTED : undefined,
    });
  }, [pageIndex, pageSize, filter, fetchLeads]);

  // GSAP entrance stats
  useGSAP(
    () => {
      gsap.from(".verify-stat", {
        opacity: 0,
        y: 14,
        duration: 0.45,
        stagger: 0.08,
        ease: "power2.out",
      });
    },
    { scope: containerRef, dependencies: [] },
  );

  // GSAP entrance rows
  useGSAP(
    () => {
      const rows = containerRef.current?.querySelectorAll("tbody tr");
      if (rows && rows.length > 0) {
        gsap.from(rows, {
          opacity: 0,
          y: 8,
          duration: 0.3,
          stagger: 0.04,
          ease: "power2.out",
          clearProps: "all",
        });
      }
    },
    { scope: containerRef, dependencies: [leads, filter] },
  );

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
              {pending.length > 0 && (
                <Badge className="badge badge-warning gap-1.5">
                  <span
                    className="rounded-full bg-warning inline-block flex-shrink-0"
                    style={{
                      width: 6,
                      height: 6,
                      animation: "pulse-live 2.4s ease-in-out infinite",
                    }}
                  />
                  {pending.length} {t("verification.pendingReview")}
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
          <div className="verify-stat kpi-stat-card bg-elevated rounded-xl p-5">
            <div className="flex items-start justify-between mb-4">
              <Clock size={22} weight="duotone" className="text-warning" />
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-warning/10 text-warning">
                Live
              </span>
            </div>
            <p className="text-2xl font-bold data-mono text-warning leading-none mb-1.5 tracking-tight">
              {pending.length}
            </p>
            <p className="text-[11px] font-sans font-semibold text-text-secondary uppercase tracking-wider">
              {t("verification.stats.pending")}
            </p>
          </div>

          <div className="verify-stat kpi-stat-card bg-elevated rounded-xl p-5">
            <div className="flex items-start justify-between mb-4">
              <CheckCircle
                size={22}
                weight="duotone"
                className="text-success"
              />
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-success/10 text-success">
                Today
              </span>
            </div>
            <p className="text-2xl font-bold data-mono text-success leading-none mb-1.5 tracking-tight">
              {approvedCount}
            </p>
            <p className="text-[11px] font-sans font-semibold text-text-secondary uppercase tracking-wider">
              {t("verification.stats.approvedToday")}
            </p>
          </div>

          <div className="verify-stat kpi-stat-card bg-elevated rounded-xl p-5">
            <div className="flex items-start justify-between mb-4">
              <XCircle size={22} weight="duotone" className="text-danger" />
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-danger/10 text-danger">
                Today
              </span>
            </div>
            <p className="text-2xl font-bold data-mono text-danger leading-none mb-1.5 tracking-tight">
              0
            </p>
            <p className="text-[11px] font-sans font-semibold text-text-secondary uppercase tracking-wider">
              {t("verification.stats.rejectedToday")}
            </p>
          </div>
        </div>

        {/* ── Main Queue Panel ── */}
        <div className="bg-elevated rounded-xl overflow-hidden">
          <div className="px-4 sm:px-5 py-4 pb-0 flex flex-col sm:flex-row sm:items-center gap-3">
            <div
              className="bg-elevated/60 border border-border-default/40 p-[3px] flex items-center gap-0.5 rounded-full overflow-x-auto scrollbar-none flex-shrink-0"
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
                    "px-5 py-1.5 h-auto rounded-full text-[13px] font-sans font-medium transition-all cursor-pointer whitespace-nowrap flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-crimson/40 " +
                    (filter === f
                      ? "bg-crimson hover:bg-crimson-hover text-white shadow-sm"
                      : "text-text-secondary hover:text-text-primary hover:bg-border-subtle/50")
                  }
                >
                  {f === "PENDING"
                    ? `${t("verification.tabs.pending")} (${pending.length})`
                    : `${t("verification.tabs.all")} (${total})`}
                </Button>
              ))}
            </div>
          </div>

          <div className="p-4 sm:p-5">
            {isLoading ? (
              <DataTableSkeleton columnCount={6} rowCount={10} shrinkZero />
            ) : (
              <DataTable table={table} />
            )}
          </div>
        </div>

        {/* ── Portaled Dialogs ── */}
        <ApproveDialog />
        <RejectDialog />
        <AskMoreDialog />
        <ReceiptDialog />
      </div>
    </TooltipProvider>
  );
}

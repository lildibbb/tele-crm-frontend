"use client";
import React, { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { MobileLeadDetail } from "@/components/mobile";
import {
  CaretLeft,
  Clock,
  CheckCircle,
  XCircle,
  Link as LinkIcon,
  PencilSimple,
  PaperPlaneRight,
  Play,
  Image as ImageIcon,
  Robot,
  UserCircle,
  Chat,
  Lightning,
  Check,
  Warning,
} from "@phosphor-icons/react";
import { useT } from "@/i18n";
import { useLeadsStore } from "@/store/leadsStore";
import { LeadStatus } from "@/types/enums";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

gsap.registerPlugin(useGSAP);

const INITIAL_TIMELINE = [
  { id: 1, type: "AUTO_REPLY_SENT",      time: "Jan 20 14:32", msg: "Bot sent welcome message",               Icon: Robot,      color: "text-text-muted"  },
  { id: 2, type: "MESSAGE_RECEIVED",     time: "Jan 20 14:35", msg: "User: Hi, how do I register?",           Icon: Chat,       color: "text-info"        },
  { id: 3, type: "SYSTEM_STATUS_CHANGE", time: "Jan 20 15:00", msg: "Status changed to REGISTERED",           Icon: Lightning,  color: "text-success"     },
  { id: 4, type: "MANUAL_REPLY_SENT",    time: "Jan 21 09:12", msg: "Agent: Your account has been approved!", Icon: UserCircle, color: "text-crimson"     },
];

const INITIAL_MESSAGES = [
  { side: "bot",    time: "14:32", content: "Welcome to Titan Journal CRM! Please register your HFM account to get started." },
  { side: "user",   time: "14:35", content: "Hi, I want to register." },
  { side: "system", time: "15:00", content: "Status changed to REGISTERED" },
  { side: "agent",  time: "09:12", content: "Your account has been approved! Please proceed to make your first deposit." },
];

function ToastMsg({ msg, type }: { msg: string; type: "success" | "danger" | "info" }) {
  const styles = {
    success: "border-success/30 text-success",
    danger:  "border-danger/30 text-danger",
    info:    "border-info/30 text-info",
  };
  const Icon = type === "success" ? CheckCircle : type === "danger" ? XCircle : Warning;
  return (
    <div className={`fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-4 py-3 rounded-xl border bg-elevated shadow-xl animate-in-up font-sans text-sm font-medium ${styles[type]}`}>
      <Icon className="h-4 w-4 flex-shrink-0" />{msg}
    </div>
  );
}

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const t = useT();
  const { id } = React.use(params);
  const { updateStatus, setHandover: storeSetHandover } = useLeadsStore();
  const lead = useLeadsStore((s) => s.leads.find((l) => l.id === id));
  const isMobile = useIsMobile();

  const [handover,        setHandover]        = useState(lead?.handoverMode ?? false);
  const [replyText,       setReplyText]        = useState("");
  const [messages,        setMessages]         = useState(INITIAL_MESSAGES);
  const [timeline,        setTimeline]         = useState(INITIAL_TIMELINE);
  const [showVerifyModal, setShowVerifyModal]  = useState(false);
  const [showRejectModal, setShowRejectModal]  = useState(false);
  const [showEditModal,   setShowEditModal]    = useState(false);
  const [rejectReason,    setRejectReason]     = useState("");
  const [copied,          setCopied]           = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "danger" | "info" } | null>(null);

  const timelineRef = useRef<HTMLDivElement>(null);
  const verifyRef   = useRef<HTMLDivElement>(null);
  const rejectRef   = useRef<HTMLDivElement>(null);
  const editRef     = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (isMobile) return;
      const items = timelineRef.current?.querySelectorAll(".timeline-item");
      if (items && items.length > 0) {
        gsap.from(items, { opacity: 0, x: -8, duration: 0.25, stagger: 0.06, ease: "power2.out" });
      }
    },
    { scope: timelineRef, dependencies: [timeline.length, isMobile] }
  );

  useEffect(() => {
    if (isMobile) return;
    if (showVerifyModal && verifyRef.current)
      gsap.fromTo(verifyRef.current, { opacity: 0, scale: 0.95, y: 8 }, { opacity: 1, scale: 1, y: 0, duration: 0.2, ease: "power2.out" });
  }, [showVerifyModal, isMobile]);

  useEffect(() => {
    if (isMobile) return;
    if (showRejectModal && rejectRef.current)
      gsap.fromTo(rejectRef.current, { opacity: 0, scale: 0.95, y: 8 }, { opacity: 1, scale: 1, y: 0, duration: 0.2, ease: "power2.out" });
  }, [showRejectModal, isMobile]);

  useEffect(() => {
    if (isMobile) return;
    if (showEditModal && editRef.current)
      gsap.fromTo(editRef.current, { opacity: 0, scale: 0.95, y: 8 }, { opacity: 1, scale: 1, y: 0, duration: 0.2, ease: "power2.out" });
  }, [showEditModal, isMobile]);

  // ── Mobile view ──
  if (isMobile) {
    return (
      <MobileLeadDetail
        lead={lead}
        onVerify={() => lead && updateStatus(lead.id, { status: LeadStatus.DEPOSIT_CONFIRMED })}
        onReject={() => lead && updateStatus(lead.id, { status: LeadStatus.NEW })}
      />
    );
  }

  const showToastMsg = (msg: string, type: "success" | "danger" | "info" = "success") => {
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
    const ref  = lead?.telegramUserId ?? id;
    const link = `https://app.titanjournal.com/tma/register?ref=${ref}`;
    await navigator.clipboard.writeText(link).catch(() => {});
    setCopied(true);
    showToastMsg(t("lead.toast.copied"), "info");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSend = () => {
    if (!replyText.trim()) return;
    const now = new Date();
    setMessages((prev) => [
      ...prev,
      {
        side: "agent",
        time: now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
        content: replyText.trim(),
      },
    ]);
    setTimeline((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        type: "MANUAL_REPLY_SENT",
        time:
          now.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) +
          " " +
          now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
        msg: `Agent: ${replyText.trim()}`,
        Icon: UserCircle,
        color: "text-crimson",
      },
    ]);
    setReplyText("");
  };

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-text-secondary font-sans">Lead not found: {id}</p>
        <Button variant="ghost" asChild className="gap-1.5 text-sm">
          <Link href="/leads">
            <CaretLeft className="h-4 w-4" /> Back to Leads
          </Link>
        </Button>
      </div>
    );
  }

  const initials       = (lead.displayName ?? "").split(" ").map((n: string) => n[0]).join("").slice(0, 2);
  const depositBalance = Number(lead.depositBalance ?? 0) || 0;

  return (
    <TooltipProvider>
      <div className="space-y-5 animate-in-up">

        {/* ── Breadcrumb ── */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="gap-1.5 text-text-secondary hover:text-text-primary h-8 px-2">
            <Link href="/leads">
              <CaretLeft className="h-3.5 w-3.5" /> {t("nav.leadIntelligence")}
            </Link>
          </Button>
          <span className="text-text-muted">/</span>
          <span className="text-text-primary text-sm font-sans">{lead.displayName}</span>
        </div>

        {/* ── Two-column grid ── */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-4">

          {/* ════ LEFT COLUMN ════ */}
          <div className="space-y-4">

            {/* Profile Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-5">
                  <Avatar className="w-14 h-14 flex-shrink-0 border-2 border-crimson/40">
                    <AvatarFallback className="bg-crimson/20 text-crimson font-display font-extrabold text-xl">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h2 className="font-display font-bold text-2xl text-text-primary">{lead.displayName}</h2>
                      <Badge className="badge badge-registered">{lead.status}</Badge>
                      <Badge className="badge badge-live flex items-center gap-1">
                        <Robot className="h-3 w-3" /> {t("lead.botActive")}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 mt-2">
                      {[
                        { label: "Telegram ID", value: lead.telegramUserId       },
                        { label: "HFM ID",      value: lead.hfmBrokerId            },
                        { label: "Email",       value: lead.email ?? "—"     },
                        { label: "Phone",       value: lead.phoneNumber            },
                        { label: "Registered",  value: lead.registeredAt ?? "—" },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex items-center gap-2">
                          <span className="text-[11px] font-sans text-text-muted w-20 flex-shrink-0">{label}:</span>
                          <span className="data-mono text-[12px] text-text-secondary truncate">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[11px] font-sans text-text-muted mb-1">{t("lead.depositBalance")}</p>
                    <p className="font-display font-bold text-2xl text-gold">
                      {lead.depositBalance && lead.depositBalance !== "—" ? lead.depositBalance : `$${depositBalance.toFixed(2)}`}
                    </p>
                  </div>
                </div>

                <Separator className="mb-4" />

                {/* Action buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        className="gap-1.5 text-xs bg-success/15 hover:bg-success/25 border border-success/25 text-success hover:text-success"
                        onClick={() => setShowVerifyModal(true)}
                      >
                        <CheckCircle className="h-3.5 w-3.5" /> {t("lead.verify")}
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
                        <PencilSimple className="h-3.5 w-3.5" /> {t("lead.edit")}
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
                        className="gap-1.5 text-xs bg-danger/15 hover:bg-danger/25 border border-danger/25 text-danger hover:text-danger"
                        onClick={() => setShowRejectModal(true)}
                      >
                        <XCircle className="h-3.5 w-3.5" /> {t("lead.reject")}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Reject deposit</TooltipContent>
                  </Tooltip>
                </div>
              </CardContent>
            </Card>

            {/* Attachments / Deposit Proof */}
            <Card>
              <CardHeader>
                <CardTitle className="font-sans font-semibold text-[14px] text-text-primary">
                  {t("lead.proof")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { name: "receipt_hfm.jpg",    type: "image" },
                    { name: "deposit_proof.mp4",  type: "video" },
                    { name: "balance_shot.jpg",   type: "image" },
                  ].map((file) => (
                    <div key={file.name} className="group cursor-pointer">
                      {/* Simple thumbnail — no nested card/border */}
                      <div className="aspect-square rounded-lg overflow-hidden bg-elevated/50 flex items-center justify-center mb-1">
                        {file.type === "video" ? (
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-8 h-8 rounded-full bg-crimson/15 flex items-center justify-center">
                              <Play className="h-3.5 w-3.5 text-crimson" />
                            </div>
                          </div>
                        ) : (
                          <ImageIcon className="h-8 w-8 text-text-muted/40" />
                        )}
                      </div>
                      <p className="data-mono text-[11px] truncate">{file.name}</p>
                      <p className="data-mono text-[10px] text-text-muted flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" /> Jan 20, 14:30{" "}
                        <span className="ml-1 text-crimson cursor-pointer text-[10px] font-sans hover:underline">
                          View Full
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="font-sans font-semibold text-[14px] text-text-primary">
                  {t("lead.history")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative" ref={timelineRef}>
                  <div className="absolute left-[11px] top-0 bottom-0 w-px bg-border-subtle" />
                  <div className="space-y-4">
                    {timeline.map((event) => {
                      const Icon = event.Icon;
                      return (
                        <div key={event.id} className="timeline-item flex gap-4 relative">
                          <div className="w-5 h-5 rounded-full bg-elevated border border-border-default flex items-center justify-center flex-shrink-0 z-10">
                            <Icon className={`h-3 w-3 ${event.color}`} />
                          </div>
                          <div className="flex-1 pb-1">
                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                              <span className={`text-[11px] font-mono ${event.color}`}>[{event.type}]</span>
                              <span className="data-mono text-[11px]">{event.time}</span>
                            </div>
                            <p className="text-sm font-sans text-text-secondary">{event.msg}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ════ RIGHT COLUMN — Chat Panel ════ */}
          <Card className="flex flex-col h-[600px] xl:h-auto min-h-[500px]">
            {/* Bot control header */}
            <div className="p-4 border-b border-border-subtle">
              <p className="text-[11px] font-sans font-medium text-text-secondary mb-2">{t("lead.botControl")}</p>
              <Button
                className={`w-full gap-2 font-semibold text-sm ${
                  handover
                    ? "bg-crimson/15 border border-crimson/25 text-crimson hover:bg-crimson/25 hover:text-crimson"
                    : "bg-success/15 border border-success/25 text-success hover:bg-success/25 hover:text-success"
                }`}
                onClick={() => {
                  const next = !handover;
                  setHandover(next);
                  if (lead) storeSetHandover(lead.id, next);
                }}
              >
                {handover ? (
                  <><UserCircle className="h-4 w-4" /> {t("lead.humanActive")}</>
                ) : (
                  <><Robot className="h-4 w-4" /> {t("lead.botActive")}</>
                )}
              </Button>
              <p className="text-[11px] font-sans text-text-muted mt-1.5 text-center">
                {handover ? t("lead.botPaused") : t("lead.clickTakeover")}
              </p>
            </div>

            {/* Messages — ScrollArea */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-3">
                {messages.map((msg, i) => {
                  if (msg.side === "system") return (
                    <div key={i} className="text-center">
                      <span className="text-[11px] font-sans italic text-text-muted">{msg.content}</span>
                    </div>
                  );
                  const isUser  = msg.side === "user";
                  const isAgent = msg.side === "agent";
                  return (
                    <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] rounded-xl px-3 py-2 ${
                          isUser
                            ? "bg-crimson/12 border border-crimson/18"
                            : isAgent
                            ? "bg-elevated border border-gold/20"
                            : "bg-elevated border border-border-subtle"
                        }`}
                      >
                        {isAgent && <p className="text-[10px] font-sans text-gold mb-1 font-medium">Agent</p>}
                        <p className="text-sm font-sans text-text-primary">{msg.content}</p>
                        <p className="data-mono text-[10px] text-text-muted mt-1">{msg.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Reply input */}
            <div className={`p-4 border-t border-border-subtle ${!handover ? "opacity-50 pointer-events-none" : ""}`}>
              <div className="flex gap-2">
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={
                    handover
                      ? t("lead.replyPlaceholder", { name: lead.displayName ?? "" })
                      : t("lead.replyDisabled")
                  }
                  rows={2}
                  className="flex-1 resize-none text-sm"
                />
                <Button
                  onClick={handleSend}
                  disabled={!replyText.trim()}
                  size="icon"
                  className="bg-crimson hover:bg-crimson/90 text-white self-end flex-shrink-0 h-9 w-9"
                >
                  <PaperPlaneRight className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-[10px] font-sans text-text-muted mt-1.5">{t("lead.replySent")}</p>
            </div>
          </Card>
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
                  <DialogTitle className="font-display font-bold text-xl text-text-primary">
                    {t("lead.verify.title")}
                  </DialogTitle>
                </div>
                <DialogDescription className="font-sans text-sm text-text-secondary">
                  {t("lead.verify.confirm", { name: lead.displayName ?? "", amount: `$${depositBalance.toFixed(2)}` })}
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center gap-1.5 p-3 rounded-lg bg-warning/10 border border-warning/20 my-4">
                <Warning className="h-3.5 w-3.5 text-warning flex-shrink-0" />
                <p className="text-xs font-sans text-warning">{t("lead.verify.warning")}</p>
              </div>
              <DialogFooter className="flex gap-3 sm:flex-row">
                <Button variant="outline" className="flex-1" onClick={() => setShowVerifyModal(false)}>
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
                  <DialogTitle className="font-display font-bold text-xl text-text-primary">
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
                <Button variant="outline" className="flex-1" onClick={() => setShowRejectModal(false)}>
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
                <DialogTitle className="font-display font-bold text-xl text-text-primary">
                  {t("lead.edit.title")}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 my-4">
                {[
                  { label: t("lead.edit.hfm"),   defaultValue: lead.hfmBrokerId ?? "",       placeholder: "HFM-XXXXX"        },
                  { label: t("lead.edit.email"),  defaultValue: lead.email ?? "", placeholder: "email@domain.com" },
                  { label: t("lead.edit.phone"),  defaultValue: lead.phoneNumber ?? "",       placeholder: "+60XXXXXXXXX"     },
                ].map(({ label, defaultValue, placeholder }) => (
                  <div key={label}>
                    <label className="block text-xs font-sans font-medium text-text-secondary mb-1.5">{label}</label>
                    <Input defaultValue={defaultValue} placeholder={placeholder} className="text-sm" />
                  </div>
                ))}
              </div>
              <DialogFooter className="flex gap-3 sm:flex-row">
                <Button variant="outline" className="flex-1" onClick={() => setShowEditModal(false)}>
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

        {toast && <ToastMsg msg={toast.msg} type={toast.type} />}
      </div>
    </TooltipProvider>
  );
}
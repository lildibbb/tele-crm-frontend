"use client";

import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { CheckCircle } from "@phosphor-icons/react";
import gsap from "gsap";
import MobileShell from "./MobileShell";
import MobileMoreDrawer from "./MobileMoreDrawer";
import { useLeadsStore } from "@/store/leadsStore";
import type { Lead } from "@/store/leadsStore";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface MobileVerificationProps {
  readonly onMoreOpen?: () => void;
  readonly onApprove?: (id: string) => void;
  readonly onReject?: (id: string) => void;
}

// ── Derive VerificationItem from Lead ──────────────────────────────────────────
function toVerificationItem(lead: Lead) {
  return {
    id: lead.id,
    leadName: lead.displayName ?? "Unknown",
    leadId: `#TJ-${lead.id.slice(-4)}`,
    hfmId: lead.hfmBrokerId ?? "—",
    depositAmount: lead.depositBalance ?? "$0.00",
    submittedAt: lead.createdAt
      ? timeAgoShort(lead.createdAt)
      : "—",
    initials: (lead.displayName ?? "??")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
  };
}

function timeAgoShort(iso: string): string {
  const hrs = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000);
  if (hrs < 1) return "Just now";
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export interface VerificationItem {
  id: string;
  leadName: string;
  leadId: string;
  hfmId: string;
  depositAmount: string;
  submittedAt: string;
  initials: string;
}

// ── Swipe card ─────────────────────────────────────────────────────────────────
const SWIPE_THRESHOLD = 0.4;

interface SwipeCardProps {
  item: VerificationItem;
  onApprove: () => void;
  onReject: () => void;
}

function SwipeCard({ item, onApprove, onReject }: SwipeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const currentX = useRef(0);
  // Track active drag to prevent accidental swipe from pointerleave/pointercancel
  const isDragging = useRef(false);
  const [dragDirection, setDragDirection] = useState<"none" | "left" | "right">("none");
  const [dragRatio, setDragRatio] = useState(0);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    startX.current = e.clientX;
    currentX.current = 0;
    isDragging.current = true;
    setDragDirection("none");
    setDragRatio(0);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || !cardRef.current) return;
    const dx = e.clientX - startX.current;
    currentX.current = dx;
    const cardWidth = cardRef.current.offsetWidth;
    const ratio = Math.abs(dx) / cardWidth;
    setDragRatio(Math.min(ratio, 1));
    setDragDirection(dx > 0 ? "right" : dx < 0 ? "left" : "none");
    gsap.set(cardRef.current, { x: dx, rotation: dx * 0.04 });
  }, []);

  const handlePointerUp = useCallback(() => {
    if (!isDragging.current || !cardRef.current) return;
    isDragging.current = false;
    const cardWidth = cardRef.current.offsetWidth;
    const ratio = Math.abs(currentX.current) / cardWidth;
    if (ratio >= SWIPE_THRESHOLD) {
      const dir = currentX.current > 0 ? 1 : -1;
      gsap.to(cardRef.current, {
        x: dir * cardWidth * 1.5,
        opacity: 0,
        duration: 0.35,
        ease: "power2.in",
        onComplete: () => {
          if (dir > 0) onApprove();
          else onReject();
        },
      });
    } else {
      gsap.to(cardRef.current, {
        x: 0,
        rotation: 0,
        duration: 0.5,
        ease: "elastic.out(1, 0.5)",
      });
      setDragDirection("none");
      setDragRatio(0);
    }
    currentX.current = 0;
  }, [onApprove, onReject]);

  const handlePointerCancel = useCallback(() => {
    if (!isDragging.current || !cardRef.current) return;
    isDragging.current = false;
    currentX.current = 0;
    gsap.to(cardRef.current, { x: 0, rotation: 0, duration: 0.3, ease: "power2.out" });
    setDragDirection("none");
    setDragRatio(0);
  }, []);

  const approveOpacity = dragDirection === "right" ? dragRatio : 0;
  const rejectOpacity = dragDirection === "left" ? dragRatio : 0;

  return (
    <div
      ref={cardRef}
      className="relative rounded-2xl border border-border-subtle cursor-grab active:cursor-grabbing select-none bg-card shadow-sm"
      style={{ touchAction: "none" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      {/* Approve overlay */}
      <div
        className="absolute inset-0 rounded-2xl flex items-start justify-start p-6 pointer-events-none"
        style={{
          background: `color-mix(in srgb, var(--success) ${Math.round(approveOpacity * 35)}%, transparent)`,
          opacity: approveOpacity,
        }}
      >
        <span
          className="font-sans font-bold text-[24px] text-success border-4 border-success rounded-lg px-2 py-0.5"
          style={{ transform: "rotate(-10deg)" }}
        >
          ✓ APPROVE
        </span>
      </div>

      {/* Reject overlay */}
      <div
        className="absolute inset-0 rounded-2xl flex items-start justify-end p-6 pointer-events-none"
        style={{
          background: `color-mix(in srgb, var(--danger) ${Math.round(rejectOpacity * 35)}%, transparent)`,
          opacity: rejectOpacity,
        }}
      >
        <span
          className="font-sans font-bold text-[24px] text-danger border-4 border-danger rounded-lg px-2 py-0.5"
          style={{ transform: "rotate(10deg)" }}
        >
          ✗ REJECT
        </span>
      </div>

      {/* Card content */}
      <div className="flex flex-col items-center gap-3 p-6">
        <div className="flex items-center justify-between w-full">
          <span className="font-mono text-[12px] text-text-muted">{item.leadId}</span>
          <span className="font-mono text-[11px] text-text-muted">{item.submittedAt}</span>
        </div>

        <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center bg-crimson-subtle">
          <span className="font-display font-bold text-[20px] text-text-primary">{item.initials}</span>
        </div>

        <div className="text-center">
          <div className="font-display font-bold text-[18px] text-text-primary">{item.leadName}</div>
          <div className="font-mono text-[13px] text-text-secondary mt-0.5">HFM: {item.hfmId}</div>
        </div>

        <div className="w-full border-t border-border-subtle my-1" />

        <div className="flex flex-col items-center gap-1">
          <span className="font-display font-bold text-[28px] text-gold">{item.depositAmount}</span>
          <span className="font-sans font-medium text-[11px] uppercase tracking-wider text-warning">
            DEPOSIT REPORTED
          </span>
        </div>

        <div className="w-20 h-20 rounded-xl flex items-center justify-center bg-elevated">
          <span className="font-sans text-[10px] text-text-muted">📄 Receipt</span>
        </div>
      </div>
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────────
function EmptyState({ todayCount }: { todayCount: number }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <CheckCircle size={64} className="text-success" weight="fill" />
      <span className="font-display font-bold text-[24px] text-text-primary">All done!</span>
      <span className="font-sans text-[14px] text-text-secondary">No pending verifications</span>
      <span className="font-sans font-medium text-[13px] text-success">
        {todayCount} verified today
      </span>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function MobileVerification({
  onMoreOpen,
  onApprove,
  onReject,
}: MobileVerificationProps) {
  const { leads, isLoading, fetchLeads, verifyLead, updateStatus } = useLeadsStore();
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    fetchLeads({ skip: 0, take: 50, status: "DEPOSIT_REPORTED", orderBy: "createdAt", order: "desc" });
  }, [fetchLeads]);

  // ── Stable derived data (no new array ref every render) ────────────────────
  const pendingLeads = useMemo(
    () => leads.filter((l) => l.status === "DEPOSIT_REPORTED"),
    [leads],
  );

  // Track IDs acted on locally for optimistic removal (no useState-in-useEffect)
  const [processedIds, setProcessedIds] = useState<Set<string>>(new Set());
  const [todayCount, setTodayCount] = useState(0);

  // Derive queue from stable memoized source — no useEffect needed
  const queue = useMemo(
    () => pendingLeads.filter((l) => !processedIds.has(l.id)).map(toVerificationItem),
    [pendingLeads, processedIds],
  );

  const [toast, setToast] = useState<{ msg: string; type: "approve" | "reject" } | null>(null);

  const handleApprove = useCallback(
    async (id: string) => {
      setProcessedIds((prev) => new Set(prev).add(id));
      setTodayCount((c) => c + 1);
      setToast({ msg: "✓ Lead approved", type: "approve" });
      onApprove?.(id);
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([8, 40, 8]);
      try { await verifyLead(id); } catch {}
      setTimeout(() => setToast(null), 4000);
    },
    [onApprove, verifyLead],
  );

  const handleReject = useCallback(
    async (id: string) => {
      setProcessedIds((prev) => new Set(prev).add(id));
      setToast({ msg: "✗ Lead rejected", type: "reject" });
      onReject?.(id);
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(30);
      try { await updateStatus(id, { status: "REJECTED" }); } catch {}
      setTimeout(() => setToast(null), 4000);
    },
    [onReject, updateStatus],
  );

  return (
    <>
      <MobileShell
        activeTab="verify"
        pageTitle="Verification Queue"
        verifyBadgeCount={queue.length}
        showLiveDot
        onTabChange={(tab) => {
          if (tab === "more") { setMoreOpen(true); onMoreOpen?.(); }
        }}
      >
      <div className="pb-6">
        {/* Stats bar */}
        <div className="flex items-center gap-4 px-4 py-3 border-b border-border-subtle">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-warning" />
            <span className="font-sans font-semibold text-[14px] text-text-primary">
              {isLoading ? "…" : `${queue.length} Pending`}
            </span>
          </span>
          <span className="w-px h-4 bg-border-subtle" />
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success" />
            <span className="font-sans text-[13px] text-text-secondary">{todayCount} Today</span>
          </span>
        </div>

        {isLoading && queue.length === 0 ? (
          <div className="px-4 pt-4">
            <div className="h-64 rounded-2xl bg-card animate-pulse shadow-sm" />
          </div>
        ) : queue.length === 0 ? (
          <EmptyState todayCount={todayCount} />
        ) : (
          <div className="px-4 pt-4 flex flex-col gap-4">
            {/* Card stack */}
            <div className="relative">
              {queue[1] && (
                <div
                  className="absolute inset-x-0 rounded-2xl border border-border-subtle h-32 bg-elevated"
                  style={{ transform: "scale(0.96) translateY(8px)", opacity: 0.6, zIndex: 0, top: "8px" }}
                />
              )}
              {queue[0] && (
                <div className="relative z-10">
                  <SwipeCard
                    key={queue[0].id}
                    item={queue[0]}
                    onApprove={() => handleApprove(queue[0].id)}
                    onReject={() => handleReject(queue[0].id)}
                  />
                </div>
              )}
            </div>

            {/* Manual action buttons */}
            {queue[0] && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleReject(queue[0].id)}
                  className="flex-1 h-[52px] rounded-xl font-sans font-semibold text-[15px] border border-danger text-danger active:scale-[0.97] transition-transform"
                >
                  ✗ Reject
                </button>
                <button
                  onClick={() => handleApprove(queue[0].id)}
                  className="flex-1 h-[52px] rounded-xl font-sans font-semibold text-[15px] bg-success text-white active:scale-[0.97] transition-transform"
                >
                  ✓ Approve
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={cn(
            "fixed left-4 right-4 z-50 flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-sans font-medium text-[14px] shadow-2xl",
            toast.type === "approve" ? "bg-success text-white" : "bg-danger text-white",
          )}
          style={{ bottom: "calc(56px + env(safe-area-inset-bottom) + 16px)" }}
        >
          <span>{toast.msg}</span>
          <button className="text-[13px] font-semibold underline opacity-80" onClick={() => setToast(null)}>
            Undo
          </button>
        </div>
      )}
      </MobileShell>
      <MobileMoreDrawer open={moreOpen} onClose={() => setMoreOpen(false)} />
    </>
  );
}

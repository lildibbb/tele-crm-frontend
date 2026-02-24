"use client";

import React, { useState, useRef, useCallback } from "react";
import { ShieldCheck, CheckCircle } from "@phosphor-icons/react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import MobileShell from "./MobileShell";
import { UserRole } from "@/types/enums";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface VerificationItem {
  id: string;
  leadName: string;
  leadId: string;
  hfmId: string;
  depositAmount: string;
  submittedAt: string;
  initials: string;
}

export interface MobileVerificationProps {
  readonly role?: UserRole;
  readonly items?: VerificationItem[];
  readonly pendingCount?: number;
  readonly todayCount?: number;
  readonly weekCount?: number;
  readonly onMoreOpen?: () => void;
  readonly onApprove?: (id: string) => void;
  readonly onReject?: (id: string) => void;
}

// ── Mock data ──────────────────────────────────────────────────────────────────
const MOCK_ITEMS: VerificationItem[] = [
  {
    id: "v1",
    leadName: "Muhammad Hafiz",
    leadId: "#TJ-1284",
    hfmId: "1029384",
    depositAmount: "$500.00",
    submittedAt: "2h ago",
    initials: "MH",
  },
  {
    id: "v2",
    leadName: "Siti Aminah",
    leadId: "#TJ-1283",
    hfmId: "HFM-77332",
    depositAmount: "$1,200.00",
    submittedAt: "4h ago",
    initials: "SA",
  },
  {
    id: "v3",
    leadName: "Daniel Kumar",
    leadId: "#TJ-1281",
    hfmId: "HFM-55231",
    depositAmount: "$350.00",
    submittedAt: "6h ago",
    initials: "DK",
  },
];

// ── Swipe card ─────────────────────────────────────────────────────────────────
const SWIPE_THRESHOLD = 0.4; // 40% of card width

interface SwipeCardProps {
  item: VerificationItem;
  onApprove: () => void;
  onReject: () => void;
}

function SwipeCard({ item, onApprove, onReject }: SwipeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const currentX = useRef(0);
  const [dragDirection, setDragDirection] = useState<"none" | "left" | "right">(
    "none",
  );
  const [dragRatio, setDragRatio] = useState(0);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    startX.current = e.clientX;
    currentX.current = 0;
    setDragDirection("none");
    setDragRatio(0);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!cardRef.current) return;
    const dx = e.clientX - startX.current;
    currentX.current = dx;
    const cardWidth = cardRef.current.offsetWidth;
    const ratio = Math.abs(dx) / cardWidth;
    setDragRatio(Math.min(ratio, 1));
    setDragDirection(dx > 0 ? "right" : dx < 0 ? "left" : "none");
    gsap.set(cardRef.current, {
      x: dx,
      rotation: dx * 0.04,
    });
  }, []);

  const handlePointerUp = useCallback(() => {
    if (!cardRef.current) return;
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
      // Spring back
      gsap.to(cardRef.current, {
        x: 0,
        rotation: 0,
        duration: 0.5,
        ease: "elastic.out(1, 0.5)",
      });
      setDragDirection("none");
      setDragRatio(0);
    }
  }, [onApprove, onReject]);

  const approveOpacity = dragDirection === "right" ? dragRatio : 0;
  const rejectOpacity = dragDirection === "left" ? dragRatio : 0;

  return (
    <div
      ref={cardRef}
      className="relative rounded-2xl border border-[#2A2A42] cursor-grab active:cursor-grabbing select-none"
      style={{ background: "#141422", touchAction: "none" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Approve overlay */}
      <div
        className="absolute inset-0 rounded-2xl flex items-start justify-start p-6 pointer-events-none"
        style={{
          background: `rgba(34,211,160,${approveOpacity * 0.35})`,
          opacity: approveOpacity,
        }}
      >
        <span
          className="font-sans font-bold text-[24px] text-[#22D3A0] border-4 border-[#22D3A0] rounded-lg px-2 py-0.5"
          style={{ transform: "rotate(-10deg)" }}
        >
          ✓ APPROVE
        </span>
      </div>

      {/* Reject overlay */}
      <div
        className="absolute inset-0 rounded-2xl flex items-start justify-end p-6 pointer-events-none"
        style={{
          background: `rgba(239,68,68,${rejectOpacity * 0.35})`,
          opacity: rejectOpacity,
        }}
      >
        <span
          className="font-sans font-bold text-[24px] text-[#EF4444] border-4 border-[#EF4444] rounded-lg px-2 py-0.5"
          style={{ transform: "rotate(10deg)" }}
        >
          ✗ REJECT
        </span>
      </div>

      {/* Card content */}
      <div className="flex flex-col items-center gap-3 p-6">
        <div className="flex items-center justify-between w-full">
          <span className="font-mono text-[12px] text-[#555570]">
            {item.leadId}
          </span>
          <span className="font-mono text-[11px] text-[#555570]">
            {item.submittedAt}
          </span>
        </div>

        {/* Avatar */}
        <div
          className="w-[52px] h-[52px] rounded-full flex items-center justify-center"
          style={{ background: "#C4232D22" }}
        >
          <span className="font-display font-bold text-[20px] text-[#F0F0FF]">
            {item.initials}
          </span>
        </div>

        <div className="text-center">
          <div className="font-display font-bold text-[18px] text-[#F0F0FF]">
            {item.leadName}
          </div>
          <div className="font-mono text-[13px] text-[#8888AA] mt-0.5">
            HFM: {item.hfmId}
          </div>
        </div>

        <div className="w-full border-t border-[#2A2A42] my-1" />

        <div className="flex flex-col items-center gap-1">
          <span className="font-display font-bold text-[28px] text-[#E8B94F]">
            {item.depositAmount}
          </span>
          <span
            className="font-sans font-medium text-[11px] uppercase tracking-wider"
            style={{ color: "#F59E0B" }}
          >
            DEPOSIT REPORTED
          </span>
        </div>

        {/* Receipt placeholder */}
        <div
          className="w-20 h-20 rounded-xl flex items-center justify-center"
          style={{ background: "#1C1C2E" }}
        >
          <span className="font-sans text-[10px] text-[#555570]">
            📄 Receipt
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────────
function EmptyState({ todayCount }: { todayCount: number }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <CheckCircle size={64} className="text-[#22D3A0]" weight="fill" />
      <span className="font-display font-bold text-[24px] text-[#F0F0FF]">
        All done!
      </span>
      <span className="font-sans text-[14px] text-[#8888AA]">
        No pending verifications
      </span>
      <span className="font-sans font-medium text-[13px] text-[#22D3A0]">
        {todayCount} verified today
      </span>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function MobileVerification({
  role = "OWNER",
  items,
  pendingCount = 5,
  todayCount = 8,
  weekCount = 23,
  onMoreOpen,
  onApprove,
  onReject,
}: MobileVerificationProps) {
  const [queue, setQueue] = useState<VerificationItem[]>(items ?? MOCK_ITEMS);
  const [toast, setToast] = useState<{
    msg: string;
    type: "approve" | "reject";
  } | null>(null);

  const handleApprove = useCallback(
    (id: string) => {
      setQueue((prev) => prev.filter((i) => i.id !== id));
      setToast({ msg: "✓ Lead approved", type: "approve" });
      onApprove?.(id);
      setTimeout(() => setToast(null), 4000);
    },
    [onApprove],
  );

  const handleReject = useCallback(
    (id: string) => {
      setQueue((prev) => prev.filter((i) => i.id !== id));
      setToast({ msg: "✗ Lead rejected", type: "reject" });
      onReject?.(id);
      setTimeout(() => setToast(null), 4000);
    },
    [onReject],
  );

  const currentItem = queue[0];
  const backItem = queue[1];

  return (
    <MobileShell
      role={role}
      activeTab="verify"
      pageTitle="Verification Queue"
      notificationCount={0}
      verifyBadgeCount={queue.length}
      userInitials="TJ"
      showLiveDot
      onTabChange={(tab) => tab === "more" && onMoreOpen?.()}
    >
      <div className="pb-6">
        {/* Stats bar */}
        <div className="flex items-center gap-4 px-4 py-3 border-b border-[#2A2A42]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
            <span className="font-sans font-semibold text-[14px] text-[#F0F0FF]">
              {queue.length} Pending
            </span>
          </span>
          <span className="w-px h-4 bg-[#2A2A42]" />
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#22D3A0]" />
            <span className="font-sans text-[13px] text-[#8888AA]">
              {todayCount} Today
            </span>
          </span>
          <span className="w-px h-4 bg-[#2A2A42]" />
          <span className="font-sans text-[13px] text-[#8888AA]">
            {weekCount} This Week
          </span>
        </div>

        {queue.length === 0 ? (
          <EmptyState todayCount={todayCount} />
        ) : (
          <div className="px-4 pt-4 flex flex-col gap-4">
            {/* Card stack */}
            <div className="relative">
              {/* Back card peek */}
              {backItem && (
                <div
                  className="absolute inset-x-0 rounded-2xl border border-[#2A2A42] h-32"
                  style={{
                    background: "#1C1C2E",
                    transform: "scale(0.96) translateY(8px)",
                    opacity: 0.6,
                    zIndex: 0,
                    top: "8px",
                  }}
                />
              )}
              {/* Front card */}
              {currentItem && (
                <div className="relative z-10">
                  <SwipeCard
                    item={currentItem}
                    onApprove={() => handleApprove(currentItem.id)}
                    onReject={() => handleReject(currentItem.id)}
                  />
                </div>
              )}
            </div>

            {/* Swipe hints */}
            <div className="flex items-center justify-center gap-4">
              <span
                className="flex items-center gap-1 rounded-full px-3 h-8 font-sans text-[13px] font-medium text-[#EF4444]"
                style={{ background: "#EF44441A" }}
              >
                ← Reject
              </span>
              <span
                className="flex items-center gap-1 rounded-full px-3 h-8 font-sans text-[13px] font-medium text-[#22D3A0]"
                style={{ background: "#22D3A01A" }}
              >
                Approve →
              </span>
            </div>

            {/* Manual buttons */}
            {currentItem && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleReject(currentItem.id)}
                  className="flex-1 h-[52px] rounded-xl font-sans font-semibold text-[15px]
                             border border-[#EF4444] text-[#EF4444] active:scale-[0.97] transition-transform"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(currentItem.id)}
                  className="flex-1 h-[52px] rounded-xl font-sans font-semibold text-[15px] text-[#080810]
                             active:scale-[0.97] transition-transform"
                  style={{ background: "#22D3A0" }}
                >
                  Approve
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
            "fixed left-4 right-4 z-50 flex items-center justify-between gap-3 px-4 py-3 rounded-xl",
            "font-sans font-medium text-[14px] text-white shadow-2xl",
          )}
          style={{
            bottom: "calc(56px + env(safe-area-inset-bottom) + 16px)",
            background: toast.type === "approve" ? "#22D3A0" : "#EF4444",
          }}
        >
          <span>{toast.msg}</span>
          <button
            className="text-white text-[13px] font-semibold underline"
            onClick={() => setToast(null)}
          >
            Undo
          </button>
        </div>
      )}
    </MobileShell>
  );
}

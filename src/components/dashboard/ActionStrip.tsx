"use client";

import React from "react";
import Link from "next/link";
import { Warning, ArrowsLeftRight, CaretRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

// ── Types ──────────────────────────────────────────────────────
interface ActionStripProps {
  pendingVerifications: number;
  handoverLeadsCount: number;
  labels: {
    pendingTitle: string;
    awaitingReview: string;
    review: string;
    handoverTitle: string;
    manualReplies: string;
    view: string;
  };
}

// ── Component ──────────────────────────────────────────────────
export const ActionStrip = React.memo(function ActionStrip({
  pendingVerifications,
  handoverLeadsCount,
  labels,
}: ActionStripProps) {
  return (
    <div className="page-section bg-elevated rounded-xl overflow-hidden border border-border-subtle shadow-sm">
      <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-border-subtle">
        <Button
          variant="ghost"
          asChild
          className="flex-1 h-auto px-5 py-3.5 justify-start rounded-none hover:bg-void/40 gap-3"
        >
          <Link href="/verification">
            <div className="flex-shrink-0">
              <Warning size={16} weight="duotone" className="text-warning" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <span className="font-sans font-semibold text-[13px] text-text-primary">
                {labels.pendingTitle}
              </span>
              <span className="hidden sm:inline text-text-muted text-[12px] font-sans ml-2">
                · {labels.awaitingReview}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {pendingVerifications > 0 && (
                <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-warning/15 border border-warning/30 text-warning text-[11px] font-bold tabular-nums">
                  {pendingVerifications}
                </span>
              )}
              <span className="flex items-center gap-0.5 text-warning text-[12px] font-medium group-hover:gap-1.5 transition-all whitespace-nowrap">
                {labels.review} <CaretRight size={13} weight="bold" />
              </span>
            </div>
          </Link>
        </Button>
        <Button
          variant="ghost"
          asChild
          className="flex-1 h-auto px-5 py-3.5 justify-start rounded-none hover:bg-void/40 gap-3"
        >
          <Link href="/leads?handover=true">
            <div className="flex-shrink-0">
              <ArrowsLeftRight
                size={16}
                weight="duotone"
                className="text-info"
              />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <span className="font-sans font-semibold text-[13px] text-text-primary">
                {labels.handoverTitle}
              </span>
              <span className="hidden sm:inline text-text-muted text-[12px] font-sans ml-2">
                · {labels.manualReplies}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {handoverLeadsCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-info/15 border border-info/30 text-info text-[11px] font-bold tabular-nums">
                  {handoverLeadsCount}
                </span>
              )}
              <span className="flex items-center gap-0.5 text-info text-[12px] font-medium group-hover:gap-1.5 transition-all whitespace-nowrap">
                {labels.view} <CaretRight size={13} weight="bold" />
              </span>
            </div>
          </Link>
        </Button>
      </div>
    </div>
  );
});

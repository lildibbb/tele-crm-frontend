"use client";

import React from "react";
import Link from "next/link";
import { Clock } from "@phosphor-icons/react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LEAD_STATUS_BADGE } from "@/lib/badge-config";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────
export interface ActivityRow {
  id: string;
  name: string;
  subtitle: string;
  status:
    | "NEW"
    | "DEPOSIT_REPORTED"
    | "DEPOSIT_CONFIRMED"
    | "CONTACTED"
    | "REJECTED";
  amount?: string;
  time: string;
}

interface LiveActivityFeedProps {
  rows: ActivityRow[];
  labels: {
    title: string;
    viewAll: string;
  };
  t: (key: string) => string;
}

// ── Component ──────────────────────────────────────────────────
export const LiveActivityFeed = React.memo(function LiveActivityFeed({
  rows,
  labels,
  t,
}: LiveActivityFeedProps) {
  return (
    <div className="xl:col-span-3 bg-elevated rounded-[20px] border border-border-subtle flex flex-col overflow-hidden shadow-sm">
      <div className="flex flex-row items-center justify-between px-5 py-4 bg-card shadow-sm">
        <span className="font-sans font-semibold text-[15px] text-text-primary">
          {labels.title}
        </span>
        <Badge className="badge badge-live flex items-center gap-1.5">
          <span className="live-dot !w-1.5 !h-1.5" />
          LIVE
        </Badge>
      </div>
      <div className="flex-1 p-0">
        <div className="space-y-0.5 px-3 py-2">
          {rows.map((row) => {
            const badge = LEAD_STATUS_BADGE[row.status];
            return (
              <Link
                key={row.id}
                href={`/leads/${row.id}`}
                className="activity-row flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-void/40 transition-colors group"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] flex-shrink-0 border ${
                    row.status === "DEPOSIT_CONFIRMED"
                      ? "bg-emerald-500/15 border-emerald-500/25 text-emerald-400"
                      : row.status === "DEPOSIT_REPORTED"
                        ? "bg-amber-500/15 border-amber-500/25 text-amber-400"
                        : row.status === "CONTACTED"
                          ? "bg-blue-500/15 border-blue-500/25 text-blue-400"
                          : row.status === "REJECTED"
                            ? "bg-red-500/15 border-red-500/25 text-red-400"
                            : "bg-crimson/15 border-crimson/20 text-crimson"
                  }`}
                >
                  {row.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-sans font-medium text-text-primary truncate">
                    {row.name}
                  </p>
                  <p className="data-mono text-[11px] text-text-muted truncate">
                    {row.subtitle}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold",
                      badge.cls,
                    )}
                  >
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full flex-shrink-0",
                        badge.dotCls,
                      )}
                    />
                    {t(badge.labelKey)}
                  </span>
                  {row.amount && row.amount !== "—" && (
                    <span className="data-mono text-[11px] text-gold">
                      {row.amount}
                    </span>
                  )}
                </div>
                <div className="hidden sm:flex items-center gap-1 text-text-muted text-[11px] font-sans flex-shrink-0">
                  <Clock size={11} weight="regular" />
                  {row.time}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      <div className="px-5 py-3 border-t border-border-subtle">
        <Button
          variant="link"
          asChild
          className="text-crimson p-0 h-auto text-xs font-sans font-medium"
        >
          <Link href="/leads">
            {labels.viewAll}
            <ArrowUpRight size={12} weight="bold" className="ml-1" />
          </Link>
        </Button>
      </div>
    </div>
  );
});

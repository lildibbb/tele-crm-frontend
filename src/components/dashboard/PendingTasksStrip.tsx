"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Clock, ArrowRight, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { usePendingTasksList } from "@/queries/usePendingTasksQuery";
import { PendingTaskStatus } from "@/types/enums";
import { PendingTaskCard } from "./PendingTaskCard";

// ── Types ──────────────────────────────────────────────────────

interface PendingTasksStripProps {
  /** Maximum number of task cards to display */
  maxCards?: number;
}

// ── Loading Skeleton ───────────────────────────────────────────

function StripSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton
          key={i}
          className="w-[200px] h-[240px] rounded-xl flex-shrink-0"
        />
      ))}
    </div>
  );
}

// ── Empty State ────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex items-center gap-4 px-6 py-8 bg-elevated rounded-xl border border-border-subtle">
      <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
        <Sparkles className="h-5 w-5 text-success" />
      </div>
      <div>
        <p className="font-sans font-semibold text-sm text-text-primary">
          All caught up!
        </p>
        <p className="font-sans text-xs text-text-secondary mt-0.5">
          No pending tasks require your attention right now.
        </p>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────

export const PendingTasksStrip = React.memo(function PendingTasksStrip({
  maxCards = 10,
}: PendingTasksStripProps) {
  const { data, isLoading } = usePendingTasksList({
    status: PendingTaskStatus.PENDING,
    take: maxCards,
  });

  const tasks = data?.data ?? [];
  const totalPending = data?.total ?? 0;

  // Build a leadId → leadName map from task data
  // (The list endpoint doesn't return lead data, so we use leadId as fallback)
  const leadNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const task of tasks) {
      if (!map.has(task.leadId)) {
        map.set(task.leadId, task.leadId.slice(0, 8));
      }
    }
    return map;
  }, [tasks]);

  return (
    <div className="page-section space-y-3">
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
            <Clock className="h-4 w-4 text-warning" />
          </div>
          <div>
            <h3 className="font-sans font-semibold text-sm text-text-primary">
              Pending Tasks
            </h3>
            <p className="font-sans text-[11px] text-text-muted">
              Media requiring your review
            </p>
          </div>
          {totalPending > 0 && (
            <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-warning/15 border border-warning/30 text-warning text-[11px] font-bold tabular-nums ml-1">
              {totalPending}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="gap-1 text-text-secondary hover:text-text-primary"
        >
          <Link href="/pending-tasks" prefetch={false}>
            View All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      {/* ── Cards ─────────────────────────────────────────── */}
      {isLoading ? (
        <StripSkeleton />
      ) : tasks.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border-default/50 hover:scrollbar-thumb-border-default">
          {tasks.map((task, i) => (
            <PendingTaskCard
              key={task.id}
              task={task}
              leadId={task.leadId}
              leadName={leadNameMap.get(task.leadId) ?? null}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
});

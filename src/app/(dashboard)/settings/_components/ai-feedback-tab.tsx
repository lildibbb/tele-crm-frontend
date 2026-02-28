"use client";
import { useCallback, useEffect, useState } from "react";
import { Brain, ThumbsUp, ThumbsDown, Star, SpinnerGap } from "@phosphor-icons/react";
import { aiFeedbackApi } from "@/lib/api/aiFeedback";
import type { AiFeedback } from "@/lib/schemas/aiFeedback.schema";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 20;

function RatingBadge({ rating }: { rating: 1 | 5 }) {
  return rating === 5 ? (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border bg-success/10 text-success border-success/20">
      <ThumbsUp className="h-3 w-3" weight="fill" /> Good
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border bg-danger/10 text-danger border-danger/20">
      <ThumbsDown className="h-3 w-3" weight="fill" /> Bad
    </span>
  );
}

export function AiFeedbackTab() {
  const [items, setItems] = useState<AiFeedback[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [promotingId, setPromotingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (s: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await aiFeedbackApi.findMany({ skip: s, take: PAGE_SIZE });
      const outer = res.data as unknown as { data: { data: AiFeedback[]; total?: number } | AiFeedback[] };
      let arr: AiFeedback[];
      let count: number;
      if (Array.isArray(outer.data)) {
        arr = outer.data;
        count = arr.length;
      } else {
        arr = (outer.data as { data: AiFeedback[] }).data ?? [];
        count = (outer.data as { total?: number }).total ?? arr.length;
      }
      setItems(arr);
      setTotal(count);
    } catch {
      setError("Could not load AI feedback. SUPERADMIN role required.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(skip);
  }, [skip, load]);

  const handleToggleFewShot = async (item: AiFeedback) => {
    setPromotingId(item.id);
    try {
      await aiFeedbackApi.toggleFewShot(item.id, !item.usedAsFewShot);
      setItems((prev) =>
        prev.map((f) =>
          f.id === item.id ? { ...f, usedAsFewShot: !f.usedAsFewShot } : f,
        ),
      );
    } catch {
      setError("Failed to update few-shot status.");
    } finally {
      setPromotingId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.floor(skip / PAGE_SIZE);

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/20 flex items-center justify-center flex-shrink-0">
          <Brain className="h-4.5 w-4.5 text-accent" weight="duotone" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-sm text-text-primary">AI Feedback</h3>
          <p className="font-sans text-xs text-text-secondary">
            Bot conversation ratings. Promote good replies as few-shot examples.
          </p>
        </div>
        <span className="ml-auto text-[10px] font-mono text-text-muted bg-card px-2 py-0.5 rounded-full border border-border-subtle shadow-sm">
          SUPERADMIN
        </span>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-xs font-sans">
          {error}
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border-subtle overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-border-subtle flex items-center justify-between">
          <span className="font-sans text-xs font-medium text-text-secondary">{total} entries</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void load(skip)}
            disabled={isLoading}
            className="h-7 text-xs text-text-muted gap-1.5"
          >
            {isLoading ? <SpinnerGap className="h-3 w-3 animate-spin" /> : null}
            Refresh
          </Button>
        </div>

        {isLoading && items.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-text-muted">
            <Brain className="h-8 w-8 opacity-30" />
            <p className="font-sans text-sm">No feedback yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border-subtle">
            {items.map((item) => (
              <div key={item.id} className="px-5 py-4 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <RatingBadge rating={item.rating} />
                  {item.usedAsFewShot && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border bg-warning/10 text-warning border-warning/20">
                      <Star className="h-3 w-3" weight="fill" /> Few-Shot
                    </span>
                  )}
                  <span className="ml-auto font-mono text-[10px] text-text-muted">
                    {new Date(item.createdAt).toLocaleDateString("en-GB")}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="bg-elevated rounded-lg p-3 border border-border-subtle">
                    <p className="font-sans text-[10px] text-text-muted mb-1">User</p>
                    <p className="font-sans text-xs text-text-primary line-clamp-3">{item.userMessage}</p>
                  </div>
                  <div className="bg-elevated rounded-lg p-3 border border-border-subtle">
                    <p className="font-sans text-[10px] text-text-muted mb-1">Bot</p>
                    <p className="font-sans text-xs text-text-primary line-clamp-3">{item.botReply}</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant={item.usedAsFewShot ? "outline" : "ghost"}
                    className={`h-7 text-xs gap-1.5 ${item.usedAsFewShot ? "text-warning border-warning/30 hover:bg-warning/10" : "text-text-muted hover:text-text-primary"}`}
                    onClick={() => void handleToggleFewShot(item)}
                    disabled={promotingId === item.id}
                  >
                    {promotingId === item.id ? (
                      <SpinnerGap className="h-3 w-3 animate-spin" />
                    ) : (
                      <Star className="h-3 w-3" weight={item.usedAsFewShot ? "fill" : "regular"} />
                    )}
                    {item.usedAsFewShot ? "Remove Few-Shot" : "Promote to Few-Shot"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-border-subtle flex items-center justify-between">
            <Button
              variant="ghost" size="sm"
              disabled={page === 0}
              onClick={() => setSkip(Math.max(0, skip - PAGE_SIZE))}
              className="text-xs"
            >
              Previous
            </Button>
            <span className="font-sans text-xs text-text-muted">
              Page {page + 1} of {totalPages}
            </span>
            <Button
              variant="ghost" size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setSkip(skip + PAGE_SIZE)}
              className="text-xs"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

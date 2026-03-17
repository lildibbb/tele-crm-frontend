"use client";

import { memo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, FileText, Loader2 } from "lucide-react";
import { FileTypeBadge } from "@/components/ui/file-type-badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUpdatePendingTaskStatus } from "@/queries/usePendingTasksQuery";
import type { PendingTask } from "@/lib/schemas/pendingTask.schema";
import {
  TelegramLogo,
  IdentificationCard,
  Phone,
  EnvelopeSimple,
} from "@phosphor-icons/react";

// ── Types ──────────────────────────────────────────────────────

interface PendingTaskCardProps {
  task: PendingTask;
  leadName: string | null;
  leadId: string;
  /** Stagger delay for entry animation */
  index: number;
}

// ── Helpers ────────────────────────────────────────────────────

function isImageMime(mime: string | null | undefined): boolean {
  return !!mime?.startsWith("image/");
}

function isVideoMime(mime: string | null | undefined): boolean {
  return !!mime?.startsWith("video/");
}

// ── Component ──────────────────────────────────────────────────

function PendingTaskCardInner({
  task,
  leadName,
  leadId,
  index,
}: PendingTaskCardProps) {
  const updateStatus = useUpdatePendingTaskStatus();
  const [imgError, setImgError] = useState(false);
  const attachment = task.attachment;
  const mime = attachment?.mimeType;

  const handleAction = (status: "RESOLVED" | "DISMISSED") => {
    updateStatus.mutate({
      id: task.id,
      data: { status },
    });
  };

  const isActing = updateStatus.isPending;

  return (
    <div
      className="group w-[230px] flex-shrink-0 snap-start bg-elevated rounded-xl border border-border-subtle shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-border-default hover:-translate-y-1 animate-in-up flex flex-col"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* ── Thumbnail area ─────────────────────────────────── */}
      <div className="relative h-[130px] bg-void/50 overflow-hidden flex-shrink-0">
        {attachment && isImageMime(mime) && !imgError ? (
          <img
            src={attachment.fileUrl}
            alt={task.caption ?? "Pending task"}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : attachment && isVideoMime(mime) ? (
          <video
            src={attachment.fileUrl}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : attachment?.mimeType ? (
          <div className="w-full h-full flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
            <FileTypeBadge mimeType={mime} size={48} />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
              <FileText className="h-6 w-6 text-text-muted/60" />
            </div>
          </div>
        )}

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 opacity-70 group-hover:opacity-90 transition-opacity duration-300" />

        {/* Caption overlay */}
        <div className="absolute bottom-2 left-3 right-3">
          <p className="text-[11px] font-sans font-medium text-white line-clamp-2 leading-snug drop-shadow-md">
            {task.caption || "No caption"}
          </p>
        </div>
      </div>

      {/* ── Content area ────────────────────────────────── */}
      <div className="p-3.5 flex flex-col gap-3 flex-1">
        {/* Lead Identity Block */}
        <div className="space-y-1.5">
          <Link
            href={`/leads/detail?id=${leadId}`}
            className="flex items-center gap-1.5 group/link"
            prefetch={false}
          >
            <div className="w-5 h-5 rounded-full bg-[#2AABEE]/10 flex items-center justify-center flex-shrink-0">
              <TelegramLogo weight="fill" className="text-[#2AABEE] w-3 h-3" />
            </div>
            <span className="text-[13px] font-sans font-semibold text-text-primary truncate group-hover/link:text-crimson transition-colors">
              {task.lead?.username
                ? `@${task.lead.username}`
                : (leadName ?? "unknown")}
            </span>
          </Link>

          {/* User Metadata */}
          <div className="flex flex-col gap-1 pl-6">
            {task.lead?.hfmBrokerId && (
              <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                <IdentificationCard
                  weight="duotone"
                  className="w-3.5 h-3.5 flex-shrink-0 opacity-70"
                />
                <span className="truncate font-mono tracking-tight">
                  {task.lead.hfmBrokerId}
                </span>
              </div>
            )}
            {task.lead?.phoneNumber && (
              <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                <Phone
                  weight="duotone"
                  className="w-3.5 h-3.5 flex-shrink-0 opacity-70"
                />
                <span className="truncate font-mono tracking-tight">
                  {task.lead.phoneNumber}
                </span>
              </div>
            )}
            {task.lead?.email && (
              <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                <EnvelopeSimple
                  weight="duotone"
                  className="w-3.5 h-3.5 flex-shrink-0 opacity-70"
                />
                <span className="truncate font-mono tracking-tight">
                  {task.lead.email}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1" />

        {/* Footer Area: Meta + Actions */}
        <div className="pt-2 border-t border-border-subtle/50 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-[10px] text-text-muted/60 font-mono">
            <span>
              {new Date(task.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
              })}
            </span>
            <span>
              {new Date(task.createdAt).toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <div className="flex gap-1.5">
            <Button
              size="xs"
              variant="ghost"
              disabled={isActing}
              onClick={() => handleAction("RESOLVED")}
              className={cn(
                "flex-1 gap-1 text-[11px] font-medium rounded-lg h-7.5 bg-success/10",
                "text-success hover:bg-success/20 hover:text-success hover:scale-[1.02] transition-all",
              )}
            >
              {isActing ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3 w-3" />
              )}
              Approve
            </Button>
            <Button
              size="xs"
              variant="ghost"
              disabled={isActing}
              onClick={() => handleAction("DISMISSED")}
              className="flex-1 gap-1 text-[11px] font-medium rounded-lg h-7.5 bg-void/50 text-text-muted hover:bg-danger/10 hover:text-danger hover:scale-[1.02] transition-all"
            >
              <XCircle className="h-3 w-3" />
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const PendingTaskCard = memo(PendingTaskCardInner);

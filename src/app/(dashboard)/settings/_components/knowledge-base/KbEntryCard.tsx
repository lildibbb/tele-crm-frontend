"use client";

import { memo } from "react";
import {
  Trash2,
  Edit3,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Clock3,
} from "lucide-react";
import { FileTypeBadge, FileTypeChip } from "@/components/ui/file-type-badge";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { KbStatus } from "@/types/enums";
import type { KbEntryCardProps } from "./kb.types";
import {
  resolveTypeConfig,
  resolveStatusConfig,
  resolveKbMime,
} from "./kb.constants";

function KbEntryCardInner({
  entry,
  index,
  onEdit,
  onDelete,
  onToggleActive,
  onRetry,
  isRetrying,
}: KbEntryCardProps) {
  const typeConf = resolveTypeConfig(entry.fileType, entry.type);
  const statusConf = resolveStatusConfig(entry.status);
  const TypeIcon = typeConf.icon;
  const mime = resolveKbMime(entry.fileType, entry.type);

  return (
    <div
      className="bg-elevated rounded-xl p-5 transition-all duration-200 animate-in-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start gap-4">
        {/* Icon: FileTypeBadge for MIME-mapped types; Lucide icon for others */}
        {mime ? (
          <div className="flex-shrink-0 mt-0.5">
            <FileTypeBadge mimeType={mime} size={36} />
          </div>
        ) : (
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: typeConf.iconBg }}
          >
            <TypeIcon
              className="h-4 w-4"
              style={{ color: typeConf.iconColor }}
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Status + type badges */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Badge
              className={cn("badge", statusConf.cls, "flex items-center gap-1")}
            >
              {entry.status === KbStatus.PROCESSING && (
                <Loader2 className="h-2.5 w-2.5 animate-spin" />
              )}
              {entry.status === KbStatus.PENDING && (
                <Clock3 className="h-2.5 w-2.5" />
              )}
              {entry.status === KbStatus.READY && (
                <CheckCircle2 className="h-2.5 w-2.5" />
              )}
              {entry.status === KbStatus.FAILED && (
                <AlertCircle className="h-2.5 w-2.5" />
              )}
              {statusConf.label}
            </Badge>
            {mime ? (
              <FileTypeChip mimeType={mime} size={20} />
            ) : (
              <Badge className={typeConf.badgeCls}>{typeConf.label}</Badge>
            )}
            {entry.mismatchFlag && (
              <Badge className="badge badge-warning flex items-center gap-1">
                <AlertCircle className="h-2.5 w-2.5" />
                Backend mismatch
              </Badge>
            )}
          </div>

          {/* Title + content preview */}
          <h3 className="font-sans font-semibold text-[14px] text-text-primary mb-1">
            {entry.title}
          </h3>
          <p className="text-xs font-sans text-text-secondary line-clamp-2 leading-relaxed">
            {entry.content}
          </p>
          {entry.mismatchFlag && (
            <p className="text-xs font-sans text-warning mt-2">
              Backend mismatch detected
              {entry.mismatchScore != null
                ? ` (${entry.mismatchScore.toFixed(2)})`
                : ""}
              .
            </p>
          )}

          {/* Footer: date + actions */}
          <div className="flex items-center justify-between gap-4 mt-3 pt-3 border-t border-border-subtle/50">
            <p className="data-mono text-[11px]">
              Created {new Date(entry.createdAt).toLocaleDateString()}
            </p>
            <div className="flex items-center gap-2">
              {entry.status === KbStatus.FAILED ? (
                <Button
                  size="xs"
                  className="gap-1"
                  onClick={() => onRetry(entry.id)}
                  disabled={isRetrying}
                >
                  {isRetrying ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <RotateCcw className="h-3 w-3" />
                  )}{" "}
                  {isRetrying ? "Retrying..." : "Retry"}
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-sans text-text-secondary">
                    {entry.isActive ? "Active" : "Inactive"}
                  </span>
                  <Switch
                    checked={entry.isActive}
                    onCheckedChange={() =>
                      entry.status !== KbStatus.PROCESSING &&
                      entry.status !== KbStatus.PENDING &&
                      onToggleActive(entry.id, entry.isActive)
                    }
                    disabled={
                      entry.status === KbStatus.PROCESSING ||
                      entry.status === KbStatus.PENDING
                    }
                    size="sm"
                  />
                </div>
              )}
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => onDelete(entry.id)}
                className="text-text-muted hover:text-danger hover:bg-danger/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
              {entry.status !== KbStatus.FAILED && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => onEdit(entry)}
                  className="text-text-muted hover:text-text-primary hover:bg-elevated"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Memoized KB entry card — re-renders only when entry data or callbacks change */
export const KbEntryCard = memo(KbEntryCardInner);

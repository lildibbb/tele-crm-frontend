import type React from "react";
import {
  UserPlus,
  ProhibitInset,
  ArrowCounterClockwise,
  PencilSimple,
  LockKey,
  CheckCircle,
  Database,
  Gear,
  X,
  ChatText,
  Pulse,
} from "@phosphor-icons/react";
import { AuditAction } from "@/types/enums";

export const auditIconMap: Partial<Record<AuditAction, React.ElementType>> = {
  USER_CREATED:           UserPlus,
  USER_DEACTIVATED:       ProhibitInset,
  USER_REACTIVATED:       ArrowCounterClockwise,
  USER_ROLE_CHANGED:      PencilSimple,
  PASSWORD_CHANGED:       LockKey,
  LEAD_STATUS_CHANGED:    CheckCircle,
  LEAD_VERIFIED:          CheckCircle,
  KB_CREATED:             Database,
  KB_UPDATED:             Gear,
  KB_DELETED:             X,
  COMMAND_MENU_CREATED:   ChatText,
  COMMAND_MENU_UPDATED:   Gear,
  COMMAND_MENU_DELETED:   X,
  SYSTEM_CONFIG_CHANGED:  Gear,
};

export const auditColorMap: Partial<Record<AuditAction, string>> = {
  USER_CREATED:          "text-info",
  USER_DEACTIVATED:      "text-danger",
  USER_REACTIVATED:      "text-success",
  USER_ROLE_CHANGED:     "text-gold",
  PASSWORD_CHANGED:      "text-warning",
  LEAD_VERIFIED:         "text-success",
  LEAD_STATUS_CHANGED:   "text-text-secondary",
  SYSTEM_CONFIG_CHANGED: "text-crimson",
  KB_DELETED:            "text-danger",
  COMMAND_MENU_DELETED:  "text-danger",
};

export const auditFallbackIcon = Pulse;

export function formatAuditAction(action: string): string {
  return action
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Compute a brief human-readable diff summary from before/after JSON.
 *  Returns e.g. "status: contacted → registered" or "+3 changes" */
export function computeChangeSummary(
  before: Record<string, unknown> | null | undefined,
  after: Record<string, unknown> | null | undefined,
): string {
  if (!before && !after) return "—";
  if (!before) return after ? `+${Object.keys(after).length} field(s) set` : "—";
  if (!after) return "—";

  const changed: string[] = [];
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const k of allKeys) {
    const bv = String(before[k] ?? "");
    const av = String(after[k] ?? "");
    if (bv !== av) changed.push(`${k}: ${bv} → ${av}`);
  }
  if (changed.length === 0) return "—";
  if (changed.length === 1) return changed[0];
  return `${changed[0]} +${changed.length - 1} more`;
}

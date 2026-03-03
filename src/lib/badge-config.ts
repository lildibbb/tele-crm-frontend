/**
 * Shared lead status badge configuration.
 * Maps LeadStatus values to Tailwind class names and i18n label keys.
 *
 * Uses inline Tailwind utilities for consistent styling across all pages
 * (leads, verification, broadcast, etc.) without relying on global CSS.
 */

export interface BadgeConfig {
  labelKey: string;
  /** Tailwind classes for badge background, text color, and ring */
  cls: string;
  /** Dot indicator color */
  dotCls: string;
}

export const LEAD_STATUS_BADGE: Record<string, BadgeConfig> = {
  NEW: {
    labelKey: "status.new",
    cls: "bg-blue-500/10 text-blue-700 dark:text-blue-400 ring-1 ring-inset ring-blue-500/20",
    dotCls: "bg-blue-500",
  },
  CONTACTED: {
    labelKey: "status.contacted",
    cls: "bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-1 ring-inset ring-amber-500/20",
    dotCls: "bg-amber-500",
  },
  DEPOSIT_REPORTED: {
    labelKey: "status.proofPending",
    cls: "bg-orange-500/10 text-orange-700 dark:text-orange-400 ring-1 ring-inset ring-orange-500/20",
    dotCls: "bg-orange-500",
  },
  DEPOSIT_CONFIRMED: {
    labelKey: "status.confirmed",
    cls: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-1 ring-inset ring-emerald-500/20",
    dotCls: "bg-emerald-500",
  },
  REJECTED: {
    labelKey: "status.rejected",
    cls: "bg-red-500/10 text-red-700 dark:text-red-400 ring-1 ring-inset ring-red-500/20",
    dotCls: "bg-red-500",
  },
};

/**
 * Broadcast status badge config — same visual language.
 */
export const BROADCAST_STATUS_BADGE: Record<string, BadgeConfig> = {
  QUEUED: {
    labelKey: "broadcast.status.queued",
    cls: "bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-1 ring-inset ring-amber-500/20",
    dotCls: "bg-amber-500 animate-pulse",
  },
  SENDING: {
    labelKey: "broadcast.status.sending",
    cls: "bg-blue-500/10 text-blue-700 dark:text-blue-400 ring-1 ring-inset ring-blue-500/20",
    dotCls: "bg-blue-500 animate-pulse",
  },
  SENT: {
    labelKey: "broadcast.status.sent",
    cls: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-1 ring-inset ring-emerald-500/20",
    dotCls: "bg-emerald-500",
  },
  FAILED: {
    labelKey: "broadcast.status.failed",
    cls: "bg-red-500/10 text-red-700 dark:text-red-400 ring-1 ring-inset ring-red-500/20",
    dotCls: "bg-red-500",
  },
};

/**
 * CSS class for user/team role badges in the audit log.
 */
export function roleBadgeCls(role: string | null | undefined): string {
  if (!role) return "bg-muted text-muted-foreground";
  switch (role.toUpperCase()) {
    case "SUPERADMIN":
      return "bg-red-500/10 text-red-700 dark:text-red-400 ring-1 ring-inset ring-red-500/20";
    case "OWNER":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-1 ring-inset ring-amber-500/20";
    case "ADMIN":
      return "bg-blue-500/10 text-blue-700 dark:text-blue-400 ring-1 ring-inset ring-blue-500/20";
    case "STAFF":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-1 ring-inset ring-emerald-500/20";
    default:
      return "bg-muted text-muted-foreground";
  }
}

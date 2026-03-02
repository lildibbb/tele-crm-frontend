/**
 * Shared lead status badge configuration.
 * Maps LeadStatus values to CSS class names and i18n label keys.
 */

export interface BadgeConfig {
  labelKey: string;
  cls: string;
}

export const LEAD_STATUS_BADGE: Record<string, BadgeConfig> = {
  NEW:               { labelKey: "status.new",        cls: "badge-new" },
  CONTACTED:         { labelKey: "status.contacted",  cls: "badge-contacted" },
  DEPOSIT_REPORTED:  { labelKey: "status.proofPending", cls: "badge-pending" },
  DEPOSIT_CONFIRMED: { labelKey: "status.confirmed",  cls: "badge-confirmed" },
  REJECTED:          { labelKey: "status.rejected",   cls: "badge-danger" },
};

/**
 * CSS class for user/team role badges in the audit log.
 */
export function roleBadgeCls(role: string | null | undefined): string {
  if (!role) return "bg-text-muted/10 text-text-muted";
  switch (role.toUpperCase()) {
    case "SUPERADMIN": return "bg-crimson/10 text-crimson";
    case "OWNER":      return "bg-gold/10 text-gold";
    case "ADMIN":      return "bg-info/10 text-info";
    case "STAFF":      return "bg-success/10 text-success";
    default:           return "bg-text-muted/10 text-text-muted";
  }
}

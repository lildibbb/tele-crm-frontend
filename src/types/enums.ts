// ── User Role ────────────────────────────────────────────────────────────────
export const UserRole = {
  SUPERADMIN: "SUPERADMIN",
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  STAFF: "STAFF",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// ── Lead Status ───────────────────────────────────────────────────────────────
export const LeadStatus = {
  NEW: "NEW",
  CONTACTED: "CONTACTED",
  REGISTERED: "REGISTERED",
  DEPOSIT_REPORTED: "DEPOSIT_REPORTED",
  DEPOSIT_CONFIRMED: "DEPOSIT_CONFIRMED",
  REJECTED: "REJECTED",
} as const;
export type LeadStatus = (typeof LeadStatus)[keyof typeof LeadStatus];

// ── Knowledge Base ────────────────────────────────────────────────────────────
export const KbType = {
  TEXT: "TEXT",
  LINK: "LINK",
  TEMPLATE: "TEMPLATE",
} as const;
export type KbType = (typeof KbType)[keyof typeof KbType];

export const KbFileType = {
  TEXT_MANUAL: "TEXT_MANUAL",
  PDF: "PDF",
  DOCX: "DOCX",
  IMAGE: "IMAGE",
  VIDEO_LINK: "VIDEO_LINK",
  EXTERNAL_LINK: "EXTERNAL_LINK",
} as const;
export type KbFileType = (typeof KbFileType)[keyof typeof KbFileType];

export const KbStatus = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  READY: "READY",
  FAILED: "FAILED",
} as const;
export type KbStatus = (typeof KbStatus)[keyof typeof KbStatus];

// ── Follow-Up Status ──────────────────────────────────────────────────────────
export const FollowUpStatus = {
  PENDING: "pending",
  SENT: "sent",
  CANCELLED: "cancelled",
} as const;
export type FollowUpStatus =
  (typeof FollowUpStatus)[keyof typeof FollowUpStatus];

// ── Audit Log Action ──────────────────────────────────────────────────────────
export const AuditAction = {
  USER_CREATED: "USER_CREATED",
  USER_DEACTIVATED: "USER_DEACTIVATED",
  USER_REACTIVATED: "USER_REACTIVATED",
  USER_ROLE_CHANGED: "USER_ROLE_CHANGED",
  PASSWORD_CHANGED: "PASSWORD_CHANGED",
  LEAD_STATUS_CHANGED: "LEAD_STATUS_CHANGED",
  LEAD_VERIFIED: "LEAD_VERIFIED",
  KB_CREATED: "KB_CREATED",
  KB_UPDATED: "KB_UPDATED",
  KB_DELETED: "KB_DELETED",
  COMMAND_MENU_CREATED: "COMMAND_MENU_CREATED",
  COMMAND_MENU_UPDATED: "COMMAND_MENU_UPDATED",
  COMMAND_MENU_DELETED: "COMMAND_MENU_DELETED",
  SYSTEM_CONFIG_CHANGED: "SYSTEM_CONFIG_CHANGED",
} as const;
export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction];

// ── AI Feedback Rating ────────────────────────────────────────────────────────
export const AiFeedbackRating = {
  BAD: 1,
  GOOD: 5,
} as const;
export type AiFeedbackRating =
  (typeof AiFeedbackRating)[keyof typeof AiFeedbackRating];

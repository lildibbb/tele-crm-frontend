import { z } from "zod/v4";

// ── Response Schemas ─────────────────────────────────────────────────────────

export const UserResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  role: z.string(),
  isActive: z.boolean(),
  telegramId: z.string().nullable(),
  lastLoginAt: z.string().nullable(),
  lastIpAddress: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type User = z.infer<typeof UserResponseSchema>;

export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  user: UserResponseSchema,
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;

export const SessionResponseSchema = z.object({
  id: z.string(),
  deviceId: z.string().nullable(),
  userAgent: z.string().nullable(),
  ipAddress: z.string().nullable(),
  lastActiveAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  isRevoked: z.boolean(),
});

export type Session = z.infer<typeof SessionResponseSchema>;

// ── Input Schemas (forms & API calls) ────────────────────────────────────────

export const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  code: z
    .string()
    .length(4, "Code must be exactly 4 digits")
    .regex(/^\d{4}$/, "Code must be numeric"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

export const SetupAccountSchema = z.object({
  invitationToken: z.string().min(1, "Invitation token is required"),
  initData: z.string(), // populated from Telegram WebApp; may be empty in web fallback
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  deviceId: z.string().optional(),
  userAgent: z.string().optional(),
});

export type SetupAccountInput = z.infer<typeof SetupAccountSchema>;

export const ChangeOwnPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ChangeOwnPasswordInput = z.infer<typeof ChangeOwnPasswordSchema>;

export const ChangePasswordSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;

export const TmaLoginSchema = z.object({
  initData: z.string().min(1),
  deviceId: z.string().min(1),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
});

export type TmaLoginInput = z.infer<typeof TmaLoginSchema>;

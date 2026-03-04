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

export const LoginSchema = z
  .object({
    email: z.string().optional(),
    password: z.string().optional(),
    initData: z.string().optional(),
    deviceId: z.string().optional(),
    userAgent: z.string().optional(),
  })
  .refine(
    (data) => {
      // Must have either initData OR (email AND password)
      if (data.initData) return true;
      return !!(data.email && data.password);
    },
    {
      message:
        "Provide either Telegram initialization data, or email and password.",
    },
  );

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

export const SetupAccountSchema = z
  .object({
    invitationToken: z.string().min(1, "Invitation token is required"),
    initData: z.string(), // populated from Telegram WebApp; may be empty in web fallback
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    deviceId: z.string().optional(),
    userAgent: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SetupAccountInput = z.infer<typeof SetupAccountSchema>;

export const InvitationInfoSchema = z.object({
  email: z.string().email().nullable(),
  role: z.string(),
});

export type InvitationInfo = z.infer<typeof InvitationInfoSchema>;

export const ChangeOwnPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
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

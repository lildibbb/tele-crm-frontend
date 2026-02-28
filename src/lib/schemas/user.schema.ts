import { z } from "zod/v4";
import { UserRole } from "@/types/enums";

// ── Response Schemas ─────────────────────────────────────────────────────────

export const UserRoleSchema = z.enum(UserRole);

export const UserResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  role: UserRoleSchema,
  isActive: z.boolean(),
  telegramId: z.string().nullable(),
  lastLoginAt: z.string().nullable(),
  lastIpAddress: z.string().nullable(),
  timezone: z.string().default("UTC"),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type UserResponse = z.infer<typeof UserResponseSchema>;

export const InvitationResponseSchema = z.object({
  id: z.string(),
  role: UserRoleSchema,
  email: z.string().nullable(),
  telegramDeepLink: z.string(),
  expiresAt: z.string().datetime(),
  createdAt: z.string().datetime(),
});

export type InvitationResponse = z.infer<typeof InvitationResponseSchema>;

// ── Input Schemas ─────────────────────────────────────────────────────────────

export const CreateUserSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: UserRoleSchema,
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

export const InviteUserSchema = z.object({
  role: UserRoleSchema,
  email: z.string().email("Please enter a valid email address").optional(),
});

export type InviteUserInput = z.infer<typeof InviteUserSchema>;

export const ChangeRoleSchema = z.object({
  role: UserRoleSchema,
});

export type ChangeRoleInput = z.infer<typeof ChangeRoleSchema>;

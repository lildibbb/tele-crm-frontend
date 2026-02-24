import { apiClient } from "./apiClient";
import type {
  UserResponse,
  InvitationResponse,
  InviteUserInput,
  ChangeRoleInput,
} from "@/lib/schemas/user.schema";
import type { ChangePasswordInput } from "@/lib/schemas/auth.schema";
import type { ApiResponse } from "@/lib/schemas/common";

export const usersApi = {
  /**
   * Returns all CRM system users. Requires ADMIN role or higher.
   */
  findAll: () =>
    apiClient.get<ApiResponse<UserResponse[]>>("/users"),

  /**
   * Returns the authenticated user's profile.
   */
  getMe: () =>
    apiClient.get<ApiResponse<UserResponse>>("/users/me"),

  /**
   * Get user by ID.
   */
  findById: (id: string) =>
    apiClient.get<ApiResponse<UserResponse>>(`/users/${id}`),

  /**
   * Deactivates the user and instantly revokes all their sessions (SUPERADMIN only).
   */
  deactivate: (id: string) =>
    apiClient.patch<void>(`/users/${id}/deactivate`),

  /**
   * Re-enables a deactivated user and clears their Redis block (SUPERADMIN only).
   */
  reactivate: (id: string) =>
    apiClient.patch<ApiResponse<UserResponse>>(`/users/${id}/reactivate`),

  /**
   * Updates a user's role. Cannot change own role (SUPERADMIN only).
   */
  changeRole: (id: string, data: ChangeRoleInput) =>
    apiClient.patch<ApiResponse<UserResponse>>(`/users/${id}/role`, data),

  /**
   * Resets a user's password and revokes all their sessions (SUPERADMIN only).
   */
  changePassword: (id: string, data: ChangePasswordInput) =>
    apiClient.patch<void>(`/users/${id}/change-password`, data),

  /**
   * Creates an invitation with a Telegram deep link for onboarding a new CRM user.
   */
  invite: (data: InviteUserInput) =>
    apiClient.post<ApiResponse<InvitationResponse>>("/users/invite", data),

  /**
   * Returns all pending and accepted invitations.
   */
  listInvitations: () =>
    apiClient.get<ApiResponse<InvitationResponse[]>>("/users/invitations"),

  /**
   * Permanently deletes an unused invitation.
   */
  deleteInvitation: (id: string) =>
    apiClient.delete<void>(`/users/invitations/${id}`),
};

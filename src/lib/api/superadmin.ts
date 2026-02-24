import { apiClient } from "./apiClient";
import type {
  UserResponse,
  CreateUserInput,
  ChangeRoleInput,
} from "@/lib/schemas/user.schema";
import type { ChangePasswordInput } from "@/lib/schemas/auth.schema";
import type { ApiResponse } from "@/lib/schemas/common";

/**
 * Superadmin-only API endpoints for system administration.
 * These endpoints require SUPERADMIN role.
 */
export const superadminApi = {
  /**
   * Returns all CRM system users. Requires SUPERADMIN role.
   */
  findAllUsers: () =>
    apiClient.get<ApiResponse<UserResponse[]>>("/superadmin/users"),

  /**
   * Directly creates a CRM user without an invitation (SUPERADMIN only).
   */
  createUser: (data: CreateUserInput) =>
    apiClient.post<ApiResponse<UserResponse>>("/superadmin/users", data),

  /**
   * Returns a specific user by UUID (SUPERADMIN only).
   */
  findUserById: (id: string) =>
    apiClient.get<ApiResponse<UserResponse>>(`/superadmin/users/${id}`),

  /**
   * Deactivates the user and instantly revokes all their sessions (SUPERADMIN only).
   */
  deactivateUser: (id: string) =>
    apiClient.delete<void>(`/superadmin/users/${id}`),

  /**
   * Resets a user's password and revokes all their sessions (SUPERADMIN only).
   */
  forcePasswordChange: (id: string, data: ChangePasswordInput) =>
    apiClient.patch<void>(`/superadmin/users/${id}/change-password`, data),

  /**
   * Re-enables a deactivated user and clears their Redis block (SUPERADMIN only).
   */
  reactivateUser: (id: string) =>
    apiClient.patch<ApiResponse<UserResponse>>(`/superadmin/users/${id}/reactivate`),

  /**
   * Updates a user's role. Cannot change own role (SUPERADMIN only).
   */
  changeUserRole: (id: string, data: ChangeRoleInput) =>
    apiClient.patch<ApiResponse<UserResponse>>(`/superadmin/users/${id}/role`, data),
};

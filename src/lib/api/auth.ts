import { apiClient } from "./apiClient";
import type {
  LoginInput,
  TmaLoginInput,
  SetupAccountInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangeOwnPasswordInput,
  ChangePasswordInput,
  AuthResponse,
  Session,
} from "@/lib/schemas/auth.schema";
import type { UserResponse } from "@/lib/schemas/user.schema";
import type { ApiResponse } from "@/lib/schemas/common";

export const authApi = {
  /**
   * Authenticates with email + password. Sets an HTTP-Only refresh token cookie.
   */
  login: (data: LoginInput) =>
    apiClient.post<ApiResponse<AuthResponse>>("/auth/login", data),

  /**
   * Reads the refresh_token HTTP-Only cookie and issues a new short-lived access token.
   */
  refresh: () =>
    apiClient.post<ApiResponse<{ accessToken: string }>>("/auth/refresh"),

  /**
   * Revokes current session and clears the refresh cookie. Returns 204 No Content.
   */
  logout: () => apiClient.post<ApiResponse<void>>("/auth/logout"),

  /**
   * Validates Telegram WebApp initData HMAC signature and logs in the linked CRM user.
   */
  tmaLogin: (data: TmaLoginInput) =>
    apiClient.post<ApiResponse<AuthResponse>>("/auth/tma-login", data),

  /**
   * Completes onboarding for an invited user: validates invitation token + Telegram initData.
   */
  setupAccount: (data: SetupAccountInput) =>
    apiClient.post<ApiResponse<AuthResponse>>("/auth/setup-account", data),

  /**
   * Returns all non-revoked, non-expired sessions for the authenticated user.
   */
  getSessions: () =>
    apiClient.get<ApiResponse<Session[]>>("/auth/sessions"),

  /**
   * Remote-wipe a specific session by UUID (sign out a device).
   */
  revokeSession: (sessionId: string) =>
    apiClient.delete<ApiResponse<void>>(`/auth/sessions/${sessionId}`),

  /**
   * Revokes ALL sessions for the current user and clears the refresh cookie.
   */
  revokeAllSessions: () =>
    apiClient.delete<ApiResponse<void>>("/auth/sessions"),

  /**
   * Sends a 4-digit OTP to the provided email. Rate-limited.
   */
  forgotPassword: (data: ForgotPasswordInput) =>
    apiClient.post<ApiResponse<null>>("/auth/forgot-password", data),

  /**
   * Validates the 4-digit OTP and sets a new password.
   */
  resetPassword: (data: ResetPasswordInput) =>
    apiClient.post<ApiResponse<null>>("/auth/reset-password", data),

  /**
   * Authenticated users can change their own password. All sessions are revoked on success.
   */
  changeOwnPassword: (data: ChangeOwnPasswordInput) =>
    apiClient.patch<ApiResponse<void>>("/auth/change-own-password", data),

  /**
   * Directly creates a CRM user without an invitation (SUPERADMIN only).
   */
  createUser: (data: { email: string; password: string; role: string }) =>
    apiClient.post<ApiResponse<UserResponse>>("/auth/users", data),
};

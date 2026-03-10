import { apiClient } from "./apiClient";
import type { ApiResponse } from "../schemas/common";

export interface GoogleOAuth2Status {
  connected: boolean;
  email?: string;
  connectedAt?: string;
  connectedBy?: string;
}

export const googleOAuth2Api = {
  /** Get the Google OAuth2 consent URL (opens in popup) */
  getConnectUrl: () =>
    apiClient.get<ApiResponse<{ authUrl: string }>>("/google/oauth/connect"),

  /** Get current Google OAuth2 connection status */
  getStatus: () =>
    apiClient.get<ApiResponse<GoogleOAuth2Status>>("/google/oauth/status"),

  /** Revoke / disconnect the Google OAuth2 connection */
  disconnect: () =>
    apiClient.delete<ApiResponse<{ message: string }>>(
      "/google/oauth/disconnect",
    ),
};

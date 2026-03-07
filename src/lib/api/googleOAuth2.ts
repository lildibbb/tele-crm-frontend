import { apiClient } from "./apiClient";

export interface GoogleOAuth2Status {
  connected: boolean;
  email?: string;
  connectedAt?: string;
  connectedBy?: string;
}

export const googleOAuth2Api = {
  /** Get the Google OAuth2 consent URL (opens in popup) */
  getConnectUrl: () =>
    apiClient.get<{ authUrl: string }>("/google/oauth/connect"),

  /** Get current Google OAuth2 connection status */
  getStatus: () => apiClient.get<GoogleOAuth2Status>("/google/oauth/status"),

  /** Revoke / disconnect the Google OAuth2 connection */
  disconnect: () =>
    apiClient.delete<{ message: string }>("/google/oauth/disconnect"),
};

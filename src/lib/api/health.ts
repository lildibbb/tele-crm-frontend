import { apiClient } from "./apiClient";

export interface HealthStatus {
  status: "ok" | "error";
  info: Record<string, { status: string; [key: string]: unknown }> | null;
  error: Record<string, { status: string; [key: string]: unknown }> | null;
  details: Record<string, { status: string; [key: string]: unknown }>;
}

export const healthApi = {
  /**
   * System health check — verifies database and Redis connectivity.
   * Returns 200 if healthy, 503 if any dependency is down.
   */
  check: () =>
    apiClient.get<HealthStatus>("/health"),
};

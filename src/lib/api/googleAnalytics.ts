import { apiClient } from "./apiClient";
import type { ApiResponse } from "@/lib/schemas/common";

export interface GoogleOpLog {
  service: "sheets" | "drive";
  operation: "fullSync" | "appendRow" | "upload";
  status: "ok" | "fail";
  records?: number;
  durationMs?: number;
  errorMessage?: string;
  timestamp: string;
}

export interface GoogleAnalyticsStats {
  sheetsSyncOk: number;
  sheetsSyncFail: number;
  driveUploadOk: number;
  driveUploadFail: number;
}

export interface GoogleAnalyticsResult {
  stats: GoogleAnalyticsStats;
  recentOps: GoogleOpLog[];
}

export const googleAnalyticsApi = {
  getAnalytics: () =>
    apiClient.get<ApiResponse<GoogleAnalyticsResult>>("/superadmin/google/analytics"),
};

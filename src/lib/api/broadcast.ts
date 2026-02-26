import { apiClient } from "./apiClient";
import type { ApiResponse } from "@/lib/schemas/common";

export interface BroadcastInput {
  message: string;
  photoUrl?: string;
}

export interface BroadcastResult {
  enqueued: number;
  logId: string;
}

export type BroadcastStatus = "QUEUED" | "SENDING" | "SENT" | "FAILED";

export interface BroadcastLog {
  id: string;
  message: string;
  photoUrl: string | null;
  recipientCount: number;
  status: BroadcastStatus;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const broadcastApi = {
  send: (data: BroadcastInput) =>
    apiClient.post<ApiResponse<BroadcastResult>>("/broadcast", data),

  history: (params?: { page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<{ data: BroadcastLog[]; total: number }>>(
      "/broadcast/history",
      { params },
    ),
};

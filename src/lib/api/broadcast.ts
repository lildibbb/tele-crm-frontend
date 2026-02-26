import { apiClient } from "./apiClient";
import type { ApiResponse } from "@/lib/schemas/common";
import type { Interaction } from "@/lib/schemas/lead.schema";

export interface BroadcastInput {
  message: string;
  photoUrl?: string;
}

export interface BroadcastResult {
  enqueued: number;
}

export const broadcastApi = {
  /**
   * Enqueue a broadcast message to all leads with a Telegram account.
   */
  send: (data: BroadcastInput) =>
    apiClient.post<ApiResponse<BroadcastResult>>("/broadcast", data),

  /**
   * Paginated history of past broadcast interactions.
   */
  history: (params?: { page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<{ data: Interaction[]; total: number }>>(
      "/broadcast/history",
      { params },
    ),
};

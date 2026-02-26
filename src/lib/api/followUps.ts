import { apiClient } from "./apiClient";
import type {
  FollowUp,
  ListFollowUpsParams,
} from "@/lib/schemas/followUp.schema";
import type { ApiResponse } from "@/lib/schemas/common";

export const followUpsApi = {
  /**
   * Paginated list of scheduled follow-up messages with optional filters.
   */
  findAll: (params?: ListFollowUpsParams) =>
    apiClient.get<ApiResponse<FollowUp[]>>("/follow-ups", { params }),

  /**
   * Cancel a scheduled follow-up by ID. Returns 204 No Content.
   */
  cancel: (id: string) =>
    apiClient.delete<void>(`/follow-ups/${id}`),

  /**
   * List failed BullMQ follow-up jobs (SUPERADMIN).
   */
  getFailed: (params?: { start?: number; end?: number }) =>
    apiClient.get<ApiResponse<unknown[]>>("/follow-ups/failed", { params }),

  /**
   * Retry a failed follow-up job by job ID.
   */
  retryJob: (jobId: string) =>
    apiClient.post<ApiResponse<{ retried: boolean }>>(`/follow-ups/retry/${jobId}`),
};

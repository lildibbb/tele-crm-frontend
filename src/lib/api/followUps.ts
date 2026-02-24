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
};

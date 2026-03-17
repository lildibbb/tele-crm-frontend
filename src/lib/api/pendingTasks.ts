import { apiClient } from "./apiClient";
import type {
  ListPendingTaskGroupsParams,
  ListPendingTasksParams,
  PendingTaskGroupedByLeadResponse,
  PendingTask,
  UpdatePendingTaskInput,
} from "@/lib/schemas/pendingTask.schema";
import type { ApiResponse } from "@/lib/schemas/common";

export const pendingTasksApi = {
  /**
   * Paginated list of pending tasks with optional status and lead filters.
   */
  list: (params?: ListPendingTasksParams) =>
    apiClient.get<ApiResponse<{ data: PendingTask[]; total: number }>>(
      "/pending-tasks",
      { params },
    ),

  /**
   * Pending tasks grouped by lead with lead metadata and status counters.
   */
  groupedByLead: (params?: ListPendingTaskGroupsParams) =>
    apiClient.get<ApiResponse<PendingTaskGroupedByLeadResponse>>(
      "/pending-tasks/grouped-by-lead",
      { params },
    ),

  /**
   * Update a pending task status.
   */
  updateStatus: (id: string, data: UpdatePendingTaskInput) =>
    apiClient.patch<ApiResponse<PendingTask>>(`/pending-tasks/${id}/status`, data),
};

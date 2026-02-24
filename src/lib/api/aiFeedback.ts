import { apiClient } from "./apiClient";
import type {
  AiFeedback,
  CreateAiFeedbackInput,
  ListAiFeedbackParams,
} from "@/lib/schemas/aiFeedback.schema";
import type { ApiResponse } from "@/lib/schemas/common";

export const aiFeedbackApi = {
  /**
   * Submit conversation feedback — rate a bot reply as good (5) or bad (1).
   */
  create: (data: CreateAiFeedbackInput) =>
    apiClient.post<ApiResponse<AiFeedback>>("/ai/feedback", data),

  /**
   * List feedback entries. SUPERADMIN only.
   */
  findMany: (params?: ListAiFeedbackParams) =>
    apiClient.get<ApiResponse<AiFeedback[]>>("/ai/feedback", { params }),

  /**
   * Toggle usedAsFewShot flag on a feedback entry. SUPERADMIN only.
   * @param id - Feedback entry UUID
   * @param enable - "true" or "false" string (query param)
   */
  toggleFewShot: (id: string, enable: boolean) =>
    apiClient.patch<ApiResponse<AiFeedback>>(
      `/ai/feedback/${id}/few-shot`,
      undefined,
      { params: { enable: String(enable) } },
    ),
};

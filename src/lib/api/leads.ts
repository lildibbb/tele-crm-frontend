import { apiClient } from "./apiClient";
import type {
  Lead,
  ListLeadsParams,
  UpdateLeadStatusInput,
  UpdateHandoverInput,
  BulkUpdateHandoverInput,
  BulkUpdateStatusInput,
  SubmitLeadInfoInput,
  LeaderboardParams,
  ExportLeadsParams,
  ImportResult,
  Interaction,
  ListInteractionsParams,
} from "@/lib/schemas/lead.schema";
import type { ApiResponse } from "@/lib/schemas/common";
import {
  canSendLeadReply,
  normalizeLeadReplyMessage,
} from "@/lib/reply/leadReplyContract";

type LeadReplyInput =
  | string
  | {
      message?: string;
      file?: File | null;
    };

export const LEAD_REPLY_REQUIRED_MESSAGE = "Message is required.";

function extractReplyErrorMessage(error: unknown): string {
  const fallback = "Failed to send message.";

  if (typeof error === "object" && error !== null) {
    const maybeError = error as {
      response?: {
        data?: {
          message?: unknown;
          error?: unknown;
        };
      };
      message?: unknown;
    };
    const message = maybeError.response?.data?.message;

    if (Array.isArray(message)) {
      const joined = message
        .filter((item): item is string => typeof item === "string")
        .join(", ")
        .trim();
      if (joined) return joined;
    }

    if (typeof message === "string" && message.trim()) {
      return message.trim();
    }

    if (
      typeof maybeError.response?.data?.error === "string" &&
      maybeError.response.data.error.trim()
    ) {
      return maybeError.response.data.error.trim();
    }

    if (typeof maybeError.message === "string" && maybeError.message.trim()) {
      return maybeError.message.trim();
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }

  return fallback;
}

export const leadsApi = {
  /**
   * Public endpoint: a lead submits their email and/or HFM Broker ID via Telegram bot.
   */
  submitInfo: (data: SubmitLeadInfoInput) =>
    apiClient.post<ApiResponse<Lead>>("/leads/submit-info", data),

  /**
   * Paginated list of all leads with optional status filter.
   */
  list: (params?: ListLeadsParams) =>
    apiClient.get<ApiResponse<Lead[]>>("/leads", { params }),

  /**
   * Returns a lead and its full interaction history.
   */
  findOne: (id: string) => apiClient.get<ApiResponse<Lead>>(`/leads/${id}`),

  /**
   * Update lead status.
   */
  updateStatus: (id: string, data: UpdateLeadStatusInput) =>
    apiClient.patch<ApiResponse<Lead>>(`/leads/${id}/status`, data),

  /**
   * Update lead info (hfmBrokerId, email, phoneNumber).
   */
  updateInfo: (
    id: string,
    data: { hfmBrokerId?: string; email?: string; phoneNumber?: string },
  ) => apiClient.patch<ApiResponse<Lead>>(`/leads/${id}/info`, data),

  /**
   * Enable/disable human handover mode for a lead.
   */
  setHandover: (id: string, data: UpdateHandoverInput) =>
    apiClient.patch<ApiResponse<Lead>>(`/leads/${id}/handover`, data),

  /**
   * Enable/disable human handover mode for multiple leads.
   */
  setBulkHandover: (data: BulkUpdateHandoverInput) =>
    apiClient.patch<ApiResponse<{ count: number }>>(
      `/leads/bulk/handover`,
      data,
    ),

  /**
   * Owner manually verifies the registration/deposit proof.
   */
  verify: (id: string) =>
    apiClient.patch<ApiResponse<Lead>>(`/leads/${id}/verify`),

  /**
   * Leads ordered by aiScore DESC. Tier: hot≥70, warm≥40, cold<40.
   */
  getLeaderboard: (params?: LeaderboardParams) =>
    apiClient.get<ApiResponse<Lead[]>>("/leads/leaderboard", { params }),

  /**
   * Streams a CSV file of all leads matching optional filters.
   * @deprecated Use exportExcel for the new multi-sheet XLSX format.
   */
  exportCsv: (params?: ExportLeadsParams) =>
    apiClient.get("/leads/export", {
      params,
      responseType: "blob" as const,
    }),

  /**
   * Downloads a multi-sheet Excel (.xlsx) file.
   * - No status filter → 5 sheets: All Leads + one per status.
   * - With status filter → single sheet for that status.
   */
  exportExcel: (params?: ExportLeadsParams) =>
    apiClient.get("/leads/export", {
      params: { ...params, format: "xlsx" },
      responseType: "blob" as const,
    }),

  /**
   * Imports leads from a CSV file (upsert by telegram_id).
   * Returns { imported, updated, skipped, errors }.
   */
  importCsv: (file: File): Promise<{ data: ApiResponse<ImportResult> }> => {
    const form = new FormData();
    form.append("file", file);
    return apiClient.post<ApiResponse<ImportResult>>("/leads/import", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /**
   * Downloads a prefilled CSV template for import.
   */
  downloadTemplate: () =>
    apiClient.get("/leads/import/template", {
      responseType: "blob" as const,
    }),

  /**
   * Paginated interaction timeline for a lead.
   */
  getInteractions: (id: string, params?: ListInteractionsParams) =>
    apiClient.get<ApiResponse<Interaction[]>>(`/leads/${id}/interactions`, {
      params,
    }),

  /**
   * Bulk update status for multiple leads.
   */
  bulkStatus: (data: BulkUpdateStatusInput) =>
    apiClient.patch<ApiResponse<{ count: number }>>("/leads/bulk/status", data),

  /**
   * Send a manual reply to a lead via Telegram from the dashboard.
   */
  reply: async (id: string, input: LeadReplyInput) => {
    const payload =
      typeof input === "string"
        ? { message: input, file: undefined }
        : { message: input.message ?? "", file: input.file ?? undefined };
    const message = normalizeLeadReplyMessage(payload.message);
    const hasFile = Boolean(payload.file);

    if (!canSendLeadReply(message, payload.file)) {
      throw new Error(LEAD_REPLY_REQUIRED_MESSAGE);
    }

    try {
      if (hasFile) {
        const form = new FormData();
        form.append("message", message);
        form.append("attachment", payload.file as File);
        return await apiClient.post<ApiResponse<{ sent: boolean }>>(
          `/leads/${id}/reply`,
          form,
          { headers: { "Content-Type": "multipart/form-data" } },
        );
      }

      return await apiClient.post<ApiResponse<{ sent: boolean }>>(
        `/leads/${id}/reply`,
        {
          message,
        },
      );
    } catch (error) {
      throw new Error(extractReplyErrorMessage(error));
    }
  },
};

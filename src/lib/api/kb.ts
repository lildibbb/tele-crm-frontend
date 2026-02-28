import { apiClient, API_BASE_URL } from "./apiClient";
import type {
  KbEntry,
  CreateKbInput,
  UpdateKbInput,
} from "@/lib/schemas/kb.schema";
import type { ApiResponse } from "@/lib/schemas/common";

export const kbApi = {
  /**
   * List all KB entries. Requires ADMIN role or higher.
   */
  findAll: () =>
    apiClient.get<ApiResponse<KbEntry[]>>("/knowledge-base"),

  /**
   * List active KB entries (RAG-ready).
   */
  findActive: () =>
    apiClient.get<ApiResponse<KbEntry[]>>("/knowledge-base/active"),

  /**
   * Get KB entry by ID.
   */
  findOne: (id: string) =>
    apiClient.get<ApiResponse<KbEntry>>(`/knowledge-base/${id}`),

  /**
   * Create text/link KB entry. Embedding generated immediately in background.
   */
  createText: (data: CreateKbInput) =>
    apiClient.post<ApiResponse<KbEntry>>("/knowledge-base/text", data),

  /**
   * Upload file to KB (PDF, DOCX, image). File is processed asynchronously.
   */
  uploadFile: (formData: FormData) =>
    apiClient.post<ApiResponse<void>>("/knowledge-base/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  /**
   * Update KB entry. Re-generates embedding if content changes.
   */
  update: (id: string, data: UpdateKbInput) =>
    apiClient.patch<ApiResponse<KbEntry>>(`/knowledge-base/${id}`, data),

  /**
   * Delete KB entry.
   */
  remove: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/knowledge-base/${id}`),

  /**
   * Subscribe to real-time processing status updates via SSE.
   * Subscribe: source.onmessage = ({ data }) => { ... }
   * The token must be passed as a query param since EventSource doesn't support headers.
   */
  getProcessingStatus: (kbId: string, accessToken: string): EventSource => {
    const url = `${API_BASE_URL}/knowledge-base/status?kbId=${encodeURIComponent(kbId)}&token=${encodeURIComponent(accessToken)}`;
    return new EventSource(url);
  },
};

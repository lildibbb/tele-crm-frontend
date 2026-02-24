import { apiClient } from "./apiClient";
import type {
  CommandMenu,
  CreateCommandMenuInput,
  UpdateCommandMenuInput,
  ReorderCommandMenuInput,
} from "@/lib/schemas/commandMenu.schema";
import type { ApiResponse } from "@/lib/schemas/common";

export const commandMenuApi = {
  /**
   * Returns all command menus ordered by display order.
   */
  findAll: () =>
    apiClient.get<ApiResponse<CommandMenu[]>>("/command-menu"),

  /**
   * Get command menu by ID.
   */
  findOne: (id: string) =>
    apiClient.get<ApiResponse<CommandMenu>>(`/command-menu/${id}`),

  /**
   * Creates a new command menu with Tiptap rich content. Embedding generated asynchronously.
   */
  create: (data: CreateCommandMenuInput) =>
    apiClient.post<ApiResponse<CommandMenu>>("/command-menu", data),

  /**
   * Updates label, description, content, order, or isActive.
   * Re-generates embedding if content changes.
   */
  update: (id: string, data: UpdateCommandMenuInput) =>
    apiClient.patch<ApiResponse<CommandMenu>>(`/command-menu/${id}`, data),

  /**
   * Delete command menu (SUPERADMIN only).
   */
  remove: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/command-menu/${id}`),

  /**
   * Bulk reorder command menus. Accepts array of { id, order }.
   */
  reorder: (data: ReorderCommandMenuInput) =>
    apiClient.patch<ApiResponse<void>>("/command-menu/reorder", data),
};

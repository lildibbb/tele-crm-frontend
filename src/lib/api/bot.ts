import { apiClient } from "./apiClient";
import type { BotStatus } from "@/lib/schemas/bot.schema";
import type { ApiResponse } from "@/lib/schemas/common";

export const botApi = {
  /**
   * Telegram bot health & webhook info (SUPERADMIN only).
   */
  getStatus: () =>
    apiClient.get<ApiResponse<BotStatus>>("/bot/status"),
};

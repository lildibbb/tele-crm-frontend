import { apiClient } from "./apiClient";
import {
  BotReplyPayloadSchema,
  OnboardingBotReplyPayloadSchema,
  type BotReplyPayload,
  type BotStatus,
} from "@/lib/schemas/bot.schema";
import type { ApiResponse } from "@/lib/schemas/common";

const LINK_LINE_PREFIX = "Link:";

function asTrimmedString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function normalizeParts(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => asTrimmedString(entry))
    .filter((entry): entry is string => Boolean(entry));
}

function splitTextParts(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function appendLinkLine(text: string, link?: string): string {
  const normalizedLink = asTrimmedString(link);
  if (!normalizedLink) return text;
  if (new RegExp(`^\\s*${LINK_LINE_PREFIX}\\s+`, "m").test(text)) return text;
  const linkLine = `${LINK_LINE_PREFIX} ${normalizedLink}`;
  return text ? `${text}\n${linkLine}` : linkLine;
}

export function parseBotReply(
  input: unknown,
  options?: { onboarding?: boolean },
): BotReplyPayload {
  const raw = typeof input === "object" && input !== null ? input : null;
  const record = raw as Record<string, unknown> | null;
  let text =
    asTrimmedString(input) ??
    asTrimmedString(record?.text) ??
    asTrimmedString(record?.reply) ??
    asTrimmedString(record?.message) ??
    "";
  let parts = normalizeParts(
    record?.parts ?? record?.messageParts ?? record?.messages,
  );

  text = appendLinkLine(
    text,
    asTrimmedString(record?.link) ?? asTrimmedString(record?.registrationUrl),
  );

  if (!parts.length && text) {
    parts = splitTextParts(text);
  }

  if (!text && parts.length) {
    text = parts.join("\n\n");
  }

  if (options?.onboarding && parts.length > 2) {
    parts = parts.slice(0, 2);
    text = parts.join("\n\n");
  }

  const payload = { text: text.trim(), parts };

  return options?.onboarding
    ? OnboardingBotReplyPayloadSchema.parse(payload)
    : BotReplyPayloadSchema.parse(payload);
}

export const botApi = {
  /**
   * Telegram bot health & webhook info (SUPERADMIN only).
   */
  getStatus: () =>
    apiClient.get<ApiResponse<BotStatus>>("/bot/status"),
};

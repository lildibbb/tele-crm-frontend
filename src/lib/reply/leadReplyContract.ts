export function normalizeLeadReplyMessage(value?: string): string {
  return (value ?? "").trim();
}

export function canSendLeadReply(
  message?: string,
  file?: File | null,
): boolean {
  return Boolean(normalizeLeadReplyMessage(message) || file);
}


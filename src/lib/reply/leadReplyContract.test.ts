import { describe, expect, it } from "vitest";
import {
  canSendLeadReply,
  normalizeLeadReplyMessage,
} from "@/lib/reply/leadReplyContract";
import { parseBotReply } from "@/lib/api/bot";

describe("leadReplyContract", () => {
  it("normalizes message text by trimming whitespace", () => {
    expect(normalizeLeadReplyMessage("  hello  ")).toBe("hello");
    expect(normalizeLeadReplyMessage(undefined)).toBe("");
  });

  it("allows attachment-only replies", () => {
    const file = new File(["proof"], "proof.png", { type: "image/png" });
    expect(canSendLeadReply("   ", file)).toBe(true);
  });

  it("rejects empty message when no attachment exists", () => {
    expect(canSendLeadReply("   ", null)).toBe(false);
  });

  it("keeps non-onboarding bot replies backward-compatible", () => {
    const payload = parseBotReply(
      "Step 1\n\nStep 2\n\nStep 3\n\nLink: https://example.com/register",
    );

    expect(payload.parts).toHaveLength(4);
    expect(payload.text).toContain("Link: https://example.com/register");
  });
});


import { describe, expect, it } from "vitest";
import { parseBotReply } from "@/lib/api/bot";

describe("onboardingFlowContract", () => {
  it("accepts max two onboarding messages and preserves Link line", () => {
    const payload = parseBotReply(
      {
        parts: [
          "Step 1: Register your broker account.",
          "Step 2: After registration, submit your screenshot.\nLink: https://example.com/register",
          "Extra follow-up that should be truncated in onboarding mode.",
        ],
      },
      { onboarding: true },
    );

    expect(payload.parts.length).toBeLessThanOrEqual(2);
    expect(payload.text).toContain("Link:");
  });
});

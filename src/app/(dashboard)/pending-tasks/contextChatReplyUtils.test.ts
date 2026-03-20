import { describe, expect, it } from "vitest";
import {
  buildOptimisticContextInteraction,
  extractInteractionAttachmentName,
} from "./contextChatReplyUtils";

describe("buildOptimisticContextInteraction", () => {
  it("creates a trimmed manual reply interaction", () => {
    const interaction = buildOptimisticContextInteraction({
      leadId: "lead-1",
      message: "  hello from agent  ",
      id: "opt-1",
      createdAt: "2026-01-01T00:00:00.000Z",
    });

    expect(interaction).toEqual({
      id: "opt-1",
      leadId: "lead-1",
      type: "MANUAL_REPLY_SENT",
      content: "hello from agent",
      metadata: null,
      createdAt: "2026-01-01T00:00:00.000Z",
    });
  });

  it("adds attachment metadata when file is present", () => {
    const file = new File(["proof"], "proof.pdf", { type: "application/pdf" });

    const interaction = buildOptimisticContextInteraction({
      leadId: "lead-2",
      message: "See attachment",
      file,
      id: "opt-2",
      createdAt: "2026-01-01T00:00:00.000Z",
    });

    expect(interaction.metadata).toEqual({
      fileName: "proof.pdf",
      mimeType: "application/pdf",
      size: file.size,
    });
  });
});

describe("extractInteractionAttachmentName", () => {
  it("reads the fileName field first", () => {
    expect(
      extractInteractionAttachmentName({
        fileName: "proof.txt",
        attachmentName: "fallback.txt",
      }),
    ).toBe("proof.txt");
  });

  it("falls back through known metadata keys", () => {
    expect(
      extractInteractionAttachmentName({
        attachmentName: "attachment.docx",
      }),
    ).toBe("attachment.docx");
  });

  it("returns null for missing attachment metadata", () => {
    expect(extractInteractionAttachmentName(null)).toBeNull();
  });
});

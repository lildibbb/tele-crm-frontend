import { describe, expect, it } from "vitest";
import {
  getAttachmentDisplayName,
  parseInteractionAttachmentMetadata,
} from "@/lib/chat-media";

describe("parseInteractionAttachmentMetadata", () => {
  it("parses flat metadata keys", () => {
    const parsed = parseInteractionAttachmentMetadata({
      fileUrl: "https://cdn.example.com/proofs/deposit.png",
      mimeType: "image/png",
      file_name: "deposit-proof.png",
    });

    expect(parsed.fileUrl).toBe("https://cdn.example.com/proofs/deposit.png");
    expect(parsed.mimeType).toBe("image/png");
    expect(parsed.fileName).toBe("deposit-proof.png");
    expect(parsed.previewType).toBe("image");
    expect(parsed.hasAttachment).toBe(true);
  });

  it("parses nested snake_case attachment payloads", () => {
    const parsed = parseInteractionAttachmentMetadata({
      attachment: {
        file_url: "https://cdn.example.com/proofs/intro.mp4",
        mime_type: "video/mp4",
        caption: "intro-video.mp4",
      },
    });

    expect(parsed.fileUrl).toBe("https://cdn.example.com/proofs/intro.mp4");
    expect(parsed.mimeType).toBe("video/mp4");
    expect(parsed.fileName).toBe("intro-video.mp4");
    expect(parsed.previewType).toBe("video");
    expect(parsed.hasAttachment).toBe(true);
  });

  it("supports JSON-string metadata blobs", () => {
    const parsed = parseInteractionAttachmentMetadata(
      JSON.stringify({
        media: {
          url: "https://cdn.example.com/docs/report.pdf",
          mime_type: "application/pdf",
          fileName: "report.pdf",
        },
      }),
    );

    expect(parsed.fileUrl).toBe("https://cdn.example.com/docs/report.pdf");
    expect(parsed.mimeType).toBe("application/pdf");
    expect(parsed.fileName).toBe("report.pdf");
    expect(parsed.previewType).toBeNull();
    expect(parsed.hasAttachment).toBe(true);
  });

  it("keeps non-previewable media as attachment fallback", () => {
    const parsed = parseInteractionAttachmentMetadata({
      fileUrl: "https://cdn.example.com/audio/voice-note.ogg",
      mimeType: "audio/ogg",
      fileName: "voice-note.ogg",
    });

    expect(parsed.previewType).toBeNull();
    expect(parsed.hasAttachment).toBe(true);
  });

  it("returns empty attachment when metadata has no media fields", () => {
    const parsed = parseInteractionAttachmentMetadata({
      source: "telegram",
      replyTo: "1234",
      type: "SYSTEM_STATUS_CHANGE",
      url: "https://example.com/lead/1234",
    });

    expect(parsed.fileUrl).toBe("https://example.com/lead/1234");
    expect(parsed.mimeType).toBeUndefined();
    expect(parsed.fileName).toBeUndefined();
    expect(parsed.previewType).toBeNull();
    expect(parsed.hasAttachment).toBe(false);
  });
});

describe("getAttachmentDisplayName", () => {
  it("prefers explicit file names", () => {
    expect(
      getAttachmentDisplayName(
        "proof.png",
        "https://cdn.example.com/path/ignored-name.png",
      ),
    ).toBe("proof.png");
  });

  it("falls back to decoded url path", () => {
    expect(
      getAttachmentDisplayName(
        undefined,
        "https://cdn.example.com/files/Deposit%20Proof%20April.pdf?token=abc123",
      ),
    ).toBe("Deposit Proof April.pdf");
  });
});

import { describe, expect, it } from "vitest";
import {
  buildEditedCanvasFile,
  buildEditedImageFile,
  stripFileExtension,
} from "@/lib/editedImage";

describe("stripFileExtension", () => {
  it("returns file name without extension", () => {
    expect(stripFileExtension("photo.png")).toBe("photo");
    expect(stripFileExtension("proof.v1.jpeg")).toBe("proof.v1");
  });

  it("falls back to attachment on empty values", () => {
    expect(stripFileExtension("   ")).toBe("attachment");
  });
});

describe("buildEditedImageFile", () => {
  it("builds a File from imageBase64 payload", () => {
    const file = buildEditedImageFile(
      {
        imageBase64: "data:image/png;base64,aGVsbG8=",
        mimeType: "image/png",
      },
      "receipt.png",
    );

    expect(file).not.toBeNull();
    expect(file?.name).toBe("receipt-edited.png");
    expect(file?.type).toBe("image/png");
    expect(file?.size).toBeGreaterThan(0);
  });

  it("uses saved extension when provided", () => {
    const file = buildEditedImageFile(
      {
        imageBase64: "data:image/jpeg;base64,aGVsbG8=",
        extension: "jpeg",
      },
      "capture.png",
    );

    expect(file?.name).toBe("capture-edited.jpeg");
  });

  it("returns null when no image data is present", () => {
    const file = buildEditedImageFile({}, "capture.png");
    expect(file).toBeNull();
  });
});

describe("buildEditedCanvasFile", () => {
  it("builds a File from an HTMLCanvasElement", async () => {
    const canvas = document.createElement("canvas");
    Object.defineProperty(canvas, "toBlob", {
      configurable: true,
      value: (callback: BlobCallback, mimeType?: string) => {
        callback(new Blob(["canvas-data"], { type: mimeType ?? "image/png" }));
      },
    });

    const file = await buildEditedCanvasFile(canvas, "receipt.jpeg", {
      mimeType: "image/jpeg",
      suffix: "annotated",
    });

    expect(file).not.toBeNull();
    expect(file?.name).toBe("receipt-annotated.jpg");
    expect(file?.type).toBe("image/jpeg");
    expect(file?.size).toBeGreaterThan(0);
  });

  it("returns null when blob export fails", async () => {
    const canvas = document.createElement("canvas");
    Object.defineProperty(canvas, "toBlob", {
      configurable: true,
      value: (callback: BlobCallback) => {
        callback(null);
      },
    });

    const file = await buildEditedCanvasFile(canvas, "proof.png");
    expect(file).toBeNull();
  });
});

export type EditorSavedImageData = {
  name?: string;
  fullName?: string;
  extension?: string;
  mimeType?: string;
  imageBase64?: string;
  imageCanvas?: HTMLCanvasElement;
};

const DEFAULT_MIME_TYPE = "image/png";
const DEFAULT_OUTPUT_SUFFIX = "edited";

export function stripFileExtension(fileName: string): string {
  const trimmed = fileName.trim();
  if (!trimmed) return "attachment";
  const dotIndex = trimmed.lastIndexOf(".");
  if (dotIndex <= 0) return trimmed;
  return trimmed.slice(0, dotIndex);
}

function sanitizeFileBaseName(fileName: string): string {
  const clean = stripFileExtension(fileName)
    .replace(/[^\w\s().-]/g, "")
    .trim();
  return clean || "attachment";
}

function normalizeExtension(extension: string | undefined, mimeType: string): string {
  const ext = (extension ?? "").replace(".", "").trim().toLowerCase();
  if (ext) return ext;
  if (mimeType.includes("jpeg")) return "jpg";
  if (mimeType.includes("webp")) return "webp";
  return "png";
}

function extensionFromMimeType(mimeType: string): string {
  return normalizeExtension(undefined, mimeType);
}

function dataUrlToBlob(dataUrl: string, fallbackMimeType: string): Blob | null {
  const parts = dataUrl.split(",");
  if (parts.length < 2) return null;
  const header = parts[0] ?? "";
  const payload = parts[1] ?? "";
  const mimeMatch = header.match(/data:(.*?);base64/i);
  const mimeType = mimeMatch?.[1]?.trim() || fallbackMimeType;

  let binaryString = "";
  if (typeof atob === "function") {
    binaryString = atob(payload);
  } else if (typeof Buffer !== "undefined") {
    binaryString = Buffer.from(payload, "base64").toString("binary");
  } else {
    return null;
  }

  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i += 1) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
}

export function buildEditedImageFile(
  savedImageData: EditorSavedImageData,
  fallbackOriginalName: string,
): File | null {
  const normalizedMimeType =
    savedImageData.mimeType?.trim().toLowerCase() || DEFAULT_MIME_TYPE;

  const sourceBaseName = sanitizeFileBaseName(
    savedImageData.fullName || savedImageData.name || fallbackOriginalName,
  );
  const finalExtension = normalizeExtension(
    savedImageData.extension,
    normalizedMimeType,
  );
  const outputFileName = `${sourceBaseName}-edited.${finalExtension}`;

  if (savedImageData.imageBase64) {
    const blob = dataUrlToBlob(savedImageData.imageBase64, normalizedMimeType);
    if (!blob) return null;
    return new File([blob], outputFileName, {
      type: blob.type || normalizedMimeType,
      lastModified: Date.now(),
    });
  }

  if (savedImageData.imageCanvas) {
    const imageDataUrl = savedImageData.imageCanvas.toDataURL(normalizedMimeType);
    const blob = dataUrlToBlob(imageDataUrl, normalizedMimeType);
    if (!blob) return null;
    return new File([blob], outputFileName, {
      type: blob.type || normalizedMimeType,
      lastModified: Date.now(),
    });
  }

  return null;
}

type BuildEditedCanvasFileOptions = {
  mimeType?: string;
  quality?: number;
  suffix?: string;
};

function safeCanvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number | undefined,
): Promise<Blob | null> {
  return new Promise((resolve, reject) => {
    if (typeof canvas.toBlob === "function") {
      try {
        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          mimeType,
          quality,
        );
      } catch (error) {
        reject(error);
      }
      return;
    }

    try {
      const dataUrl = canvas.toDataURL(mimeType, quality);
      resolve(dataUrlToBlob(dataUrl, mimeType));
    } catch (error) {
      reject(error);
    }
  });
}

export async function buildEditedCanvasFile(
  canvas: HTMLCanvasElement,
  fallbackOriginalName: string,
  options?: BuildEditedCanvasFileOptions,
): Promise<File | null> {
  const normalizedMimeType =
    options?.mimeType?.trim().toLowerCase() || DEFAULT_MIME_TYPE;
  const normalizedQuality = options?.quality;
  const outputSuffix = options?.suffix?.trim() || DEFAULT_OUTPUT_SUFFIX;
  const sourceBaseName = sanitizeFileBaseName(fallbackOriginalName);
  const outputFileName = `${sourceBaseName}-${outputSuffix}.${extensionFromMimeType(normalizedMimeType)}`;

  const blob = await safeCanvasToBlob(canvas, normalizedMimeType, normalizedQuality);
  if (!blob) return null;

  return new File([blob], outputFileName, {
    type: blob.type || normalizedMimeType,
    lastModified: Date.now(),
  });
}

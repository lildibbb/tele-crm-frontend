"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type PointerEvent,
} from "react";
import {
  ArrowUpRight,
  Check,
  Crop,
  Loader2,
  PenLine,
  Redo2,
  RotateCw,
  Type,
  Undo2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { buildEditedCanvasFile } from "@/lib/editedImage";
import { K, useT } from "@/i18n";
import { cn } from "@/lib/utils";

export type AttachmentAnnotationDialogProps = {
  open: boolean;
  sourceUrl: string | null;
  sourceFileName: string;
  onClose: () => void;
  onSave: (file: File) => void | Promise<void>;
  layout?: "desktop" | "mobile";
};

type ToolId = "pen" | "arrow" | "text" | "crop";

type Point = {
  x: number;
  y: number;
};

type CropRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type ArrowDraft = {
  start: Point;
  end: Point;
};

const MAX_HISTORY_LENGTH = 25;
const MIN_CROP_SIZE = 16;
const MAX_IMAGE_DIMENSION = 1600;
const DEFAULT_STROKE_COLOR = "#dc2626";
const DEFAULT_LINE_WIDTH = 3;
const DEFAULT_TEXT_VALUE = "Note";
const SOURCE_FETCH_TIMEOUT_MS = 8000;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load image"));
    image.src = src;
  });
}

function isInlineSource(url: string): boolean {
  return url.startsWith("blob:") || url.startsWith("data:");
}

function getCanvasPoint(
  event: PointerEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement,
): Point {
  const rect = canvas.getBoundingClientRect();
  const scaleX = rect.width === 0 ? 1 : canvas.width / rect.width;
  const scaleY = rect.height === 0 ? 1 : canvas.height / rect.height;

  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

function normalizeCropRect(start: Point, end: Point): CropRect {
  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);
  return {
    x,
    y,
    width: Math.abs(end.x - start.x),
    height: Math.abs(end.y - start.y),
  };
}

function drawArrow(
  context: CanvasRenderingContext2D,
  start: Point,
  end: Point,
  color: string,
  lineWidth: number,
) {
  const headLength = Math.max(10, lineWidth * 4);
  const angle = Math.atan2(end.y - start.y, end.x - start.x);

  context.save();
  context.strokeStyle = color;
  context.fillStyle = color;
  context.lineWidth = lineWidth;
  context.lineCap = "round";
  context.lineJoin = "round";

  context.beginPath();
  context.moveTo(start.x, start.y);
  context.lineTo(end.x, end.y);
  context.stroke();

  context.beginPath();
  context.moveTo(end.x, end.y);
  context.lineTo(
    end.x - headLength * Math.cos(angle - Math.PI / 6),
    end.y - headLength * Math.sin(angle - Math.PI / 6),
  );
  context.lineTo(
    end.x - headLength * Math.cos(angle + Math.PI / 6),
    end.y - headLength * Math.sin(angle + Math.PI / 6),
  );
  context.closePath();
  context.fill();
  context.restore();
}

function clampCropRect(
  rect: CropRect,
  canvas: HTMLCanvasElement,
): CropRect | null {
  const x = Math.max(0, Math.min(canvas.width, rect.x));
  const y = Math.max(0, Math.min(canvas.height, rect.y));
  const maxWidth = canvas.width - x;
  const maxHeight = canvas.height - y;
  const width = Math.max(0, Math.min(maxWidth, rect.width));
  const height = Math.max(0, Math.min(maxHeight, rect.height));
  if (width < MIN_CROP_SIZE || height < MIN_CROP_SIZE) return null;
  return { x, y, width, height };
}

const TOOL_BUTTONS: ReadonlyArray<{
  id: ToolId;
  labelKey: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  { id: "pen", labelKey: K.lead.annotation.toolPen, icon: PenLine },
  { id: "arrow", labelKey: K.lead.annotation.toolArrow, icon: ArrowUpRight },
  { id: "text", labelKey: K.lead.annotation.toolText, icon: Type },
  { id: "crop", labelKey: K.lead.annotation.toolCrop, icon: Crop },
];

export default function AttachmentAnnotationDialog({
  open,
  sourceUrl,
  sourceFileName,
  onClose,
  onSave,
  layout = "desktop",
}: AttachmentAnnotationDialogProps) {
  const t = useT();
  const isMobileLayout = layout === "mobile";
  const [isSaving, setIsSaving] = useState(false);
  const [isPreparingSource, setIsPreparingSource] = useState(false);
  const [preparedSourceUrl, setPreparedSourceUrl] = useState<string | null>(
    null,
  );
  const [isImageReady, setIsImageReady] = useState(false);
  const [hasSourceError, setHasSourceError] = useState(false);
  const [isExportBlocked, setIsExportBlocked] = useState(false);
  const [activeTool, setActiveTool] = useState<ToolId>("pen");
  const [strokeColor, setStrokeColor] = useState(DEFAULT_STROKE_COLOR);
  const [lineWidth, setLineWidth] = useState(DEFAULT_LINE_WIDTH);
  const [textValue, setTextValue] = useState(DEFAULT_TEXT_VALUE);
  const [cropRect, setCropRect] = useState<CropRect | null>(null);
  const [pendingArrow, setPendingArrow] = useState<ArrowDraft | null>(null);
  const [, setHistoryVersion] = useState(0);

  const baseCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isPointerDownRef = useRef(false);
  const lastPointRef = useRef<Point | null>(null);
  const cropStartRef = useRef<Point | null>(null);
  const preparedObjectUrlRef = useRef<string | null>(null);
  const sourceJobTokenRef = useRef(0);

  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);

  const canUndo = historyIndexRef.current > 0;
  const canRedo =
    historyIndexRef.current >= 0 &&
    historyIndexRef.current < historyRef.current.length - 1;

  const clearPreparedObjectUrl = useCallback(() => {
    if (!preparedObjectUrlRef.current) return;
    URL.revokeObjectURL(preparedObjectUrlRef.current);
    preparedObjectUrlRef.current = null;
  }, []);

  const syncOverlayToBase = useCallback(() => {
    const baseCanvas = baseCanvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    if (!baseCanvas || !overlayCanvas) return;
    overlayCanvas.width = baseCanvas.width;
    overlayCanvas.height = baseCanvas.height;
  }, []);

  const clearOverlay = useCallback(() => {
    const overlayCanvas = overlayCanvasRef.current;
    if (!overlayCanvas) return;
    const context = overlayCanvas.getContext("2d");
    if (!context) return;
    context.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  }, []);

  const redrawOverlay = useCallback(() => {
    const overlayCanvas = overlayCanvasRef.current;
    if (!overlayCanvas) return;
    const context = overlayCanvas.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    if (cropRect) {
      context.save();
      context.fillStyle = "rgba(0, 0, 0, 0.28)";
      context.fillRect(0, 0, overlayCanvas.width, overlayCanvas.height);
      context.clearRect(
        cropRect.x,
        cropRect.y,
        cropRect.width,
        cropRect.height,
      );
      context.setLineDash([8, 4]);
      context.strokeStyle = "#ffffff";
      context.lineWidth = 2;
      context.strokeRect(
        cropRect.x,
        cropRect.y,
        cropRect.width,
        cropRect.height,
      );
      context.restore();
    }

    if (pendingArrow) {
      drawArrow(
        context,
        pendingArrow.start,
        pendingArrow.end,
        strokeColor,
        lineWidth,
      );
    }
  }, [cropRect, lineWidth, pendingArrow, strokeColor]);

  useEffect(() => {
    redrawOverlay();
  }, [redrawOverlay]);

  const prepareSourceUrl = useCallback(
    async (rawSourceUrl: string): Promise<string> => {
      const trimmedSourceUrl = rawSourceUrl.trim();
      if (!trimmedSourceUrl) {
        throw new Error("Missing source URL");
      }

      if (isInlineSource(trimmedSourceUrl)) {
        return trimmedSourceUrl;
      }

      const controller = new AbortController();
      const timeoutId = window.setTimeout(
        () => controller.abort(),
        SOURCE_FETCH_TIMEOUT_MS,
      );

      try {
        const response = await fetch(trimmedSourceUrl, {
          mode: "cors",
          credentials: "omit",
          cache: "no-store",
          redirect: "follow",
          signal: controller.signal,
        });
        if (!response.ok) {
          return trimmedSourceUrl;
        }

        const blob = await response.blob();
        if (!blob.type.startsWith("image/")) {
          return trimmedSourceUrl;
        }

        clearPreparedObjectUrl();
        const objectUrl = URL.createObjectURL(blob);
        preparedObjectUrlRef.current = objectUrl;
        return objectUrl;
      } catch {
        return trimmedSourceUrl;
      } finally {
        window.clearTimeout(timeoutId);
      }
    },
    [clearPreparedObjectUrl],
  );

  const pushHistorySnapshot = useCallback(() => {
    const baseCanvas = baseCanvasRef.current;
    if (!baseCanvas) return;

    try {
      const snapshot = baseCanvas.toDataURL("image/png");

      const currentHistory = historyRef.current;
      const currentIndex = historyIndexRef.current;
      const currentSnapshot = currentHistory[currentIndex];
      if (snapshot === currentSnapshot) return;

      const nextHistory = currentHistory.slice(0, currentIndex + 1);
      nextHistory.push(snapshot);

      if (nextHistory.length > MAX_HISTORY_LENGTH) {
        nextHistory.shift();
      }

      historyRef.current = nextHistory;
      historyIndexRef.current = nextHistory.length - 1;
      setHistoryVersion((value) => value + 1);
      setIsExportBlocked(false);
    } catch (error) {
      // If canvas is tainted, toDataURL will throw a SecurityError
      console.error(
        "Failed to take history snapshot (CORS/Tainted Canvas):",
        error,
      );
      setIsExportBlocked(true);
    }
  }, []);

  const restoreHistorySnapshot = useCallback(
    async (index: number) => {
      const baseCanvas = baseCanvasRef.current;
      const overlayCanvas = overlayCanvasRef.current;
      if (!baseCanvas || !overlayCanvas) return;

      const snapshot = historyRef.current[index];
      if (!snapshot) return;

      const image = await loadImage(snapshot);
      baseCanvas.width = image.naturalWidth;
      baseCanvas.height = image.naturalHeight;

      const context = baseCanvas.getContext("2d");
      if (!context) return;
      context.clearRect(0, 0, baseCanvas.width, baseCanvas.height);
      context.drawImage(image, 0, 0, baseCanvas.width, baseCanvas.height);

      syncOverlayToBase();
      clearOverlay();
      setCropRect(null);
      setPendingArrow(null);

      historyIndexRef.current = index;
      setHistoryVersion((value) => value + 1);
    },
    [clearOverlay, syncOverlayToBase],
  );

  const loadSourceImage = useCallback(async () => {
    const baseCanvas = baseCanvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;

    if (!baseCanvas || !overlayCanvas || !preparedSourceUrl) {
      setIsImageReady(false);
      return;
    }

    setIsImageReady(false);
    setCropRect(null);
    setPendingArrow(null);
    setIsExportBlocked(false);
    clearOverlay();

    const image = await loadImage(preparedSourceUrl).catch(async () => {
      if (!sourceUrl) throw new Error("Missing source URL");
      const fallbackUrl = sourceUrl.trim();
      if (!fallbackUrl || fallbackUrl === preparedSourceUrl) {
        throw new Error("Failed to load prepared image source");
      }
      return loadImage(fallbackUrl);
    });
    if (!image.naturalWidth || !image.naturalHeight) {
      throw new Error("Image has invalid dimensions");
    }

    const scale = Math.min(
      1,
      MAX_IMAGE_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight),
    );
    const canvasWidth = Math.max(1, Math.round(image.naturalWidth * scale));
    const canvasHeight = Math.max(1, Math.round(image.naturalHeight * scale));

    baseCanvas.width = canvasWidth;
    baseCanvas.height = canvasHeight;

    const context = baseCanvas.getContext("2d");
    if (!context) {
      throw new Error("Failed to initialize canvas context");
    }

    context.clearRect(0, 0, canvasWidth, canvasHeight);
    context.drawImage(image, 0, 0, canvasWidth, canvasHeight);
    syncOverlayToBase();

    historyRef.current = [];
    historyIndexRef.current = -1;
    pushHistorySnapshot();
    setIsImageReady(true);
  }, [
    clearOverlay,
    preparedSourceUrl,
    pushHistorySnapshot,
    sourceUrl,
    syncOverlayToBase,
  ]);

  useEffect(() => {
    if (!open || !sourceUrl) {
      setPreparedSourceUrl(null);
      setHasSourceError(false);
      setIsPreparingSource(false);
      return;
    }

    let cancelled = false;
    const nextToken = sourceJobTokenRef.current + 1;
    sourceJobTokenRef.current = nextToken;
    setIsPreparingSource(true);
    setHasSourceError(false);
    setIsImageReady(false);
    setPreparedSourceUrl(null);

    void prepareSourceUrl(sourceUrl)
      .then((normalizedUrl) => {
        if (cancelled || sourceJobTokenRef.current !== nextToken) return;
        setPreparedSourceUrl(normalizedUrl);
      })
      .catch(() => {
        if (cancelled || sourceJobTokenRef.current !== nextToken) return;
        setHasSourceError(true);
        toast.error(t(K.lead.annotation.runtimeError));
      })
      .finally(() => {
        if (cancelled || sourceJobTokenRef.current !== nextToken) return;
        setIsPreparingSource(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, prepareSourceUrl, sourceUrl, t]);

  useEffect(() => {
    if (!open || !preparedSourceUrl || isPreparingSource) return;

    const timeoutId = window.setTimeout(() => {
      void loadSourceImage().catch(() => {
        setIsImageReady(false);
        setHasSourceError(true);
        toast.error(t(K.lead.annotation.runtimeError));
      });
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [isPreparingSource, loadSourceImage, open, preparedSourceUrl, t]);

  useEffect(() => {
    if (!open) {
      setCropRect(null);
      setPendingArrow(null);
      setHistoryVersion((value) => value + 1);
      isPointerDownRef.current = false;
      lastPointRef.current = null;
      cropStartRef.current = null;
      clearPreparedObjectUrl();
      setPreparedSourceUrl(null);
      setHasSourceError(false);
      setIsPreparingSource(false);
      setIsImageReady(false);
      setIsExportBlocked(false);
    }
  }, [clearPreparedObjectUrl, open]);

  useEffect(
    () => () => {
      clearPreparedObjectUrl();
    },
    [clearPreparedObjectUrl],
  );

  const commitArrow = useCallback(
    (draft: ArrowDraft) => {
      const baseCanvas = baseCanvasRef.current;
      if (!baseCanvas) return;
      const context = baseCanvas.getContext("2d");
      if (!context) return;
      drawArrow(context, draft.start, draft.end, strokeColor, lineWidth);
      pushHistorySnapshot();
    },
    [lineWidth, pushHistorySnapshot, strokeColor],
  );

  const applyCrop = useCallback(() => {
    const baseCanvas = baseCanvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    if (!baseCanvas || !overlayCanvas || !cropRect) return;

    const clamped = clampCropRect(cropRect, baseCanvas);
    if (!clamped) {
      toast.error(t(K.lead.annotation.saveError));
      return;
    }

    const scratchCanvas = document.createElement("canvas");
    scratchCanvas.width = Math.round(clamped.width);
    scratchCanvas.height = Math.round(clamped.height);
    const scratchContext = scratchCanvas.getContext("2d");
    if (!scratchContext) return;

    scratchContext.drawImage(
      baseCanvas,
      clamped.x,
      clamped.y,
      clamped.width,
      clamped.height,
      0,
      0,
      scratchCanvas.width,
      scratchCanvas.height,
    );

    baseCanvas.width = scratchCanvas.width;
    baseCanvas.height = scratchCanvas.height;

    const baseContext = baseCanvas.getContext("2d");
    if (!baseContext) return;
    baseContext.clearRect(0, 0, baseCanvas.width, baseCanvas.height);
    baseContext.drawImage(scratchCanvas, 0, 0);

    syncOverlayToBase();
    clearOverlay();
    setCropRect(null);
    pushHistorySnapshot();
  }, [clearOverlay, cropRect, pushHistorySnapshot, syncOverlayToBase, t]);

  const handleUndo = useCallback(() => {
    const targetIndex = historyIndexRef.current - 1;
    if (targetIndex < 0) return;
    void restoreHistorySnapshot(targetIndex);
  }, [restoreHistorySnapshot]);

  const handleRedo = useCallback(() => {
    const targetIndex = historyIndexRef.current + 1;
    if (targetIndex >= historyRef.current.length) return;
    void restoreHistorySnapshot(targetIndex);
  }, [restoreHistorySnapshot]);

  const handleReset = useCallback(() => {
    if (historyRef.current.length === 0) return;
    void restoreHistorySnapshot(0);
  }, [restoreHistorySnapshot]);

  const handleRotate = useCallback(() => {
    const baseCanvas = baseCanvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    if (!baseCanvas || !overlayCanvas) return;

    const scratchCanvas = document.createElement("canvas");
    scratchCanvas.width = baseCanvas.height;
    scratchCanvas.height = baseCanvas.width;
    const scratchContext = scratchCanvas.getContext("2d");
    if (!scratchContext) return;

    scratchContext.translate(scratchCanvas.width / 2, scratchCanvas.height / 2);
    scratchContext.rotate(Math.PI / 2);
    scratchContext.drawImage(
      baseCanvas,
      -baseCanvas.width / 2,
      -baseCanvas.height / 2,
    );

    baseCanvas.width = scratchCanvas.width;
    baseCanvas.height = scratchCanvas.height;
    const baseContext = baseCanvas.getContext("2d");
    if (!baseContext) return;

    baseContext.clearRect(0, 0, baseCanvas.width, baseCanvas.height);
    baseContext.drawImage(scratchCanvas, 0, 0);

    syncOverlayToBase();
    clearOverlay();
    setCropRect(null);
    setPendingArrow(null);
    pushHistorySnapshot();
  }, [clearOverlay, pushHistorySnapshot, syncOverlayToBase]);

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLCanvasElement>) => {
      const baseCanvas = baseCanvasRef.current;
      if (!baseCanvas || !isImageReady || isSaving) return;

      event.currentTarget.setPointerCapture(event.pointerId);
      const point = getCanvasPoint(event, baseCanvas);

      if (activeTool === "text") {
        const text = textValue.trim();
        if (!text) {
          toast.error(t(K.lead.annotation.saveError));
          return;
        }
        const context = baseCanvas.getContext("2d");
        if (!context) return;

        context.save();
        context.fillStyle = strokeColor;
        context.font = "600 24px Inter, Arial, sans-serif";
        context.textBaseline = "top";
        context.fillText(text, point.x, point.y);
        context.restore();
        pushHistorySnapshot();
        return;
      }

      isPointerDownRef.current = true;
      lastPointRef.current = point;

      if (activeTool === "pen") {
        const context = baseCanvas.getContext("2d");
        if (!context) return;
        context.save();
        context.strokeStyle = strokeColor;
        context.lineWidth = lineWidth;
        context.lineCap = "round";
        context.lineJoin = "round";
        context.beginPath();
        context.moveTo(point.x, point.y);
        context.lineTo(point.x, point.y);
        context.stroke();
        context.restore();
        return;
      }

      if (activeTool === "arrow") {
        setPendingArrow({ start: point, end: point });
        return;
      }

      if (activeTool === "crop") {
        cropStartRef.current = point;
        setCropRect({ x: point.x, y: point.y, width: 0, height: 0 });
      }
    },
    [
      activeTool,
      isImageReady,
      isSaving,
      lineWidth,
      pushHistorySnapshot,
      strokeColor,
      t,
      textValue,
    ],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLCanvasElement>) => {
      if (!isPointerDownRef.current) return;
      const baseCanvas = baseCanvasRef.current;
      if (!baseCanvas) return;

      const nextPoint = getCanvasPoint(event, baseCanvas);
      const previousPoint = lastPointRef.current;

      if (activeTool === "pen" && previousPoint) {
        const context = baseCanvas.getContext("2d");
        if (!context) return;
        context.save();
        context.strokeStyle = strokeColor;
        context.lineWidth = lineWidth;
        context.lineCap = "round";
        context.lineJoin = "round";
        context.beginPath();
        context.moveTo(previousPoint.x, previousPoint.y);
        context.lineTo(nextPoint.x, nextPoint.y);
        context.stroke();
        context.restore();
        lastPointRef.current = nextPoint;
        return;
      }

      if (activeTool === "arrow") {
        setPendingArrow((current) =>
          current ? { start: current.start, end: nextPoint } : null,
        );
        return;
      }

      if (activeTool === "crop" && cropStartRef.current) {
        setCropRect(normalizeCropRect(cropStartRef.current, nextPoint));
      }
    },
    [activeTool, lineWidth, strokeColor],
  );

  const handlePointerUp = useCallback(
    (event: PointerEvent<HTMLCanvasElement>) => {
      if (!isPointerDownRef.current) return;
      event.currentTarget.releasePointerCapture(event.pointerId);
      isPointerDownRef.current = false;

      if (activeTool === "pen") {
        pushHistorySnapshot();
      }

      if (activeTool === "arrow" && pendingArrow) {
        commitArrow(pendingArrow);
        setPendingArrow(null);
        clearOverlay();
      }

      if (activeTool === "crop") {
        const baseCanvas = baseCanvasRef.current;
        if (!baseCanvas || !cropRect) return;
        const clamped = clampCropRect(cropRect, baseCanvas);
        setCropRect(clamped);
      }

      lastPointRef.current = null;
      cropStartRef.current = null;
    },
    [
      activeTool,
      clearOverlay,
      commitArrow,
      cropRect,
      pendingArrow,
      pushHistorySnapshot,
    ],
  );

  const handleDone = useCallback(async () => {
    const baseCanvas = baseCanvasRef.current;
    if (!baseCanvas) {
      toast.error(t(K.lead.annotation.saveError));
      return;
    }

    setIsSaving(true);
    try {
      if (isExportBlocked) {
        toast.error(t(K.lead.annotation.corsBlocked));
        return;
      }

      const editedFile = await buildEditedCanvasFile(
        baseCanvas,
        sourceFileName,
        {
          mimeType: "image/png",
          quality: 0.95,
        },
      ).catch((error) => {
        // Handle SecurityError for tainted canvas specifically
        if (error instanceof Error && error.name === "SecurityError") {
          throw new Error("CANVAS_TAINTED");
        }
        throw error;
      });

      if (!editedFile) {
        toast.error(t(K.lead.annotation.saveError));
        return;
      }

      await Promise.resolve(onSave(editedFile));
      toast.success(t(K.lead.annotation.editedAttached));
      onClose();
    } catch (error) {
      console.error("Image save error:", error);
      if (error instanceof Error && error.message === "CANVAS_TAINTED") {
        toast.error(t(K.lead.annotation.corsBlocked));
      } else {
        toast.error(t(K.lead.annotation.saveError));
      }
    } finally {
      setIsSaving(false);
    }
  }, [isExportBlocked, onClose, onSave, sourceFileName, t]);

  const toolButtons = useMemo(
    () =>
      TOOL_BUTTONS.map((tool) => {
        const Icon = tool.icon;
        const isActive = activeTool === tool.id;
        return (
          <Button
            key={tool.id}
            type="button"
            size="sm"
            variant={isActive ? "default" : "outline"}
            className={cn(
              "h-9 gap-1.5",
              isMobileLayout ? "w-9 px-0" : "px-2.5 sm:px-3",
            )}
            onClick={() => setActiveTool(tool.id)}
            disabled={isSaving || !isImageReady}
            aria-label={t(tool.labelKey)}
          >
            <Icon className="h-3.5 w-3.5" />
            {!isMobileLayout && (
              <span className="hidden sm:inline">{t(tool.labelKey)}</span>
            )}
          </Button>
        );
      }),
    [activeTool, isImageReady, isMobileLayout, isSaving, t],
  );

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden border-border-subtle bg-[#0b1018] p-0",
          isMobileLayout
            ? "!inset-0 !left-0 !top-0 !m-0 !h-[100dvh] !max-h-[100dvh] !w-[100dvw] !max-w-[100dvw] !translate-x-0 !translate-y-0 rounded-none border-0"
            : "h-[100dvh] max-w-[100vw] sm:h-auto sm:max-h-[94vh] sm:max-w-6xl sm:rounded-2xl",
        )}
      >
        <DialogHeader
          className={cn(
            "border-b border-white/10 bg-black/30 px-4",
            isMobileLayout ? "pt-3 pb-2" : "py-3",
          )}
          style={
            isMobileLayout
              ? { paddingTop: "max(0.75rem, env(safe-area-inset-top))" }
              : undefined
          }
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <DialogTitle className="flex items-center gap-2 text-base text-white">
                <PenLine className="h-4 w-4" />
                {t(K.lead.annotation.title)}
              </DialogTitle>
              <DialogDescription className="truncate text-xs text-white/65 sm:text-sm">
                {sourceFileName || t(K.lead.annotation.description)}
              </DialogDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              disabled={isSaving}
              className="text-white hover:bg-white/10 hover:text-white"
              aria-label={t(K.common.close)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div
          className={cn(
            "flex h-full min-h-0 flex-col",
            !isMobileLayout && "sm:h-[72vh] sm:min-h-[520px]",
          )}
        >
          {sourceUrl ? (
            <>
              <div
                className={cn(
                  "flex items-center gap-2 border-b border-white/10 bg-black/25 px-3 py-2",
                  isMobileLayout
                    ? "overflow-x-auto whitespace-nowrap"
                    : "flex-wrap",
                )}
              >
                {toolButtons}
                <label
                  className={cn(
                    "flex items-center gap-1 text-xs text-white/75",
                    isMobileLayout ? "ml-1 shrink-0" : "ml-auto",
                  )}
                >
                  {t(K.lead.annotation.strokeColor)}
                  <input
                    type="color"
                    value={strokeColor}
                    onChange={(event) => setStrokeColor(event.target.value)}
                    className="h-8 w-9 cursor-pointer rounded border border-white/20 bg-transparent p-0"
                    disabled={isSaving || !isImageReady}
                    aria-label={t(K.lead.annotation.strokeColor)}
                  />
                </label>
                <label className="shrink-0 flex items-center gap-1 text-xs text-white/75">
                  {t(K.lead.annotation.strokeSize)}
                  <input
                    type="range"
                    min={1}
                    max={12}
                    value={lineWidth}
                    onChange={(event) =>
                      setLineWidth(Number.parseInt(event.target.value, 10))
                    }
                    className="w-20"
                    disabled={isSaving || !isImageReady}
                    aria-label={t(K.lead.annotation.strokeSize)}
                  />
                </label>
                {activeTool === "text" && (
                  <input
                    type="text"
                    value={textValue}
                    onChange={(event) => setTextValue(event.target.value)}
                    className={cn(
                      "h-8 rounded-md border border-white/20 bg-black/40 px-2 text-xs text-white placeholder:text-white/50",
                      isMobileLayout ? "min-w-32" : "min-w-36",
                    )}
                    placeholder={t(K.lead.annotation.textPlaceholder)}
                    maxLength={80}
                    disabled={isSaving || !isImageReady}
                    aria-label={t(K.lead.annotation.toolText)}
                  />
                )}
              </div>

              <div className="relative flex-1 overflow-auto bg-[#070b12]">
                <div className="flex min-h-full items-center justify-center p-3 sm:p-4">
                  <div className="relative">
                    <canvas
                      ref={baseCanvasRef}
                      className={cn(
                        "h-auto w-auto select-none rounded-[4px] bg-black object-contain",
                        isMobileLayout
                          ? "max-h-full max-w-full"
                          : "max-h-[55dvh] sm:max-h-[56vh] sm:max-w-full",
                      )}
                    />
                    <canvas
                      ref={overlayCanvasRef}
                      className={cn(
                        "absolute inset-0 h-auto w-auto touch-none rounded-[4px] object-contain",
                        isMobileLayout
                          ? "max-h-full max-w-full m-auto"
                          : "max-h-[55dvh] sm:max-h-[56vh] sm:max-w-full m-auto",
                        activeTool === "text"
                          ? "cursor-text"
                          : "cursor-crosshair",
                      )}
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                    />
                  </div>
                </div>

                {(isPreparingSource || !isImageReady) && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/45">
                    {hasSourceError ? (
                      <div className="pointer-events-auto flex flex-col items-center gap-2 rounded-lg border border-danger/60 bg-danger/15 px-4 py-3">
                        <p className="text-center text-sm text-danger">
                          {t(K.lead.annotation.runtimeError)}
                        </p>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-8 border-danger/50 bg-transparent text-danger hover:bg-danger/15"
                          onClick={() => {
                            setHasSourceError(false);
                            setPreparedSourceUrl(null);
                            setIsImageReady(false);
                            sourceJobTokenRef.current += 1;
                            setIsPreparingSource(true);
                            void prepareSourceUrl(sourceUrl ?? "")
                              .then((normalizedUrl) => {
                                setPreparedSourceUrl(normalizedUrl);
                              })
                              .catch(() => {
                                setHasSourceError(true);
                              })
                              .finally(() => {
                                setIsPreparingSource(false);
                              });
                          }}
                        >
                          {t(K.common.retry)}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 rounded-full bg-black/55 px-3 py-2 text-xs text-white/80 sm:text-sm">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t(K.common.loading)}
                      </div>
                    )}
                  </div>
                )}

                {isExportBlocked && isImageReady && (
                  <div className="pointer-events-none absolute inset-x-2 bottom-2 rounded-md border border-warning/60 bg-warning/10 px-3 py-2 text-center text-xs text-warning sm:inset-x-4">
                    {t(K.lead.annotation.corsBlocked)}
                  </div>
                )}
              </div>

              <div
                className={cn(
                  "flex items-center gap-2 border-t border-white/10 bg-black/30 px-3 py-2",
                  isMobileLayout
                    ? "justify-between"
                    : "flex-wrap justify-between",
                )}
                style={{
                  paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
                }}
              >
                <div
                  className={cn(
                    "flex items-center gap-2",
                    isMobileLayout
                      ? "min-w-0 flex-1 overflow-x-auto pr-1"
                      : "flex-wrap",
                  )}
                >
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleUndo}
                    disabled={!canUndo || isSaving}
                  >
                    <Undo2 className="h-3.5 w-3.5" />
                    <span
                      className={cn(
                        isMobileLayout && "hidden",
                        "hidden sm:inline",
                      )}
                    >
                      {t(K.lead.annotation.undo)}
                    </span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRedo}
                    disabled={!canRedo || isSaving}
                  >
                    <Redo2 className="h-3.5 w-3.5" />
                    <span
                      className={cn(
                        isMobileLayout && "hidden",
                        "hidden sm:inline",
                      )}
                    >
                      {t(K.lead.annotation.redo)}
                    </span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRotate}
                    disabled={isSaving || !isImageReady}
                  >
                    <RotateCw className="h-3.5 w-3.5" />
                    <span
                      className={cn(
                        isMobileLayout && "hidden",
                        "hidden sm:inline",
                      )}
                    >
                      {t(K.lead.annotation.rotate)}
                    </span>
                  </Button>
                  {cropRect && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={applyCrop}
                      disabled={isSaving || !isImageReady}
                    >
                      <Crop className="h-3.5 w-3.5" />
                      <span
                        className={cn(
                          isMobileLayout && "hidden",
                          "hidden sm:inline",
                        )}
                      >
                        {t(K.lead.annotation.applyCrop)}
                      </span>
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    disabled={isSaving || !isImageReady}
                  >
                    {t(K.lead.annotation.reset)}
                  </Button>
                </div>

                <Button
                  type="button"
                  size="default"
                  className={cn(
                    "h-10 shrink-0 gap-1.5 px-4",
                    isMobileLayout && "min-w-[120px]",
                  )}
                  onClick={() => void handleDone()}
                  disabled={
                    isSaving ||
                    !isImageReady ||
                    hasSourceError ||
                    isExportBlocked
                  }
                >
                  <Check className="h-3.5 w-3.5" />
                  {isSaving
                    ? t(K.lead.annotation.saving)
                    : t(K.lead.annotation.done)}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-sm text-text-muted">
              {t(K.lead.annotation.noSource)}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

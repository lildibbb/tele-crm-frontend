"use client";

import { useState, useRef } from "react";
import {
  Upload,
  X,
  Camera,
  Play,
  Send,
  FileVideo,
  ImageIcon,
  CheckCircle,
} from "lucide-react";

type FileItem = { name: string; type: "image" | "video"; preview?: string };

export default function TMADepositPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [hfmId, setHfmId] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (selected: FileList | null) => {
    if (!selected) return;
    const newFiles: FileItem[] = Array.from(selected).map((f) => ({
      name: f.name,
      type: f.type.startsWith("video") ? "video" : "image",
      preview: f.type.startsWith("image") ? URL.createObjectURL(f) : undefined,
    }));
    setFiles((prev) => [...prev, ...newFiles].slice(0, 3));
  };

  const removeFile = (i: number) =>
    setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1400));
    setLoading(false);
    setDone(true);
  };

  /* brand colours inlined so TMA light theme works */
  const brand = "#C4232D";
  const textMain = "#1A1A2E";
  const textSub = "#6B6B8A";
  const border = "#E2E2F0";
  const bg = "#FFFFFF";
  const card = "#F8F8FC";

  if (done)
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{ background: bg }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
          style={{ background: "#ECFDF5" }}
        >
          <CheckCircle className="h-8 w-8 text-green-500" />
        </div>
        <h2
          className="font-display font-bold text-2xl text-center mb-2"
          style={{ color: textMain }}
        >
          Deposit Submitted!
        </h2>
        <p
          className="font-sans text-sm text-center mb-6"
          style={{ color: textSub }}
        >
          Your proof has been received and is pending review. We&apos;ll notify
          you via Telegram.
        </p>
        <button
          onClick={() => setDone(false)}
          style={{ background: brand, borderRadius: "16px", height: "52px" }}
          className="w-full max-w-sm text-white font-sans font-semibold"
        >
          Submit Another
        </button>
      </div>
    );

  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{ color: textMain }}
    >
      {/* Background image */}
      <img
        src="/assets/bg/tma-mobile-bg.jpeg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-top"
        aria-hidden="true"
      />
      <div className="absolute inset-0" style={{ background: "rgba(255,255,255,0.90)" }} aria-hidden="true" />
      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1">
      {/* Header */}
      <div className="text-center px-6 pt-8 pb-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-3"
          style={{ background: brand }}
        >
          <Upload className="h-4 w-4 text-white" />
        </div>
        <h1
          className="font-display font-bold text-xl"
          style={{ color: textMain }}
        >
          TITAN <span style={{ color: brand }}>JOURNAL</span> CRM
        </h1>
        <p className="font-sans text-xs mt-1" style={{ color: textSub }}>
          Deposit Verification
        </p>
        <div className="h-px mt-4 mx-4" style={{ background: border }} />
      </div>

      {/* Form */}
      <div className="flex-1 px-6 pt-4 pb-8 max-w-md mx-auto w-full">
        <div className="mb-6">
          <h2
            className="font-display font-bold text-2xl mb-1"
            style={{ color: textMain }}
          >
            Upload Proof of Transfer
          </h2>
          <p className="font-sans text-sm" style={{ color: textSub }}>
            Upload your bank receipt or transfer screenshot for verification
          </p>
        </div>

        <form onSubmit={submit} className="space-y-5">
          {/* Upload zone */}
          <div>
            <label
              className="block text-xs font-medium font-sans mb-2"
              style={{ color: textSub }}
            >
              Receipt / Screenshot *
            </label>
            <div
              onClick={() => inputRef.current?.click()}
              className="w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all active:opacity-70"
              style={{
                borderColor: files.length > 0 ? brand : border,
                background: files.length > 0 ? "#FFF5F5" : card,
                minHeight: "140px",
              }}
            >
              {files.length === 0 ? (
                <div className="py-8 text-center px-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                    style={{ background: `${brand}1A` }}
                  >
                    <Camera className="h-6 w-6" style={{ color: brand }} />
                  </div>
                  <p
                    className="font-sans font-medium text-sm"
                    style={{ color: textMain }}
                  >
                    Tap to upload
                  </p>
                  <p
                    className="font-sans text-xs mt-1"
                    style={{ color: textSub }}
                  >
                    JPG, PNG, MP4 — max 20MB each
                  </p>
                  <div className="flex items-center gap-2 justify-center mt-3">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-sans font-medium"
                      style={{ background: `${brand}1A`, color: brand }}
                    >
                      📷 Photo
                    </span>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-sans font-medium"
                      style={{ background: `${brand}1A`, color: brand }}
                    >
                      🎬 Video
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3 p-4 w-full">
                  {files.map((f, i) => (
                    <div
                      key={i}
                      className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0"
                      style={{
                        background: "#F0F0FA",
                        border: `1px solid ${border}`,
                      }}
                    >
                      {f.preview ? (
                        <img
                          src={f.preview}
                          alt={f.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {f.type === "video" ? (
                            <FileVideo
                              className="h-6 w-6"
                              style={{ color: brand }}
                            />
                          ) : (
                            <ImageIcon className="h-6 w-6 opacity-40" />
                          )}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(i);
                        }}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(0,0,0,0.6)" }}
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  ))}
                  {files.length < 3 && (
                    <div
                      className="w-20 h-20 rounded-xl border-2 border-dashed flex items-center justify-center flex-shrink-0 cursor-pointer"
                      style={{ borderColor: "#D0D0E8" }}
                    >
                      <Plus style={{ color: textSub }} className="h-5 w-5" />
                    </div>
                  )}
                </div>
              )}
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <p className="font-sans text-xs mt-1.5" style={{ color: textSub }}>
              Upload up to 3 files
            </p>
          </div>

          {/* HFM ID */}
          <div>
            <label
              className="block text-xs font-medium font-sans mb-1.5"
              style={{ color: textSub }}
            >
              HFM Broker ID *
            </label>
            <input
              type="text"
              required
              value={hfmId}
              onChange={(e) => setHfmId(e.target.value)}
              placeholder="HFM-12345"
              style={{
                background: card,
                border: `1px solid ${border}`,
                color: textMain,
                height: "48px",
                borderRadius: "12px",
              }}
              className="w-full px-4 font-sans text-sm focus:outline-none"
              onFocus={(e) => {
                e.target.style.borderColor = brand;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = border;
              }}
            />
          </div>

          {/* Amount */}
          <div>
            <label
              className="block text-xs font-medium font-sans mb-1.5"
              style={{ color: textSub }}
            >
              Deposit Amount (USD) *
            </label>
            <div className="relative">
              <span
                className="absolute left-4 top-1/2 -translate-y-1/2 font-sans font-medium"
                style={{ color: textSub }}
              >
                $
              </span>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                style={{
                  background: card,
                  border: `1px solid ${border}`,
                  color: textMain,
                  height: "48px",
                  borderRadius: "12px",
                }}
                className="w-full pl-8 pr-4 font-sans text-sm focus:outline-none"
                onFocus={(e) => {
                  e.target.style.borderColor = brand;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = border;
                }}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label
              className="block text-xs font-medium font-sans mb-1.5"
              style={{ color: textSub }}
            >
              Additional Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional info for verification…"
              rows={3}
              style={{
                background: card,
                border: `1px solid ${border}`,
                color: textMain,
                borderRadius: "12px",
              }}
              className="w-full px-4 py-3 font-sans text-sm focus:outline-none resize-none transition-colors"
              onFocus={(e) => {
                e.target.style.borderColor = brand;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = border;
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || files.length === 0}
            style={{ background: brand, borderRadius: "16px", height: "52px" }}
            className="w-full flex items-center justify-center gap-2.5 text-white font-sans font-semibold text-base transition-opacity disabled:opacity-60 active:opacity-80 mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send className="h-4 w-4" /> Submit for Verification
              </>
            )}
          </button>
        </form>
      </div>
      </div>
    </div>
  );
}

// tiny helper to avoid TS error
function Plus({
  style,
  className,
}: {
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      className={className}
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

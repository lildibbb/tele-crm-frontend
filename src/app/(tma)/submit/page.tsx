"use client";

import { useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  Shield,
  Upload,
  Send,
  CheckCircle,
  XCircle,
  Camera,
  X,
  FileVideo,
  ImageIcon,
  Plus,
} from "lucide-react";
import { submitForm } from "@/lib/api/leads.public";

type FileItem = {
  file: File;
  name: string;
  type: "image" | "video";
  preview?: string;
};

const brand = "#C4232D";
const textMain = "#1A1A2E";
const textSub = "#6B6B8A";
const border = "#E2E2F0";
const bg = "#FFFFFF";
const card = "#F8F8FC";

function InputField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        className="block text-xs font-sans font-medium mb-1.5"
        style={{ color: textSub }}
      >
        {label}
        {required && <span style={{ color: brand }}> *</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: card,
  border: `1px solid ${border}`,
  color: textMain,
  height: "48px",
  borderRadius: "12px",
  fontSize: "14px",
};

function styledInput(extra?: React.CSSProperties) {
  return { ...inputStyle, ...extra };
}

export default function TMASubmitPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  // Form state
  const [hfmId, setHfmId] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<FileItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Submission state
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // File handling
  const handleFiles = (selected: FileList | null) => {
    if (!selected) return;
    const newFiles: FileItem[] = Array.from(selected).map((f) => ({
      file: f,
      name: f.name,
      type: f.type.startsWith("video") ? "video" : "image",
      preview: f.type.startsWith("image") ? URL.createObjectURL(f) : undefined,
    }));
    setFiles((prev) => [...prev, ...newFiles].slice(0, 3));
  };

  const removeFile = (i: number) =>
    setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    setSubmitError(null);
    try {
      await submitForm({
        token,
        hfmBrokerId: hfmId || undefined,
        email: email || undefined,
        phoneNumber: phone || undefined,
        depositBalance: amount || undefined,
        notes: notes || undefined,
        files: files.length > 0 ? files.map((f) => f.file) : undefined,
      });
      setDone(true);
    } catch (err: unknown) {
      setSubmitError(
        err instanceof Error ? err.message : "Submission failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Missing token ────────────────────────────────────────────────────────────
  if (!token) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{ background: bg }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
          style={{ background: "#FEF2F2" }}
        >
          <XCircle className="h-8 w-8" style={{ color: "#EF4444" }} />
        </div>
        <h2
          className="font-display font-bold text-2xl text-center mb-2"
          style={{ color: textMain }}
        >
          Invalid Link
        </h2>
        <p className="font-sans text-sm text-center" style={{ color: textSub }}>
          This link is invalid or missing. Please request a new link from the Telegram bot.
        </p>
      </div>
    );
  }

  // ── Success state ────────────────────────────────────────────────────────────
  if (done) {
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
          Submitted Successfully!
        </h2>
        <p
          className="font-sans text-sm text-center mb-6"
          style={{ color: textSub }}
        >
          Your registration and deposit proof have been received. We will verify and notify you via Telegram shortly.
        </p>
      </div>
    );
  }

  // ── Main form ────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{ color: textMain }}
    >
      <img
        src="/assets/bg/tma-mobile-bg.jpeg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-top"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0"
        style={{ background: "rgba(255,255,255,0.90)" }}
        aria-hidden="true"
      />
      <div className="relative z-10 flex flex-col flex-1">
        {/* Header */}
        <div className="text-center px-6 pt-8 pb-4">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: brand }}
            >
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span
              className="font-display font-bold text-lg tracking-tight"
              style={{ color: textMain }}
            >
              TITAN <span style={{ color: brand }}>JOURNAL</span> CRM
            </span>
          </div>
          <div className="h-px bg-tma-border mx-4" style={{ background: border }} />
        </div>

        {/* Form */}
        <div className="flex-1 px-6 pt-4 pb-8 max-w-md mx-auto w-full">
          <div className="mb-6">
            <h1
              className="font-display font-bold text-2xl mb-1"
              style={{ color: textMain }}
            >
              Registration & Deposit
            </h1>
            <p className="font-sans text-sm leading-relaxed" style={{ color: textSub }}>
              Complete your IB account registration and submit your deposit proof in one step.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* File upload */}
            <InputField label="Receipt / Screenshot (optional)">
              <div
                onClick={() => inputRef.current?.click()}
                className="w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all active:opacity-70"
                style={{
                  borderColor: files.length > 0 ? brand : border,
                  background: files.length > 0 ? "#FFF5F5" : card,
                  minHeight: "120px",
                }}
              >
                {files.length === 0 ? (
                  <div className="py-6 text-center px-4">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2"
                      style={{ background: `${brand}1A` }}
                    >
                      <Camera className="h-5 w-5" style={{ color: brand }} />
                    </div>
                    <p className="font-sans font-medium text-sm" style={{ color: textMain }}>
                      Tap to upload
                    </p>
                    <p className="font-sans text-xs mt-0.5" style={{ color: textSub }}>
                      JPG, PNG, MP4 — max 20MB each
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3 p-4 w-full">
                    {files.map((f, i) => (
                      <div
                        key={i}
                        className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0"
                        style={{ background: "#F0F0FA", border: `1px solid ${border}` }}
                      >
                        {f.preview ? (
                          <img src={f.preview} alt={f.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {f.type === "video" ? (
                              <FileVideo className="h-6 w-6" style={{ color: brand }} />
                            ) : (
                              <ImageIcon className="h-6 w-6 opacity-40" />
                            )}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ background: "rgba(0,0,0,0.6)" }}
                        >
                          <X className="h-3 w-3 text-white" />
                        </button>
                      </div>
                    ))}
                    {files.length < 3 && (
                      <div
                        className="w-20 h-20 rounded-xl border-2 border-dashed flex items-center justify-center flex-shrink-0"
                        style={{ borderColor: "#D0D0E8" }}
                      >
                        <Plus className="h-5 w-5" style={{ color: textSub }} />
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
              <p className="font-sans text-xs mt-1" style={{ color: textSub }}>
                Upload up to 3 files
              </p>
            </InputField>

            {/* HFM Broker ID */}
            <InputField label="HFM Broker ID" required>
              <input
                type="text"
                placeholder="e.g. HFM-12345"
                value={hfmId}
                onChange={(e) => setHfmId(e.target.value)}
                required
                style={styledInput()}
                className="w-full px-4 font-sans focus:outline-none transition-colors"
                onFocus={(e) => (e.target.style.borderColor = brand)}
                onBlur={(e) => (e.target.style.borderColor = border)}
              />
            </InputField>

            {/* Deposit amount */}
            <InputField label="Deposit Amount (USD)" required>
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
                  style={styledInput()}
                  className="w-full pl-8 pr-4 font-sans text-sm focus:outline-none"
                  onFocus={(e) => (e.target.style.borderColor = brand)}
                  onBlur={(e) => (e.target.style.borderColor = border)}
                />
              </div>
            </InputField>

            {/* Email */}
            <InputField label="Email Address">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styledInput()}
                className="w-full px-4 font-sans focus:outline-none transition-colors"
                onFocus={(e) => (e.target.style.borderColor = brand)}
                onBlur={(e) => (e.target.style.borderColor = border)}
              />
            </InputField>

            {/* Phone */}
            <InputField label="Phone Number">
              <input
                type="tel"
                placeholder="+60 12 345 6789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={styledInput()}
                className="w-full px-4 font-sans focus:outline-none transition-colors"
                onFocus={(e) => (e.target.style.borderColor = brand)}
                onBlur={(e) => (e.target.style.borderColor = border)}
              />
            </InputField>

            {/* Notes */}
            <InputField label="Additional Notes (optional)">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional info for verification…"
                rows={3}
                style={{ ...styledInput(), height: "auto", borderRadius: "12px" }}
                className="w-full px-4 py-3 font-sans text-sm focus:outline-none resize-none"
                onFocus={(e) => (e.target.style.borderColor = brand)}
                onBlur={(e) => (e.target.style.borderColor = border)}
              />
            </InputField>

            {submitError && (
              <p className="font-sans text-sm text-red-500 text-center">
                {submitError}
              </p>
            )}

            <div className="pt-1">
              <button
                type="submit"
                disabled={loading || !amount}
                style={{ background: brand, height: "52px", borderRadius: "16px" }}
                className="w-full flex items-center justify-center gap-2 text-white font-sans font-semibold text-base transition-opacity active:opacity-80 disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit for Verification
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-5 text-center">
            <p className="font-sans text-xs" style={{ color: "#9A9AB0" }}>
              <Upload className="h-3 w-3 inline mr-1 mb-0.5" />
              Having trouble? Contact support via Telegram
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

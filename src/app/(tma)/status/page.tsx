"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  XCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";

// ── Demo state — switch between these to see all three screens ──
type VerificationStatus = "PENDING" | "APPROVED" | "REJECTED";

interface StatusConfig {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  badgeLabel: string;
  bgColor: string;
  iconColor: string;
  borderColor: string;
}

const STATUS_CONFIG: Record<VerificationStatus, StatusConfig> = {
  PENDING: {
    icon: Clock,
    title: "Under Review",
    subtitle:
      "Your deposit proof has been submitted and is currently being reviewed by our team.",
    badgeLabel: "Pending Review",
    bgColor: "#FFFBEB",
    iconColor: "#D97706",
    borderColor: "#FDE68A",
  },
  APPROVED: {
    icon: CheckCircle2,
    title: "Deposit Verified! 🎉",
    subtitle:
      "Your deposit has been verified and your account is now fully activated. Welcome aboard!",
    badgeLabel: "Approved ✓",
    bgColor: "#ECFDF5",
    iconColor: "#059669",
    borderColor: "#A7F3D0",
  },
  REJECTED: {
    icon: XCircle,
    title: "Verification Failed",
    subtitle:
      "Your deposit proof could not be verified. Please re-upload a clearer image or contact support.",
    badgeLabel: "Not Verified",
    bgColor: "#FFF5F5",
    iconColor: "#DC2626",
    borderColor: "#FECACA",
  },
};

const HISTORY_ITEMS = [
  { label: "Registration Submitted", date: "Jan 15, 2026", done: true },
  { label: "HFM Broker ID Verified", date: "Jan 16, 2026", done: true },
  { label: "Deposit Proof Submitted", date: "Jan 20, 2026", done: true },
  { label: "Verification Review", date: "Pending", done: false },
  { label: "Account Fully Activated", date: "—", done: false },
];

export default function TMAStatusPage() {
  // Toggle to see different states
  const [currentStatus, setCurrentStatus] =
    useState<VerificationStatus>("PENDING");
  const [showHistory, setShowHistory] = useState(false);

  const config = STATUS_CONFIG[currentStatus];
  const StatusIcon = config.icon;

  const textMain = "#1A1A2E";
  const textSub = "#6B6B8A";
  const brand = "#C4232D";
  const bg = "#F8F8FC";
  const border = "#E2E2F0";

  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{ color: textMain }}
    >
      {/* Conditional background: confirmed gets celebration bg, others get standard mobile bg */}
      <img
        src={currentStatus === "APPROVED" ? "/assets/bg/tma-confirmed-bg.jpeg" : "/assets/bg/tma-mobile-bg.jpeg"}
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-top transition-all duration-700"
        aria-hidden="true"
      />
      <div className="absolute inset-0" style={{ background: "rgba(255,255,255,0.88)" }} aria-hidden="true" />
      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1">
      {/* Header */}
      <div className="text-center px-6 pt-8 pb-4">
        <h1
          className="font-display font-bold text-xl"
          style={{ color: textMain }}
        >
          TITAN <span style={{ color: brand }}>JOURNAL</span> CRM
        </h1>
        <p className="font-sans text-xs mt-1" style={{ color: textSub }}>
          Account Status
        </p>
        <div className="h-px mt-4 mx-4" style={{ background: border }} />
      </div>

      <div className="flex-1 px-6 pb-8 max-w-md mx-auto w-full pt-4 space-y-5">
        {/* Main status card */}
        <div
          className="rounded-2xl p-6 border-2"
          style={{
            background: config.bgColor,
            borderColor: config.borderColor,
          }}
        >
          <div className="flex flex-col items-center text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ background: `${config.iconColor}20` }}
            >
              <StatusIcon
                className="h-8 w-8"
                style={{ color: config.iconColor }}
              />
            </div>
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-sans font-semibold mb-3"
              style={{
                background: `${config.iconColor}20`,
                color: config.iconColor,
              }}
            >
              {config.badgeLabel}
            </span>
            <h2
              className="font-display font-bold text-2xl mb-2"
              style={{ color: textMain }}
            >
              {config.title}
            </h2>
            <p
              className="font-sans text-sm leading-relaxed"
              style={{ color: textSub }}
            >
              {config.subtitle}
            </p>
          </div>
        </div>

        {/* Submission Summary */}
        <div
          className="rounded-2xl p-5"
          style={{ background: "#FFFFFF", border: `1px solid ${border}` }}
        >
          <h3
            className="font-sans font-semibold text-sm mb-4"
            style={{ color: textMain }}
          >
            Submission Details
          </h3>
          <div className="space-y-3">
            {[
              { label: "Name", value: "Ahmed Faris" },
              { label: "HFM ID", value: "HFM-88421", mono: true },
              {
                label: "Deposit Amount",
                value: "$500.00 USD",
                highlight: true,
              },
              { label: "Submitted", value: "Jan 20, 2026 — 14:32" },
              {
                label: "Reference No.",
                value: `TJ-${Math.floor(Math.random() * 9999)
                  .toString()
                  .padStart(4, "0")}`,
                mono: true,
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-3"
              >
                <span className="font-sans text-xs" style={{ color: textSub }}>
                  {row.label}
                </span>
                <span
                  className={`text-xs font-sans font-medium ${row.mono ? "font-mono" : ""}`}
                  style={{ color: row.highlight ? "#D97706" : textMain }}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline — collapsible */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "#FFFFFF", border: `1px solid ${border}` }}
        >
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full px-5 py-4 flex items-center justify-between"
          >
            <span
              className="font-sans font-semibold text-sm"
              style={{ color: textMain }}
            >
              Verification Timeline
            </span>
            {showHistory ? (
              <ChevronUp className="h-4 w-4" style={{ color: textSub }} />
            ) : (
              <ChevronDown className="h-4 w-4" style={{ color: textSub }} />
            )}
          </button>

          {showHistory && (
            <div className="px-5 pb-5 relative">
              <div
                className="absolute left-8 top-0 bottom-5 w-px"
                style={{ background: border }}
              />
              <div className="space-y-4">
                {HISTORY_ITEMS.map((item, i) => (
                  <div key={i} className="flex items-start gap-4 relative">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex-shrink-0 z-10 mt-0.5 flex items-center justify-center ${item.done ? "border-green-500 bg-green-50" : "border-gray-300 bg-white"}`}
                    >
                      {item.done && (
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      )}
                    </div>
                    <div>
                      <p
                        className="font-sans text-sm font-medium"
                        style={{ color: item.done ? textMain : textSub }}
                      >
                        {item.label}
                      </p>
                      <p
                        className="font-mono text-xs"
                        style={{ color: textSub }}
                      >
                        {item.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CTA depending on status */}
        {currentStatus === "PENDING" && (
          <div className="text-center">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-1.5 mx-auto text-sm font-sans font-medium"
              style={{ color: brand }}
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh Status
            </button>
            <p className="font-sans text-xs mt-2" style={{ color: textSub }}>
              Usually takes 1–4 hours
            </p>
          </div>
        )}

        {currentStatus === "REJECTED" && (
          <a
            href="/tma/deposit"
            style={{
              background: brand,
              borderRadius: "16px",
              height: "52px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            className="w-full text-white font-sans font-semibold text-base"
          >
            Re-upload Deposit Proof
          </a>
        )}

        {currentStatus === "APPROVED" && (
          <div
            className="rounded-2xl p-5 text-center"
            style={{ background: "#ECFDF5", border: "1px solid #A7F3D0" }}
          >
            <p
              className="font-display font-bold text-lg"
              style={{ color: "#059669" }}
            >
              Account Activated
            </p>
            <p className="font-sans text-sm mt-1" style={{ color: "#065F46" }}>
              Your IB account is fully set up. Start trading!
            </p>
          </div>
        )}

        {/* Dev state switcher (remove in prod) */}
        <div className="flex items-center gap-2 justify-center pt-2">
          {(["PENDING", "APPROVED", "REJECTED"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setCurrentStatus(s)}
              className="px-2.5 py-1 rounded text-[10px] font-mono transition-colors"
              style={{
                background: currentStatus === s ? brand : "#E2E2F0",
                color: currentStatus === s ? "#fff" : textSub,
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}

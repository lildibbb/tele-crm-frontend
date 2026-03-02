"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  XCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";
import { getLeadStatus, type LeadStatusData } from "@/lib/api/leads.public";

type VerificationStatus = "PENDING" | "APPROVED" | "REJECTED" | "LOADING" | "ERROR";

interface StatusConfig {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  badgeLabel: string;
  bgColor: string;
  iconColor: string;
  borderColor: string;
}

const STATUS_CONFIG: Record<Exclude<VerificationStatus, "LOADING" | "ERROR">, StatusConfig> = {
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

function deriveStatus(apiStatus: string): Exclude<VerificationStatus, "LOADING" | "ERROR"> {
  if (apiStatus === "DEPOSIT_CONFIRMED") return "APPROVED";
  if (apiStatus === "DEPOSIT_REPORTED") return "PENDING";
  return "REJECTED";
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TMAStatusPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [lead, setLead] = useState<LeadStatusData | null>(null);
  const [uiStatus, setUiStatus] = useState<VerificationStatus>("LOADING");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const fetchStatus = useCallback(async () => {
    if (!token) {
      setErrorMsg("This link is invalid or missing. Please request a new link from the Telegram bot.");
      setUiStatus("ERROR");
      return;
    }
    setUiStatus("LOADING");
    try {
      const res = await getLeadStatus(token);
      setLead(res.data);
      setUiStatus(deriveStatus(res.data.status));
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to load status.");
      setUiStatus("ERROR");
    }
  }, [token]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const textMain = "#1A1A2E";
  const textSub = "#6B6B8A";
  const brand = "#C4232D";
  const bg = "#F8F8FC";
  const border = "#E2E2F0";

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (uiStatus === "LOADING") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: bg }}>
        <div className="w-6 h-6 border-2 border-gray-200 border-t-red-500 rounded-full animate-spin" />
      </div>
    );
  }

  // ── Error / invalid token ────────────────────────────────────────────────────
  if (uiStatus === "ERROR") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: bg }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "#FEF2F2" }}>
          <XCircle className="h-8 w-8" style={{ color: "#EF4444" }} />
        </div>
        <h2 className="font-display font-bold text-2xl text-center mb-2" style={{ color: textMain }}>
          Unable to Load Status
        </h2>
        <p className="font-sans text-sm text-center" style={{ color: textSub }}>{errorMsg}</p>
      </div>
    );
  }

  const config = STATUS_CONFIG[uiStatus as Exclude<VerificationStatus, "LOADING" | "ERROR">];
  const StatusIcon = config.icon;

  const timelineItems = [
    { label: "Registration Submitted", date: formatDate(lead?.createdAt ?? null), done: !!lead?.createdAt },
    { label: "HFM Broker ID Linked", date: lead?.hfmBrokerId ? formatDate(lead.registeredAt) : "Pending", done: !!lead?.hfmBrokerId },
    { label: "Deposit Proof Submitted", date: formatDateTime(lead?.depositReportedAt ?? null), done: !!lead?.depositReportedAt },
    { label: "Verification Review", date: lead?.verifiedAt ? formatDateTime(lead.verifiedAt) : "Pending", done: !!lead?.verifiedAt },
    { label: "Account Fully Activated", date: uiStatus === "APPROVED" ? formatDate(lead?.verifiedAt ?? null) : "—", done: uiStatus === "APPROVED" },
  ];

  return (
    <div className="min-h-screen flex flex-col relative" style={{ color: textMain }}>
      <img
        src={uiStatus === "APPROVED" ? "/assets/bg/tma-confirmed-bg.jpeg" : "/assets/bg/tma-mobile-bg.jpeg"}
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-top transition-all duration-700"
        aria-hidden="true"
      />
      <div className="absolute inset-0" style={{ background: "rgba(255,255,255,0.88)" }} aria-hidden="true" />
      <div className="relative z-10 flex flex-col flex-1">
        {/* Header */}
        <div className="text-center px-6 pt-8 pb-4">
          <h1 className="font-display font-bold text-xl" style={{ color: textMain }}>
            TITAN <span style={{ color: brand }}>JOURNAL</span> CRM
          </h1>
          <p className="font-sans text-xs mt-1" style={{ color: textSub }}>Account Status</p>
          <div className="h-px mt-4 mx-4" style={{ background: border }} />
        </div>

        <div className="flex-1 px-6 pb-8 max-w-md mx-auto w-full pt-4 space-y-5">
          {/* Status card */}
          <div className="rounded-2xl p-6 border-2" style={{ background: config.bgColor, borderColor: config.borderColor }}>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: `${config.iconColor}20` }}>
                <StatusIcon className="h-8 w-8" style={{ color: config.iconColor }} />
              </div>
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-sans font-semibold mb-3"
                style={{ background: `${config.iconColor}20`, color: config.iconColor }}
              >
                {config.badgeLabel}
              </span>
              <h2 className="font-display font-bold text-2xl mb-2" style={{ color: textMain }}>
                {config.title}
              </h2>
              <p className="font-sans text-sm leading-relaxed" style={{ color: textSub }}>
                {config.subtitle}
              </p>
            </div>
          </div>

          {/* Submission details */}
          <div className="rounded-2xl p-5" style={{ background: "#FFFFFF", border: `1px solid ${border}` }}>
            <h3 className="font-sans font-semibold text-sm mb-4" style={{ color: textMain }}>
              Submission Details
            </h3>
            <div className="space-y-3">
              {[
                { label: "Name", value: lead?.displayName ?? "—" },
                { label: "HFM ID", value: lead?.hfmBrokerId ?? "—", mono: true },
                { label: "Deposit Amount", value: lead?.depositBalance ? `$${lead.depositBalance} USD` : "—", highlight: true },
                { label: "Submitted", value: formatDateTime(lead?.depositReportedAt ?? null) },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3">
                  <span className="font-sans text-xs" style={{ color: textSub }}>{row.label}</span>
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
          <div className="rounded-2xl overflow-hidden" style={{ background: "#FFFFFF", border: `1px solid ${border}` }}>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full px-5 py-4 flex items-center justify-between"
            >
              <span className="font-sans font-semibold text-sm" style={{ color: textMain }}>
                Verification Timeline
              </span>
              {showHistory
                ? <ChevronUp className="h-4 w-4" style={{ color: textSub }} />
                : <ChevronDown className="h-4 w-4" style={{ color: textSub }} />}
            </button>

            {showHistory && (
              <div className="px-5 pb-5 relative">
                <div className="absolute left-8 top-0 bottom-5 w-px" style={{ background: border }} />
                <div className="space-y-4">
                  {timelineItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-4 relative">
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 z-10 mt-0.5 flex items-center justify-center ${item.done ? "border-green-500 bg-green-50" : "border-gray-300 bg-white"}`}>
                        {item.done && <div className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                      </div>
                      <div>
                        <p className="font-sans text-sm font-medium" style={{ color: item.done ? textMain : textSub }}>
                          {item.label}
                        </p>
                        <p className="font-mono text-xs" style={{ color: textSub }}>{item.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CTAs */}
          {uiStatus === "PENDING" && (
            <div className="text-center">
              <button
                onClick={fetchStatus}
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

          {uiStatus === "REJECTED" && token && (
            <a
              href={`/tma/submit?token=${encodeURIComponent(token)}`}
              style={{ background: brand, borderRadius: "16px", height: "52px", display: "flex", alignItems: "center", justifyContent: "center" }}
              className="w-full text-white font-sans font-semibold text-base"
            >
              Re-upload Deposit Proof
            </a>
          )}

          {uiStatus === "APPROVED" && (
            <div className="rounded-2xl p-5 text-center" style={{ background: "#ECFDF5", border: "1px solid #A7F3D0" }}>
              <p className="font-display font-bold text-lg" style={{ color: "#059669" }}>
                Account Activated
              </p>
              <p className="font-sans text-sm mt-1" style={{ color: "#065F46" }}>
                Your IB account is fully set up. Start trading!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

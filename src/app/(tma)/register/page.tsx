"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Shield, Send } from "lucide-react";

export default function TMARegistrationPage() {
  const [hfmId, setHfmId] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSuccess(true);
  };

  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{ color: "var(--color-tma-text)" }}
    >
      {/* Background image */}
      <img
        src="/assets/bg/tma-mobile-bg.jpeg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-top"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-white/88" aria-hidden="true" />
      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1">
      {/* Header */}
      <div className="text-center px-6 pt-8 pb-4">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--color-tma-brand)" }}
          >
            <Shield className="h-4 w-4 text-white" />
          </div>
          <span
            className="font-display font-bold text-lg tracking-tight"
            style={{ color: "var(--color-tma-text)" }}
          >
            TITAN{" "}
            <span style={{ color: "var(--color-tma-brand)" }}>JOURNAL</span> CRM
          </span>
        </div>
        <div className="h-px bg-tma-border mx-4" />
      </div>

      {/* Form area */}
      <div className="flex-1 px-6 pt-6 pb-8 max-w-md mx-auto w-full">
        {success ? (
          /* Success state */
          <div className="text-center py-10">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "#ECFDF5" }}
            >
              <CheckCircle className="h-8 w-8" style={{ color: "#22D3A0" }} />
            </div>
            <h2
              className="font-display font-bold text-2xl mb-2"
              style={{ color: "var(--color-tma-text)" }}
            >
              Registration Submitted!
            </h2>
            <p
              className="font-sans text-sm mb-6"
              style={{ color: "var(--color-tma-text-muted)" }}
            >
              Your details have been received. A confirmation will be sent to
              your Telegram shortly.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="w-full py-4 rounded-2xl font-sans font-semibold text-base text-white transition-opacity active:opacity-80"
              style={{ background: "var(--color-tma-brand)" }}
            >
              Go Back
            </button>
          </div>
        ) : (
          <>
            {/* Hero */}
            <div className="mb-7">
              <h1
                className="font-display font-bold text-2xl mb-2"
                style={{ color: "var(--color-tma-text)" }}
              >
                Register Your Account
              </h1>
              <p
                className="font-sans text-sm leading-relaxed"
                style={{ color: "var(--color-tma-text-muted)" }}
              >
                Provide your details below to complete your IB account
                registration.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  className="block text-xs font-sans font-medium mb-1.5"
                  style={{ color: "var(--color-tma-text-muted)" }}
                >
                  HFM Broker ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. HFM-12345"
                  value={hfmId}
                  onChange={(e) => setHfmId(e.target.value)}
                  required
                  style={{
                    background: "var(--color-tma-bg)",
                    border: "1px solid var(--color-tma-border)",
                    color: "var(--color-tma-text)",
                    fontSize: "14px",
                    height: "48px",
                  }}
                  className="w-full px-3 rounded-xl font-sans focus:outline-none transition-colors"
                  onFocus={(e) =>
                    (e.target.style.borderColor = "var(--color-tma-brand)")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = "var(--color-tma-border)")
                  }
                />
              </div>

              <div>
                <label
                  className="block text-xs font-sans font-medium mb-1.5"
                  style={{ color: "var(--color-tma-text-muted)" }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    background: "var(--color-tma-bg)",
                    border: "1px solid var(--color-tma-border)",
                    color: "var(--color-tma-text)",
                    fontSize: "14px",
                    height: "48px",
                  }}
                  className="w-full px-3 rounded-xl font-sans focus:outline-none transition-colors"
                  onFocus={(e) =>
                    (e.target.style.borderColor = "var(--color-tma-brand)")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = "var(--color-tma-border)")
                  }
                />
              </div>

              <div>
                <label
                  className="block text-xs font-sans font-medium mb-1.5"
                  style={{ color: "var(--color-tma-text-muted)" }}
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+60 12 345 6789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    background: "var(--color-tma-bg)",
                    border: "1px solid var(--color-tma-border)",
                    color: "var(--color-tma-text)",
                    fontSize: "14px",
                    height: "48px",
                  }}
                  className="w-full px-3 rounded-xl font-sans focus:outline-none transition-colors"
                  onFocus={(e) =>
                    (e.target.style.borderColor = "var(--color-tma-brand)")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = "var(--color-tma-border)")
                  }
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: "var(--color-tma-brand)",
                    height: "52px",
                    borderRadius: "16px",
                  }}
                  className="w-full flex items-center justify-center gap-2 text-white font-sans font-semibold text-base transition-opacity active:opacity-80 disabled:opacity-60"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Submit Registration
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Footer */}
            <div className="mt-6 space-y-2 text-center">
              <p className="font-sans text-[13px]">
                <span
                  style={{
                    color: "var(--color-tma-brand)",
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                >
                  Where can I find my HFM ID?
                </span>
              </p>
              <p className="font-sans text-xs" style={{ color: "#9A9AB0" }}>
                Having trouble? Contact support
              </p>
            </div>
          </>
        )}
      </div>
      </div>
    </div>
  );
}

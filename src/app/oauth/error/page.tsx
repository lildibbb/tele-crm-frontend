"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

function ErrorContent() {
  const params = useSearchParams();
  const reason = params.get("reason") ?? "unknown";

  useEffect(() => {
    if (window.opener) {
      window.opener.postMessage("google-oauth-error", window.location.origin);
    }
    const t = setTimeout(() => window.close(), 1000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 mx-auto rounded-full bg-danger/10 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-danger"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <p className="text-sm text-text-primary font-medium">
          Connection failed
        </p>
        <p className="text-xs text-text-muted">Reason: {reason}</p>
        <p className="text-xs text-text-muted">Closing window…</p>
      </div>
    </div>
  );
}

export default function OAuthErrorPage() {
  return (
    <Suspense>
      <ErrorContent />
    </Suspense>
  );
}

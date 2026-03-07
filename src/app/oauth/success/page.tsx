"use client";

import { useEffect } from "react";

/**
 * Tiny page opened in a popup by the Google OAuth2 connect flow.
 * Sends a postMessage to the opener (main window) and closes itself.
 */
export default function OAuthSuccessPage() {
  useEffect(() => {
    if (window.opener) {
      window.opener.postMessage("google-oauth-success", window.location.origin);
    }
    // Close the popup after a brief delay so the message is delivered
    const t = setTimeout(() => window.close(), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 mx-auto rounded-full bg-success/10 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-success"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <p className="text-sm text-text-primary font-medium">Connected!</p>
        <p className="text-xs text-text-muted">Closing window…</p>
      </div>
    </div>
  );
}

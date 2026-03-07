"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { CheckCircle, Prohibit } from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useGoogleOAuth2Status,
  useGoogleConnect,
  useGoogleDisconnect,
} from "@/queries/useGoogleOAuth2Query";
import { useAuthStore } from "@/store/authStore";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Disconnect Confirm Dialog ────────────────────────────────────────────────

function DisconnectDialog({
  onConfirm,
  isPending,
}: {
  onConfirm: () => void;
  isPending: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="text-xs h-7 px-3 border-danger/30 text-danger hover:bg-danger/10 hover:text-danger hover:border-danger/50 transition-colors"
        onClick={() => setOpen(true)}
      >
        Disconnect
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          {/* Dialog */}
          <div className="relative z-10 w-full max-w-md bg-card rounded-xl border border-border-subtle shadow-xl p-6 space-y-4">
            <div className="space-y-1.5">
              <h3 className="text-base font-semibold text-text-primary">
                Disconnect Google Drive?
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Future syncs will fall back to the service account (if
                configured). This will revoke the OAuth2 token from Google.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-danger hover:bg-danger/90 text-white text-xs"
                onClick={() => {
                  onConfirm();
                  setOpen(false);
                }}
                disabled={isPending}
              >
                {isPending ? "Disconnecting…" : "Disconnect"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Main Card ────────────────────────────────────────────────────────────────

export function GoogleDriveConnectionCard() {
  const { data, isLoading, error } = useGoogleOAuth2Status();
  const connect = useGoogleConnect();
  const disconnect = useGoogleDisconnect();

  const { user } = useAuthStore();
  const role = user?.role ?? "STAFF";
  const isOwner = role === "OWNER" || role === "SUPERADMIN";

  const isConnected = data?.connected === true;

  return (
    <div className="page-panel bg-elevated rounded-xl border border-border-subtle overflow-hidden">
      {/* ── Header ── */}
      <div className="px-5 py-4 bg-card border-b border-border-subtle flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "shrink-0 transition-opacity whitespace-nowrap",
              !isConnected && "opacity-40",
            )}
          >
            <Icon icon="logos:google-drive" className="w-[22px] h-[22px]" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-text-primary font-sans">
              Google Drive — OAuth2
            </h2>
            <p className="text-[11px] text-text-muted mt-0.5 font-sans">
              Connect your Google account for personal Drive sync
            </p>
          </div>
        </div>

        {/* Connection status badge */}
        {!isLoading && !error && (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-medium ${
              isConnected ? "text-success" : "text-text-muted"
            }`}
          >
            {isConnected ? (
              <>
                <CheckCircle size={12} weight="fill" /> Connected
              </>
            ) : (
              <>
                <Prohibit size={12} weight="fill" /> Not connected
              </>
            )}
          </span>
        )}
      </div>

      {/* ── Body ── */}
      <div className="p-5">
        {isLoading ? (
          <div className="space-y-2.5">
            <Skeleton className="h-3.5 w-52" />
            <Skeleton className="h-3.5 w-36" />
            <Skeleton className="h-7 w-32 mt-3" />
          </div>
        ) : error /* Only show if user is OWNER (error 403 = not owner, silently hide) */ ? null : isConnected ? (
          /* ── Connected State ── */
          <div className="space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-text-muted font-medium w-20">
                  Account
                </span>
                <span className="text-xs text-blue-400 font-medium">
                  {data.email}
                </span>
              </div>
              {data.connectedAt && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-text-muted font-medium w-20">
                    Connected
                  </span>
                  <span className="text-xs text-text-secondary">
                    {formatDate(data.connectedAt)}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-1">
              {isOwner ? (
                <DisconnectDialog
                  onConfirm={() => disconnect.mutate()}
                  isPending={disconnect.isPending}
                />
              ) : (
                <p className="text-[10px] text-text-muted">
                  Only the workspace{" "}
                  <span className="text-text-secondary font-medium">Owner</span>{" "}
                  can disconnect this integration.
                </p>
              )}
            </div>
          </div>
        ) : (
          /* ── Not Connected State ── */
          <div className="space-y-3">
            <p className="text-xs text-text-muted leading-relaxed max-w-sm">
              {isOwner
                ? "Authorise your Google account to let this CRM sync lead attachments to your Google Drive. Only files created by this app are accessible — no other Drive content is touched."
                : "The workspace Owner has not connected a Google Drive for synced attachments yet."}
            </p>

            {isOwner && (
              <button
                onClick={() => connect.mutate()}
                disabled={connect.isPending}
                className={`
                  inline-flex items-center gap-2.5 h-9 px-4 rounded-lg text-xs font-medium
                  bg-white text-gray-800 border border-gray-200 shadow-sm
                  hover:bg-gray-50 hover:shadow-md
                  active:scale-[0.98]
                  transition-all duration-150
                  disabled:opacity-60 disabled:cursor-not-allowed
                `}
              >
                <Icon icon="logos:google-icon" className="w-4 h-4 shrink-0" />
                {connect.isPending ? "Opening Google…" : "Connect Google Drive"}
              </button>
            )}

            {isOwner && (
              <p className="text-[10px] text-text-muted">
                Only the workspace{" "}
                <span className="text-text-secondary font-medium">Owner</span>{" "}
                can connect/disconnect Google Drive.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

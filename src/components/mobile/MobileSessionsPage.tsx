"use client";

import React, { useState, useEffect } from "react";
import {
  DeviceMobile,
  Desktop,
  ShieldCheck,
  ShieldWarning,
  SignOut,
  Clock,
  Globe,
  WifiHigh,
  Warning,
  ArrowCounterClockwise,
  Trash,
} from "@phosphor-icons/react";
import { authApi } from "@/lib/api/auth";
import type { Session } from "@/lib/schemas/auth.schema";
import { showToast } from "@/lib/toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getDeviceType(ua: string | null): "mobile" | "desktop" {
  if (!ua) return "desktop";
  return /mobile|android|iphone|ipad/i.test(ua) ? "mobile" : "desktop";
}

function getDeviceName(ua: string | null): string {
  if (!ua) return "Unknown Device";
  if (/iphone/i.test(ua)) return "iPhone";
  if (/ipad/i.test(ua)) return "iPad";
  if (/android.*mobile/i.test(ua)) return "Android Phone";
  if (/android/i.test(ua)) return "Android Tablet";
  if (/windows/i.test(ua)) return "Windows PC";
  if (/macintosh|mac os/i.test(ua)) return "Mac";
  if (/linux/i.test(ua)) return "Linux";
  if (/mobile/i.test(ua)) return "Mobile Device";
  return "Desktop Browser";
}

function getBrowserName(ua: string | null): string {
  if (!ua) return "";
  if (/edg\//i.test(ua)) return "Edge";
  if (/chrome/i.test(ua)) return "Chrome";
  if (/safari/i.test(ua) && !/chrome/i.test(ua)) return "Safari";
  if (/firefox/i.test(ua)) return "Firefox";
  return "Browser";
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Active now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function isCurrentSession(session: Session): boolean {
  // Heuristic: last active within 5 minutes = current
  const diff = Date.now() - new Date(session.lastActiveAt).getTime();
  return diff < 5 * 60 * 1000;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-card border border-border-subtle">
      <Skeleton className="w-11 h-11 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2 pt-0.5">
        <Skeleton className="h-4 w-32 rounded-md" />
        <Skeleton className="h-3 w-24 rounded-md" />
        <Skeleton className="h-3 w-40 rounded-md" />
      </div>
    </div>
  );
}

// ── Session Card ──────────────────────────────────────────────────────────────

function SessionCard({
  session,
  onRevoke,
  revoking,
}: {
  session: Session;
  onRevoke: (id: string) => void;
  revoking: boolean;
}) {
  const isCurrent = isCurrentSession(session);
  const deviceType = getDeviceType(session.userAgent);
  const DeviceIcon = deviceType === "mobile" ? DeviceMobile : Desktop;
  const deviceName = getDeviceName(session.userAgent);
  const browserName = getBrowserName(session.userAgent);

  return (
    <div
      className={cn(
        "flex items-start gap-3.5 p-4 rounded-2xl border transition-all",
        isCurrent
          ? "bg-crimson/5 border-crimson/20"
          : "bg-card border-border-subtle",
      )}
    >
      {/* Device icon */}
      <span
        className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
          isCurrent ? "bg-crimson/10" : "bg-elevated",
        )}
      >
        <DeviceIcon
          size={22}
          weight="fill"
          className={isCurrent ? "text-crimson" : "text-text-secondary"}
        />
      </span>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className="font-sans font-semibold text-[14px] text-text-primary truncate">
            {deviceName}
            {browserName && (
              <span className="text-text-muted font-normal"> · {browserName}</span>
            )}
          </span>
          {isCurrent && (
            <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold font-sans bg-crimson/15 text-crimson">
              <span className="w-1.5 h-1.5 rounded-full bg-crimson animate-pulse" />
              This device
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
          {session.ipAddress && (
            <div className="flex items-center gap-1">
              <WifiHigh size={11} className="text-text-muted shrink-0" />
              <span className="font-mono text-[11px] text-text-muted">
                {session.ipAddress}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock size={11} className="text-text-muted shrink-0" />
            <span className="font-mono text-[11px] text-text-muted">
              {timeAgo(session.lastActiveAt)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Globe size={11} className="text-text-muted shrink-0" />
            <span className="font-mono text-[11px] text-text-muted">
              {new Date(session.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Revoke button */}
      {!isCurrent && (
        <button
          onClick={() => onRevoke(session.id)}
          disabled={revoking}
          className="shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl bg-danger/10 active:bg-danger/20 transition-colors disabled:opacity-40"
          aria-label="Revoke session"
        >
          {revoking ? (
            <span className="w-4 h-4 border-2 border-danger border-t-transparent rounded-full animate-spin" />
          ) : (
            <SignOut size={16} weight="bold" className="text-danger" />
          )}
        </button>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function MobileSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [revokeAllOpen, setRevokeAllOpen] = useState(false);
  const [revokingAll, setRevokingAll] = useState(false);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authApi.getSessions();
      setSessions(res.data.data ?? []);
    } catch {
      setError("Couldn't load sessions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const revokeSession = async (id: string) => {
    setRevoking(id);
    try {
      await authApi.revokeSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      showToast.success("Session ended");
    } catch {
      showToast.error("Couldn't revoke session");
    } finally {
      setRevoking(null);
    }
  };

  const revokeAll = async () => {
    setRevokingAll(true);
    try {
      await authApi.revokeAllSessions();
      setSessions([]);
      showToast.success("All sessions ended");
      setRevokeAllOpen(false);
    } catch {
      showToast.error("Couldn't end all sessions");
    } finally {
      setRevokingAll(false);
    }
  };

  const otherSessions = sessions.filter((s) => !isCurrentSession(s));
  const currentSession = sessions.find((s) => isCurrentSession(s));

  return (
    <div className="flex flex-col pb-6">
      {/* ── Stats bar ────────────────────────────────────────────── */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between gap-2 rounded-2xl bg-card border border-border-subtle px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-elevated flex items-center justify-center shrink-0">
              <ShieldCheck size={18} weight="fill" className="text-text-secondary" />
            </span>
            <div>
              <p className="font-sans font-semibold text-[13px] text-text-primary">
                {isLoading ? "—" : sessions.length} active session{sessions.length !== 1 ? "s" : ""}
              </p>
              <p className="font-sans text-[11px] text-text-muted">across all devices</p>
            </div>
          </div>
          <button
            onClick={() => void load()}
            disabled={isLoading}
            className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl bg-elevated active:bg-card transition-colors disabled:opacity-50"
          >
            <ArrowCounterClockwise
              size={16}
              className={cn("text-text-secondary", isLoading && "animate-spin")}
            />
          </button>
        </div>
      </div>

      {/* ── Security notice ──────────────────────────────────────── */}
      <div className="mx-4 mb-3 flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-warning/8 border border-warning/20">
        <ShieldWarning size={16} weight="fill" className="text-warning shrink-0 mt-0.5" />
        <p className="font-sans text-[12px] text-warning leading-relaxed">
          Don&apos;t recognise a session? Revoke it immediately and change your password.
        </p>
      </div>

      {/* ── Error ────────────────────────────────────────────────── */}
      {error && (
        <div className="mx-4 mb-3 flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-danger/10 border border-danger/20">
          <Warning size={16} weight="fill" className="text-danger shrink-0" />
          <p className="font-sans text-[12px] text-danger flex-1">{error}</p>
          <button
            onClick={() => void load()}
            className="font-sans text-[12px] text-danger font-semibold underline-offset-2 underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Loading ───────────────────────────────────────────────── */}
      {isLoading && (
        <div className="px-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* ── Empty ────────────────────────────────────────────────── */}
      {!isLoading && !error && sessions.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 px-6">
          <span className="w-16 h-16 rounded-2xl bg-elevated flex items-center justify-center">
            <ShieldCheck size={32} weight="duotone" className="text-text-muted" />
          </span>
          <div className="text-center">
            <p className="font-sans font-semibold text-[16px] text-text-primary">
              No active sessions
            </p>
            <p className="font-sans text-[13px] text-text-muted mt-1">
              Your account has no active sessions.
            </p>
          </div>
        </div>
      )}

      {/* ── Current session ──────────────────────────────────────── */}
      {!isLoading && currentSession && (
        <section className="px-4 mb-4">
          <p className="font-sans text-[11px] font-semibold text-text-muted uppercase tracking-widest mb-2">
            Current Session
          </p>
          <SessionCard
            session={currentSession}
            onRevoke={revokeSession}
            revoking={revoking === currentSession.id}
          />
        </section>
      )}

      {/* ── Other sessions ───────────────────────────────────────── */}
      {!isLoading && otherSessions.length > 0 && (
        <section className="px-4">
          <p className="font-sans text-[11px] font-semibold text-text-muted uppercase tracking-widest mb-2">
            Other Sessions
          </p>
          <div className="space-y-2.5">
            {otherSessions.map((s) => (
              <SessionCard
                key={s.id}
                session={s}
                onRevoke={revokeSession}
                revoking={revoking === s.id}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Revoke all button ─────────────────────────────────────── */}
      {!isLoading && otherSessions.length > 0 && (
        <div className="px-4 mt-5">
          <button
            onClick={() => setRevokeAllOpen(true)}
            className="w-full min-h-[48px] flex items-center justify-center gap-2 rounded-2xl border border-danger/30 bg-danger/8 font-sans font-semibold text-[14px] text-danger active:bg-danger/15 transition-colors"
          >
            <Trash size={16} weight="bold" />
            Revoke All Other Sessions
          </button>
        </div>
      )}

      {/* ── Revoke all confirmation sheet ─────────────────────────── */}
      <Sheet open={revokeAllOpen} onOpenChange={setRevokeAllOpen}>
        <SheetContent side="bottom" className="bg-card border-border-subtle rounded-t-3xl pb-safe">
          <SheetHeader className="pb-4">
            <div className="w-10 h-1 rounded-full bg-border-default mx-auto mb-4" />
            <div className="w-14 h-14 rounded-2xl bg-danger/10 flex items-center justify-center mx-auto mb-3">
              <ShieldWarning size={28} weight="fill" className="text-danger" />
            </div>
            <SheetTitle className="font-display font-bold text-[18px] text-text-primary text-center">
              Revoke All Sessions?
            </SheetTitle>
            <p className="font-sans text-[13px] text-text-secondary text-center leading-relaxed mt-1">
              This will sign out all other devices. You&apos;ll stay logged in on this device.
            </p>
          </SheetHeader>

          <div className="flex flex-col gap-3 px-1 pt-2">
            <button
              onClick={() => void revokeAll()}
              disabled={revokingAll}
              className="w-full min-h-[50px] flex items-center justify-center gap-2 rounded-2xl bg-danger font-sans font-semibold text-[15px] text-white active:bg-danger/90 transition-colors disabled:opacity-60"
            >
              {revokingAll ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <SignOut size={18} weight="bold" />
                  Revoke All
                </>
              )}
            </button>
            <button
              onClick={() => setRevokeAllOpen(false)}
              className="w-full min-h-[50px] flex items-center justify-center rounded-2xl bg-elevated font-sans font-semibold text-[15px] text-text-secondary active:bg-card transition-colors"
            >
              Cancel
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

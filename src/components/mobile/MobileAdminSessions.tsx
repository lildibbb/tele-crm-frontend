"use client";

import React, { useState } from "react";
import {
  DeviceMobile,
  Desktop,
  Users,
  ProhibitInset,
  Clock,
  WifiHigh,
  Globe,
  ArrowCounterClockwise,
  Warning,
  ShieldWarning,
} from "@phosphor-icons/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { superadminApi } from "@/lib/api/superadmin";
import type { AdminSession } from "@/lib/api/superadmin";
import { queryKeys } from "@/queries/queryKeys";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/format";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface MobileAdminSessionsProps {}

// ── Helpers ───────────────────────────────────────────────────────────────────

function truncateId(id: string, len = 16) {
  return id.length <= len ? id : `${id.slice(0, len)}…`;
}

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
  session: AdminSession;
  onRevoke: (id: string) => void;
  revoking: boolean;
}) {
  const deviceType = getDeviceType(session.userAgent);
  const DeviceIcon = deviceType === "mobile" ? DeviceMobile : Desktop;
  const deviceName = getDeviceName(session.userAgent);
  const browserName = getBrowserName(session.userAgent);

  return (
    <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-card border border-border-subtle">
      {/* Device icon */}
      <span className="w-11 h-11 rounded-xl bg-elevated flex items-center justify-center shrink-0">
        <DeviceIcon size={22} weight="fill" className="text-text-secondary" />
      </span>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-sans font-semibold text-[13px] text-text-primary truncate">
          {deviceName}
          {browserName && (
            <span className="text-text-muted font-normal"> · {browserName}</span>
          )}
        </p>
        <p className="font-mono text-[11px] text-text-muted mt-0.5 truncate" title={session.userId}>
          uid: {truncateId(session.userId)}
        </p>
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
          {session.ipAddress && (
            <div className="flex items-center gap-1">
              <WifiHigh size={11} className="text-text-muted shrink-0" />
              <span className="font-mono text-[11px] text-text-muted">{session.ipAddress}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock size={11} className="text-text-muted shrink-0" />
            <span className="font-mono text-[11px] text-text-muted">{timeAgo(session.lastActiveAt)}</span>
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
      <button
        onClick={() => onRevoke(session.id)}
        disabled={revoking}
        className="shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl bg-danger/10 active:bg-danger/20 transition-colors disabled:opacity-40"
        aria-label="Revoke session"
      >
        {revoking ? (
          <span className="w-4 h-4 border-2 border-danger border-t-transparent rounded-full animate-spin" />
        ) : (
          <ProhibitInset size={16} weight="bold" className="text-danger" />
        )}
      </button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

export default function MobileAdminSessions({}: MobileAdminSessionsProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [revokeId, setRevokeId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // SUPERADMIN guard
  if (user?.role !== "SUPERADMIN") {
    router.replace("/");
    return null;
  }

  const { data: sessions = [], isLoading, refetch } = useQuery({
    queryKey: queryKeys.superadmin.sessions(),
    queryFn: () => superadminApi.listSessions(),
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => superadminApi.revokeSession(id),
    onSuccess: (_, id) => {
      toast.success(`Session ${truncateId(id, 12)} revoked`);
      queryClient.invalidateQueries({ queryKey: queryKeys.superadmin.sessions() });
      setRevokeId(null);
    },
    onError: () => toast.error("Failed to revoke session"),
  });

  const activeSessions = sessions.filter((s) => !s.isRevoked);
  const visibleSessions = activeSessions.slice(0, page * PAGE_SIZE);
  const hasMore = visibleSessions.length < activeSessions.length;

  return (
    <div className="flex flex-col pb-6">
      {/* ── Stats bar ──────────────────────────────────────────────── */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between gap-2 rounded-2xl bg-card border border-border-subtle px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-elevated flex items-center justify-center shrink-0">
              <Users size={18} weight="fill" className="text-text-secondary" />
            </span>
            <div>
              <p className="font-sans font-semibold text-[13px] text-text-primary">
                {isLoading ? "—" : activeSessions.length} active session{activeSessions.length !== 1 ? "s" : ""}
              </p>
              <p className="font-sans text-[11px] text-text-muted">across all users</p>
            </div>
          </div>
          <button
            onClick={() => void refetch()}
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

      {/* ── Admin notice ───────────────────────────────────────────── */}
      <div className="mx-4 mb-3 flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-warning/8 border border-warning/20">
        <ShieldWarning size={16} weight="fill" className="text-warning shrink-0 mt-0.5" />
        <p className="font-sans text-[12px] text-warning leading-relaxed">
          These are all active sessions system-wide. Revoking a session signs out that user immediately.
        </p>
      </div>

      {/* ── Loading ────────────────────────────────────────────────── */}
      {isLoading && (
        <div className="px-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* ── Empty state ────────────────────────────────────────────── */}
      {!isLoading && activeSessions.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 px-6">
          <span className="w-16 h-16 rounded-2xl bg-elevated flex items-center justify-center">
            <Users size={32} weight="duotone" className="text-text-muted" />
          </span>
          <div className="text-center">
            <p className="font-sans font-semibold text-[16px] text-text-primary">
              No active sessions
            </p>
            <p className="font-sans text-[13px] text-text-muted mt-1">
              No users are currently signed in.
            </p>
          </div>
        </div>
      )}

      {/* ── Session list ───────────────────────────────────────────── */}
      {!isLoading && activeSessions.length > 0 && (
        <div className="px-4 space-y-2.5">
          {visibleSessions.map((s) => (
            <SessionCard
              key={s.id}
              session={s}
              onRevoke={(id) => setRevokeId(id)}
              revoking={revokeMutation.isPending && revokeId === s.id}
            />
          ))}
        </div>
      )}

      {/* ── Load more ──────────────────────────────────────────────── */}
      {hasMore && (
        <div className="px-4 mt-4">
          <button
            onClick={() => setPage((p) => p + 1)}
            className="w-full min-h-[46px] flex items-center justify-center rounded-2xl border border-border-default bg-elevated font-sans font-semibold text-[14px] text-text-secondary active:bg-card transition-colors"
          >
            Load more ({activeSessions.length - visibleSessions.length} remaining)
          </button>
        </div>
      )}

      {/* ── Revoke confirm sheet ───────────────────────────────────── */}
      <Sheet open={!!revokeId} onOpenChange={(v) => !v && setRevokeId(null)}>
        <SheetContent
          side="bottom"
          className="bg-card border-border-subtle rounded-t-3xl pb-safe"
        >
          <SheetHeader className="pb-4">
            <div className="w-10 h-1 rounded-full bg-border-default mx-auto mb-4" />
            <div className="w-14 h-14 rounded-2xl bg-danger/10 flex items-center justify-center mx-auto mb-3">
              <Warning size={28} weight="fill" className="text-danger" />
            </div>
            <SheetTitle className="font-display font-bold text-[18px] text-text-primary text-center">
              Revoke Session?
            </SheetTitle>
            <p className="font-sans text-[13px] text-text-secondary text-center leading-relaxed mt-1">
              This will immediately sign out the user on this session.
            </p>
          </SheetHeader>

          <div className="flex flex-col gap-3 px-1 pt-2">
            <button
              onClick={() => revokeId && revokeMutation.mutate(revokeId)}
              disabled={revokeMutation.isPending}
              className="w-full min-h-[50px] flex items-center justify-center gap-2 rounded-2xl bg-danger font-sans font-semibold text-[15px] text-white active:bg-danger/90 transition-colors disabled:opacity-60"
            >
              {revokeMutation.isPending ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ProhibitInset size={18} weight="bold" />
                  Revoke Session
                </>
              )}
            </button>
            <button
              onClick={() => setRevokeId(null)}
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

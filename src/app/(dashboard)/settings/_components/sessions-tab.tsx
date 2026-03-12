"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  Monitor,
  Smartphone,
  LogOut,
  AlertCircle,
  Globe,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { authApi } from "@/lib/api/auth";
import type { Session } from "@/lib/schemas/auth.schema";
import { toast } from "sonner";
import { parseUserAgent, formatUA } from "@/lib/utils/parseUserAgent";

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 2) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function SessionsTab() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [revokeId, setRevokeId] = useState<string | null>(null);
  const [revoking, setRevoking] = useState(false);

  useEffect(() => {
    authApi
      .getSessions()
      .then((res: { data: { data: Session[] } }) => setSessions(res.data.data))
      .catch(() => toast.error("Couldn't load sessions. Please try again."))
      .finally(() => setIsLoading(false));
  }, []);

  const revokeSession = async (id: string) => {
    setRevoking(true);
    try {
      await authApi.revokeSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      toast.success("Session ended successfully");
    } catch {
      toast.error("Couldn't revoke this session. Please try again.");
    } finally {
      setRevoking(false);
      setRevokeId(null);
    }
  };

  const revokeAll = async () => {
    setRevoking(true);
    try {
      await authApi.revokeAllSessions();
      setSessions([]);
      toast.success("All sessions ended successfully");
    } catch {
      toast.error("Couldn't end all sessions. Please try again.");
    } finally {
      setRevoking(false);
    }
  };

  const mostRecentId = sessions.length
    ? sessions.reduce((a, b) =>
        new Date(a.lastActiveAt) > new Date(b.lastActiveAt) ? a : b
      ).id
    : null;

  return (
    <div className="space-y-5 animate-in-up">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">
            Active Sessions
          </h2>
          <p className="text-text-secondary text-sm font-sans mt-1">
            {sessions.length} active session{sessions.length !== 1 ? "s" : ""}{" "}
            across all devices
          </p>
        </div>
        {sessions.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={revokeAll}
            disabled={revoking}
            className="gap-1.5 text-danger border-danger/20 bg-danger/10 hover:bg-danger/20 hover:text-danger w-full sm:w-auto"
          >
            <LogOut className="h-3.5 w-3.5" /> Revoke All Sessions
          </Button>
        )}
      </div>

      {/* Security notice */}
      <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg bg-warning/10 border border-warning/20">
        <AlertCircle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
        <p className="text-xs font-sans text-warning">
          If you don&apos;t recognise a session, revoke it immediately and
          change your password.
        </p>
      </div>

      {/* Session cards */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[76px] rounded-xl" />
          ))
        ) : sessions.length === 0 ? (
          <div className="bg-elevated rounded-xl p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-success/20 border border-success/30 flex items-center justify-center mx-auto mb-3">
              <Shield className="h-5 w-5 text-success" />
            </div>
            <p className="font-sans font-semibold text-text-primary text-sm">
              No active sessions
            </p>
            <p className="font-sans text-xs text-text-secondary mt-1">
              Your account has no other active sessions.
            </p>
          </div>
        ) : (
          sessions.map((session, i) => {
            const parsed = parseUserAgent(session.userAgent);
            const deviceType = parsed.deviceType;
            const isCurrent = session.id === mostRecentId;
            const deviceLabel = formatUA(parsed);
            return (
              <div
                key={session.id}
                className={`bg-elevated rounded-xl p-4 transition-all animate-in-up ${isCurrent ? "border border-brand/30" : ""}`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${isCurrent ? "bg-brand/10 border-brand/20" : "bg-overlay border-transparent"}`}>
                    {deviceType === "mobile" ? (
                      <Smartphone className={`h-4 w-4 ${isCurrent ? "text-brand" : "text-text-secondary"}`} />
                    ) : (
                      <Monitor className={`h-4 w-4 ${isCurrent ? "text-brand" : "text-text-secondary"}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-sans font-semibold text-[13px] text-text-primary truncate leading-snug">
                        {deviceLabel}
                      </p>
                      {isCurrent && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-brand/30 text-brand bg-brand/10 gap-1 flex-shrink-0">
                          <CheckCircle className="h-2.5 w-2.5" /> Current
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      {session.ipAddress && (
                        <div className="flex items-center gap-1 text-xs font-sans text-text-secondary">
                          <Shield className="h-3 w-3 text-text-muted flex-shrink-0" />
                          <span className="data-mono">{session.ipAddress}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-xs font-sans text-text-secondary">
                        <Globe className="h-3 w-3 text-text-muted flex-shrink-0" />
                        {new Date(session.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1 text-xs font-sans text-text-secondary">
                        <Clock className="h-3 w-3 text-text-muted flex-shrink-0" />
                        {formatRelativeTime(session.lastActiveAt)}
                      </div>
                    </div>
                    {/* Mobile revoke — full width below metadata */}
                    {!isCurrent && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRevokeId(session.id)}
                        className="gap-1.5 text-danger border-danger/20 bg-danger/10 hover:bg-danger/20 hover:text-danger mt-3 w-full sm:hidden"
                      >
                        <LogOut className="h-3.5 w-3.5" /> Revoke
                      </Button>
                    )}
                  </div>
                  {/* Desktop revoke — inline right */}
                  {!isCurrent ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRevokeId(session.id)}
                      className="gap-1.5 text-danger border-danger/20 bg-danger/10 hover:bg-danger/20 hover:text-danger flex-shrink-0 hidden sm:flex"
                    >
                      <LogOut className="h-3.5 w-3.5" /> Revoke
                    </Button>
                  ) : (
                    <span className="text-xs font-sans text-text-muted flex-shrink-0 px-2 hidden sm:block">This device</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Confirm revoke dialog */}
      <Dialog
        open={!!revokeId}
        onOpenChange={(open) => {
          if (!open) setRevokeId(null);
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="w-10 h-10 rounded-full bg-danger/20 border border-danger/30 flex items-center justify-center mb-2">
              <LogOut className="h-5 w-5 text-danger" />
            </div>
            <DialogTitle className="font-bold text-xl text-text-primary">
              Revoke Session
            </DialogTitle>
          </DialogHeader>
          <p className="font-sans text-sm text-text-secondary">
            This device will be signed out immediately and will need to log in
            again.
          </p>
          <div className="flex gap-3 pt-1">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setRevokeId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1 gap-2"
              disabled={revoking}
              onClick={() => revokeId && revokeSession(revokeId)}
            >
              <LogOut className="h-4 w-4" /> Revoke
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

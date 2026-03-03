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
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

function getDeviceType(userAgent: string | null): "mobile" | "desktop" {
  if (!userAgent) return "desktop";
  return /mobile|android|iphone|ipad/i.test(userAgent) ? "mobile" : "desktop";
}

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

  return (
    <div className="space-y-5 animate-in-up">
      {/* Page header */}
      <div className="flex items-center justify-between">
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
            className="gap-1.5 text-danger border-danger/20 bg-danger/10 hover:bg-danger/20 hover:text-danger"
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
            <Skeleton key={i} className="h-[80px] rounded-xl" />
          ))
        ) : sessions.length === 0 ? (
          <div className="bg-elevated rounded-xl p-6 text-center">
            <div className="w-10 h-10 rounded-full bg-success/20 border border-success/30 flex items-center justify-center mx-auto mb-3">
              <Shield className="h-5 w-5 text-success" />
            </div>
            <p className="font-sans font-medium text-text-primary text-sm">
              No active sessions
            </p>
            <p className="font-sans text-xs text-text-secondary mt-1">
              Your account has no active sessions.
            </p>
          </div>
        ) : (
          sessions.map((session, i) => {
            const deviceType = getDeviceType(session.userAgent);
            return (
              <div
                key={session.id}
                className="bg-elevated rounded-xl p-5 transition-all animate-in-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-overlay">
                    {deviceType === "mobile" ? (
                      <Smartphone className="h-5 w-5 text-text-secondary" />
                    ) : (
                      <Monitor className="h-5 w-5 text-text-secondary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans font-medium text-[13px] text-text-primary mb-1 truncate">
                      {session.userAgent ?? "Unknown device"}
                    </p>
                    <div className="flex items-center gap-4 flex-wrap">
                      {session.ipAddress && (
                        <div className="flex items-center gap-1 text-xs font-sans text-text-secondary">
                          <Shield className="h-3 w-3 text-text-muted" />
                          <span className="data-mono">{session.ipAddress}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-xs font-sans text-text-secondary">
                        <Globe className="h-3 w-3 text-text-muted" />
                        {new Date(session.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1 text-xs font-sans text-text-secondary">
                        <Clock className="h-3 w-3 text-text-muted" />
                        {formatRelativeTime(session.lastActiveAt)}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRevokeId(session.id)}
                    className="gap-1.5 text-danger border-danger/20 bg-danger/10 hover:bg-danger/20 hover:text-danger flex-shrink-0"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Revoke
                  </Button>
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

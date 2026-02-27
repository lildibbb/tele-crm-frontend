"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  UserCircle,
  Monitor,
  CaretLeft,
  CheckCircle,
} from "@phosphor-icons/react";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/lib/api/auth";
import type { ChangeOwnPasswordInput } from "@/lib/schemas/auth.schema";
import { UserRole } from "@/types/enums";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ROLE_CSS: Record<UserRole, { text: string; bg: string }> = {
  SUPERADMIN: { text: "text-gold",           bg: "bg-gold-subtle" },
  OWNER:      { text: "text-crimson",        bg: "bg-crimson-subtle" },
  ADMIN:      { text: "text-info",           bg: "bg-info/10" },
  STAFF:      { text: "text-text-secondary", bg: "bg-elevated" },
};

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const role = (user?.role ?? "STAFF") as UserRole;
  const roleStyle = ROLE_CSS[role];
  const initial = user?.email?.[0]?.toUpperCase() ?? "?";

  const createdAt = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "—";
  const lastLogin = user?.lastLoginAt
    ? new Date(user.lastLoginAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "Never";

  const handleChangePassword = async () => {
    setError(null);
    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (form.newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    setSaving(true);
    try {
      await authApi.changeOwnPassword(form as ChangeOwnPasswordInput);
      setSuccess(true);
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? "Failed to change password. Check your current password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-void font-sans">
      {/* Mobile header */}
      <header className="flex items-center h-[52px] px-4 bg-base border-b border-border-subtle md:hidden">
        <button
          onClick={() => router.back()}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-crimson"
        >
          <CaretLeft size={22} weight="bold" />
        </button>
        <span className="flex-1 text-center font-semibold text-[17px] text-text-primary">Profile</span>
        <div className="min-w-[44px]" />
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Page title (desktop) */}
        <div className="hidden md:block">
          <h1 className="font-display font-bold text-2xl text-text-primary">My Profile</h1>
          <p className="text-sm text-text-muted mt-0.5">Manage your account settings</p>
        </div>

        {/* Profile card */}
        <div className="bg-base border border-border-subtle rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-crimson-subtle border-2 border-crimson/30 flex items-center justify-center text-crimson font-display font-bold text-[32px] flex-shrink-0">
            {initial}
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left space-y-1">
            <p className="font-display font-bold text-xl text-text-primary">{user?.email}</p>
            <span className={cn("inline-block text-xs font-semibold px-2 py-0.5 rounded-full border border-current", roleStyle.text, roleStyle.bg)}>
              {role}
            </span>
            <div className="flex flex-col sm:flex-row sm:gap-6 pt-1 text-xs text-text-muted gap-1">
              <span>Member since {createdAt}</span>
              <span>Last login: {lastLogin}</span>
              {user?.lastIpAddress && <span>IP: {user.lastIpAddress}</span>}
            </div>
          </div>

          {/* Sessions shortcut */}
          <button
            onClick={() => router.push("/settings")}
            className="flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-crimson transition-colors px-3 py-2 rounded-lg border border-border-subtle hover:border-crimson/30 self-start"
          >
            <Monitor size={14} />
            Active Sessions
          </button>
        </div>

        {/* Change Password */}
        <div className="bg-base border border-border-subtle rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Lock size={16} className="text-crimson" />
            <h2 className="font-display font-bold text-base text-text-primary">Change Password</h2>
          </div>

          {success ? (
            <div className="flex items-center gap-2 p-4 rounded-xl bg-success/10 border border-success/20 text-success text-sm">
              <CheckCircle size={18} weight="fill" />
              Password changed successfully. Other sessions have been invalidated.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs text-text-secondary">Current Password</Label>
                <Input
                  type="password"
                  value={form.currentPassword}
                  onChange={(e) => setForm((p) => ({ ...p, currentPassword: e.target.value }))}
                  className="h-9 text-sm"
                  autoComplete="current-password"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-text-secondary">New Password</Label>
                  <Input
                    type="password"
                    value={form.newPassword}
                    onChange={(e) => setForm((p) => ({ ...p, newPassword: e.target.value }))}
                    className="h-9 text-sm"
                    autoComplete="new-password"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-text-secondary">Confirm New Password</Label>
                  <Input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                    className="h-9 text-sm"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {error && <p className="text-xs text-danger">{error}</p>}

              <div className="flex justify-end pt-1">
                <Button
                  onClick={() => void handleChangePassword()}
                  disabled={saving || !form.currentPassword || !form.newPassword || !form.confirmPassword}
                  className="bg-crimson hover:bg-crimson/90 text-white text-sm gap-1.5 px-5"
                >
                  {saving ? (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <Lock size={14} />
                  )}
                  Save Password
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => router.push("/settings")}
            className="flex items-center gap-3 p-4 bg-base border border-border-subtle rounded-xl hover:border-crimson/30 hover:bg-elevated/30 transition-all group text-left"
          >
            <Monitor size={18} className="text-text-muted group-hover:text-crimson transition-colors" />
            <div>
              <p className="text-sm font-semibold text-text-primary">Active Sessions</p>
              <p className="text-xs text-text-muted">Manage your logged-in devices</p>
            </div>
          </button>
          <button
            onClick={() => router.push("/settings")}
            className="flex items-center gap-3 p-4 bg-base border border-border-subtle rounded-xl hover:border-crimson/30 hover:bg-elevated/30 transition-all group text-left"
          >
            <UserCircle size={18} className="text-text-muted group-hover:text-crimson transition-colors" />
            <div>
              <p className="text-sm font-semibold text-text-primary">Account Settings</p>
              <p className="text-xs text-text-muted">Preferences and notifications</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}


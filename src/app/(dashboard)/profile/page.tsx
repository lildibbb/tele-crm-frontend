"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  UserCircle,
  CaretLeft,
  CheckCircle,
  Shield,
} from "@phosphor-icons/react";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/lib/api/auth";
import type { ChangeOwnPasswordInput } from "@/lib/schemas/auth.schema";
import { UserRole } from "@/types/enums";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SessionsTab } from "@/app/(dashboard)/settings/_components/sessions-tab";
import { cn } from "@/lib/utils";
import { useT, K } from "@/i18n";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { MobileProfile } from "@/components/mobile";

const ROLE_CSS: Record<UserRole, { text: string; bg: string }> = {
  SUPERADMIN: { text: "text-gold",           bg: "bg-gold-subtle" },
  OWNER:      { text: "text-crimson",        bg: "bg-crimson-subtle" },
  ADMIN:      { text: "text-info",           bg: "bg-info/10" },
  STAFF:      { text: "text-text-secondary", bg: "bg-elevated" },
};

type ProfileTab = "profile" | "sessions";

export default function ProfilePage() {
  const isMobile = useIsMobile();
  const t = useT();
  const router = useRouter();
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<ProfileTab>("profile");
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  if (isMobile) return <MobileProfile onBack={() => router.back()} onSignOut={() => router.replace("/login")} />;

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
    <div className="space-y-6 animate-in-up">
      {/* Mobile header */}
      <header className="flex items-center h-[52px] md:hidden -mx-4 -mt-4 px-4 bg-base border-b border-border-subtle">
        <button
          onClick={() => router.back()}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-crimson"
        >
          <CaretLeft size={22} weight="bold" />
        </button>
        <span className="flex-1 text-center font-semibold text-[17px] text-text-primary">{t(K.profile.title)}</span>
        <div className="min-w-[44px]" />
      </header>

      {/* Desktop title */}
      <div className="hidden md:flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-crimson/10 border border-crimson/20 flex items-center justify-center flex-shrink-0">
          <UserCircle className="h-5 w-5 text-crimson" weight="fill" />
        </div>
        <div>
          <h1 className="font-display font-bold text-xl text-text-primary">{t(K.profile.pageTitle)}</h1>
          <p className="font-sans text-sm text-text-secondary">{t(K.profile.subtitle)}</p>
        </div>
      </div>

      {/* Profile card */}
      <div className="bg-elevated rounded-2xl border border-border-subtle p-5 flex flex-col sm:flex-row items-center sm:items-start gap-4">
        <div className="w-16 h-16 rounded-2xl bg-crimson/10 border border-crimson/20 flex items-center justify-center text-crimson font-display font-bold text-2xl flex-shrink-0">
          {initial}
        </div>
        <div className="flex-1 text-center sm:text-left space-y-1.5">
          <p className="font-display font-bold text-lg text-text-primary">{user?.email}</p>
          <span className={cn("inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border border-current", roleStyle.text, roleStyle.bg)}>
            {role}
          </span>
          <div className="flex flex-wrap justify-center sm:justify-start gap-x-5 gap-y-0.5 pt-0.5 text-xs text-text-muted font-sans">
            <span>{t(K.profile.memberSince)} {createdAt}</span>
            <span>{t(K.profile.lastLogin)} {lastLogin}</span>
            {user?.lastIpAddress && <span>{t(K.profile.ip)} {user.lastIpAddress}</span>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-elevated rounded-xl w-full sm:w-auto sm:inline-flex">
        {([
          { value: "profile", label: t(K.profile.tab.account), Icon: Lock },
          { value: "sessions", label: t(K.profile.tab.sessions), Icon: Shield },
        ] as { value: ProfileTab; label: string; Icon: React.ElementType }[]).map(({ value, label, Icon }) => (
          <button
            key={value}
            onClick={() => setActiveTab(value)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium font-sans transition-colors",
              activeTab === value
                ? "bg-card shadow-sm text-text-primary"
                : "text-text-secondary hover:text-text-primary",
            )}
          >
            <Icon size={14} weight="bold" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "profile" ? (
        <div className="max-w-lg space-y-4">
          <div className="bg-elevated rounded-2xl border border-border-subtle p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Lock size={15} className="text-crimson" weight="bold" />
              <h2 className="font-display font-semibold text-base text-text-primary">{t(K.profile.changePassword)}</h2>
            </div>

            {success ? (
              <div className="flex items-center gap-2 p-4 rounded-xl bg-success/10 border border-success/20 text-success text-sm font-sans">
                <CheckCircle size={16} weight="fill" />
                {t(K.profile.passwordChanged)}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs text-text-secondary">{t(K.profile.currentPassword)}</Label>
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
                    <Label className="text-xs text-text-secondary">{t(K.profile.newPassword)}</Label>
                    <Input
                      type="password"
                      value={form.newPassword}
                      onChange={(e) => setForm((p) => ({ ...p, newPassword: e.target.value }))}
                      className="h-9 text-sm"
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-text-secondary">{t(K.profile.confirmPassword)}</Label>
                    <Input
                      type="password"
                      value={form.confirmPassword}
                      onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                      className="h-9 text-sm"
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                {error && <p className="text-xs text-danger font-sans">{error}</p>}

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
                    {t(K.profile.savePassword)}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <SessionsTab />
      )}
    </div>
  );
}


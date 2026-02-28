"use client";

import React, { useState, useCallback } from "react";
import {
  CaretLeft,
  CaretRight,
  Camera,
  PencilSimple,
  LockKey,
  Monitor,
  Bell,
  CurrencyDollar,
  ShieldCheck,
  MoonStars,
  Translate,
  SignOut,
  Eye,
  EyeSlash,
  CheckCircle,
  Warning,
  SpinnerGap,
  CalendarBlank,
  Clock,
} from "@phosphor-icons/react";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuthStore } from "@/store/authStore";
import { usersApi } from "@/lib/api/users";
import { UserRole } from "@/types/enums";
import { cn } from "@/lib/utils";
import { useT, K } from "@/i18n";
import { formatDate } from "@/lib/format";
import { showToast } from "@/lib/toast";

// ── Role chip config ───────────────────────────────────────────────────────────
const ROLE_LABEL: Record<UserRole, string> = {
  SUPERADMIN: "Superadmin",
  OWNER: "Owner",
  ADMIN: "Admin",
  STAFF: "Staff",
};

const ROLE_BORDER: Record<UserRole, string> = {
  SUPERADMIN: "border-border-subtle",
  OWNER: "border-border-subtle",
  ADMIN: "border-border-subtle",
  STAFF: "border-border-subtle",
};

const ROLE_CSS: Record<UserRole, { textClass: string; bgClass: string }> = {
  SUPERADMIN: { textClass: "text-gold", bgClass: "bg-gold-subtle" },
  OWNER: { textClass: "text-crimson", bgClass: "bg-crimson-subtle" },
  ADMIN: { textClass: "text-info", bgClass: "bg-[color-mix(in_srgb,var(--info)_15%,transparent)]" },
  STAFF: { textClass: "text-text-secondary", bgClass: "bg-elevated" },
};

// ── iOS-style section group ────────────────────────────────────────────────────
function SectionGroup({
  header,
  children,
}: {
  header: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-4 mt-6">
      <h3 className="text-[11px] font-bold text-text-secondary uppercase tracking-[0.1em] px-2 mb-2">
        {header}
      </h3>
      <div className="rounded-xl bg-card border border-border-subtle overflow-hidden divide-y divide-border-subtle shadow-[var(--shadow-card)]">
        {children}
      </div>
    </div>
  );
}

// ── Account row ────────────────────────────────────────────────────────────────
function AccountRow({
  Icon,
  iconColor = "text-crimson",
  iconBg = "bg-crimson-subtle",
  label,
  value,
  onClick,
}: {
  Icon: React.ElementType;
  iconColor?: string;
  iconBg?: string;
  label: string;
  value?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3.5 w-full px-4 min-h-[52px] active:bg-elevated/60 transition-colors group"
    >
      <span
        className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
          iconBg,
        )}
      >
        <Icon size={18} className={iconColor} weight="fill" />
      </span>
      <span className="flex-1 font-sans font-medium text-[14px] text-text-primary text-left">
        {label}
      </span>
      {value && (
        <span className="font-sans text-[12px] font-medium text-text-secondary mr-1">
          {value}
        </span>
      )}
      <CaretRight
        size={14}
        className="text-text-muted shrink-0 group-active:translate-x-0.5 transition-transform"
      />
    </button>
  );
}

// ── Password form ──────────────────────────────────────────────────────────────
function PasswordChangeForm({
  userId,
  t,
  onSuccess,
}: {
  userId: string;
  t: (key: string) => string;
  onSuccess: () => void;
}) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});

  const validate = useCallback(() => {
    const e: typeof errors = {};
    if (newPassword.length < 8) e.newPassword = "Password must be at least 8 characters";
    if (confirmPassword !== newPassword) e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [newPassword, confirmPassword]);

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await usersApi.changePassword(userId, { newPassword });
      showToast.success(t(K.profile.passwordChanged));
      setNewPassword("");
      setConfirmPassword("");
      setErrors({});
      onSuccess();
    } catch {
      showToast.error("Failed to change password. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-4 py-3 space-y-3">
      {/* New password */}
      <div>
        <label className="block text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
          {t(K.profile.newPassword)}
        </label>
        <div className="relative">
          <input
            type={showNew ? "text" : "password"}
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (errors.newPassword) setErrors((p) => ({ ...p, newPassword: undefined }));
            }}
            placeholder="••••••••"
            className={cn(
              "w-full h-11 rounded-lg bg-elevated border px-3.5 pr-11 font-mono text-[14px] text-text-primary placeholder:text-text-muted outline-none transition-colors",
              errors.newPassword
                ? "border-danger focus:border-danger"
                : "border-border-subtle focus:border-crimson",
            )}
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute right-3 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            {showNew ? (
              <EyeSlash size={18} className="text-text-muted" />
            ) : (
              <Eye size={18} className="text-text-muted" />
            )}
          </button>
        </div>
        {errors.newPassword && (
          <p className="flex items-center gap-1.5 mt-1.5 text-[12px] text-danger font-medium">
            <Warning size={14} weight="fill" />
            {errors.newPassword}
          </p>
        )}
      </div>

      {/* Confirm password */}
      <div>
        <label className="block text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
          {t(K.profile.confirmPassword)}
        </label>
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: undefined }));
            }}
            placeholder="••••••••"
            className={cn(
              "w-full h-11 rounded-lg bg-elevated border px-3.5 pr-11 font-mono text-[14px] text-text-primary placeholder:text-text-muted outline-none transition-colors",
              errors.confirmPassword
                ? "border-danger focus:border-danger"
                : "border-border-subtle focus:border-crimson",
            )}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            {showConfirm ? (
              <EyeSlash size={18} className="text-text-muted" />
            ) : (
              <Eye size={18} className="text-text-muted" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="flex items-center gap-1.5 mt-1.5 text-[12px] text-danger font-medium">
            <Warning size={14} weight="fill" />
            {errors.confirmPassword}
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={saving || !newPassword || !confirmPassword}
        className={cn(
          "w-full h-11 rounded-lg font-sans font-semibold text-[14px] transition-all flex items-center justify-center gap-2",
          saving || !newPassword || !confirmPassword
            ? "bg-elevated text-text-muted cursor-not-allowed"
            : "bg-crimson text-white active:scale-[0.98] active:bg-crimson-hover",
        )}
      >
        {saving ? (
          <>
            <SpinnerGap size={16} className="animate-spin" />
            Saving…
          </>
        ) : (
          <>
            <CheckCircle size={16} weight="bold" />
            {t(K.profile.savePassword)}
          </>
        )}
      </button>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export interface MobileProfileProps {
  readonly onBack?: () => void;
  readonly onEditProfile?: () => void;
  readonly onChangePassword?: () => void;
  readonly onActiveSessions?: () => void;
  readonly onSignOut?: () => void;
}

export default function MobileProfile({
  onBack,
  onEditProfile,
  onChangePassword,
  onActiveSessions,
  onSignOut,
}: MobileProfileProps) {
  const t = useT();
  const { user, logout } = useAuthStore();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  const role = (user?.role ?? "STAFF") as UserRole;
  const email = user?.email ?? "user@example.com";
  const initials = email[0]?.toUpperCase() ?? "?";
  const roleConfig = ROLE_CSS[role];

  const handleSignOut = async () => {
    await logout();
    onSignOut?.();
  };

  return (
    <div className="flex flex-col min-h-screen bg-void text-text-primary font-sans">
      <div className="pt-[env(safe-area-inset-top)]" />

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="flex items-center h-[52px] px-4 bg-base border-b border-border-subtle sticky top-0 z-20">
        <button
          onClick={onBack}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-crimson active:opacity-70 transition-opacity"
          aria-label="Go back"
        >
          <CaretLeft size={22} weight="bold" />
        </button>
        <span className="flex-1 text-center font-sans font-semibold text-[17px] text-text-primary">
          {t(K.profile.title)}
        </span>
        <div className="min-w-[44px]" />
      </header>

      {/* ── Content ────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto pb-[calc(32px+env(safe-area-inset-bottom))]">
        {/* ── Hero avatar card ─────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-3 px-6 pt-8 pb-2">
          {/* Avatar with role-colored ring */}
          <div className="relative">
            <div
              className={cn(
                "w-[96px] h-[96px] rounded-full flex items-center justify-center border-[3px] bg-elevated shadow-[var(--shadow-card)]",
                ROLE_BORDER[role],
              )}
            >
              <span className="font-display font-bold text-[38px] text-text-primary select-none">
                {initials}
              </span>
            </div>
            <button
              className="absolute -bottom-0.5 -right-0.5 w-8 h-8 rounded-full flex items-center justify-center border-[2.5px] border-void bg-crimson active:bg-crimson-hover transition-colors"
              aria-label="Change avatar"
            >
              <Camera size={14} color="white" weight="fill" />
            </button>
          </div>

          {/* Email */}
          <span className="font-display font-bold text-[20px] text-text-primary text-center leading-tight mt-1">
            {email}
          </span>

          {/* Role chip */}
          <span
            className={cn(
              "rounded-full px-3.5 py-1 font-sans font-semibold text-[11px] uppercase tracking-wider border border-border-subtle",
              roleConfig.textClass,
              roleConfig.bgClass,
            )}
          >
            {ROLE_LABEL[role]}
          </span>
        </div>

        {/* ── Meta info pills ──────────────────────────────────────── */}
        <div className="mx-4 mt-3 rounded-xl bg-card border border-border-subtle divide-y divide-border-subtle shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-3 px-4 py-3">
            <CalendarBlank size={16} className="text-text-muted shrink-0" />
            <span className="text-[12px] text-text-secondary font-sans">
              {t(K.profile.memberSince)}
            </span>
            <span className="ml-auto font-mono text-[12px] text-text-primary font-medium">
              {formatDate(user?.createdAt)}
            </span>
          </div>
          {user?.lastLoginAt && (
            <div className="flex items-center gap-3 px-4 py-3">
              <Clock size={16} className="text-text-muted shrink-0" />
              <span className="text-[12px] text-text-secondary font-sans">
                {t(K.profile.lastLogin)}
              </span>
              <span className="ml-auto font-mono text-[12px] text-text-primary font-medium">
                {formatDate(user.lastLoginAt, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}
        </div>

        {/* ── Account section ──────────────────────────────────────── */}
        <SectionGroup header={t(K.profile.tab.account)}>
          <AccountRow
            Icon={PencilSimple}
            label="Edit Profile"
            onClick={onEditProfile}
          />
          <AccountRow
            Icon={Monitor}
            label={t(K.settings.sessions)}
            iconColor="text-info"
            iconBg="bg-[color-mix(in_srgb,var(--info)_15%,transparent)]"
            onClick={onActiveSessions}
          />
        </SectionGroup>

        {/* ── Password section ─────────────────────────────────────── */}
        <SectionGroup header={t(K.profile.changePassword)}>
          {!showPasswordForm ? (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="flex items-center gap-3.5 w-full px-4 min-h-[52px] active:bg-elevated/60 transition-colors group"
            >
              <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-crimson-subtle">
                <LockKey size={18} className="text-crimson" weight="fill" />
              </span>
              <span className="flex-1 font-sans font-medium text-[14px] text-text-primary text-left">
                {t(K.profile.changePassword)}
              </span>
              <CaretRight
                size={14}
                className="text-text-muted shrink-0 group-active:translate-x-0.5 transition-transform"
              />
            </button>
          ) : (
            <PasswordChangeForm
              userId={user?.id ?? ""}
              t={t}
              onSuccess={() => setShowPasswordForm(false)}
            />
          )}
        </SectionGroup>

        {/* ── Sign out ─────────────────────────────────────────────── */}
        <div className="mx-4 mt-8">
          <button
            onClick={() => setShowSignOutConfirm(true)}
            className="w-full h-[52px] text-crimson font-semibold text-[15px] active:opacity-70 transition-opacity flex items-center justify-center gap-2"
          >
            <SignOut size={20} weight="bold" />
            {t(K.nav.logout)}
          </button>
        </div>

        <p className="text-center font-sans font-medium tracking-[0.2em] uppercase text-[10px] text-text-muted mt-6 pb-6">
          Titan Journal CRM v1.0.0
        </p>
      </main>

      {/* ── Sign-out confirmation dialog ───────────────────────────── */}
      <AlertDialog open={showSignOutConfirm} onOpenChange={setShowSignOutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be signed out of this device. You can sign back in at
              any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t(K.common.cancel)}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSignOut}
              className="bg-danger text-white hover:bg-danger/90"
            >
              {t(K.nav.logout)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

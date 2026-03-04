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
  Globe,
} from "@phosphor-icons/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAuthStore } from "@/store/authStore";
import { usersApi } from "@/lib/api/users";
import { UserRole } from "@/types/enums";
import { cn } from "@/lib/utils";
import { useT, K } from "@/i18n";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";

// ── Role label ─────────────────────────────────────────────────────────────────
const ROLE_LABEL: Record<UserRole, string> = {
  SUPERADMIN: "Superadmin",
  OWNER: "Owner",
  ADMIN: "Admin",
  STAFF: "Staff",
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
    <div className="px-4 mt-6">
      <p className="text-[10px] font-semibold text-text-muted uppercase tracking-[0.1em] mb-2">
        {header}
      </p>
      <div className="rounded-xl bg-card border border-border-subtle overflow-hidden divide-y divide-border-subtle">
        {children}
      </div>
    </div>
  );
}

// ── Account row ────────────────────────────────────────────────────────────────
function AccountRow({
  Icon,
  label,
  value,
  onClick,
}: {
  Icon: React.ElementType;
  label: string;
  value?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full px-4 min-h-[48px] active:bg-elevated/60 transition-colors group"
    >
      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-elevated shrink-0">
        <Icon size={16} className="text-text-secondary" weight="regular" />
      </span>
      <span className="flex-1 font-sans text-[14px] text-text-primary text-left">
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
      toast.success(t(K.profile.passwordChanged));
      setNewPassword("");
      setConfirmPassword("");
      setErrors({});
      onSuccess();
    } catch {
      toast.error("Failed to change password. Please try again.");
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

// ── Timezone options ───────────────────────────────────────────────────────────
const TIMEZONE_OPTIONS = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];

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
  const [showTzSheet, setShowTzSheet] = useState(false);
  const [tzPending, setTzPending] = useState<string>("");
  const [tzSaving, setTzSaving] = useState(false);
  const [tzSaved, setTzSaved] = useState(false);

  const currentTz = user?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;

  const handleOpenTzSheet = () => {
    setTzPending(currentTz);
    setTzSaved(false);
    setShowTzSheet(true);
  };

  const handleSaveTz = async () => {
    if (!tzPending || tzPending === currentTz) { setShowTzSheet(false); return; }
    setTzSaving(true);
    try {
      await usersApi.updateTimezone(tzPending);
      toast.success("Timezone updated");
      setTzSaved(true);
      setShowTzSheet(false);
    } catch {
      toast.error("Failed to update timezone");
    } finally {
      setTzSaving(false);
    }
  };

  const role = (user?.role ?? "STAFF") as UserRole;
  const email = user?.email ?? "user@example.com";
  const initials = email[0]?.toUpperCase() ?? "?";

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
          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-text-secondary active:opacity-70 transition-opacity"
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
          {/* Avatar */}
          <div className="relative">
            <Avatar className="w-24 h-24 border-2 border-border-subtle">
              <AvatarFallback className="bg-elevated text-text-primary font-semibold text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
            <button
              className="absolute -bottom-0.5 -right-0.5 w-8 h-8 rounded-full flex items-center justify-center border-[2.5px] border-void bg-crimson active:bg-crimson-hover transition-colors"
              aria-label="Change avatar"
            >
              <Camera size={14} className="text-white" weight="fill" />
            </button>
          </div>

          {/* Email */}
          <span className="font-display font-bold text-[20px] text-text-primary text-center leading-tight mt-1">
            {email}
          </span>

          {/* Role chip */}
          <Badge variant="secondary" className="text-[10px]">
            {ROLE_LABEL[role]}
          </Badge>
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
            onClick={onActiveSessions}
          />
        </SectionGroup>

        {/* ── Preferences section ──────────────────────────────────── */}
        <SectionGroup header="Preferences">
          <button
            onClick={handleOpenTzSheet}
            className="flex items-center gap-3 w-full px-4 min-h-[48px] active:bg-elevated/60 transition-colors group"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-elevated shrink-0">
              <Globe size={16} className="text-text-secondary" weight="regular" />
            </span>
            <span className="flex-1 font-sans text-[14px] text-text-primary text-left">
              Timezone
            </span>
            <span className="font-sans text-[12px] font-medium text-text-secondary mr-1 truncate max-w-[160px]">
              {currentTz}
            </span>
            <CaretRight
              size={14}
              className="text-text-muted shrink-0 group-active:translate-x-0.5 transition-transform"
            />
          </button>
        </SectionGroup>

        {/* ── Password section ─────────────────────────────────────── */}
        <SectionGroup header={t(K.profile.changePassword)}>
          {!showPasswordForm ? (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="flex items-center gap-3 w-full px-4 min-h-[48px] active:bg-elevated/60 transition-colors group"
            >
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-elevated shrink-0">
                <LockKey size={16} className="text-text-secondary" weight="regular" />
              </span>
              <span className="flex-1 font-sans text-[14px] text-text-primary text-left">
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
            className="w-full h-[52px] text-danger font-semibold text-[15px] active:opacity-70 transition-opacity flex items-center justify-center gap-2"
          >
            <SignOut size={20} weight="bold" className="text-text-secondary" />
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

      {/* ── Timezone bottom sheet ──────────────────────────────────── */}
      <Sheet open={showTzSheet} onOpenChange={setShowTzSheet}>
        <SheetContent side="bottom" className="rounded-t-2xl px-0 pb-[env(safe-area-inset-bottom)]">
          <SheetHeader className="px-4 pb-2">
            <SheetTitle className="text-left text-[17px]">Select Timezone</SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto max-h-[55vh] divide-y divide-border-subtle">
            {TIMEZONE_OPTIONS.map((tz) => (
              <button
                key={tz}
                onClick={() => setTzPending(tz)}
                className="flex items-center justify-between w-full px-5 min-h-[48px] active:bg-elevated/60 transition-colors"
              >
                <span className="font-sans text-[14px] text-text-primary">{tz}</span>
                {tzPending === tz && (
                  <CheckCircle size={18} weight="fill" className="text-crimson shrink-0" />
                )}
              </button>
            ))}
          </div>
          <div className="px-4 pt-3">
            <button
              onClick={handleSaveTz}
              disabled={tzSaving}
              className={cn(
                "w-full h-11 rounded-xl font-sans font-semibold text-[14px] transition-all flex items-center justify-center gap-2",
                tzSaving
                  ? "bg-elevated text-text-muted cursor-not-allowed"
                  : "bg-crimson text-white active:scale-[0.98] active:bg-crimson-hover",
              )}
            >
              {tzSaving ? (
                <><SpinnerGap size={16} className="animate-spin" />Saving…</>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

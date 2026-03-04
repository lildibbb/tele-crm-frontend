"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CaretLeft,
  CaretRight,
  Robot,
  Brain,
  ListBullets,
  Users,
  Key,
  Sun,
  Globe,
  LockKey,
  ShieldCheck,
  SignOut,
  Lock,
  MoonStars,
  Translate,
  Palette,
  CheckCircle,
} from "@phosphor-icons/react";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { UserRole } from "@/types/enums";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useT, K } from "@/i18n";
import { usersApi } from "@/lib/api/users";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface MobileSettingsProps {
  readonly onBack?: () => void;
  readonly onSignOut?: () => void;
}

interface SettingsItem {
  id: string;
  Icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  label: string;
  value?: string;
  href?: string;
  ownerOnly?: boolean;
  disabled?: boolean;
  lockedReason?: string;
}

// ── iOS-style section group ────────────────────────────────────────────────────
function SectionCard({
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
      <div className="rounded-xl bg-card bg-clip-padding border border-border-subtle overflow-hidden divide-y divide-border-subtle">
        {children}
      </div>
    </div>
  );
}

// ── Navigation row (icon + label + value + chevron) ────────────────────────────
function NavRow({ item }: { item: SettingsItem }) {
  const inner = (
    <div
      className={cn(
        "flex items-center gap-3 w-full px-4 min-h-[48px]",
        item.disabled
          ? "opacity-40"
          : "active:bg-elevated/60 transition-colors group",
      )}
    >
      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-elevated shrink-0">
        <item.Icon size={16} className="text-text-secondary" weight="regular" />
      </span>
      <span className="flex-1 font-sans text-[14px] text-text-primary text-left">
        {item.label}
      </span>
      {item.lockedReason ? (
        <span className="flex items-center gap-1 font-sans text-[11px] text-text-muted">
          <Lock size={12} />
          {item.lockedReason}
        </span>
      ) : item.value ? (
        <span className="font-sans text-[12px] font-medium text-text-secondary mr-1">
          {item.value}
        </span>
      ) : null}
      {!item.disabled && (
        <CaretRight
          size={14}
          className="text-text-muted shrink-0 group-active:translate-x-0.5 transition-transform"
        />
      )}
    </div>
  );

  if (item.href && !item.disabled) {
    return <Link href={item.href}>{inner}</Link>;
  }
  return <div>{inner}</div>;
}

// ── Toggle row (icon + label + switch) ─────────────────────────────────────────
function ToggleRow({
  Icon,
  label,
  checked,
  onChange,
}: {
  Icon: React.ElementType;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 min-h-[48px]">
      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-elevated shrink-0">
        <Icon size={16} className="text-text-secondary" weight="regular" />
      </span>
      <span className="flex-1 font-sans text-[14px] text-text-primary">
        {label}
      </span>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-crimson data-[state=unchecked]:bg-border-default"
      />
    </div>
  );
}

// ── Data ───────────────────────────────────────────────────────────────────────
const BOT_ITEMS: SettingsItem[] = [
  {
    id: "bot-config",
    Icon: Robot,
    iconColor: "text-text-secondary",
    iconBg: "bg-elevated",
    label: "Bot Config",
    href: "/settings/bot-config",
  },
  {
    id: "knowledge",
    Icon: Brain,
    iconColor: "text-text-secondary",
    iconBg: "bg-elevated",
    label: "Knowledge Base",
    href: "/settings/knowledge-base",
  },
  {
    id: "commands",
    Icon: ListBullets,
    iconColor: "text-text-secondary",
    iconBg: "bg-elevated",
    label: "Command Menu",
    href: "/settings/commands",
  },
];

const TEAM_ITEMS_OWNER: SettingsItem[] = [
  {
    id: "team",
    Icon: Users,
    iconColor: "text-text-secondary",
    iconBg: "bg-elevated",
    label: "Team Members",
    href: "/settings/team",
  },
  {
    id: "sessions",
    Icon: Key,
    iconColor: "text-text-secondary",
    iconBg: "bg-elevated",
    label: "Active Sessions",
    href: "/settings/sessions",
  },
];

const TEAM_ITEMS_ADMIN: SettingsItem[] = [
  {
    id: "team",
    Icon: Users,
    iconColor: "text-text-secondary",
    iconBg: "bg-elevated",
    label: "Team Members",
    href: "/settings/team",
  },
];

const ACCOUNT_ITEMS: SettingsItem[] = [
  {
    id: "password",
    Icon: LockKey,
    iconColor: "text-text-secondary",
    iconBg: "bg-elevated",
    label: "Change Password",
    href: "/profile/password",
  },
  {
    id: "security",
    Icon: ShieldCheck,
    iconColor: "text-text-secondary",
    iconBg: "bg-elevated",
    label: "Security",
    href: "/settings/sessions",
  },
];

// ── Language options ───────────────────────────────────────────────────────────
const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ms", label: "Bahasa Melayu" },
] as const;

// ── Timezone options ───────────────────────────────────────────────────────────
const TIMEZONES = [
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
] as const;


// ── Main ───────────────────────────────────────────────────────────────────────
export default function MobileSettings({
  onBack,
  onSignOut,
}: MobileSettingsProps) {
  const router = useRouter();
  const t = useT();
  const { user, logout } = useAuthStore();
  const role = (user?.role as UserRole) ?? "STAFF";
  const { theme, setTheme } = useTheme();

  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [language, setLanguage] = useState<string>("en");
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);

  // ── Timezone state ─────────────────────────────────────────────────────────
  const defaultTz =
    user?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [showTzSheet, setShowTzSheet] = useState(false);
  const [selectedTz, setSelectedTz] = useState<string>(defaultTz);
  const [pendingTz, setPendingTz] = useState<string>(defaultTz);
  const [tzSaving, setTzSaving] = useState(false);
  const [tzStatus, setTzStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSaveTz = async () => {
    setTzSaving(true);
    setTzStatus("idle");
    try {
      await usersApi.updateTimezone(pendingTz);
      setSelectedTz(pendingTz);
      setTzStatus("success");
      setTimeout(() => {
        setTzStatus("idle");
        setShowTzSheet(false);
      }, 1200);
    } catch {
      setTzStatus("error");
    } finally {
      setTzSaving(false);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    router.back();
  };

  const handleSignOut = async () => {
    if (onSignOut) {
      onSignOut();
      return;
    }
    await logout();
    router.replace("/login");
  };

  const teamItems =
    role === "OWNER"
      ? TEAM_ITEMS_OWNER
      : role === "ADMIN"
        ? TEAM_ITEMS_ADMIN
        : [];

  return (
    <div className="flex flex-col min-h-screen bg-void text-text-primary font-sans">
      <div className="pt-[env(safe-area-inset-top)]" />

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="flex items-center h-[52px] px-4 bg-base border-b border-border-subtle sticky top-0 z-20">
        <button
          onClick={handleBack}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-text-secondary active:opacity-70 transition-opacity"
          aria-label="Go back"
        >
          <CaretLeft size={22} weight="bold" />
        </button>
        <span className="flex-1 text-center font-sans font-semibold text-[17px] text-text-primary">
          {t(K.nav.settings)}
        </span>
        <div className="min-w-[44px]" />
      </header>

      {/* ── Content ────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto pb-[calc(32px+env(safe-area-inset-bottom))]">
        {/* ── Account ──────────────────────────────────────────────── */}
        <SectionCard header={t(K.profile.tab.account)}>
          {ACCOUNT_ITEMS.map((item) => (
            <NavRow key={item.id} item={item} />
          ))}
        </SectionCard>

        {/* ── Bot Configuration ────────────────────────────────────── */}
        <SectionCard header="Bot Configuration">
          {BOT_ITEMS.map((item) => (
            <NavRow key={item.id} item={item} />
          ))}
        </SectionCard>

        {/* ── Team (role-gated) ────────────────────────────────────── */}
        {teamItems.length > 0 && (
          <SectionCard header={t(K.settings.team)}>
            {teamItems.map((item) => (
              <NavRow key={item.id} item={item} />
            ))}
          </SectionCard>
        )}

        {/* ── Appearance ───────────────────────────────────────────── */}
        <SectionCard header="Appearance">
          <ToggleRow
            Icon={MoonStars}
            label="Dark Mode"
            checked={theme === "dark"}
            onChange={() => setTheme(theme === "dark" ? "light" : "dark")}
          />
        </SectionCard>

        {/* ── Timezone ─────────────────────────────────────────────── */}
        <SectionCard header="Timezone">
          <button
            onClick={() => {
              setPendingTz(selectedTz);
              setTzStatus("idle");
              setShowTzSheet(true);
            }}
            className="flex items-center gap-3 w-full px-4 min-h-[48px] active:bg-elevated/60 transition-colors group"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-elevated shrink-0">
              <Globe size={16} className="text-text-secondary" weight="regular" />
            </span>
            <span className="flex-1 font-sans text-[14px] text-text-primary text-left">
              Timezone
            </span>
            <span className="font-sans text-[12px] font-medium text-text-secondary mr-1 truncate max-w-[140px]">
              {selectedTz}
            </span>
            <CaretRight
              size={14}
              className="text-text-muted shrink-0 group-active:translate-x-0.5 transition-transform"
            />
          </button>
        </SectionCard>

        {/* ── Language ──────────────────────────────────────────────── */}
        <SectionCard header="Language">
          {!showLanguagePicker ? (
            <button
              onClick={() => setShowLanguagePicker(true)}
              className="flex items-center gap-3.5 w-full px-4 min-h-[52px] active:bg-elevated/60 transition-colors group"
            >
              <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-elevated">
                <Translate
                  size={18}
                  className="text-text-secondary"
                  weight="fill"
                />
              </span>
              <span className="flex-1 font-sans font-medium text-[14px] text-text-primary text-left">
                Language
              </span>
              <span className="font-sans text-[12px] font-medium text-text-secondary mr-1">
                {LANGUAGES.find((l) => l.code === language)?.label ?? "English"}
              </span>
              <CaretRight
                size={14}
                className="text-text-muted shrink-0 group-active:translate-x-0.5 transition-transform"
              />
            </button>
          ) : (
            <div className="py-1">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setShowLanguagePicker(false);
                  }}
                  className={cn(
                    "flex items-center gap-3.5 w-full px-4 min-h-[48px] active:bg-elevated/60 transition-colors",
                    lang.code === language && "bg-elevated/40",
                  )}
                >
                  <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-elevated">
                    <Globe
                      size={18}
                      className="text-text-secondary"
                      weight="fill"
                    />
                  </span>
                  <span className="flex-1 font-sans font-medium text-[14px] text-text-primary text-left">
                    {lang.label}
                  </span>
                  {lang.code === language && (
                    <CheckCircle
                      size={20}
                      className="text-text-secondary"
                      weight="fill"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </SectionCard>

        {/* ── Sign out ─────────────────────────────────────────────── */}
        <div className="mx-4 mt-8 pb-8">
          <button
            onClick={() => setShowSignOutConfirm(true)}
            className="w-full h-[52px] text-danger font-semibold text-[15px] active:opacity-70 transition-opacity flex items-center justify-center gap-2"
          >
            <SignOut size={20} weight="bold" className="text-text-secondary" />
            {t(K.nav.logout)}
          </button>
        </div>
      </main>

      {/* ── Sign-out confirmation dialog ───────────────────────────── */}
      <AlertDialog
        open={showSignOutConfirm}
        onOpenChange={setShowSignOutConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be signed out of this device. You can sign back in at any
              time.
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

      {/* ── Timezone Sheet ─────────────────────────────────────────── */}
      <Sheet open={showTzSheet} onOpenChange={(v) => !v && setShowTzSheet(false)}>
        <SheetContent side="bottom" className="rounded-t-2xl bg-card border border-border-subtle pb-[env(safe-area-inset-bottom)]">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-text-primary">Select Timezone</SheetTitle>
          </SheetHeader>
          <Select value={pendingTz} onValueChange={setPendingTz}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz} value={tz}>
                  {tz}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {tzStatus === "success" && (
            <p className="mt-3 text-xs text-green-500 font-medium">Timezone saved!</p>
          )}
          {tzStatus === "error" && (
            <p className="mt-3 text-xs text-danger font-medium">Failed to save. Please try again.</p>
          )}
          <button
            onClick={handleSaveTz}
            disabled={tzSaving}
            className="mt-4 w-full h-[48px] rounded-xl bg-crimson text-white font-semibold text-[15px] flex items-center justify-center gap-2 disabled:opacity-60 active:opacity-80 transition-opacity"
          >
            {tzSaving ? <Loader2 size={18} className="animate-spin" /> : null}
            {tzSaving ? "Saving…" : "Save"}
          </button>
        </SheetContent>
      </Sheet>
    </div>
  );
}

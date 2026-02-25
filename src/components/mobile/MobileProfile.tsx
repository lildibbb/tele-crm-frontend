"use client";

import React, { useState } from "react";
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
} from "@phosphor-icons/react";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/types/enums";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────

interface TogglesState {
  newLeadAlerts: boolean;
  depositReports: boolean;
  verificationUpdates: boolean;
}

// ── Role chip config ───────────────────────────────────────────────────────────
const ROLE_LABEL: Record<UserRole, string> = {
  SUPERADMIN: "Superadmin",
  OWNER: "Owner",
  ADMIN: "Admin",
  STAFF: "Staff",
};

const ROLE_CSS: Record<UserRole, { textClass: string; bgClass: string }> = {
  SUPERADMIN: { textClass: "text-gold", bgClass: "bg-gold-subtle" },
  OWNER:      { textClass: "text-crimson", bgClass: "bg-crimson-subtle" },
  ADMIN:      { textClass: "text-info", bgClass: "bg-[color-mix(in_srgb,var(--info)_15%,transparent)]" },
  STAFF:      { textClass: "text-text-secondary", bgClass: "bg-elevated" },
};

// ── Section group ──────────────────────────────────────────────────────────────
function SectionGroup({ header, children }: { header: string; children: React.ReactNode }) {
  return (
    <div className="mx-4 mt-6">
      <h3 className="text-[11px] font-bold text-text-secondary uppercase tracking-[0.1em] px-2 mb-2">
        {header}
      </h3>
      <div className="rounded-xl bg-card border border-border-subtle overflow-hidden divide-y divide-border-subtle">
        {children}
      </div>
    </div>
  );
}

// ── Account row ────────────────────────────────────────────────────────────────
function AccountRow({ Icon, label, value, onClick }: {
  Icon: React.ElementType;
  label: string;
  value?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 w-full p-4 active:bg-elevated transition-colors group"
    >
      <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-crimson-subtle">
        <Icon size={20} className="text-crimson" weight="fill" />
      </span>
      <span className="flex-1 font-sans font-medium text-[14px] text-text-primary text-left">{label}</span>
      {value && <span className="font-sans text-[12px] font-medium text-text-secondary">{value}</span>}
      <CaretRight size={16} className="text-text-muted shrink-0 group-hover:translate-x-1 transition-transform" />
    </button>
  );
}

// ── Toggle row ──────────────────────────────────────────────────────────────────
function ToggleRow({ Icon, label, enabled, onToggle }: {
  Icon: React.ElementType;
  label: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-4 p-4">
      <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-elevated">
        <Icon size={20} className="text-text-secondary" weight="fill" />
      </span>
      <span className="flex-1 font-sans font-medium text-[14px] text-text-primary">{label}</span>
      <Switch
        checked={enabled}
        onCheckedChange={onToggle}
        className="data-[state=checked]:bg-crimson data-[state=unchecked]:bg-border-default"
      />
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
  const { user, logout } = useAuthStore();
  const [toggles, setToggles] = useState({ newLeadAlerts: true, depositReports: true, verificationUpdates: true });

  const role = (user?.role ?? "STAFF") as UserRole;
  const email = user?.email ?? "user@example.com";
  const initials = email[0]?.toUpperCase() ?? "?";
  const roleConfig = ROLE_CSS[role];

  const toggle = (key: keyof typeof toggles) => setToggles((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSignOut = () => {
    logout();
    onSignOut?.();
  };

  return (
    <div className="flex flex-col min-h-screen bg-void text-text-primary font-sans">
      <div className="pt-[env(safe-area-inset-top)]" />

      {/* Header */}
      <header className="flex items-center h-[52px] px-4 bg-base border-b border-border-subtle">
        <button onClick={onBack} className="min-w-[44px] min-h-[44px] flex items-center justify-center text-crimson">
          <CaretLeft size={22} weight="bold" />
        </button>
        <span className="flex-1 text-center font-sans font-semibold text-[17px] text-text-primary">Profile</span>
        <div className="min-w-[44px]" />
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-[calc(32px+env(safe-area-inset-bottom))]">
        {/* Hero */}
        <div className="flex flex-col items-center gap-2 px-6 pt-8 pb-4">
          <div className="relative">
            <div className={cn("w-24 h-24 rounded-full flex items-center justify-center border-2 bg-elevated", "border-crimson")}>
              <span className="font-display font-bold text-[36px] text-text-primary">{initials}</span>
            </div>
            <button
              className="absolute bottom-0 right-0 p-1.5 rounded-full flex items-center justify-center border-2 border-void bg-crimson"
              aria-label="Change avatar"
            >
              <Camera size={14} color="white" weight="fill" />
            </button>
          </div>

          <span className="font-display font-bold text-[22px] text-text-primary text-center">{email}</span>

          <span className={cn("rounded-full px-3 py-1 font-sans font-semibold text-[12px] border", roleConfig.textClass, roleConfig.bgClass, "border-current")}>
            {ROLE_LABEL[role]}
          </span>

          <span className="font-sans text-[13px] text-text-secondary text-center">{email}</span>
        </div>

        {/* Account section */}
        <SectionGroup header="Account">
          <AccountRow Icon={PencilSimple} label="Edit Profile" onClick={onEditProfile} />
          <AccountRow Icon={LockKey} label="Change Password" onClick={onChangePassword} />
          <AccountRow Icon={Monitor} label="Active Sessions" onClick={onActiveSessions} />
        </SectionGroup>

        {/* Notifications section */}
        <SectionGroup header="Notifications">
          <ToggleRow Icon={Bell}           label="New Lead Alerts"       enabled={toggles.newLeadAlerts}       onToggle={() => toggle("newLeadAlerts")} />
          <ToggleRow Icon={CurrencyDollar} label="Deposit Reports"       enabled={toggles.depositReports}      onToggle={() => toggle("depositReports")} />
          <ToggleRow Icon={ShieldCheck}    label="Verification Updates"  enabled={toggles.verificationUpdates} onToggle={() => toggle("verificationUpdates")} />
        </SectionGroup>

        {/* Preferences section */}
        <SectionGroup header="Preferences">
          <AccountRow Icon={MoonStars} label="Theme"    value="System" />
          <AccountRow Icon={Translate} label="Language" value="English" />
        </SectionGroup>

        {/* Sign out */}
        <div className="mx-4 mt-8 flex flex-col items-center gap-4">
          <button
            onClick={handleSignOut}
            className="w-full py-3.5 border-2 border-crimson text-crimson font-bold rounded-xl hover:bg-crimson hover:text-white transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <SignOut size={18} weight="bold" />
            Sign Out
          </button>
        </div>

        <p className="text-center font-sans font-medium tracking-[0.2em] uppercase text-[10px] text-text-muted mt-6 pb-6">
          Titan Journal CRM v1.0.0
        </p>
      </main>
    </div>
  );
}

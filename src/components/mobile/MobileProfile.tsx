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
import { UserRole } from "@/types/enums";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface MobileProfileProps {
  readonly role?: UserRole;
  readonly userName?: string;
  readonly userInitials?: string;
  readonly userEmail?: string;
  readonly joinedDate?: string;
  readonly activeSessionCount?: number;
  readonly onBack?: () => void;
  readonly onEditProfile?: () => void;
  readonly onChangePassword?: () => void;
  readonly onActiveSessions?: () => void;
  readonly onSignOut?: () => void;
}

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

const ROLE_COLORS: Record<UserRole, { color: string; bg: string }> = {
  SUPERADMIN: { color: "#E8B94F", bg: "#E8B94F1A" },
  OWNER: { color: "#C4232D", bg: "#C4232D1A" },
  ADMIN: { color: "#60A5FA", bg: "#60A5FA1A" },
  STAFF: { color: "#8888AA", bg: "#8888AA1A" },
};

// ── Section group ──────────────────────────────────────────────────────────────
function SectionGroup({
  header,
  children,
}: {
  header: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-4 mt-6">
      <h3 className="text-[11px] font-bold text-[#8888AA] uppercase tracking-[0.1em] px-2 mb-2">
        {header}
      </h3>
      <div className="rounded-xl bg-[#141422] border border-[#2A2A42] overflow-hidden divide-y divide-[#2A2A42]">
        {children}
      </div>
    </div>
  );
}

// ── Account row ────────────────────────────────────────────────────────────────
function AccountRow({
  Icon,
  iconColor,
  label,
  value,
  onClick,
}: {
  Icon: React.ElementType;
  iconColor: string;
  label: string;
  value?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 w-full p-4 active:bg-[#1C1C2E] transition-colors group"
    >
      <span
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `${iconColor}22` }}
      >
        <Icon size={20} style={{ color: iconColor }} weight="fill" />
      </span>
      <span className="flex-1 font-sans font-medium text-[14px] text-[#F0F0FF] text-left">
        {label}
      </span>
      {value && (
        <span className="font-sans text-[12px] font-medium text-[#8888AA]">
          {value}
        </span>
      )}
      <CaretRight
        size={16}
        className="text-[#555570] shrink-0 group-hover:translate-x-1 transition-transform"
      />
    </button>
  );
}

// ── Toggle row ──────────────────────────────────────────────────────────────────
function ToggleRow({
  Icon,
  label,
  enabled,
  onToggle,
}: {
  Icon: React.ElementType;
  label: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-4 p-4">
      <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-[#1C1C2E]">
        <Icon size={20} className="text-[#8888AA]" weight="fill" />
      </span>
      <span className="flex-1 font-sans font-medium text-[14px] text-[#F0F0FF]">
        {label}
      </span>
      <Switch
        checked={enabled}
        onCheckedChange={onToggle}
        className={cn(
          "data-[state=checked]:bg-[#C4232D]",
          "data-[state=unchecked]:bg-[#2A2A42]",
        )}
      />
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function MobileProfile({
  role = "OWNER",
  userName = "Sarah Lim",
  userInitials,
  userEmail = "sarah@titanjournal.com",
  joinedDate = "Jan 15, 2026",
  activeSessionCount = 3,
  onBack,
  onEditProfile,
  onChangePassword,
  onActiveSessions,
  onSignOut,
}: MobileProfileProps) {
  const [toggles, setToggles] = useState<TogglesState>({
    newLeadAlerts: true,
    depositReports: true,
    verificationUpdates: true,
  });

  const initials =
    userInitials ??
    userName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  const roleConfig = ROLE_COLORS[role];

  const toggle = (key: keyof TogglesState) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#080810] text-[#F0F0FF] font-sans">
      <div className="pt-[env(safe-area-inset-top)]" />

      {/* Header */}
      <header className="flex items-center h-[52px] px-4 bg-[#0E0E1A] border-b border-[#2A2A42]">
        <button
          onClick={onBack}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[#C4232D]"
        >
          <CaretLeft size={22} weight="bold" />
        </button>
        <span className="flex-1 text-center font-sans font-semibold text-[17px] text-[#F0F0FF]">
          Profile
        </span>
        <div className="min-w-[44px]" />
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-[calc(32px+env(safe-area-inset-bottom))]">
        {/* Hero */}
        <div className="flex flex-col items-center gap-2 px-6 pt-8 pb-4">
          {/* Avatar with camera btn */}
          <div className="relative">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center border-2"
              style={{ background: "#1C1C2E", borderColor: roleConfig.color }}
            >
              <span className="font-display font-bold text-[36px] text-[#F0F0FF]">
                {initials}
              </span>
            </div>
            <button
              className="absolute bottom-0 right-0 p-1.5 rounded-full flex items-center justify-center border-2 border-[#080810]"
              style={{ background: roleConfig.color }}
              aria-label="Change avatar"
            >
              <Camera size={14} color="white" weight="fill" />
            </button>
          </div>

          {/* Name */}
          <span className="font-display font-bold text-[22px] text-[#F0F0FF] text-center">
            {userName}
          </span>

          {/* Role chip */}
          <span
            className="rounded-full px-3 py-1 font-sans font-semibold text-[12px] border"
            style={{
              color: roleConfig.color,
              background: roleConfig.bg,
              borderColor: roleConfig.color,
            }}
          >
            {ROLE_LABEL[role]}
          </span>

          {/* Email + join date */}
          <span className="font-sans text-[13px] text-[#8888AA] text-center">
            {userEmail}
          </span>
          <span className="font-mono text-[12px] text-[#555570]">
            Joined {joinedDate}
          </span>
        </div>

        {/* Account section */}
        <SectionGroup header="Account">
          <AccountRow
            Icon={PencilSimple}
            iconColor="#e61927"
            label="Edit Profile"
            onClick={onEditProfile}
          />
          <AccountRow
            Icon={LockKey}
            iconColor="#e61927"
            label="Change Password"
            onClick={onChangePassword}
          />
          <AccountRow
            Icon={Monitor}
            iconColor="#e61927"
            label="Active Sessions"
            value={`${activeSessionCount} active`}
            onClick={onActiveSessions}
          />
        </SectionGroup>

        {/* Notifications section */}
        <SectionGroup header="Notifications">
          <ToggleRow
            Icon={Bell}
            label="New Lead Alerts"
            enabled={toggles.newLeadAlerts}
            onToggle={() => toggle("newLeadAlerts")}
          />
          <ToggleRow
            Icon={CurrencyDollar}
            label="Deposit Reports"
            enabled={toggles.depositReports}
            onToggle={() => toggle("depositReports")}
          />
          <ToggleRow
            Icon={ShieldCheck}
            label="Verification Updates"
            enabled={toggles.verificationUpdates}
            onToggle={() => toggle("verificationUpdates")}
          />
        </SectionGroup>

        {/* Preferences section */}
        <SectionGroup header="Preferences">
          <AccountRow
            Icon={MoonStars}
            iconColor="#e61927"
            label="Theme"
            value="Dark Mode"
          />
          <AccountRow
            Icon={Translate}
            iconColor="#e61927"
            label="Language"
            value="English"
          />
        </SectionGroup>

        {/* Danger zone / Sign out */}
        <div className="mx-4 mt-8 flex flex-col items-center gap-4">
          <button
            onClick={onSignOut}
            className="w-full py-3.5 border-2 border-[#C4232D] text-[#C4232D] font-bold rounded-xl
                       hover:bg-[#C4232D] hover:text-[#F0F0FF] transition-all active:scale-[0.98]
                       flex items-center justify-center gap-2"
          >
            <SignOut size={18} weight="bold" />
            Sign Out
          </button>
        </div>

        {/* Version */}
        <p className="text-center font-sans font-medium tracking-[0.2em] uppercase text-[10px] text-[#555570] mt-6 pb-6">
          Titan Journal CRM v1.0.0
        </p>
      </main>
    </div>
  );
}

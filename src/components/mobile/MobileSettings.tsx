"use client";

import React, { useState } from "react";
import Link from "next/link";
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
} from "@phosphor-icons/react";
import { Separator } from "@/components/ui/separator";
import { UserRole } from "@/types/enums";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface MobileSettingsProps {
  readonly role?: UserRole;
  readonly onBack?: () => void;
  readonly onSignOut?: () => void;
}

interface SettingsGroup {
  id: string;
  header: string;
  ownerOnly?: boolean;
  items: SettingsItem[];
}

interface SettingsItem {
  id: string;
  Icon: React.ElementType;
  iconColor: string;
  label: string;
  value?: string;
  href?: string;
  ownerOnly?: boolean;
  disabled?: boolean;
  lockedReason?: string;
}

// ── Data ───────────────────────────────────────────────────────────────────────
const BOT_ITEMS: SettingsItem[] = [
  {
    id: "bot-config",
    Icon: Robot,
    iconColor: "#60A5FA",
    label: "Bot Config",
    href: "/settings",
  },
  {
    id: "knowledge",
    Icon: Brain,
    iconColor: "#8888AA",
    label: "Knowledge Base",
    href: "/settings/knowledge-base",
  },
  {
    id: "commands",
    Icon: ListBullets,
    iconColor: "#8888AA",
    label: "Command Menu",
    href: "/settings/commands",
  },
];

const TEAM_ITEMS_OWNER: SettingsItem[] = [
  {
    id: "team",
    Icon: Users,
    iconColor: "#60A5FA",
    label: "Team Members",
    href: "/settings/team",
  },
  {
    id: "sessions",
    Icon: Key,
    iconColor: "#8888AA",
    label: "Active Sessions",
    href: "/settings/sessions",
  },
];

const TEAM_ITEMS_ADMIN: SettingsItem[] = [
  {
    id: "team",
    Icon: Users,
    iconColor: "#555570",
    label: "Team Members",
    disabled: true,
    lockedReason: "Owner access required",
  },
];

const APPEARANCE_ITEMS: SettingsItem[] = [
  {
    id: "theme",
    Icon: Sun,
    iconColor: "#8888AA",
    label: "Theme",
    value: "Dark",
  },
  {
    id: "language",
    Icon: Globe,
    iconColor: "#8888AA",
    label: "Language",
    value: "English",
  },
];

const ACCOUNT_ITEMS: SettingsItem[] = [
  {
    id: "password",
    Icon: LockKey,
    iconColor: "#8888AA",
    label: "Change Password",
    href: "/profile/password",
  },
  {
    id: "security",
    Icon: ShieldCheck,
    iconColor: "#8888AA",
    label: "Security",
    href: "/settings/sessions",
  },
];

// ── Settings Row ──────────────────────────────────────────────────────────────
function Row({ item }: { item: SettingsItem }) {
  const inner = (
    <div
      className={cn(
        "flex items-center gap-4 w-full p-4",
        item.disabled
          ? "opacity-50"
          : "active:bg-[#1C1C2E] transition-colors group",
      )}
    >
      <span
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `${item.iconColor}22` }}
      >
        <item.Icon size={20} style={{ color: item.iconColor }} weight="fill" />
      </span>
      <span className="flex-1 font-sans font-medium text-[14px] text-[#F0F0FF] text-left">
        {item.label}
      </span>
      {item.lockedReason ? (
        <span className="flex items-center gap-1 font-sans text-[11px] text-[#555570]">
          <Lock size={12} />
          {item.lockedReason}
        </span>
      ) : item.value ? (
        <span className="font-sans text-[12px] font-medium text-[#8888AA]">
          {item.value}
        </span>
      ) : null}
      {!item.disabled && (
        <CaretRight
          size={16}
          className="text-[#555570] shrink-0 group-hover:translate-x-1 transition-transform"
        />
      )}
    </div>
  );

  if (item.href && !item.disabled) {
    return <Link href={item.href}>{inner}</Link>;
  }
  return <div>{inner}</div>;
}

function SettingsGroup({
  group,
  role,
}: {
  group: SettingsGroup;
  role: UserRole;
}) {
  if (group.ownerOnly && role !== "OWNER") return null;
  return (
    <div className="mx-4 mt-6">
      <h3 className="text-[11px] font-bold text-[#8888AA] uppercase tracking-[0.1em] px-2 mb-2">
        {group.header}
      </h3>
      <div className="rounded-xl bg-[#141422] border border-[#2A2A42] overflow-hidden divide-y divide-[#2A2A42]">
        {group.items.map((item) => (
          <Row key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function MobileSettings({
  role = "OWNER",
  onBack,
  onSignOut,
}: MobileSettingsProps) {
  const groups: SettingsGroup[] = [
    { id: "bot", header: "Bot Configuration", items: BOT_ITEMS },
    {
      id: "team-owner",
      header: "Team",
      ownerOnly: true,
      items: TEAM_ITEMS_OWNER,
    },
    { id: "appearance", header: "Appearance", items: APPEARANCE_ITEMS },
    { id: "account", header: "Account", items: ACCOUNT_ITEMS },
  ];

  // For ADMIN: show team section with locked state
  const showAdminTeamSection = role === "ADMIN";

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
          Settings
        </span>
        <div className="min-w-[44px]" />
      </header>

      {/* Groups */}
      <main className="flex-1 pb-[calc(32px+env(safe-area-inset-bottom))]">
        {groups.map((group) => (
          <SettingsGroup key={group.id} group={group} role={role} />
        ))}

        {showAdminTeamSection && (
          <div className="mx-4 mt-6">
            <h3 className="text-[11px] font-bold text-[#8888AA] uppercase tracking-[0.1em] px-2 mb-2">
              Team
            </h3>
            <div className="rounded-xl bg-[#141422] border border-[#2A2A42] overflow-hidden divide-y divide-[#2A2A42]">
              {TEAM_ITEMS_ADMIN.map((item) => (
                <Row key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* Danger zone */}
        <div className="mx-4 mt-8 pb-8 flex flex-col items-center gap-4">
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
      </main>
    </div>
  );
}

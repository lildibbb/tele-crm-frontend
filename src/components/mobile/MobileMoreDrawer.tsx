"use client";

import React from "react";
import {
  ChartBar,
  Sliders,
  Bell,
  User,
  Crown,
  SignOut,
  X,
  CaretRight,
  GearSix,
  Database,
} from "@phosphor-icons/react";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { UserRole } from "@/types/enums";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface MobileMoreDrawerProps {
  readonly role: UserRole;
  readonly open: boolean;
  readonly onClose: () => void;
  readonly userName?: string;
  readonly userInitials?: string;
  readonly notificationCount?: number;
  readonly onAnalytics?: () => void;
  readonly onSettings?: () => void;
  readonly onNotifications?: () => void;
  readonly onProfile?: () => void;
  readonly onAdminPanel?: () => void;
  readonly onSignOut?: () => void;
}

interface NavItemConfig {
  Icon: React.ElementType;
  iconColor: string;
  label: string;
  badge?: number;
  action: string;
}

// ── Role config ────────────────────────────────────────────────────────────────
const ROLE_CHIP_CONFIG: Record<
  UserRole,
  { label: string; color: string; bg: string }
> = {
  SUPERADMIN: { label: "Superadmin", color: "#E8B94F", bg: "#E8B94F1A" },
  OWNER: { label: "Owner", color: "#C4232D", bg: "#C4232D1A" },
  ADMIN: { label: "Admin", color: "#60A5FA", bg: "#60A5FA1A" },
  STAFF: { label: "Staff", color: "#8888AA", bg: "#8888AA1A" },
};

function getNavItems(role: UserRole, notifCount: number): NavItemConfig[] {
  const base: NavItemConfig[] = [
    {
      Icon: Bell,
      iconColor: "#F59E0B",
      label: "Notifications",
      badge: notifCount > 0 ? notifCount : undefined,
      action: "notifications",
    },
    { Icon: User, iconColor: "#8888AA", label: "Profile", action: "profile" },
  ];

  if (role === "SUPERADMIN") {
    return [
      {
        Icon: ChartBar,
        iconColor: "#60A5FA",
        label: "Analytics (All Orgs)",
        action: "analytics",
      },
      {
        Icon: GearSix,
        iconColor: "#8888AA",
        label: "System Config",
        action: "settings",
      },
      ...base,
      {
        Icon: Crown,
        iconColor: "#E8B94F",
        label: "Admin Panel",
        action: "admin",
      },
    ];
  }
  if (role === "OWNER" || role === "ADMIN") {
    return [
      {
        Icon: ChartBar,
        iconColor: "#60A5FA",
        label: "Analytics",
        action: "analytics",
      },
      {
        Icon: Sliders,
        iconColor: "#8888AA",
        label: "Settings",
        action: "settings",
      },
      ...base,
    ];
  }
  // STAFF: minimal
  return base;
}

// ── Nav row ────────────────────────────────────────────────────────────────────
function NavRow({
  item,
  onAction,
}: {
  item: NavItemConfig;
  onAction: (action: string) => void;
}) {
  return (
    <button
      onClick={() => onAction(item.action)}
      className="flex items-center gap-4 w-full p-4 active:bg-[#1C1C2E] transition-colors group"
    >
      <span
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${item.iconColor}22` }}
      >
        <item.Icon size={20} style={{ color: item.iconColor }} weight="fill" />
      </span>
      <span className="flex-1 font-sans font-medium text-[14px] text-[#F0F0FF] text-left">
        {item.label}
      </span>
      {item.badge !== undefined && item.badge > 0 && (
        <span
          className="min-w-[20px] h-5 px-1.5 rounded-full bg-[#C4232D] font-mono text-[11px] text-white
                     flex items-center justify-center"
        >
          {item.badge >= 10 ? "9+" : item.badge}
        </span>
      )}
      <CaretRight
        size={16}
        className="text-[#555570] shrink-0 group-hover:translate-x-1 transition-transform"
      />
    </button>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function MobileMoreDrawer({
  role,
  open,
  onClose,
  userName = "Sarah Lim",
  userInitials = "SL",
  notificationCount = 0,
  onAnalytics,
  onSettings,
  onNotifications,
  onProfile,
  onAdminPanel,
  onSignOut,
}: MobileMoreDrawerProps) {
  const chip = ROLE_CHIP_CONFIG[role];
  const navItems = getNavItems(role, notificationCount);

  const handleAction = (action: string) => {
    onClose();
    switch (action) {
      case "analytics":
        return onAnalytics?.();
      case "settings":
        return onSettings?.();
      case "notifications":
        return onNotifications?.();
      case "profile":
        return onProfile?.();
      case "admin":
        return onAdminPanel?.();
    }
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="bottom"
        className="p-0 border-t border-[#2A2A42] rounded-t-[20px] focus:outline-none"
        style={{ background: "#141422", maxHeight: "75vh" }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-8 h-1 rounded-full bg-[#38385A]" />
        </div>

        {/* Profile row */}
        <button
          onClick={() => {
            onClose();
            onProfile?.();
          }}
          className="flex items-center gap-4 w-full px-5 py-3 active:bg-[#1C1C2E] transition-colors"
        >
          {/* Avatar */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-sans font-semibold text-[14px] text-[#F0F0FF]"
            style={{ background: "#1C1C2E" }}
          >
            {userInitials}
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="font-sans font-semibold text-[15px] text-[#F0F0FF] truncate">
              {userName}
            </div>
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-sans font-semibold text-[11px] mt-0.5"
              style={{ background: chip.bg, color: chip.color }}
            >
              {chip.label}
            </span>
          </div>
          <CaretRight size={16} className="text-[#555570] shrink-0" />
        </button>

        <Separator className="bg-[#2A2A42]" />

        {/* Nav items */}
        <div className="py-2">
          {navItems.map((item) => (
            <NavRow key={item.action} item={item} onAction={handleAction} />
          ))}
        </div>

        <Separator className="bg-[#2A2A42]" />

        {/* Bottom: Language + Sign Out */}
        <div className="flex items-center justify-between px-5 py-4 gap-4">
          <div className="flex items-center gap-1 rounded-full border border-[#2A2A42] overflow-hidden">
            <button className="px-3 py-1.5 font-sans font-semibold text-[12px] text-[#F0F0FF] bg-[#C4232D1A]">
              EN
            </button>
            <button className="px-3 py-1.5 font-sans text-[12px] text-[#8888AA]">
              MY
            </button>
          </div>
          <button
            onClick={() => {
              onClose();
              onSignOut?.();
            }}
            className="flex items-center gap-2 rounded-xl px-4 py-2 border-2 border-[#C4232D] text-[#C4232D]
                       hover:bg-[#C4232D] hover:text-white transition-all active:scale-[0.97]"
          >
            <SignOut size={16} weight="bold" />
            <span className="font-sans font-semibold text-[14px]">
              Sign Out
            </span>
          </button>
        </div>

        <div style={{ height: "env(safe-area-inset-bottom)" }} />
      </SheetContent>
    </Sheet>
  );
}

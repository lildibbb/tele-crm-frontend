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
  iconClass: string;
  label: string;
  badge?: number;
  action: string;
}

// ── Role config ────────────────────────────────────────────────────────────────
const ROLE_CHIP_CONFIG: Record<UserRole, { label: string; textClass: string; bgClass: string }> = {
  SUPERADMIN: { label: "Superadmin", textClass: "text-gold",         bgClass: "bg-gold-subtle" },
  OWNER:      { label: "Owner",      textClass: "text-crimson",      bgClass: "bg-crimson-subtle" },
  ADMIN:      { label: "Admin",      textClass: "text-info",         bgClass: "bg-[color-mix(in_srgb,var(--info)_15%,transparent)]" },
  STAFF:      { label: "Staff",      textClass: "text-text-secondary", bgClass: "bg-elevated" },
};

function getNavItems(role: UserRole, notifCount: number): NavItemConfig[] {
  const base: NavItemConfig[] = [
    { Icon: Bell,  iconClass: "text-warning", label: "Notifications", badge: notifCount > 0 ? notifCount : undefined, action: "notifications" },
    { Icon: User,  iconClass: "text-text-secondary", label: "Profile", action: "profile" },
  ];

  if (role === "SUPERADMIN") {
    return [
      { Icon: ChartBar, iconClass: "text-info",          label: "Analytics (All Orgs)", action: "analytics" },
      { Icon: GearSix,  iconClass: "text-text-secondary", label: "System Config",        action: "settings" },
      ...base,
      { Icon: Crown,    iconClass: "text-gold",           label: "Admin Panel",          action: "admin" },
    ];
  }
  if (role === "OWNER" || role === "ADMIN") {
    return [
      { Icon: ChartBar, iconClass: "text-info",          label: "Analytics", action: "analytics" },
      { Icon: Sliders,  iconClass: "text-text-secondary", label: "Settings",  action: "settings" },
      ...base,
    ];
  }
  return base;
}

// ── Nav row ────────────────────────────────────────────────────────────────────
function NavRow({ item, onAction }: { item: NavItemConfig; onAction: (action: string) => void }) {
  return (
    <button
      onClick={() => onAction(item.action)}
      className="flex items-center gap-4 w-full p-4 active:bg-elevated transition-colors group"
    >
      <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-card border border-border-subtle">
        <item.Icon size={20} className={item.iconClass} weight="fill" />
      </span>
      <span className="flex-1 font-sans font-medium text-[14px] text-text-primary text-left">{item.label}</span>
      {item.badge !== undefined && item.badge > 0 && (
        <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-crimson font-mono text-[11px] text-white flex items-center justify-center">
          {item.badge >= 10 ? "9+" : item.badge}
        </span>
      )}
      <CaretRight size={16} className="text-text-muted shrink-0 group-hover:translate-x-1 transition-transform" />
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
        className="p-0 border-t border-border-subtle rounded-t-[20px] focus:outline-none bg-base"
        style={{ maxHeight: "75vh" }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-8 h-1 rounded-full bg-border-default" />
        </div>

        {/* Profile row */}
        <button
          onClick={() => { onClose(); onProfile?.(); }}
          className="flex items-center gap-4 w-full px-5 py-3 active:bg-elevated transition-colors"
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-sans font-semibold text-[14px] text-text-primary bg-elevated">
            {userInitials}
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="font-sans font-semibold text-[15px] text-text-primary truncate">{userName}</div>
            <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-sans font-semibold text-[11px] mt-0.5", chip.bgClass, chip.textClass)}>
              {chip.label}
            </span>
          </div>
          <CaretRight size={16} className="text-text-muted shrink-0" />
        </button>

        <Separator className="bg-border-subtle" />

        {/* Nav items */}
        <div className="py-2">
          {navItems.map((item) => <NavRow key={item.action} item={item} onAction={handleAction} />)}
        </div>

        <Separator className="bg-border-subtle" />

        {/* Bottom: Language + Sign Out */}
        <div className="flex items-center justify-between px-5 py-4 gap-4">
          <div className="flex items-center gap-1 rounded-full border border-border-subtle overflow-hidden">
            <button className="px-3 py-1.5 font-sans font-semibold text-[12px] text-crimson bg-crimson-subtle">EN</button>
            <button className="px-3 py-1.5 font-sans text-[12px] text-text-secondary">MY</button>
          </div>
          <button
            onClick={() => { onClose(); onSignOut?.(); }}
            className="flex items-center gap-2 rounded-xl px-4 py-2 border-2 border-crimson text-crimson hover:bg-crimson hover:text-white transition-all active:scale-[0.97]"
          >
            <SignOut size={16} weight="bold" />
            <span className="font-sans font-semibold text-[14px]">Sign Out</span>
          </button>
        </div>

        <div style={{ height: "env(safe-area-inset-bottom)" }} />
      </SheetContent>
    </Sheet>
  );
}

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  ChartBar,
  Sliders,
  Bell,
  User,
  Crown,
  SignOut,
  CaretRight,
  GearSix,
  Megaphone,
  Timer,
  ClipboardText,
} from "@phosphor-icons/react";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { UserRole } from "@/types/enums";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface MobileMoreDrawerProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly notificationCount?: number;
}

interface QuickLink {
  Icon: React.ElementType;
  label: string;
  href: string;
  iconColor: string;
  iconBg: string;
  badge?: number;
}

// ── Role config ────────────────────────────────────────────────────────────────
const ROLE_CHIP_CONFIG: Record<UserRole, { label: string; textClass: string; bgClass: string }> = {
  SUPERADMIN: { label: "Superadmin", textClass: "text-gold",           bgClass: "bg-gold-subtle" },
  OWNER:      { label: "Owner",      textClass: "text-crimson",        bgClass: "bg-crimson-subtle" },
  ADMIN:      { label: "Admin",      textClass: "text-info",           bgClass: "bg-[color-mix(in_srgb,var(--info)_15%,transparent)]" },
  STAFF:      { label: "Staff",      textClass: "text-text-secondary", bgClass: "bg-elevated" },
};

function getQuickLinks(role: UserRole, notifCount: number): QuickLink[] {
  const analytics: QuickLink = {
    Icon: ChartBar, label: "Analytics", href: "/analytics",
    iconColor: "text-info", iconBg: "bg-[color-mix(in_srgb,var(--info)_12%,transparent)]",
  };
  const auditLogs: QuickLink = {
    Icon: ClipboardText, label: "Audit Logs", href: "/audit-logs",
    iconColor: "text-text-primary", iconBg: "bg-elevated",
  };
  const followUps: QuickLink = {
    Icon: Timer, label: "Follow-ups", href: "/follow-ups",
    iconColor: "text-gold", iconBg: "bg-gold-subtle",
  };
  const broadcasts: QuickLink = {
    Icon: Megaphone, label: "Broadcasts", href: "/broadcasts",
    iconColor: "text-crimson", iconBg: "bg-crimson-subtle",
  };
  const settings: QuickLink = {
    Icon: GearSix, label: "Settings", href: "/settings",
    iconColor: "text-text-secondary", iconBg: "bg-elevated",
  };
  const profile: QuickLink = {
    Icon: User, label: "Profile", href: "/profile",
    iconColor: "text-success", iconBg: "bg-[color-mix(in_srgb,var(--success)_12%,transparent)]",
  };

  if (role === "SUPERADMIN") {
    return [analytics, auditLogs, followUps, broadcasts, settings, profile];
  }
  if (role === "OWNER" || role === "ADMIN") {
    return [analytics, auditLogs, followUps, broadcasts, settings, profile];
  }
  return [followUps, broadcasts, settings, profile, auditLogs, analytics];
}

// ── Quick Link Cell ────────────────────────────────────────────────────────────
function QuickLinkCell({ link, onNavigate }: { link: QuickLink; onNavigate: (href: string) => void }) {
  return (
    <button
      onClick={() => onNavigate(link.href)}
      className="flex flex-col items-center gap-2 py-3 active:scale-[0.95] transition-transform min-h-[44px]"
    >
      <span className={cn("relative flex items-center justify-center w-12 h-12 rounded-2xl", link.iconBg)}>
        <link.Icon size={22} className={link.iconColor} weight="fill" />
        {link.badge !== undefined && link.badge > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-crimson font-mono text-[10px] text-white flex items-center justify-center font-bold">
            {link.badge >= 10 ? "9+" : link.badge}
          </span>
        )}
      </span>
      <span className="font-sans text-[11px] font-medium text-text-secondary text-center leading-tight">
        {link.label}
      </span>
    </button>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function MobileMoreDrawer({
  open,
  onClose,
  notificationCount = 0,
}: MobileMoreDrawerProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const role = (user?.role as UserRole) ?? "STAFF";
  const userEmail = user?.email ?? "user@example.com";
  const userName = userEmail.split("@")[0] ?? "User";
  const userInitials = userName[0]?.toUpperCase() ?? "U";

  const chip = ROLE_CHIP_CONFIG[role];
  const quickLinks = getQuickLinks(role, notificationCount);

  const handleNavigate = (href: string) => {
    onClose();
    router.push(href);
  };

  const handleSignOut = async () => {
    onClose();
    await logout();
    router.replace("/login");
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="bottom"
        className="p-0 border-t border-border-subtle rounded-t-[24px] focus:outline-none bg-elevated"
        style={{ maxHeight: "80vh" }}
      >
        {/* ── Drag Handle ───────────────────────────────────────────── */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-9 h-[5px] rounded-full bg-border-default" />
        </div>

        {/* ── Quick Links Grid (3 columns) ──────────────────────────── */}
        <div className="px-5 pt-3 pb-2">
          <p className="font-sans text-[11px] font-bold text-text-muted uppercase tracking-[0.08em] mb-2">
            Quick Links
          </p>
          <div className="grid grid-cols-3 gap-x-2 gap-y-1">
            {quickLinks.map((link) => (
              <QuickLinkCell key={link.href} link={link} onNavigate={handleNavigate} />
            ))}
          </div>
        </div>

        <div className="mx-5">
          <Separator className="bg-border-subtle" />
        </div>

        {/* ── Account Section ───────────────────────────────────────── */}
        <div className="px-5 pt-4 pb-2">
          <p className="font-sans text-[11px] font-bold text-text-muted uppercase tracking-[0.08em] mb-3">
            Account
          </p>
          <div className="rounded-2xl bg-card border border-border-subtle overflow-hidden shadow-[var(--shadow-card)]">
            {/* User Info */}
            <button
              onClick={() => handleNavigate("/profile")}
              className="flex items-center gap-3.5 w-full px-4 py-3.5 active:bg-elevated transition-colors text-left min-h-[56px]"
            >
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-crimson-subtle font-display text-[15px] font-bold text-crimson shrink-0">
                {userInitials}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-sans font-semibold text-[14px] text-text-primary truncate">{userName}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-sans text-[12px] text-text-muted truncate">{userEmail}</span>
                  <span className={cn("inline-flex items-center gap-1 shrink-0 rounded-full px-2 py-0.5 font-sans font-bold text-[10px]", chip.bgClass, chip.textClass)}>
                    {chip.label}
                  </span>
                </div>
              </div>
              <CaretRight size={16} className="text-text-muted shrink-0" />
            </button>

            {/* Sign Out */}
            <div className="border-t border-border-subtle">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full px-4 py-3.5 active:bg-elevated transition-colors min-h-[48px]"
              >
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] shrink-0">
                  <SignOut size={18} className="text-danger" weight="bold" />
                </span>
                <span className="font-sans font-semibold text-[14px] text-danger">Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        <div style={{ height: "calc(16px + env(safe-area-inset-bottom))" }} />
      </SheetContent>
    </Sheet>
  );
}

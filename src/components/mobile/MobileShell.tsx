"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SquaresFour,
  Users,
  ShieldCheck,
  DotsThreeOutline,
  Crown,
  DiamondsFour,
  Circle,
  Bell,
} from "@phosphor-icons/react";
import { UserRole } from "@/types/enums";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────
export type MobileTab = "home" | "leads" | "verify" | "more";

export interface MobileShellProps {
  readonly role: UserRole;
  readonly children: ReactNode;
  readonly activeTab: MobileTab;
  readonly pageTitle: string;
  /** Total unread notifications for bell badge */
  readonly notificationCount?: number;
  /** Badge count on Verify tab */
  readonly verifyBadgeCount?: number;
  /** User initials for avatar */
  readonly userInitials?: string;
  readonly onTabChange?: (tab: MobileTab) => void;
  readonly onNotificationsClick?: () => void;
  readonly onAvatarClick?: () => void;
  readonly showLiveDot?: boolean;
}

// ── Role badge config ──────────────────────────────────────────────────────────
const ROLE_CONFIG: Record<
  UserRole,
  { color: string; Icon: React.ElementType; label: string }
> = {
  SUPERADMIN: { color: "#E8B94F", Icon: Crown, label: "Superadmin" },
  OWNER: { color: "#C4232D", Icon: DiamondsFour, label: "Owner" },
  ADMIN: { color: "#60A5FA", Icon: ShieldCheck, label: "Admin" },
  STAFF: { color: "#8888AA", Icon: Circle, label: "Staff" },
};

// ── Tab config per role ────────────────────────────────────────────────────────
interface TabItem {
  id: MobileTab;
  label: string;
  Icon: React.ElementType;
  href: string;
}

function getTabsForRole(role: UserRole): TabItem[] {
  if (role === "SUPERADMIN") {
    return [
      { id: "home", label: "Overview", Icon: SquaresFour, href: "/" },
      { id: "leads", label: "Orgs", Icon: Users, href: "/admin/orgs" },
      { id: "verify", label: "Admin", Icon: Crown, href: "/admin" },
      { id: "more", label: "More", Icon: DotsThreeOutline, href: "#more" },
    ];
  }
  return [
    {
      id: "home",
      label: role === "STAFF" ? "Tasks" : "Home",
      Icon: SquaresFour,
      href: "/",
    },
    { id: "leads", label: "Leads", Icon: Users, href: "/leads" },
    { id: "verify", label: "Verify", Icon: ShieldCheck, href: "/verification" },
    { id: "more", label: "More", Icon: DotsThreeOutline, href: "#more" },
  ];
}

// ── Badge ──────────────────────────────────────────────────────────────────────
function TabBadge({ count }: { count: number }) {
  const label = count >= 10 ? "9+" : String(count);
  return (
    <span
      className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#C4232D]
                 flex items-center justify-center font-mono text-[9px] text-white leading-none"
    >
      {label}
    </span>
  );
}

function BellBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span
      className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#C4232D]
                 flex items-center justify-center font-mono text-[9px] text-white leading-none"
    >
      {count >= 10 ? "9+" : count}
    </span>
  );
}

// ── LIVE dot ──────────────────────────────────────────────────────────────────
function LiveDot() {
  return (
    <span className="flex items-center gap-1">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF3B47] opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF3B47]" />
      </span>
      <span className="font-sans text-[11px] font-medium text-[#C4232D] tracking-wide">
        LIVE
      </span>
    </span>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function MobileShell({
  role,
  children,
  activeTab,
  pageTitle,
  notificationCount = 0,
  verifyBadgeCount = 0,
  userInitials = "TJ",
  onTabChange,
  onNotificationsClick,
  onAvatarClick,
  showLiveDot = false,
}: MobileShellProps) {
  const pathname = usePathname();
  const roleConfig = ROLE_CONFIG[role];
  const tabs = getTabsForRole(role);

  return (
    <div className="flex flex-col min-h-screen bg-[#080810] text-[#F0F0FF] font-sans">
      {/* ── Safe area top ─────────────────────────────────── */}
      <div className="pt-[env(safe-area-inset-top)]" />

      {/* ── Header ────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 flex items-center gap-2 px-4 h-[52px]
                   bg-[#0E0E1A] border-b border-[#2A2A42]"
      >
        {/* Role badge + title */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span
            className="flex items-center justify-center w-6 h-6 rounded-full shrink-0"
            style={{ color: roleConfig.color }}
          >
            <roleConfig.Icon size={18} weight="fill" />
          </span>
          <span className="font-sans font-semibold text-[17px] text-[#F0F0FF] truncate">
            {pageTitle}
          </span>
          {showLiveDot && <LiveDot />}
        </div>

        {/* Bell + avatar */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onNotificationsClick}
            className="relative min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Notifications"
          >
            <Bell size={22} className="text-[#8888AA]" />
            <BellBadge count={notificationCount} />
          </button>
          <button
            onClick={onAvatarClick}
            className="w-8 h-8 rounded-full bg-[#1C1C2E] flex items-center justify-center
                       min-w-[44px] min-h-[44px] font-sans font-semibold text-[14px] text-[#F0F0FF]
                       border border-[#2A2A42]"
            aria-label="Profile"
          >
            {userInitials}
          </button>
        </div>
      </header>

      {/* ── Page content ──────────────────────────────────── */}
      <main
        className="flex-1 overflow-y-auto"
        style={{ paddingBottom: "calc(56px + env(safe-area-inset-bottom))" }}
      >
        {children}
      </main>

      {/* ── Bottom tab bar ────────────────────────────────── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#2A2A42]"
        style={{
          background: "rgba(14, 14, 26, 0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="flex items-center justify-around h-14">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const isMostlyLink = tab.href !== "#more";
            // Show verify badge
            const showBadge = tab.id === "verify" && verifyBadgeCount > 0;

            const inner = (
              <div
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-full min-h-[44px] transition-all",
                  isActive ? "bg-[#C4232D1A]" : "bg-transparent",
                )}
              >
                <span className="relative">
                  <tab.Icon
                    size={22}
                    weight={isActive ? "fill" : "regular"}
                    style={{ color: isActive ? "#C4232D" : "#555570" }}
                  />
                  {showBadge && <TabBadge count={verifyBadgeCount} />}
                </span>
                <span
                  className={cn(
                    "font-sans text-[11px] leading-tight",
                    isActive
                      ? "font-semibold text-[#F0F0FF]"
                      : "font-normal text-[#555570]",
                  )}
                >
                  {tab.label}
                </span>
              </div>
            );

            if (isMostlyLink) {
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  onClick={() => onTabChange?.(tab.id)}
                  className="flex-1 flex justify-center"
                >
                  {inner}
                </Link>
              );
            }

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange?.(tab.id)}
                className="flex-1 flex justify-center"
              >
                {inner}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export { LiveDot };

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
import { useAuthStore } from "@/store/authStore";

// ── Types ─────────────────────────────────────────────────────────────────────
export type MobileTab = "home" | "leads" | "verify" | "more";

export interface MobileShellProps {
  readonly role?: UserRole;
  readonly children: ReactNode;
  readonly activeTab: MobileTab;
  readonly pageTitle: string;
  /** Total unread notifications for bell badge */
  readonly notificationCount?: number;
  /** Badge count on Verify tab */
  readonly verifyBadgeCount?: number;
  /** Override user initials (defaults to auth user email initial) */
  readonly userInitials?: string;
  readonly onTabChange?: (tab: MobileTab) => void;
  readonly onNotificationsClick?: () => void;
  readonly onAvatarClick?: () => void;
  readonly showLiveDot?: boolean;
  /** Optional back button handler — shows back arrow instead of role icon */
  readonly onBack?: () => void;
}

// ── Role badge config ──────────────────────────────────────────────────────────
const ROLE_CONFIG: Record<
  UserRole,
  { Icon: React.ElementType; label: string; iconClass: string; avatarBorder: string }
> = {
  SUPERADMIN: { Icon: Crown,         label: "Superadmin", iconClass: "text-gold",            avatarBorder: "border-gold/40" },
  OWNER:      { Icon: DiamondsFour,  label: "Owner",      iconClass: "text-crimson",         avatarBorder: "border-crimson/40" },
  ADMIN:      { Icon: ShieldCheck,   label: "Admin",      iconClass: "text-info",            avatarBorder: "border-info/40" },
  STAFF:      { Icon: Circle,        label: "Staff",      iconClass: "text-text-secondary",  avatarBorder: "border-border-subtle" },
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
      { id: "home",   label: "Overview", Icon: SquaresFour,     href: "/" },
      { id: "leads",  label: "Orgs",     Icon: Users,           href: "/admin/orgs" },
      { id: "verify", label: "Admin",    Icon: Crown,           href: "/admin" },
      { id: "more",   label: "More",     Icon: DotsThreeOutline, href: "#more" },
    ];
  }
  return [
    {
      id: "home",
      label: role === "STAFF" ? "Tasks" : "Home",
      Icon: SquaresFour,
      href: "/",
    },
    { id: "leads",  label: "Leads",  Icon: Users,            href: "/leads" },
    { id: "verify", label: "Verify", Icon: ShieldCheck,      href: "/verification" },
    { id: "more",   label: "More",   Icon: DotsThreeOutline, href: "#more" },
  ];
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function TabBadge({ count }: { count: number }) {
  return (
    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-crimson flex items-center justify-center font-mono text-[9px] text-white leading-none shadow-sm shadow-crimson/30">
      {count >= 10 ? "9+" : count}
    </span>
  );
}

function BellBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-crimson flex items-center justify-center font-mono text-[9px] text-white leading-none animate-in fade-in duration-200 shadow-sm shadow-crimson/30">
      {count >= 10 ? "9+" : count}
    </span>
  );
}

function LiveDot() {
  return (
    <span className="flex items-center gap-1 ml-1">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-live" />
      </span>
      <span className="font-sans text-[10px] font-bold text-crimson tracking-widest uppercase">
        Live
      </span>
    </span>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function MobileShell({
  role: roleProp,
  children,
  activeTab,
  pageTitle,
  notificationCount = 0,
  verifyBadgeCount = 0,
  userInitials: userInitialsProp,
  onTabChange,
  onNotificationsClick,
  onAvatarClick,
  showLiveDot = false,
  onBack,
}: MobileShellProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const role = roleProp ?? (user?.role as UserRole) ?? "STAFF";
  const roleConfig = ROLE_CONFIG[role];
  const tabs = getTabsForRole(role);

  // Derive initials from auth user email if not provided
  const initials =
    userInitialsProp ??
    (user?.email ? user.email[0].toUpperCase() : "TJ");

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background text-text-primary font-sans">
      {/* ── Safe area top ─────────────────────────────────── */}
      <div className="pt-[env(safe-area-inset-top)]" />

      {/* ── Header ────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 flex items-center gap-2 px-4 h-[56px] border-b border-border-subtle bg-base">
        {/* Role icon + title */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {onBack ? (
            <button
              onClick={onBack}
              className="flex items-center justify-center w-8 h-8 -ml-1 rounded-lg active:bg-elevated transition-colors"
              aria-label="Go back"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-crimson">
                <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          ) : (
            <span className={cn("flex items-center justify-center w-7 h-7 rounded-lg shrink-0", roleConfig.iconClass)}>
              <roleConfig.Icon size={18} weight="fill" />
            </span>
          )}
          <span className="font-sans font-semibold text-[17px] text-text-primary truncate leading-tight">
            {pageTitle}
          </span>
          {showLiveDot && <LiveDot />}
        </div>

        {/* Bell + avatar */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onNotificationsClick}
            className="relative min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl active:bg-elevated/60 transition-colors"
            aria-label="Notifications"
          >
            <Bell size={21} weight="regular" className="text-text-secondary" />
            <BellBadge count={notificationCount} />
          </button>
          <button
            onClick={onAvatarClick}
            className={cn(
              "w-8 h-8 rounded-full bg-elevated flex items-center justify-center font-sans font-semibold text-[13px] text-text-primary border transition-transform active:scale-90",
              roleConfig.avatarBorder,
            )}
            aria-label="Profile"
          >
            {initials}
          </button>
        </div>
      </header>

      {/* ── Page content ──────────────────────────────────── */}
      <main
        className="flex-1 overflow-y-auto overscroll-y-contain"
        style={{ paddingBottom: "calc(60px + env(safe-area-inset-bottom))" }}
      >
        {children}
      </main>

      {/* ── Bottom tab bar ────────────────────────────────── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-border-subtle bg-base"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center justify-around h-[56px]">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const isLink = tab.href !== "#more";
            const showBadge = tab.id === "verify" && verifyBadgeCount > 0;

            const inner = (
              <div
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 px-4 py-1.5 rounded-2xl min-h-[44px] transition-all duration-200",
                  isActive ? "bg-crimson/15" : "bg-transparent active:bg-elevated/50",
                )}
              >
                <span className="relative">
                  <tab.Icon
                    size={22}
                    weight={isActive ? "fill" : "regular"}
                    className={cn(
                      "transition-colors duration-200",
                      isActive ? "text-crimson" : "text-text-muted",
                    )}
                  />
                  {showBadge && <TabBadge count={verifyBadgeCount} />}
                </span>
                <span
                  className={cn(
                    "font-sans text-[10px] leading-tight transition-colors duration-200",
                    isActive ? "font-semibold text-crimson" : "font-medium text-text-muted",
                  )}
                >
                  {tab.label}
                </span>
              </div>
            );

            if (isLink) {
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


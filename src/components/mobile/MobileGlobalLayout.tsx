"use client";

/**
 * MobileGlobalLayout — global mobile shell used by the dashboard layout.
 * Provides: sticky header, scrollable content, fixed bottom nav, "More" sheet.
 * All mobile page components render as pure content inside this wrapper.
 */

import React, { ReactNode, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  SquaresFour,
  Users,
  ShieldCheck,
  DotsThreeOutline,
  Crown,
  CaretRight,
  ChartBar,
  Sliders,
  Timer,
  Megaphone,
  ClipboardText,
  BookOpen,
  Queue,
  DeviceMobile,
  GoogleLogo,
  Wrench,
  HardDrives,
  Key,
  Warning,
} from "@phosphor-icons/react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";
import { useMaintenanceConfig, useFeatureVisibility } from "@/queries/useMaintenanceQuery";
import { UserRole } from "@/types/enums";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n";

// ── Page titles ────────────────────────────────────────────────────────────────

const PAGE_TITLES: Record<string, string> = {
  "/": "Command Center",
  "/leads": "Lead Intelligence",
  "/verification": "Verification",
  "/broadcasts": "Broadcasts",
  "/follow-ups": "Follow-ups",
  "/audit-logs": "Audit Logs",
  "/analytics": "Analytics",
  "/settings": "Settings",
  "/settings/team": "Team",
  "/profile": "Profile",
  "/admin": "Admin",
  "/admin/overview": "Overview",
  "/admin/users": "Users",
  "/admin/maintenance": "Maintenance",
  "/admin/system": "System Config",
  "/admin/backup": "Backup",
  "/admin/secrets": "Secrets",
  "/admin/google": "Google Analytics",
  "/admin/queues": "Queues",
  "/admin/sessions": "All Sessions",
  "/docs": "Documentation",
  "/settings/knowledge-base": "Knowledge Base",
  "/settings/commands": "Bot Commands",
  "/settings/bot-config": "Bot Configuration",
  "/settings/integrations": "Integrations",
};

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  for (const [path, title] of Object.entries(PAGE_TITLES)) {
    if (path !== "/" && pathname.startsWith(path)) return title;
  }
  return "Titan Journal";
}

// ── Tab navigation ─────────────────────────────────────────────────────────────

type TabId = "home" | "leads" | "verify" | "more";

interface Tab {
  id: TabId;
  label: string;
  Icon: React.ElementType;
  href?: string;
}

function getTabsForRole(role: UserRole): Tab[] {
  if (role === "SUPERADMIN") {
    return [
      { id: "home", label: "Overview", Icon: Crown, href: "/admin/overview" },
      { id: "leads", label: "Team", Icon: Users, href: "/settings/team" },
      {
        id: "verify",
        label: "Audit",
        Icon: ClipboardText,
        href: "/audit-logs",
      },
      { id: "more", label: "More", Icon: DotsThreeOutline },
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
    { id: "more", label: "More", Icon: DotsThreeOutline },
  ];
}

function isTabActive(tab: Tab, pathname: string): boolean {
  if (!tab.href) return false;
  if (tab.href === "/") return pathname === "/";
  return pathname.startsWith(tab.href);
}

// ── More drawer ────────────────────────────────────────────────────────────────

interface QuickLink {
  label: string;
  href: string;
  Icon: React.ElementType;
}

/**
 * Returns the quick-link list for the mobile "More" drawer.
 * Follow-ups is conditionally included based on feature visibility so it
 * disappears from the drawer when the superadmin has toggled it off.
 * Superadmins always see all links regardless of visibility flags.
 */
function getQuickLinks(
  role: UserRole,
  showFollowUps: boolean,
): QuickLink[] {
  const common: QuickLink[] = [
    { label: "Analytics", href: "/analytics", Icon: ChartBar },
    { label: "Broadcasts", href: "/broadcasts", Icon: Megaphone },
    ...(showFollowUps
      ? [{ label: "Follow-ups", href: "/follow-ups", Icon: Timer }]
      : []),
    { label: "Audit Logs", href: "/audit-logs", Icon: ClipboardText },
    { label: "Settings", href: "/settings", Icon: Sliders },
    { label: "Docs", href: "/docs", Icon: BookOpen },
  ];
  if (role === "SUPERADMIN") {
    return [
      { label: "Users", href: "/admin/users", Icon: Users },
      { label: "Queues", href: "/admin/queues", Icon: Queue },
      { label: "Sessions", href: "/admin/sessions", Icon: DeviceMobile },
      { label: "Google", href: "/admin/google", Icon: GoogleLogo },
      { label: "System", href: "/admin/system", Icon: Wrench },
      { label: "Backup", href: "/admin/backup", Icon: HardDrives },
      { label: "Secrets", href: "/admin/secrets", Icon: Key },
      { label: "Maintenance", href: "/admin/maintenance", Icon: Warning },
      { label: "Analytics", href: "/analytics", Icon: ChartBar },
      { label: "Settings", href: "/settings", Icon: Sliders },
      { label: "Docs", href: "/docs", Icon: BookOpen },
    ];
  }
  if (role === "STAFF") {
    return common.filter((l) => !["Audit Logs"].includes(l.label));
  }
  return common;
}

const ROLE_LABEL: Record<UserRole, string> = {
  SUPERADMIN: "Superadmin",
  OWNER: "Owner",
  ADMIN: "Admin",
  STAFF: "Staff",
};

function MoreDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { user } = useAuthStore();

  const role = (user?.role as UserRole) ?? "STAFF";
  const isSuperAdmin = role === UserRole.SUPERADMIN;
  const email = user?.email ?? "";
  const name = email.split("@")[0] ?? "User";
  const initials = name[0]?.toUpperCase() ?? "U";
  const roleLabel = ROLE_LABEL[role];

  const { followUps: followUpsVisible } = useFeatureVisibility();
  const showFollowUps = isSuperAdmin || followUpsVisible;
  const links = getQuickLinks(role, showFollowUps);

  const navigate = useCallback(
    (href: string) => {
      onClose();
      router.push(href);
    },
    [onClose, router],
  );

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="bottom"
        className="p-0 border-t border-border-subtle rounded-t-[20px] bg-base focus:outline-none"
        style={{ maxHeight: "80dvh" }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-8 h-1 rounded-full bg-border-default" />
        </div>

        {/* Quick links */}
        <div className="px-5 pt-1 pb-3">
          <p className="font-sans text-[10px] font-semibold text-text-muted uppercase tracking-[0.1em] mb-3">
            Quick Links
          </p>
          <div className="grid grid-cols-3 gap-1">
            {links.map((link) => (
              <button
                key={link.href}
                onClick={() => navigate(link.href)}
                className="flex flex-col items-center gap-2 py-3 rounded-xl active:bg-elevated transition-colors min-h-[72px]"
              >
                <span className="flex items-center justify-center w-11 h-11 rounded-2xl bg-elevated">
                  <link.Icon
                    size={20}
                    weight="regular"
                    className="text-text-secondary"
                  />
                </span>
                <span className="font-sans text-[11px] text-text-secondary text-center leading-tight">
                  {link.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mx-5">
          <Separator className="bg-border-subtle" />
        </div>

        {/* Account section */}
        <div className="px-5 pt-4 pb-3">
          <p className="font-sans text-[10px] font-semibold text-text-muted uppercase tracking-[0.1em] mb-3">
            Account
          </p>

          {/* Profile row */}
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-3 w-full px-3.5 py-3 rounded-xl bg-card border border-border-subtle active:bg-elevated transition-colors text-left min-h-[56px]"
          >
            <Avatar className="w-9 h-9 shrink-0">
              <AvatarFallback className="bg-elevated text-text-primary text-sm font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-sans font-semibold text-[13px] text-text-primary truncate">
                {name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-sans text-[11px] text-text-muted truncate">
                  {email}
                </span>
                <Badge
                  variant="secondary"
                  className="text-[9px] px-1.5 py-0 h-4 shrink-0 font-medium"
                >
                  {roleLabel}
                </Badge>
              </div>
            </div>
            <CaretRight
              size={14}
              weight="regular"
              className="text-text-muted shrink-0"
            />
          </button>
        </div>

        <div style={{ height: "max(16px, env(safe-area-inset-bottom))" }} />
      </SheetContent>
    </Sheet>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

interface MobileGlobalLayoutProps {
  readonly children: ReactNode;
}

export default function MobileGlobalLayout({
  children,
}: MobileGlobalLayoutProps) {
  const t = useT();
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();

  const [moreOpen, setMoreOpen] = useState(false);

  const role = (user?.role as UserRole) ?? "STAFF";
  const tabs = getTabsForRole(role);
  const title = getPageTitle(pathname);
  const initials = user?.email ? user.email[0].toUpperCase() : "TJ";

  const { data: maintenanceConfig } = useMaintenanceConfig();
  const maintenanceMode = maintenanceConfig?.maintenanceMode ?? false;

  // Full-screen pages (chat) bypass the global chrome
  const isChatPage = /^\/leads\/[^/]+\/chat$/.test(pathname);
  if (isChatPage) return <>{children}</>;

  return (
    <div className="flex flex-col min-h-[100dvh] bg-void text-text-primary font-sans">
      {/* Safe area top */}
      <div style={{ height: "env(safe-area-inset-top)" }} aria-hidden />

      {/* ── Header ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 flex items-center gap-3 px-4 h-14 border-b border-border-subtle bg-base/90 backdrop-blur-xl shrink-0">
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <h1 className="font-display font-semibold text-[17px] text-text-primary truncate leading-tight">
            {title}
          </h1>
          <div
            className={cn(
              "flex items-center gap-1 px-1.5 py-0.5 rounded-full border transition-colors shrink-0",
              maintenanceMode
                ? "bg-warning/10 border-warning/15"
                : "bg-live/10 border-live/15",
            )}
          >
            <span
              className={cn(
                "w-1 h-1 rounded-full",
                maintenanceMode
                  ? "bg-warning animate-pulse"
                  : "bg-live animate-pulse",
              )}
            />
            <span
              className={cn(
                "text-[9px] font-sans font-bold tracking-wider",
                maintenanceMode ? "text-warning" : "text-live",
              )}
            >
              {maintenanceMode ? t("common.maintenance") : t("common.live")}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => router.push("/profile")}
            className="ml-0.5"
            aria-label="Profile"
          >
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-elevated text-text-primary text-xs font-semibold border border-border-subtle">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>
        </div>
      </header>

      {/* ── Page content ────────────────────────────────────────────── */}
      <main
        id="mobile-main"
        className="flex-1 overflow-y-auto overscroll-y-contain"
        style={{ paddingBottom: "calc(60px + env(safe-area-inset-bottom))" }}
      >
        {children}
      </main>

      {/* ── Bottom tab bar ──────────────────────────────────────────── */}
      <nav
        className="fixed bottom-0 inset-x-0 z-40 border-t border-border-subtle bg-base/90 backdrop-blur-xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Mobile navigation"
      >
        <div className="flex h-[60px]">
          {tabs.map((tab) => {
            const isActive =
              isTabActive(tab, pathname) || (tab.id === "more" && moreOpen);

            const handleClick = () => {
              if (tab.id === "more") {
                setMoreOpen(true);
              } else if (tab.href) {
                router.push(tab.href);
              }
            };

            return (
              <button
                key={tab.id}
                onClick={handleClick}
                aria-label={tab.label}
                aria-current={isActive ? "page" : undefined}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 active:opacity-70 transition-opacity"
              >
                <div
                  className={cn(
                    "flex items-center justify-center rounded-2xl px-3 py-1 transition-colors duration-200",
                    isActive ? "bg-crimson/10" : "",
                  )}
                >
                  <tab.Icon
                    size={22}
                    weight={isActive ? "fill" : "regular"}
                    className={cn(
                      "transition-colors duration-200",
                      isActive ? "text-crimson" : "text-text-muted",
                    )}
                  />
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium leading-none transition-colors duration-200",
                    isActive ? "text-crimson" : "text-text-muted",
                  )}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── More sheet ──────────────────────────────────────────────── */}
      <MoreDrawer open={moreOpen} onClose={() => setMoreOpen(false)} />
    </div>
  );
}

export { getPageTitle };

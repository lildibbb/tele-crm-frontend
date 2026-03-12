"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  SquaresFour,
  Users,
  ShieldCheck,
  Sliders,
  ChartBar,
  Crown,
  Megaphone,
  Timer,
  ClipboardText,
  SignOut,
  UserCircle,
  CaretDown,
  Warning,
  HardDrives,
  LockKey,
  ChartLineUp,
  ListBullets,
  Desktop,
  Eye,
  Robot,
  ThumbsUp,
} from "@phosphor-icons/react";
import { useT } from "@/i18n";
import { useAuthStore } from "@/store/authStore";
import { useBotStatus } from "@/queries/useBotQuery";
import { UserRole } from "@/types/enums";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useFeatureVisibility } from "@/queries/useMaintenanceQuery";
import { ChevronUp } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";

const ADMIN_SUB_ITEMS = [
  { href: "/admin/overview", icon: SquaresFour, label: "Overview" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/maintenance", icon: Warning, label: "Maintenance" },
  { href: "/admin/system", icon: Sliders, label: "System Config" },
  { href: "/admin/backup", icon: HardDrives, label: "Backup" },
  { href: "/admin/secrets", icon: LockKey, label: "Secrets" },
  { href: "/admin/google", icon: ChartLineUp, label: "Google Analytics" },
  { href: "/admin/queues", icon: ListBullets, label: "Queue Manager" },
  { href: "/admin/sessions", icon: Desktop, label: "Sessions" },
  { href: "/admin/features", icon: Eye, label: "Feature Visibility" },
  { href: "/admin/ai-feedback", icon: ThumbsUp, label: "AI Feedback" },
];

const ALL_NAV_ITEMS = [
  {
    href: "/",
    icon: SquaresFour,
    labelKey: "nav.commandCenter",
    roles: [UserRole.OWNER, UserRole.ADMIN, UserRole.STAFF],
  },
  {
    href: "/leads",
    icon: Users,
    labelKey: "nav.leadIntelligence",
    roles: [UserRole.OWNER, UserRole.ADMIN, UserRole.STAFF],
  },
  {
    href: "/verification",
    icon: ShieldCheck,
    labelKey: "nav.verificationQueue",
    roles: [UserRole.OWNER, UserRole.ADMIN, UserRole.STAFF],
  },
  {
    href: "/broadcasts",
    icon: Megaphone,
    labelKey: "nav.broadcasts",
    roles: [UserRole.OWNER, UserRole.ADMIN],
  },
  {
    href: "/follow-ups",
    icon: Timer,
    labelKey: "nav.followUps",
    roles: [UserRole.OWNER, UserRole.ADMIN],
  },
  {
    href: "/audit-logs",
    icon: ClipboardText,
    labelKey: "nav.auditLogs",
    roles: [UserRole.OWNER, UserRole.ADMIN, UserRole.SUPERADMIN],
  },
  {
    href: "/analytics",
    icon: ChartBar,
    labelKey: "nav.analytics",
    roles: [
      UserRole.OWNER,
      UserRole.ADMIN,
      UserRole.STAFF,
      UserRole.SUPERADMIN,
    ],
  },
  {
    href: "/settings",
    icon: Sliders,
    labelKey: "nav.settings",
    roles: [UserRole.OWNER, UserRole.ADMIN, UserRole.SUPERADMIN],
  },
  {
    href: "/settings",
    icon: Sliders,
    labelKey: "nav.botConfig",
    roles: [UserRole.STAFF],
  },
];

export const NAV_ITEMS = ALL_NAV_ITEMS;

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useT();
  const { user, logout } = useAuthStore();
  const { setOpenMobile, state: sidebarState } = useSidebar();

  const { data: botStatus } = useBotStatus();
  const botOnline = botStatus?.online ?? null;

  const role = user?.role as UserRole | undefined;
  const isSuperAdmin = role === UserRole.SUPERADMIN;
  const isAdminPath = pathname.startsWith("/admin");
  const visibility = useFeatureVisibility();

  const [adminOpen, setAdminOpen] = useState(() => isAdminPath);
  useEffect(() => {
    if (isAdminPath) setAdminOpen(true);
  }, [isAdminPath]);

  const visibleItems = ALL_NAV_ITEMS.filter((item) => {
    if (!role || !item.roles.includes(role)) return false;
    if (role === UserRole.SUPERADMIN) return true;
    if (item.href === "/follow-ups" && !visibility.followUps) return false;
    return true;
  });

  const isCollapsed = sidebarState === "collapsed";

  // Derive user initials for avatar
  const userInitials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : "?";

  const roleBadgeClass = cn(
    "inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold leading-none tracking-wide",
    user?.role === UserRole.OWNER || user?.role === UserRole.SUPERADMIN
      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-1 ring-inset ring-amber-500/25"
      : user?.role === UserRole.ADMIN
        ? "bg-blue-500/15 text-blue-700 dark:text-blue-400 ring-1 ring-inset ring-blue-500/25"
        : "bg-muted text-text-secondary ring-1 ring-inset ring-border-subtle",
  );

  return (
    <Sidebar collapsible="icon" variant="inset">
      {/* ── Header / Logo ──────────────────────────────────────── */}
      <SidebarHeader className="px-3 py-3 border-b border-sidebar-border/60">
        <Link
          href="/"
          className="flex items-center h-9 w-full overflow-hidden"
          onClick={() => setOpenMobile(false)}
        >
          {/* Full logo + title — hidden when collapsed */}
          <div className="group-data-[collapsible=icon]:hidden flex items-center gap-3 w-full">
            <Image
              src="/assets/logo/titan-logo-02.svg"
              alt="Titan CRM"
              width={130}
              height={32}
              className="object-contain h-8 w-auto max-w-[140px]"
              priority
              unoptimized
            />
            <div className="flex flex-col leading-tight">
              <span className="font-display font-extrabold text-text-primary text-sm tracking-tight">
                TITAN JOURNAL
              </span>
              <span className="text-crimson font-bold text-xs tracking-tight">
                CRM
              </span>
            </div>
          </div>

          {/* Icon logo — shown only when collapsed */}
          <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center w-full">
            <Image
              src="/assets/logo/titan-logo-03.svg"
              alt="T"
              width={28}
              height={28}
              className="object-contain h-7 w-7"
              priority
              unoptimized
            />
          </div>
        </Link>
      </SidebarHeader>

      {/* ── Nav Content ───────────────────────────────────────── */}
      <SidebarContent className="px-2 py-3">
        {/* Section label */}
        <p className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-text-muted/60 select-none group-data-[collapsible=icon]:hidden">
          Navigation
        </p>

        <SidebarMenu className="gap-0.5">
          {/* ── Regular nav items ── */}
          {visibleItems.map(({ href, icon: Icon, labelKey }) => {
            const label = t(labelKey);
            const isActive =
              href === "/"
                ? pathname === "/"
                : pathname === href || pathname.startsWith(href + "/");
            const isSettings = href === "/settings";

            return (
              <SidebarMenuItem key={href} className="relative">
                {/* Left accent bar — hidden in icon mode */}
                {isActive && (
                  <span className="absolute left-0 inset-y-1.5 w-0.5 rounded-r-full bg-crimson z-10 group-data-[collapsible=icon]:hidden pointer-events-none" />
                )}
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={label}
                  className={cn(
                    "group/navitem h-auto py-2.5 px-3 rounded-lg transition-all duration-150 overflow-hidden",
                    isActive
                      ? "!bg-crimson/8 !text-crimson"
                      : "text-text-secondary hover:!bg-elevated hover:!text-text-primary",
                  )}
                  onClick={() => setOpenMobile(false)}
                >
                  <Link href={href} className="flex items-center gap-2.5">
                    <Icon
                      size={17}
                      weight={isActive ? "fill" : "regular"}
                      className={cn(
                        "flex-shrink-0 transition-transform duration-150",
                        "group-hover/navitem:scale-110",
                      )}
                    />
                    <span className="font-medium text-[13px] leading-none">
                      {label}
                    </span>
                    {/* Bot status dot on settings */}
                    {isSettings && (
                      <span
                        className={cn(
                          "ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors",
                          botOnline === true
                            ? "bg-success shadow-[0_0_4px_var(--color-success)]"
                            : botOnline === false
                              ? "bg-danger"
                              : "bg-text-muted/30",
                        )}
                        title={
                          botOnline === true
                            ? "Bot online"
                            : botOnline === false
                              ? "Bot offline"
                              : "Checking…"
                        }
                      />
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}

          {/* ── Superadmin section ── */}
          {isSuperAdmin && (
            <>
              <li className="group-data-[collapsible=icon]:hidden pt-2 pb-1 px-2">
                <div className="border-t border-sidebar-border/60" />
                <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-text-muted/60 select-none">
                  Superadmin
                </p>
              </li>

              <SidebarMenuItem className="relative">
                {isAdminPath && (
                  <span className="absolute left-0 inset-y-1.5 w-0.5 rounded-r-full bg-crimson z-10 group-data-[collapsible=icon]:hidden pointer-events-none" />
                )}
                <SidebarMenuButton
                  isActive={isAdminPath}
                  tooltip="Superadmin"
                  className={cn(
                    "group/navitem h-auto py-2.5 px-3 rounded-lg transition-all duration-150 overflow-hidden cursor-pointer select-none",
                    isAdminPath
                      ? "!bg-crimson/8 !text-crimson"
                      : "text-text-secondary hover:!bg-elevated hover:!text-text-primary",
                  )}
                  onClick={() => {
                    if (isCollapsed) {
                      router.push("/admin/overview");
                      setOpenMobile(false);
                    } else {
                      setAdminOpen((o) => !o);
                    }
                  }}
                >
                  <Crown
                    size={17}
                    weight={isAdminPath ? "fill" : "regular"}
                    className="flex-shrink-0 transition-transform duration-150 group-hover/navitem:scale-110"
                  />
                  <span className="font-medium text-[13px] leading-none flex-1 group-data-[collapsible=icon]:hidden">
                    {t("nav.superAdmin")}
                  </span>
                  <CaretDown
                    size={12}
                    weight="bold"
                    className={cn(
                      "ml-auto flex-shrink-0 text-current opacity-50 transition-transform duration-200 group-data-[collapsible=icon]:hidden",
                      adminOpen ? "rotate-180" : "rotate-0",
                    )}
                  />
                </SidebarMenuButton>

                {/* Sub-items */}
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-200 ease-in-out group-data-[collapsible=icon]:hidden",
                    adminOpen ? "max-h-[480px] opacity-100" : "max-h-0 opacity-0",
                  )}
                >
                  <SidebarMenuSub className="mt-1 ml-1 border-l border-sidebar-border/60 space-y-0.5">
                    {ADMIN_SUB_ITEMS.map(({ href, icon: SubIcon, label }) => {
                      const isSubActive =
                        pathname === href || pathname.startsWith(href + "/");
                      return (
                        <SidebarMenuSubItem key={href}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={isSubActive}
                            className={cn(
                              "h-8 rounded-md transition-colors duration-150 text-[12px]",
                              isSubActive
                                ? "!text-crimson !bg-crimson/8 font-semibold"
                                : "text-text-secondary hover:!text-text-primary hover:!bg-elevated/60",
                            )}
                          >
                            <Link
                              href={href}
                              onClick={() => setOpenMobile(false)}
                              className="flex items-center gap-2"
                            >
                              <SubIcon
                                size={13}
                                weight={isSubActive ? "fill" : "regular"}
                                className="flex-shrink-0"
                              />
                              <span>{label}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </div>
              </SidebarMenuItem>
            </>
          )}
        </SidebarMenu>
      </SidebarContent>

      {/* ── Footer / User ─────────────────────────────────────── */}
      <SidebarFooter className="px-2 pb-3 pt-2 border-t border-sidebar-border/60">
        {/* Bot status pill — shown only when expanded */}
        {botOnline !== null && (
          <div className={cn(
            "mb-2 mx-1 group-data-[collapsible=icon]:hidden",
          )}>
            <div className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border",
              botOnline
                ? "bg-success/8 border-success/20 text-success"
                : "bg-danger/8 border-danger/20 text-danger",
            )}>
              <Robot size={12} weight="duotone" className="flex-shrink-0" />
              <span className="flex-1">Bot</span>
              <span className="flex items-center gap-1 font-semibold">
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  botOnline ? "bg-success animate-pulse" : "bg-danger",
                )} />
                {botOnline ? "Online" : "Offline"}
              </span>
            </div>
          </div>
        )}

        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="h-auto py-2 px-2.5 rounded-xl cursor-pointer transition-colors duration-150 hover:!bg-elevated data-[state=open]:!bg-elevated group/user"
                >
                  {/* Avatar */}
                  <Avatar className="h-8 w-8 rounded-lg flex-shrink-0">
                    <AvatarFallback className="rounded-lg bg-crimson/10 border border-crimson/20 text-crimson text-[11px] font-bold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>

                  {/* User info — hidden in icon mode */}
                  <div className="flex-1 min-w-0 text-left group-data-[collapsible=icon]:hidden">
                    <p className="text-[12px] font-semibold text-text-primary truncate leading-tight">
                      {user?.email ?? "—"}
                    </p>
                    <span className={cn("mt-0.5", roleBadgeClass)}>
                      {user?.role?.toUpperCase() ?? "—"}
                    </span>
                  </div>

                  <ChevronUp
                    size={14}
                    className="ml-auto text-text-muted opacity-60 group-data-[collapsible=icon]:hidden group-data-[state=open]/user:rotate-180 transition-transform duration-200"
                  />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-52 rounded-xl border border-border-subtle shadow-lg"
                align="end"
                side="top"
                sideOffset={6}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2.5 px-3 py-2.5">
                    <Avatar className="h-9 w-9 rounded-lg flex-shrink-0">
                      <AvatarFallback className="rounded-lg bg-crimson/10 border border-crimson/20 text-crimson text-[12px] font-bold">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-text-primary truncate">
                        {user?.email}
                      </p>
                      <span className={cn("mt-0.5", roleBadgeClass)}>
                        {user?.role?.toUpperCase() ?? "—"}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer rounded-lg mx-1 my-0.5"
                    onClick={() => {
                      setOpenMobile(false);
                      router.push("/profile");
                    }}
                  >
                    <UserCircle size={15} weight="regular" className="text-text-secondary" />
                    <span className="text-[13px]">My Profile</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="gap-2 cursor-pointer rounded-lg mx-1 mb-1 text-danger focus:text-danger focus:bg-danger/10"
                  onClick={() => logout()}
                >
                  <SignOut size={15} weight="regular" />
                  <span className="text-[13px]">{t("nav.logout")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

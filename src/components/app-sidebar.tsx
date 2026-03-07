"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
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
  CaretUpDown,
  CaretDown,
  Warning,
  HardDrives,
  LockKey,
  ChartLineUp,
  ListBullets,
  Desktop,
  Eye,
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
import { EllipsisVertical } from "lucide-react";
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
    roles: [
      UserRole.OWNER,
      UserRole.ADMIN,
      UserRole.SUPERADMIN,
    ],
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

  // Auto-expand admin group when on an admin route
  const [adminOpen, setAdminOpen] = useState(() => isAdminPath);
  useEffect(() => {
    if (isAdminPath) setAdminOpen(true);
  }, [isAdminPath]);

  // Filter nav items by current user's role
  const visibleItems = ALL_NAV_ITEMS.filter((item) => {
    if (!role || !item.roles.includes(role)) return false;
    // Superadmin always sees all navigation items
    if (role === UserRole.SUPERADMIN) return true;
    // Hide Follow-ups if superadmin has disabled the feature
    if (item.href === '/follow-ups' && !visibility.followUps) return false;
    return true;
  });

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/l">
                <div className="font-display font-extrabold tracking-tight leading-none select-none w-full flex items-center justify-center h-full">
                  {/* Full Logo - Hidden when collapsed */}
                  <div className="flex items-center text-[13px] gap-1 transition-opacity duration-300 group-data-[collapsible=icon]:hidden w-full whitespace-nowrap overflow-hidden">
                    <span className="text-text-primary">TITAN</span>
                    <span className="text-text-secondary font-bold">
                      {" "}
                      JOURNAL
                    </span>
                    <span className="text-crimson font-bold"> CRM</span>
                  </div>
                  {/* Icon Logo - Shown ONLY when collapsed */}
                  <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center w-full text-crimson text-lg">
                    T.
                  </div>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu className="space-y-1">
          {/* ── Regular nav items ──────────────────────── */}
          {visibleItems.map(({ href, icon: Icon, labelKey }) => {
            const label = t(labelKey);
            const isActive =
              href === "/"
                ? pathname === "/"
                : pathname === href || pathname.startsWith(href + "/");

            return (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={label}
                  className={`nav-item group h-auto py-2.5 px-3 transition-all duration-300 overflow-hidden ${isActive ? "!bg-crimson/10 !text-crimson active" : "text-text-secondary hover:!bg-elevated hover:!text-text-primary"}`}
                  onClick={() => setOpenMobile(false)}
                >
                  <Link href={href} className="flex items-center">
                    <Icon
                      size={18}
                      weight={isActive ? "fill" : "light"}
                      className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                    />
                    <span className="font-medium ml-2">{label}</span>
                    {href === "/settings" && (
                      <span
                        className={`ml-auto w-2 h-2 rounded-full flex-shrink-0 transition-colors ${
                          botOnline === true
                            ? "bg-success"
                            : botOnline === false
                              ? "bg-danger"
                              : "bg-text-muted/40"
                        }`}
                        title={
                          botOnline === true
                            ? "Bot online"
                            : botOnline === false
                              ? "Bot offline"
                              : "Checking..."
                        }
                      />
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}

          {/* ── Superadmin collapsible group ───────────── */}
          {isSuperAdmin && (
            <>
              {/* Divider */}
              <li className="group-data-[collapsible=icon]:hidden">
                <div className="mx-1 my-1.5 border-t border-border-subtle/40" />
              </li>

              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isAdminPath}
                  tooltip="Superadmin"
                  className={`nav-item group h-auto py-2.5 px-3 transition-all duration-300 overflow-hidden cursor-pointer select-none ${
                    isAdminPath
                      ? "!bg-crimson/10 !text-crimson active"
                      : "text-text-secondary hover:!bg-elevated hover:!text-text-primary"
                  }`}
                  onClick={() => {
                    if (sidebarState === "collapsed") {
                      router.push("/admin/overview");
                      setOpenMobile(false);
                    } else {
                      setAdminOpen((o) => !o);
                    }
                  }}
                >
                  <Crown
                    size={18}
                    weight={isAdminPath ? "fill" : "light"}
                    className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                  />
                  <span className="font-medium ml-3 truncate flex-1 transition-opacity duration-300 group-data-[collapsible=icon]:hidden">
                    {t("nav.superAdmin")}
                  </span>
                  {/* Caret — hidden in icon mode */}
                  <CaretDown
                    size={13}
                    weight="bold"
                    className={`ml-auto flex-shrink-0 text-text-muted transition-all duration-200 group-data-[collapsible=icon]:hidden ${
                      adminOpen ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </SidebarMenuButton>

                {/* Sub-items — animated slide */}
                <div
                  className={`overflow-hidden transition-all duration-200 ease-in-out group-data-[collapsible=icon]:hidden ${
                    adminOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <SidebarMenuSub className="mt-0.5">
                    {ADMIN_SUB_ITEMS.map(({ href, icon: SubIcon, label }) => {
                      const isSubActive =
                        pathname === href || pathname.startsWith(href + "/");
                      return (
                        <SidebarMenuSubItem key={href}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={isSubActive}
                            className={`h-8 transition-colors duration-150 ${
                              isSubActive
                                ? "!text-crimson !bg-crimson/8 font-medium"
                                : "text-text-secondary hover:!text-text-primary hover:!bg-elevated/60"
                            }`}
                          >
                            <Link
                              href={href}
                              onClick={() => setOpenMobile(false)}
                              className="flex items-center gap-2"
                            >
                              <SubIcon
                                size={14}
                                weight={isSubActive ? "fill" : "regular"}
                                className="flex-shrink-0"
                              />
                              <span className="text-xs font-medium">
                                {label}
                              </span>
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

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg">
                    <Avatar>
                      <AvatarFallback className="bg-crimson-subtle border border-crimson/30 text-crimson">
                        {user?.email?.[0]?.toUpperCase() ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {user?.email ?? "—"}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold leading-none mt-0.5 w-fit",
                        user?.role === UserRole.OWNER || user?.role === UserRole.SUPERADMIN
                          ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-1 ring-inset ring-amber-500/25"
                          : user?.role === UserRole.ADMIN
                            ? "bg-blue-500/15 text-blue-700 dark:text-blue-400 ring-1 ring-inset ring-blue-500/25"
                            : "bg-muted text-text-secondary ring-1 ring-inset ring-border-subtle",
                      )}
                    >
                      {user?.role?.toUpperCase() ?? "—"}
                    </span>
                  </div>
                  <EllipsisVertical className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <p className="text-xs font-semibold text-text-primary truncate">
                        {user?.email}
                      </p>
                      <p className="text-[10px] text-text-muted">
                        {user?.role}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer"
                    onClick={() => {
                      setOpenMobile(false);
                      router.push("/profile");
                    }}
                  >
                    <UserCircle />
                    My Profile
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2 cursor-pointer text-danger focus:text-danger focus:bg-danger/10"
                  onClick={() => logout()}
                >
                  <SignOut />
                  {t("nav.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

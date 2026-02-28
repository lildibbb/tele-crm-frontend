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
  BookOpen,
} from "@phosphor-icons/react";
import { useT } from "@/i18n";
import { useAuthStore } from "@/store/authStore";
import { useBotStore } from "@/store/botStore";
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
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ADMIN_SUB_ITEMS = [
  { href: "/admin/overview", icon: SquaresFour, label: "Overview" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/maintenance", icon: Warning, label: "Maintenance" },
  { href: "/admin/system", icon: Sliders, label: "System Config" },
  { href: "/admin/backup", icon: HardDrives, label: "Backup" },
  { href: "/admin/secrets", icon: LockKey, label: "Secrets" },
  { href: "/admin/google", icon: ChartLineUp, label: "Google Analytics" },
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
      UserRole.STAFF,
      UserRole.SUPERADMIN,
    ],
  },
  {
    href: "/docs",
    icon: BookOpen,
    labelKey: "nav.docs",
    roles: [
      UserRole.OWNER,
      UserRole.ADMIN,
      UserRole.STAFF,
      UserRole.SUPERADMIN,
    ],
  },
];

export const NAV_ITEMS = ALL_NAV_ITEMS;

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useT();
  const { user, logout } = useAuthStore();
  const { setOpenMobile, state: sidebarState } = useSidebar();

  const botOnline = useBotStore((s) => s.online);
  const startPolling = useBotStore((s) => s.startPolling);

  const role = user?.role as UserRole | undefined;
  const isSuperAdmin = role === UserRole.SUPERADMIN;
  const isAdminPath = pathname.startsWith("/admin");

  // Auto-expand admin group when on an admin route
  const [adminOpen, setAdminOpen] = useState(() => isAdminPath);
  useEffect(() => {
    if (isAdminPath) setAdminOpen(true);
  }, [isAdminPath]);

  // Start bot status polling when sidebar mounts
  useEffect(() => {
    const stop = startPolling();
    return stop;
  }, [startPolling]);

  // Filter nav items by current user's role
  const visibleItems = ALL_NAV_ITEMS.filter((item) =>
    role ? item.roles.includes(role) : false,
  );

  return (
    <Sidebar
      collapsible="icon"
      className="border-none mt-4 mb-4 ml-2 h-[calc(100svh-2rem)] [&>[data-sidebar=sidebar]]:rounded-xl [&>[data-sidebar=sidebar]]:bg-base [&>[data-sidebar=sidebar]]:border-none [&>[data-sidebar=sidebar]]:shadow-[2px_0_12px_rgba(0,0,0,0.12),1px_0_3px_rgba(0,0,0,0.08)] z-40 group/app-sidebar"
    >
      <SidebarHeader className="h-14 flex items-center justify-center px-5 flex-shrink-0 bg-transparent transition-all duration-300 group-data-[collapsible=icon]:px-0">
        <div className="font-display font-extrabold tracking-tight leading-none select-none w-full flex items-center justify-center h-full">
          {/* Full Logo - Hidden when collapsed */}
          <div className="flex items-center text-[13px] gap-1 transition-opacity duration-300 group-data-[collapsible=icon]:hidden w-full whitespace-nowrap overflow-hidden">
            <span className="text-text-primary">TITAN</span>
            <span className="text-text-secondary font-bold"> JOURNAL</span>
            <span className="text-crimson font-bold"> CRM</span>
          </div>
          {/* Icon Logo - Shown ONLY when collapsed */}
          <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center w-full text-crimson text-lg">
            T.
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2.5 py-4 overflow-y-auto bg-transparent scrollbar-none group-data-[collapsible=icon]:px-2">
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
                  <Link
                    href={href}
                    className="flex items-center min-w-0 w-full"
                  >
                    <Icon
                      size={18}
                      weight={isActive ? "fill" : "light"}
                      className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                    />
                    <span className="font-medium ml-3 truncate transition-opacity duration-300 group-data-[collapsible=icon]:hidden">
                      {label}
                    </span>
                    {href === "/settings" && (
                      <span
                        className={`ml-auto w-2 h-2 rounded-full flex-shrink-0 transition-colors group-data-[collapsible=icon]:hidden ${
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

      <SidebarFooter className="p-3 bg-transparent transition-all duration-300 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:pb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="w-full flex items-center gap-2.5 bg-elevated/30 p-2 rounded-xl border border-border-subtle/50 transition-all duration-300 hover:bg-elevated/60 focus:outline-none group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center"
              aria-label="Profile menu"
            >
              <div className="w-8 h-8 rounded-full bg-crimson-subtle border border-crimson/30 flex items-center justify-center text-crimson font-display font-bold text-[11px] flex-shrink-0 shadow-inner group-data-[collapsible=icon]:ring-2 group-data-[collapsible=icon]:ring-crimson/20 transition-all duration-300">
                {user?.email?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="flex-1 min-w-0 text-left transition-opacity duration-300 group-data-[collapsible=icon]:hidden">
                <p className="text-[12px] font-semibold text-text-primary truncate">
                  {user?.email ?? "—"}
                </p>
                <span
                  className={`badge ${user?.role === UserRole.OWNER ? "badge-owner" : user?.role === UserRole.ADMIN ? "badge-admin" : user?.role === UserRole.SUPERADMIN ? "badge-owner" : "badge-staff"} text-[9px] px-1.5 py-px mt-0.5 inline-block`}
                >
                  {user?.role?.toUpperCase() ?? "—"}
                </span>
              </div>
              <CaretUpDown
                size={13}
                className="text-text-muted flex-shrink-0 group-data-[collapsible=icon]:hidden"
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="start"
            sideOffset={8}
            className="w-56 mb-1"
          >
            <div className="px-2 py-1.5 mb-1">
              <p className="text-xs font-semibold text-text-primary truncate">
                {user?.email}
              </p>
              <p className="text-[10px] text-text-muted">{user?.role}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 cursor-pointer"
              onClick={() => {
                setOpenMobile(false);
                router.push("/profile");
              }}
            >
              <UserCircle size={15} className="text-text-secondary" />
              <span>My Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 cursor-pointer text-danger focus:text-danger focus:bg-danger/10"
              onClick={() => logout()}
            >
              <SignOut size={15} />
              <span>{t("nav.logout")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

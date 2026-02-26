"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  SquaresFour,
  Users,
  ShieldCheck,
  Sliders,
  ChartBar,
  Crown,
  Megaphone,
  Timer,
  SignOut,
} from "@phosphor-icons/react";
import { useT } from "@/i18n";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/types/enums";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";

const ALL_NAV_ITEMS = [
  { href: "/",             icon: SquaresFour, labelKey: "nav.commandCenter",    roles: [UserRole.OWNER, UserRole.ADMIN, UserRole.STAFF] },
  { href: "/leads",        icon: Users,       labelKey: "nav.leadIntelligence",  roles: [UserRole.OWNER, UserRole.ADMIN, UserRole.STAFF] },
  { href: "/verification", icon: ShieldCheck, labelKey: "nav.verificationQueue", roles: [UserRole.OWNER, UserRole.ADMIN, UserRole.STAFF] },
  { href: "/broadcasts",   icon: Megaphone,   labelKey: "nav.broadcasts",        roles: [UserRole.OWNER, UserRole.ADMIN] },
  { href: "/follow-ups",   icon: Timer,       labelKey: "nav.followUps",         roles: [UserRole.OWNER, UserRole.ADMIN] },
  { href: "/analytics",    icon: ChartBar,    labelKey: "nav.analytics",         roles: [UserRole.OWNER, UserRole.ADMIN, UserRole.STAFF, UserRole.SUPERADMIN] },
  { href: "/settings",     icon: Sliders,     labelKey: "nav.settings",          roles: [UserRole.OWNER, UserRole.ADMIN, UserRole.STAFF, UserRole.SUPERADMIN] },
  { href: "/admin",        icon: Crown,       labelKey: "nav.superAdmin",        roles: [UserRole.SUPERADMIN] },
];

export const NAV_ITEMS = ALL_NAV_ITEMS;

export function AppSidebar() {
  const pathname = usePathname();
  const t = useT();
  const { user, logout } = useAuthStore();
  const { setOpenMobile } = useSidebar();

  const role = user?.role as UserRole | undefined;

  // Filter nav items by current user's role
  const visibleItems = ALL_NAV_ITEMS.filter((item) =>
    role ? item.roles.includes(role) : false,
  );

  return (
    <Sidebar
      collapsible="icon"
      className="border-none mt-4  mb-4 ml-2 h-[calc(100svh-2rem)] [&>[data-sidebar=sidebar]]:rounded-xl [&>[data-sidebar=sidebar]]:bg-base [&>[data-sidebar=sidebar]]:border-none shadow-none z-40 group/app-sidebar"
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
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-3 bg-transparent transition-all duration-300 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:pb-4">
        <div className="flex items-center gap-2.5 bg-elevated/30 p-2 rounded-xl border border-border-subtle/50 transition-all duration-300 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center">
          <div className="w-8 h-8 rounded-full bg-crimson-subtle border border-crimson/30 flex items-center justify-center text-crimson font-display font-bold text-[11px] flex-shrink-0 shadow-inner group-data-[collapsible=icon]:ring-2 group-data-[collapsible=icon]:ring-crimson/20 transition-all duration-300 cursor-pointer">
            {user?.email?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="flex-1 min-w-0 transition-opacity duration-300 group-data-[collapsible=icon]:hidden">
            <p className="text-[12px] font-semibold text-text-primary truncate">
              {user?.email ?? "—"}
            </p>
            <span
              className={`badge ${user?.role === UserRole.OWNER ? "badge-owner" : user?.role === UserRole.ADMIN ? "badge-admin" : user?.role === UserRole.SUPERADMIN ? "badge-owner" : "badge-staff"} text-[9px] px-1.5 py-px mt-0.5 inline-block`}
            >
              {user?.role?.toUpperCase() ?? "—"}
            </span>
          </div>
          <button
            aria-label={t("nav.logout")}
            onClick={() => logout()}
            className="p-1.5 rounded-md text-text-muted hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer group-data-[collapsible=icon]:hidden"
          >
            <SignOut size={15} weight="regular" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

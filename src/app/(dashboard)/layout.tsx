"use client";

import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell } from "@phosphor-icons/react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useT, useLocale } from "@/i18n";
import type { Locale } from "@/i18n";
import { useAuthStore } from "@/store/authStore";
import { useMaintenanceStore } from "@/store/maintenanceStore";
import { MaintenanceBanner } from "@/components/maintenance/MaintenanceBanner";
import { useIsMobileHydrated } from "@/lib/hooks/useIsMobile";
import MobileGlobalLayout from "@/components/mobile/MobileGlobalLayout";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar, NAV_ITEMS } from "@/components/app-sidebar";

const PAGE_TITLE_KEYS: Record<string, string> = {
  "/": "nav.commandCenter",
  "/leads": "nav.leadIntelligence",
  "/verification": "nav.verificationQueue",
  "/analytics": "nav.analytics",
  "/settings": "settings.botConfig",
  "/settings/knowledge-base": "settings.knowledgeBase",
  "/settings/commands": "settings.commands",
  "/settings/team": "settings.team",
  "/settings/sessions": "settings.sessions",
  "/admin/overview": "nav.superAdmin",
  "/admin/users": "nav.superAdmin",
  "/admin/maintenance": "nav.superAdmin",
  "/admin/system": "nav.superAdmin",
  "/admin/backup": "nav.superAdmin",
  "/admin/secrets": "nav.superAdmin",
  "/admin/google": "nav.superAdmin",
  "/docs": "nav.docs",
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();
  const fetchPublicConfig = useMaintenanceStore((s) => s.fetchPublicConfig);
  const t = useT();
  const { locale, setLocale } = useLocale();
  const isMobile = useIsMobileHydrated();

  // Route guard: redirect unauthenticated users to login
  useEffect(() => {
    if (isInitialized && !user) {
      router.replace("/login");
    }
  }, [isInitialized, user, router]);

  // Fetch public config (maintenance mode + feature flags) on mount
  useEffect(() => {
    void fetchPublicConfig();
  // Mount-only effect — deps intentionally omitted (fetch config once on layout mount)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleLocale = () =>
    setLocale(locale === "en" ? "ms" : ("en" as Locale));

  // Prevent flash of wrong layout during hydration
  if (isMobile === undefined) {
    return (
      <div className="flex items-center justify-center h-[100dvh] bg-void">
        <div className="w-6 h-6 border-2 border-crimson/30 border-t-crimson rounded-full animate-spin" />
      </div>
    );
  }

  // ── Mobile layout — global shell wraps all pages ──
  if (isMobile) {
    return <MobileGlobalLayout>{children}</MobileGlobalLayout>;
  }

  return (
    <SidebarProvider>
      {/* Outer flex-col: banner on top, then sidebar+content row */}
      <div className="flex flex-col bg-void h-[100dvh] w-full overflow-hidden">
        {/* Full-width maintenance banner — outside overflow-hidden row, above sidebar */}
        <MaintenanceBanner />
        {/* Sidebar + content row */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <AppSidebar />
          <SidebarInset className="bg-void border-none shadow-none z-10 flex-1 flex flex-col min-w-0 overflow-hidden rounded-xl transition-all duration-300">
            {/* Topbar */}
            <header className="h-14 backdrop-blur-xl bg-transparent rounded-xl flex items-center justify-between px-4 md:px-5 flex-shrink-0 z-30">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="-ml-2 text-text-secondary hover:text-text-primary" />
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-live/10 border border-live/15">
                  <span className="live-dot !w-1.5 !h-1.5" />
                  <span className="text-[10px] font-sans font-semibold text-live tracking-widest">
                    {t("common.live")}
                  </span>
                </div>
                <button
                  aria-label="Notifications"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-elevated transition-colors relative cursor-pointer"
                >
                  <Bell size={16} weight="regular" />
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-crimson rounded-full" />
                </button>
                <button
                  onClick={toggleLocale}
                  aria-label="Switch language"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-semibold text-text-secondary hover:text-text-primary hover:bg-elevated transition-colors cursor-pointer border border-border-subtle"
                >
                  {locale.toUpperCase()}
                </button>
                <ThemeToggle />
              </div>
            </header>

            {/* Content */}
            <main
              id="dashboard-main"
              className="flex-1 overflow-y-auto bg-void pb-[88px] md:pb-0"
            >
              <div className="p-4 md:p-5 max-w-[1440px] mx-auto">{children}</div>
            </main>

            {/* ── Mobile Bottom Nav — iOS UITabBar style ── */}
            <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 backdrop-blur-xl bg-base/80 border-t border-border-subtle safe-area-bottom">
              <div className="flex items-stretch justify-around h-[72px]">
                {NAV_ITEMS.map(({ href, icon: Icon, labelKey }) => {
                  const label = t(labelKey);
                  const isActive =
                    href === "/" ? pathname === "/" : pathname.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      className="flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-all duration-200 cursor-pointer"
                      aria-label={label}
                    >
                      <div
                        className={`flex items-center justify-center rounded-xl px-3 py-1 transition-all duration-200 ${isActive ? "bg-crimson/15" : ""}`}
                      >
                        <Icon
                          size={22}
                          weight={isActive ? "fill" : "light"}
                          className={`transition-colors duration-200 ${isActive ? "text-crimson" : "text-text-muted"}`}
                        />
                      </div>
                      <span
                        className={`text-[10px] font-medium leading-none transition-colors duration-200 ${isActive ? "text-crimson" : "text-text-muted"}`}
                      >
                        {label.split(" ")[0]}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </nav>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}

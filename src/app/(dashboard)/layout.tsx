"use client";

import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useT, useLocale } from "@/i18n";
import type { Locale } from "@/i18n";
import { useAuthStore } from "@/store/authStore";
import { useMaintenanceStore } from "@/store/maintenanceStore";
import { MaintenanceBanner } from "@/components/maintenance/MaintenanceBanner";
import MobileGlobalLayout from "@/components/mobile/MobileGlobalLayout";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
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
  const maintenanceMode = useMaintenanceStore((s) => s.maintenanceMode);
  const t = useT();
  const { locale, setLocale } = useLocale();
  const toggleLocale = () =>
    setLocale(locale === "en" ? "ms" : ("en" as Locale));

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

  // ── Both layouts are always rendered; CSS media queries handle visibility ──
  // Using md:hidden / hidden md:block means no JS is needed to prevent flash.

  return (
    <>
      {/* Mobile layout - always rendered but hidden on desktop */}
      <div className="md:hidden">
        <MobileGlobalLayout>{children}</MobileGlobalLayout>
      </div>

      {/* Desktop layout - always rendered but hidden on mobile */}
      <div className="hidden md:block">
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
                    <div
                      className={cn(
                        "hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-colors",
                        maintenanceMode
                          ? "bg-warning/10 border-warning/15"
                          : "bg-live/10 border-live/15",
                      )}
                    >
                      <span
                        className={cn(
                          "live-dot !w-1.5 !h-1.5",
                          maintenanceMode && "bg-warning animate-pulse",
                        )}
                      />
                      <span
                        className={cn(
                          "text-[10px] font-sans font-semibold tracking-widest",
                          maintenanceMode ? "text-warning" : "text-live",
                        )}
                      >
                        {maintenanceMode
                          ? t("common.maintenance")
                          : t("common.live")}
                      </span>
                    </div>
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
                  className="flex-1 overflow-y-auto pb-[88px] md:pb-0"
                >
                  <div className="p-4 md:p-5 max-w-[1440px] mx-auto">
                    {children}
                  </div>
                </main>
              </SidebarInset>
            </div>
          </div>
        </SidebarProvider>
      </div>
    </>
  );
}

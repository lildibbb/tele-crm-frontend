"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { useT, useLocale } from "@/i18n";
import type { Locale } from "@/i18n";
import { useAuthStore } from "@/store/authStore";
import { useMaintenanceConfig } from "@/queries/useMaintenanceQuery";
import { MaintenanceBanner } from "@/components/maintenance/MaintenanceBanner";
import MobileGlobalLayout from "@/components/mobile/MobileGlobalLayout";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { AppSidebar, NAV_ITEMS } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";

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
  const { data: maintenanceConfig } = useMaintenanceConfig();
  const maintenanceMode = maintenanceConfig?.maintenanceMode ?? false;
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

  // Resolve page title from exact path first, then prefix match
  const pageTitle =
    PAGE_TITLE_KEYS[pathname] ??
    NAV_ITEMS.find(
      (item) => item.href !== "/" && pathname.startsWith(item.href + "/"),
    )?.labelKey ??
    "nav.commandCenter";

  return (
    <>
      {/* Mobile layout — hidden on desktop */}
      <div className="md:hidden">
        <MobileGlobalLayout>{children}</MobileGlobalLayout>
      </div>

      {/* Desktop layout — hidden on mobile */}
      <div className="hidden md:flex md:flex-col h-svh">
        {/* Full-width maintenance banner sits above the entire dashboard */}
        <MaintenanceBanner />

        <SidebarProvider
          style={
            {
              "--sidebar-width": "16rem",
              "--sidebar-width-icon": "3rem",
              "--header-height": "calc(var(--spacing) * 14)",
            } as React.CSSProperties
          }
        >
          <AppSidebar />

          <SidebarInset>
            {/* ── Header ──────────────────────────────────────── */}
            <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b border-border-subtle transition-[width,height] ease-linear">
              <div className="flex w-full items-center gap-1 px-4 py-3 lg:gap-2 lg:px-6">
                <SidebarTrigger className="-ml-1" />
                <Separator
                  orientation="vertical"
                  className="mx-2 data-[orientation=vertical]:h-4"
                />

                <span className="text-sm font-medium text-text-primary truncate">
                  {t(pageTitle)}
                </span>

                <div className="ml-auto flex items-center gap-2">
                  {/* Live / Maintenance status pill */}
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

                  {/* Locale toggle */}
                  <button
                    onClick={toggleLocale}
                    aria-label="Switch language"
                    className="flex items-center justify-center gap-1 w-8 h-8 rounded-md text-xs font-mono font-semibold text-text-secondary hover:text-text-primary hover:bg-elevated transition-colors cursor-pointer border border-border-subtle"
                  >
                    {locale.toUpperCase()}
                  </button>

                  <ThemeToggle />
                </div>
              </div>
            </header>

            {/* ── Main content ────────────────────────────────── */}
            <main
              id="dashboard-main"
              className="flex-1 overflow-y-auto pb-[88px] md:pb-0"
            >
              <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
                  {children}
                </div>
              </div>
            </main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </>
  );
}

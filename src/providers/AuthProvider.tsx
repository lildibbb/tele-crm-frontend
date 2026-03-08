"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/login",
  "/forgot-password",
  "/reset-password",
  "/setup-account",
  "/register",
  "/deposit",
  "/status",
  "/docs-public",
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { initAuth, skipAuthCheck, isInitialized, isLoading, user } = useAuthStore();

  // Check if current route is public
  const isPublicRoute = useMemo(() => {
    return PUBLIC_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(route + "/"),
    );
  }, [pathname]);

  useEffect(() => {
    // Allow auth initialization even on public routes, except for purely "guest-only" routes
    // This ensures `/docs-public` can recognize the logged-in user's role.
    const isGuestOnlyRoute = [
      "/login",
      "/register",
      "/forgot-password",
      "/reset-password",
    ].some((route) => pathname === route || pathname.startsWith(route + "/"));

    if (isGuestOnlyRoute) {
      skipAuthCheck();
      return;
    }

    initAuth();
    // Mount-only effect — deps intentionally omitted
    // initAuth and skipAuthCheck are stable store functions; re-running on pathname
    // change is handled by the isPublicRoute check above
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Handle redirect to login when on protected routes
  useEffect(() => {
    if (!isInitialized || isPublicRoute) {
      return;
    }

    if (!user) {
      router.replace("/login");
    }
  }, [isInitialized, isPublicRoute, user, router]);

  if (!isInitialized) {
    return (
      <div className="min-h-svh bg-void flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-text-muted" />
      </div>
    );
  }

  return <>{children}</>;
}

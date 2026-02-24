"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/login", "/forgot-password", "/reset-password", "/setup-account"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { initAuth, skipAuthCheck, isInitialized, isLoading } = useAuthStore();

  // Check if current route is public
  const isPublicRoute = useMemo(() => {
    return PUBLIC_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    );
  }, [pathname]);

  useEffect(() => {
    // Skip authentication initialization on public routes
    if (isPublicRoute) {
      // Mark as initialized so the app doesn't get stuck in loading state
      skipAuthCheck();
      return;
    }
    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Handle redirect to login when on protected routes
  useEffect(() => {
    if (!isInitialized || isPublicRoute) {
      return;
    }
    
    // If not authenticated and trying to access protected route, redirect to login
    // Note: This handles cases where the user has no valid session
  }, [isInitialized, isPublicRoute, pathname]);

  if (!isInitialized) {
    return (
      <div className="min-h-svh bg-void flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-text-muted" />
      </div>
    );
  }

  return <>{children}</>;
}

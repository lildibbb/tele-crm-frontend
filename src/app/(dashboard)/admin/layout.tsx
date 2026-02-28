"use client";

import { ReactNode } from "react";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/types/enums";
import { ForbiddenView } from "@/components/ui/forbidden-view";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isInitialized } = useAuthStore();

  // Still initializing — show nothing (dashboard layout handles the loading spinner)
  if (!isInitialized) return null;

  // Not authenticated — dashboard layout will redirect to /login
  if (!user) return null;

  // Authenticated but insufficient role — show forbidden UI
  if (user.role !== UserRole.SUPERADMIN) {
    return <ForbiddenView requiredRole="SUPERADMIN" />;
  }

  return <>{children}</>;
}


"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/types/enums";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user && user.role !== UserRole.SUPERADMIN) {
      router.replace("/");
    }
  }, [user, router]);

  if (!user || user.role !== UserRole.SUPERADMIN) return null;

  return <>{children}</>;
}


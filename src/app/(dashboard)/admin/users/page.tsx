"use client";
import { UsersPanel } from "@/components/superadmin/users-panel";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { MobileAdminUsers } from "@/components/mobile";
export default function AdminUsersPage() {
  const isMobile = useIsMobile();
  if (isMobile) return <MobileAdminUsers />;
  return <UsersPanel />;
}

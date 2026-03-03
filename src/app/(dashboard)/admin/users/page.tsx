"use client";
import { UsersPanel } from "@/components/superadmin/users-panel";
import { useT, K } from "@/i18n";
export default function AdminUsersPage() {
  const t = useT();
  return <UsersPanel />;
}

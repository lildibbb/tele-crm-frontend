"use client";

import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  SquaresFour,
  Users,
  Warning,
  Sliders,
  HardDrives,
  LockKey,
  ShieldStar,
} from "@phosphor-icons/react";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/types/enums";

const NAV_ITEMS = [
  { href: "/admin/overview",    icon: SquaresFour, label: "Overview" },
  { href: "/admin/users",       icon: Users,       label: "Users" },
  { href: "/admin/maintenance", icon: Warning,     label: "Maintenance" },
  { href: "/admin/system",      icon: Sliders,     label: "System Config" },
  { href: "/admin/backup",      icon: HardDrives,  label: "Backup" },
  { href: "/admin/secrets",     icon: LockKey,     label: "Secrets" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user && user.role !== UserRole.SUPERADMIN) {
      router.replace("/");
    }
  }, [user, router]);

  if (!user || user.role !== UserRole.SUPERADMIN) return null;

  return (
    <div className="flex gap-5 min-h-0 items-start">
      {/* ── Sidebar ── */}
      <aside className="w-52 shrink-0 sticky top-0 self-start">
        <div className="flex items-center gap-2 px-3 py-3 mb-2">
          <div className="rounded-lg p-1 bg-crimson/10">
            <ShieldStar size={16} weight="duotone" className="text-crimson" />
          </div>
          <span className="text-sm font-bold text-text-primary">Superadmin</span>
        </div>
        <nav className="space-y-0.5">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-crimson/10 text-crimson font-medium"
                    : "text-text-secondary hover:text-text-primary hover:bg-elevated"
                }`}
              >
                <Icon size={16} weight={isActive ? "fill" : "light"} />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* ── Content ── */}
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}

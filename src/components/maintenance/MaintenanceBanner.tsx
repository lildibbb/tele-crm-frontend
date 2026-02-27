'use client';

import { useEffect, useState } from 'react';
import { Warning, CheckCircle, X } from '@phosphor-icons/react';
import { useMaintenanceStore } from '@/store/maintenanceStore';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@/types/enums';

const SESSION_KEY = 'titan-crm-maintenance-dismissed';

export function MaintenanceBanner() {
  const maintenanceMode = useMaintenanceStore((s) => s.maintenanceMode);
  const banner = useMaintenanceStore((s) => s.maintenanceBanner);
  const user = useAuthStore((s) => s.user);
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Avoid SSR/hydration mismatch — only read sessionStorage on client
  useEffect(() => {
    setMounted(true);
    setDismissed(sessionStorage.getItem(SESSION_KEY) === 'true');
  }, []);

  if (!mounted || !maintenanceMode || dismissed) return null;

  const isSuperAdmin = user?.role === UserRole.SUPERADMIN;

  const handleDismiss = () => {
    sessionStorage.setItem(SESSION_KEY, 'true');
    setDismissed(true);
  };

  return (
    <div
      className="w-full flex items-center gap-3 border-b border-amber-500/40 bg-amber-950/50 px-5 py-2.5 text-sm backdrop-blur-md z-[9999] shrink-0"
      role="alert"
      aria-live="polite"
    >
      <Warning weight="fill" className="h-4 w-4 shrink-0 text-amber-400" />
      <span className="flex-1 text-amber-200 text-xs leading-snug">
        <span className="font-semibold">Maintenance Mode — </span>
        {banner}
      </span>
      {isSuperAdmin && (
        <span className="hidden sm:flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-2 py-0.5 text-xs font-medium text-emerald-400 shrink-0">
          <CheckCircle weight="fill" className="h-3 w-3" />
          Full access
        </span>
      )}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss maintenance banner"
        className="ml-1 rounded p-0.5 text-amber-400/60 transition-colors hover:bg-amber-800/40 hover:text-amber-300 shrink-0"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

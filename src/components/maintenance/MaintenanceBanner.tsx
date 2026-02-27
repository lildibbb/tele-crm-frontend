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

  // Check sessionStorage on mount (re-shows on new tab)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDismissed(sessionStorage.getItem(SESSION_KEY) === 'true');
    }
  }, []);

  if (!maintenanceMode || dismissed) return null;

  const isSuperAdmin = user?.role === UserRole.SUPERADMIN;

  const handleDismiss = () => {
    sessionStorage.setItem(SESSION_KEY, 'true');
    setDismissed(true);
  };

  return (
    <div className="relative flex items-center gap-3 border-b border-amber-500/30 bg-amber-950/30 px-4 py-2.5 text-sm backdrop-blur-sm dark:bg-amber-900/20">
      <Warning
        weight="fill"
        className="h-4 w-4 shrink-0 text-amber-400"
      />
      <span className="flex-1 text-amber-200">
        <span className="font-medium">Maintenance Mode — </span>
        {banner}
      </span>
      {isSuperAdmin && (
        <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-2 py-0.5 text-xs font-medium text-emerald-400">
          <CheckCircle weight="fill" className="h-3 w-3" />
          You have full access
        </span>
      )}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss maintenance banner"
        className="ml-1 rounded p-0.5 text-amber-400/70 transition-colors hover:bg-amber-800/40 hover:text-amber-300"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

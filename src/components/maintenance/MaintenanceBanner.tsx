'use client';

import { useEffect, useState } from 'react';
import { Warning, CheckCircle, X, Wrench } from '@phosphor-icons/react';
import { useMaintenanceConfig } from '@/queries/useMaintenanceQuery';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@/types/enums';

const SESSION_KEY = 'titan-crm-maintenance-dismissed';

export function MaintenanceBanner() {
  const { data: maintenanceConfig } = useMaintenanceConfig();
  const maintenanceMode = maintenanceConfig?.maintenanceMode ?? false;
  const banner = maintenanceConfig?.maintenanceBanner ?? '';
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
  const tickerText = banner || 'System under maintenance — read-only mode active.';
  // Duplicate for seamless infinite marquee loop
  const repeated = `${tickerText}   ✦   ${tickerText}   ✦   ${tickerText}   ✦   ${tickerText}   ✦   `;

  const handleDismiss = () => {
    sessionStorage.setItem(SESSION_KEY, 'true');
    setDismissed(true);
  };

  return (
    <div
      className="relative w-full flex items-center overflow-hidden border-b border-amber-500/30 z-[9999] shrink-0"
      style={{
        background:
          'linear-gradient(90deg, rgba(120,50,0,0.82) 0%, rgba(146,64,14,0.78) 45%, rgba(120,53,0,0.82) 100%)',
        backdropFilter: 'blur(12px)',
        height: 34,
      }}
      role="alert"
      aria-live="polite"
    >
      {/* Left badge — always visible */}
      <div className="flex items-center gap-1.5 pl-3 pr-3 shrink-0 border-r border-amber-500/30 h-full">
        <Wrench weight="fill" className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
        <span className="text-[10px] font-bold font-mono tracking-widest text-amber-200 uppercase whitespace-nowrap">
          Maintenance
        </span>
      </div>

      {/* Marquee ticker — fills remaining space */}
      <div className="flex-1 overflow-hidden min-w-0">
        <span className="marquee-ticker text-[11px] text-amber-100/90 font-sans">
          {repeated}
        </span>
      </div>

      {/* Right badges */}
      <div className="flex items-center gap-2 pl-3 pr-2 shrink-0 border-l border-amber-500/30 h-full">
        {isSuperAdmin && (
          <span className="hidden sm:flex items-center gap-1 rounded-full border border-emerald-500/35 bg-emerald-950/50 px-2 py-0.5 text-[10px] font-medium text-emerald-400 whitespace-nowrap">
            <CheckCircle weight="fill" className="h-3 w-3" />
            Full access
          </span>
        )}
        <button
          onClick={handleDismiss}
          aria-label="Dismiss maintenance banner"
          className="rounded p-0.5 text-amber-400/60 transition-colors hover:bg-amber-800/40 hover:text-amber-300"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}


"use client";
import { MaintenancePanel } from "@/components/superadmin/maintenance-panel";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useT, K } from "@/i18n";

export default function AdminMaintenancePage() {
  const isMobile = useIsMobile();
  const t = useT();

  if (isMobile) {
    return (
      <div className="p-4 space-y-5">
        <div className="flex flex-col gap-1 px-1">
          <h1 className="text-xl font-bold text-text-primary tracking-tight">
            {t(K.superadmin.maintenance.title)}
          </h1>
          <p className="text-xs text-text-secondary">
            {t(K.superadmin.maintenance.subtitle)}
          </p>
        </div>
        <MaintenancePanel />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-1">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          {t(K.superadmin.maintenance.title)}
        </h1>
        <p className="text-sm text-text-secondary">
          {t(K.superadmin.maintenance.subtitle)}
        </p>
      </div>
      <MaintenancePanel />
    </div>
  );
}

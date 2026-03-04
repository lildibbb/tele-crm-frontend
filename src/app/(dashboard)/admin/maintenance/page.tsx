"use client";
import { MaintenancePanel } from "@/components/superadmin/maintenance-panel";
import { MobileAdminMaintenance } from "@/components/mobile";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useT, K } from "@/i18n";

export default function AdminMaintenancePage() {
  const isMobile = useIsMobile();
  const t = useT();

  if (isMobile) {
    return <MobileAdminMaintenance />;
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

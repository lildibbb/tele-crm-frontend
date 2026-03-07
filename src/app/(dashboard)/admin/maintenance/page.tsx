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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          {t(K.superadmin.maintenance.title)}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {t(K.superadmin.maintenance.subtitle)}
        </p>
      </div>
      <MaintenancePanel />
    </div>
  );
}

"use client";
import { MaintenancePanel } from "@/components/superadmin/maintenance-panel";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

export default function AdminMaintenancePage() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="px-4 py-4">
        <MaintenancePanel />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Maintenance</h1>
        <p className="text-sm text-text-secondary mt-1">Maintenance mode and feature flags</p>
      </div>
      <MaintenancePanel />
    </div>
  );
}

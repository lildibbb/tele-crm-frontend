"use client";
import { MaintenancePanel } from "@/components/superadmin/maintenance-panel";
export default function AdminMaintenancePage() {
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

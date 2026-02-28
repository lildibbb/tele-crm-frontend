"use client";
import { SystemConfigPanel } from "@/components/superadmin/system-config-panel";
export default function AdminSystemPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">System Configuration</h1>
        <p className="text-sm text-text-secondary mt-1">Platform-wide configuration keys</p>
      </div>
      <SystemConfigPanel />
    </div>
  );
}

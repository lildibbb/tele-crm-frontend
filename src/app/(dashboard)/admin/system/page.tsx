"use client";
import { SystemConfigPanel } from "@/components/superadmin/system-config-panel";
import { useT, K } from "@/i18n";
export default function AdminSystemPage() {
  const t = useT();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{t(K.superadmin.system.title)}</h1>
        <p className="text-sm text-text-secondary mt-1">{t(K.superadmin.system.subtitle)}</p>
      </div>
      <SystemConfigPanel />
    </div>
  );
}

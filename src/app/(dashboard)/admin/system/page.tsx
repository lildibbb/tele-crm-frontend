"use client";
import { SystemConfigPanel } from "@/components/superadmin/system-config-panel";
import { MobileAdminSystem } from "@/components/mobile";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useT, K } from "@/i18n";

export default function AdminSystemPage() {
  const isMobile = useIsMobile();
  const t = useT();

  if (isMobile) {
    return <MobileAdminSystem />;
  }

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

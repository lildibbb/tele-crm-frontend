"use client";
import { SecretsPanel } from "@/components/superadmin/secrets-panel";
import { MobileAdminSecrets } from "@/components/mobile";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useT, K } from "@/i18n";

export default function AdminSecretsPage() {
  const isMobile = useIsMobile();
  const t = useT();

  if (isMobile) {
    return <MobileAdminSecrets />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{t(K.superadmin.secrets.title)}</h1>
        <p className="text-sm text-text-secondary mt-1">{t(K.superadmin.secrets.subtitle)}</p>
      </div>
      <SecretsPanel />
    </div>
  );
}

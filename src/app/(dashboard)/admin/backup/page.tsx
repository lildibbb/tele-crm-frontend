"use client";
import { BackupPanel } from "@/components/superadmin/backup-panel";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useT, K } from "@/i18n";

export default function AdminBackupPage() {
  const isMobile = useIsMobile();
  const t = useT();

  if (isMobile) {
    return (
      <div className="px-4 py-4">
        <BackupPanel />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{t(K.superadmin.backup.title)}</h1>
        <p className="text-sm text-text-secondary mt-1">{t(K.superadmin.backup.subtitle)}</p>
      </div>
      <BackupPanel />
    </div>
  );
}

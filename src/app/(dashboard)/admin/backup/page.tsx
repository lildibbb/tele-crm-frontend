"use client";
import { BackupPanel } from "@/components/superadmin/backup-panel";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

export default function AdminBackupPage() {
  const isMobile = useIsMobile();

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
        <h1 className="text-2xl font-bold text-text-primary">Database Backup</h1>
        <p className="text-sm text-text-secondary mt-1">Scheduled backups, manual triggers, and history</p>
      </div>
      <BackupPanel />
    </div>
  );
}

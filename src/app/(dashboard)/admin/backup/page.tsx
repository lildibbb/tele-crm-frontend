"use client";
import { BackupPanel } from "@/components/superadmin/backup-panel";
export default function AdminBackupPage() {
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

"use client";
import { SecretsPanel } from "@/components/superadmin/secrets-panel";
export default function AdminSecretsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Encrypted Secrets</h1>
        <p className="text-sm text-text-secondary mt-1">AES-256-GCM credentials for integrations</p>
      </div>
      <SecretsPanel />
    </div>
  );
}

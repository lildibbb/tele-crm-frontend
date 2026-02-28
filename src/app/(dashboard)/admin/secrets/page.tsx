"use client";
import { SecretsPanel } from "@/components/superadmin/secrets-panel";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useRouter } from "next/navigation";
import { CaretLeft, LockKey } from "@phosphor-icons/react";

export default function AdminSecretsPage() {
  const isMobile = useIsMobile();
  const router = useRouter();

  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen bg-void text-text-primary font-sans">
        <div className="pt-[env(safe-area-inset-top)]" />
        <header className="flex items-center h-[52px] px-4 bg-base border-b border-border-subtle sticky top-0 z-10">
          <button onClick={() => router.back()} className="min-w-[44px] min-h-[44px] flex items-center justify-center text-crimson">
            <CaretLeft size={22} weight="bold" />
          </button>
          <span className="flex-1 text-center font-sans font-semibold text-[17px] text-text-primary">Secrets</span>
          <div className="min-w-[44px] flex items-center justify-center">
            <LockKey size={20} className="text-crimson" weight="fill" />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 pb-[calc(32px+env(safe-area-inset-bottom))]">
          <SecretsPanel />
        </main>
      </div>
    );
  }

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

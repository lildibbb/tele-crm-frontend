"use client";

import { ArrowLeft } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { AiFeedbackPanel } from "@/app/(dashboard)/settings/_components/ai-feedback-tab";

export default function MobileAdminAiFeedback() {
  const router = useRouter();
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 bg-elevated border-b border-border-subtle">
        <button onClick={() => router.back()} className="p-1">
          <ArrowLeft size={20} className="text-text-primary" />
        </button>
        <div>
          <h1 className="text-sm font-semibold text-text-primary">AI Feedback</h1>
          <p className="text-xs text-text-secondary">Review conversation feedback</p>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-4">
        <AiFeedbackPanel />
      </main>
    </div>
  );
}

"use client";

import { AiFeedbackPanel } from "@/app/(dashboard)/settings/_components/ai-feedback-tab";

export default function AdminAiFeedbackPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">AI Feedback</h1>
        <p className="text-sm text-text-secondary mt-1">
          Review conversation feedback and promote examples for model fine-tuning.
        </p>
      </div>
      <AiFeedbackPanel />
    </div>
  );
}

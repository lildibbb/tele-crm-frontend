"use client";

import { useEffect } from "react";
import { Warning, ArrowCounterClockwise } from "@phosphor-icons/react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="ios-icon bg-danger/12 mb-5 w-16 h-16 rounded-[20px]">
        <Warning size={32} weight="duotone" className="text-danger" />
      </div>
      <h2 className="font-display font-bold text-xl text-text-primary mb-2">
        Something went wrong
      </h2>
      <p className="text-text-secondary text-sm font-sans max-w-sm mb-6">
        {error.message ?? "An unexpected error occurred. Please try again."}
      </p>
      <button
        onClick={reset}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-crimson text-white text-sm font-semibold hover:bg-crimson-hover transition-colors cursor-pointer"
      >
        <ArrowCounterClockwise size={16} weight="bold" />
        Try again
      </button>
    </div>
  );
}

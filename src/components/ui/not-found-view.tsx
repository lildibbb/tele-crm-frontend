"use client";

import { cn } from "@/lib/utils";
import { MagnifyingGlass, ArrowLeft, House } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

interface NotFoundViewProps {
  /** What entity wasn't found, e.g. "lead", "record" */
  entity?: string;
  className?: string;
}

export function NotFoundView({ entity = "page", className }: NotFoundViewProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-[60vh] px-6 text-center",
        className
      )}
    >
      {/* Icon */}
      <div className="w-16 h-16 rounded-[20px] bg-card border border-border-subtle flex items-center justify-center mb-5">
        <MagnifyingGlass size={28} weight="duotone" className="text-text-muted" />
      </div>

      {/* Code badge */}
      <span className="inline-block px-3 py-1 rounded-full bg-elevated border border-border-subtle font-mono text-[10px] text-text-muted tracking-widest uppercase mb-4">
        Error 404
      </span>

      {/* Heading */}
      <h2 className="font-display font-bold text-[22px] text-text-primary leading-tight mb-2">
        {entity.charAt(0).toUpperCase() + entity.slice(1)} not found
      </h2>

      <p className="font-sans text-[13px] text-text-secondary max-w-[300px] leading-relaxed mb-6">
        The {entity} you&apos;re looking for doesn&apos;t exist or may have been deleted.
      </p>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-elevated hover:bg-card border border-border-subtle text-text-secondary text-[13px] font-semibold transition-colors"
        >
          <House size={14} weight="bold" />
          Dashboard
        </Link>
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card hover:bg-elevated border border-border-subtle text-text-secondary text-[13px] font-semibold transition-colors"
        >
          <ArrowLeft size={14} weight="bold" />
          Go back
        </button>
      </div>
    </div>
  );
}

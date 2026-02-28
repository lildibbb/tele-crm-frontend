"use client";

import { cn } from "@/lib/utils";
import { LockKey, ArrowLeft, House } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

interface ForbiddenViewProps {
  /** The role(s) required to access this section */
  requiredRole?: string | string[];
  className?: string;
}

export function ForbiddenView({ requiredRole, className }: ForbiddenViewProps) {
  const roles = requiredRole
    ? Array.isArray(requiredRole)
      ? requiredRole
      : [requiredRole]
    : null;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-[60vh] px-6 text-center",
        className
      )}
    >
      {/* Icon */}
      <div className="w-16 h-16 rounded-[20px] bg-card border border-border-subtle flex items-center justify-center mb-5 shadow-[0_0_40px_rgba(196,35,45,0.12)]">
        <LockKey size={30} weight="duotone" className="text-crimson" />
      </div>

      {/* Code badge */}
      <span className="inline-block px-3 py-1 rounded-full bg-crimson/10 border border-crimson/20 font-mono text-[10px] text-crimson tracking-widest uppercase mb-4">
        Access Denied · 403
      </span>

      {/* Heading */}
      <h2 className="font-display font-bold text-[22px] text-text-primary leading-tight mb-2">
        Restricted area
      </h2>

      <p className="font-sans text-[13px] text-text-secondary max-w-[320px] leading-relaxed mb-5">
        You don&apos;t have permission to view this page. Contact your administrator if
        you believe this is a mistake.
      </p>

      {/* Required role pills */}
      {roles && (
        <div className="flex flex-wrap gap-1.5 justify-center mb-6">
          <span className="font-sans text-[11px] text-text-muted">Requires:</span>
          {roles.map((r) => (
            <span
              key={r}
              className="px-2.5 py-0.5 rounded-full bg-elevated border border-border-default font-mono text-[10px] text-text-secondary"
            >
              {r}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-crimson hover:bg-crimson-hover text-white text-[13px] font-semibold transition-colors"
        >
          <House size={14} weight="bold" />
          Dashboard
        </Link>
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-elevated hover:bg-card border border-border-subtle text-text-secondary text-[13px] font-semibold transition-colors"
        >
          <ArrowLeft size={14} weight="bold" />
          Go back
        </button>
      </div>
    </div>
  );
}

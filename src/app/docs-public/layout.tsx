import type { Metadata } from "next";
import Link from "next/link";
import { Books, ArrowSquareOut } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Documentation | Titan Journal CRM",
  description: "Complete feature guide for Titan Journal CRM — roles, workflows, and all features.",
};

/**
 * Standalone docs layout for the docs.* subdomain.
 *
 * Replicates the dashboard's flex-col structure (h-14 header + overflow-y-auto main)
 * so DocsClient's -m-4/-m-5 escape and h-[calc(100dvh-3.5rem)] work unchanged.
 * No AppSidebar, no auth guard — this is a public documentation site.
 */
export default function DocsPublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "#";

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden bg-void">
      {/* ── Topbar — exactly h-14 (3.5rem) to match dashboard header ── */}
      <header className="h-14 flex-shrink-0 flex items-center justify-between px-5 border-b border-border-subtle bg-base/90 backdrop-blur-xl z-30">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-elevated border border-border-subtle flex items-center justify-center group-hover:border-border-default transition-colors">
            <Books size={15} weight="fill" className="text-text-secondary" />
          </div>
          <div>
            <p className="font-mono text-[9px] text-crimson uppercase tracking-widest leading-none mb-0.5">
              Titan Journal CRM
            </p>
            <p className="font-display font-bold text-[13px] text-text-primary leading-none">
              Documentation
            </p>
          </div>
        </Link>

        {/* Open App link */}
        {appUrl !== "#" && (
          <a
            href={appUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-elevated border border-border-subtle font-sans text-[12px] font-medium text-text-secondary hover:text-text-primary hover:border-border-default transition-colors"
          >
            <ArrowSquareOut size={13} weight="bold" />
            Open App
          </a>
        )}
      </header>

      {/*
       * Content area — mirrors the dashboard's:
       *   <main id="dashboard-main" className="flex-1 overflow-y-auto">
       *     <div className="p-4 md:p-5 max-w-[1440px] mx-auto">
       * DocsClient uses -m-4/-m-5 to escape this padding and fill the area.
       */}
      <main className="flex-1 overflow-y-auto" id="dashboard-main">
        <div className="p-4 md:p-5 max-w-[1440px] mx-auto">{children}</div>
      </main>
    </div>
  );
}

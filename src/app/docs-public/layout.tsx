import type { Metadata } from "next";
import { Books } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Documentation | Titan Journal CRM",
  description:
    "Complete feature guide for Titan Journal CRM — roles, workflows, and all features.",
};

/**
 * Standalone docs layout for the docs.* subdomain.
 *
 * Mirrors the dashboard's flex-col structure (h-14 header + overflow-hidden main)
 * No padding wrapper — DocsClient fills the content area directly.
 */
export default function DocsPublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden bg-void">
      {/* ── Topbar — exactly h-14 (3.5rem) to match dashboard header ── */}
      <header className="h-14 flex-shrink-0 flex items-center justify-between px-5 border-b border-border-subtle bg-base/90 backdrop-blur-xl z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-elevated border border-border-subtle flex items-center justify-center">
            <Books size={14} weight="fill" className="text-text-secondary" />
          </div>
          <div>
            <p className="font-mono text-[9px] text-crimson uppercase tracking-widest leading-none mb-0.5">
              Titan Journal CRM
            </p>
            <p className="font-display font-semibold text-sm text-text-primary leading-none">
              Documentation
            </p>
          </div>
        </div>
      </header>

      {/* Content area — no padding, DocsClient manages its own layout */}
      <main className="flex-1 overflow-hidden" id="dashboard-main">
        {children}
      </main>
    </div>
  );
}

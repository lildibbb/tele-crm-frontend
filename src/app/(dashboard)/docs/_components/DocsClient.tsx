"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/types/enums";
import { cn } from "@/lib/utils";
import {
  MagnifyingGlass,
  X,
  CaretLeft,
  CaretRight,
  Lock,
  Books,
  List,
} from "@phosphor-icons/react";
import {
  CHAPTERS,
  CHAPTER_BODY_MAP,
  ChapterHeader,
  AccessBadge,
  getIsRestricted,
} from "./chapterBodies";

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export function DocsClient() {
  const { user } = useAuthStore();
  const role = user?.role as UserRole | undefined;

  const [activeChapterId, setActiveChapterId] = useState<string>(CHAPTERS[0].id);
  const [search, setSearch] = useState("");
  const [navOpen, setNavOpen] = useState(false); // for md breakpoint overlay nav
  const contentRef = useRef<HTMLDivElement>(null);

  const activeChapter = CHAPTERS.find((c) => c.id === activeChapterId) ?? CHAPTERS[0];
  const activeIndex   = CHAPTERS.indexOf(activeChapter);
  const prevChapter   = activeIndex > 0 ? CHAPTERS[activeIndex - 1] : undefined;
  const nextChapter   = activeIndex < CHAPTERS.length - 1 ? CHAPTERS[activeIndex + 1] : undefined;
  const BodyComponent = CHAPTER_BODY_MAP[activeChapterId];

  const filteredChapters = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return CHAPTERS;
    return CHAPTERS.filter(
      (ch) =>
        ch.title.toLowerCase().includes(q) ||
        ch.summary.toLowerCase().includes(q) ||
        ch.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [search]);

  // Scroll content to top when chapter changes
  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [activeChapterId]);

  function navigate(id: string) {
    setActiveChapterId(id);
    setNavOpen(false);
  }

  // ── Shared chapter nav list ──────────────────────────────────────────────
  const NavList = () => (
    <>
      {filteredChapters.map((ch) => {
        const Icon      = ch.icon;
        const isActive  = ch.id === activeChapterId;
        const restricted = getIsRestricted(ch.access, role);
        const globalIdx = CHAPTERS.indexOf(ch);
        return (
          <button
            key={ch.id}
            onClick={() => navigate(ch.id)}
            className={cn(
              "w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left transition-colors relative",
              isActive
                ? "bg-crimson/8 text-crimson"
                : "text-text-secondary hover:text-text-primary hover:bg-elevated/50",
              restricted && "opacity-40"
            )}
          >
            {/* Active indicator */}
            {isActive && (
              <span className="absolute left-0 inset-y-2 w-[3px] bg-crimson rounded-full" />
            )}
            <Icon
              size={15}
              weight={isActive ? "fill" : "regular"}
              className="shrink-0 mt-px"
            />
            <span className="flex-1 min-w-0">
              <span className="block font-mono text-[9px] text-text-muted leading-none mb-0.5">
                {String(globalIdx + 1).padStart(2, "0")}
              </span>
              <span
                className={cn(
                  "block font-sans text-[12.5px] leading-tight truncate",
                  isActive ? "font-semibold text-crimson" : "font-medium"
                )}
              >
                {ch.title}
              </span>
            </span>
            {restricted && (
              <Lock size={11} className="shrink-0 text-text-muted/50" weight="fill" />
            )}
          </button>
        );
      })}
      {filteredChapters.length === 0 && (
        <p className="px-4 py-8 text-[12px] text-text-muted text-center font-sans">
          No chapters match &ldquo;{search}&rdquo;
        </p>
      )}
    </>
  );

  return (
    /*
     * Full-bleed: escape the layout's p-4/p-5 wrapper so docs fills
     * the entire SidebarInset content area from edge to edge.
     * Height = viewport minus the h-14 topbar.
     */
    <div className="-m-4 md:-m-5 flex h-[calc(100dvh-3.5rem)] overflow-hidden">

      {/* ── Left chapter navigator ─────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-[220px] xl:w-[248px] shrink-0 border-r border-border-subtle bg-base/80 h-full overflow-hidden">
        {/* Brand header */}
        <div className="px-4 pt-5 pb-3.5 border-b border-border-subtle shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-elevated border border-border-subtle flex items-center justify-center">
              <Books size={14} weight="fill" className="text-text-secondary" />
            </div>
            <div>
              <p className="font-mono text-[9px] text-crimson uppercase tracking-widest leading-none mb-0.5">
                Titan Journal CRM
              </p>
              <p className="font-display font-bold text-[13px] text-text-primary leading-none">
                Documentation
              </p>
            </div>
          </div>
          <p className="mt-2.5 font-sans text-[11px] text-text-muted">
            {CHAPTERS.length} chapters · Full feature guide
          </p>
        </div>

        {/* Search */}
        <div className="px-3 py-2.5 border-b border-border-subtle shrink-0">
          <div className="relative">
            <MagnifyingGlass
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search chapters…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-8 pl-7 pr-7 rounded-lg bg-elevated border border-border-subtle font-sans text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-default transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted"
              >
                <X size={11} weight="bold" />
              </button>
            )}
          </div>
        </div>

        {/* Chapter list */}
        <nav className="flex-1 overflow-y-auto py-1.5 scrollbar-hide">
          <NavList />
        </nav>

        {/* Role badge */}
        {role && (
          <div className="shrink-0 px-3.5 py-3 border-t border-border-subtle">
            <p className="font-mono text-[9px] text-text-muted uppercase tracking-widest mb-1.5">
              Signed in as
            </p>
            <AccessBadge roles={[role]} />
          </div>
        )}
      </aside>

      {/* ── Mobile/tablet nav overlay (< lg) ───────────────────────────── */}
      {navOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setNavOpen(false)}
          />
          <aside className="relative z-10 flex flex-col w-72 max-w-[85vw] h-full bg-base border-r border-border-subtle">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-border-subtle">
              <p className="font-display font-bold text-[14px] text-text-primary">Chapters</p>
              <button onClick={() => setNavOpen(false)} className="text-text-muted">
                <X size={16} weight="bold" />
              </button>
            </div>
            <div className="px-3 py-2.5 border-b border-border-subtle">
              <div className="relative">
                <MagnifyingGlass size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-8 pl-7 pr-7 rounded-lg bg-elevated border border-border-subtle font-sans text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none transition-colors"
                />
              </div>
            </div>
            <nav className="flex-1 overflow-y-auto py-1.5">
              <NavList />
            </nav>
          </aside>
        </div>
      )}

      {/* ── Content area ──────────────────────────────────────────────────── */}
      <div ref={contentRef} className="flex-1 min-w-0 h-full overflow-y-auto">

        {/* Sticky content topbar (mobile nav trigger + breadcrumb) */}
        <div className="sticky top-0 z-20 flex items-center gap-3 px-5 md:px-8 h-12 bg-base/90 backdrop-blur-xl border-b border-border-subtle">
          {/* Mobile nav toggle */}
          <button
            onClick={() => setNavOpen(true)}
            className="lg:hidden flex items-center gap-1.5 text-text-secondary"
          >
            <List size={16} weight="bold" />
            <span className="font-sans text-[12px] font-medium">Chapters</span>
          </button>

          {/* Breadcrumb */}
          <div className="hidden lg:flex items-center gap-1.5 font-mono text-[11px] text-text-muted">
            <Books size={11} />
            <span>Docs</span>
            <span className="text-border-default">/</span>
            <span className="text-text-secondary truncate max-w-[240px]">
              {activeChapter.title}
            </span>
          </div>

          {/* Progress pill */}
          <div className="ml-auto flex items-center gap-2">
            <span className="font-mono text-[10px] text-text-muted">
              {String(activeIndex + 1).padStart(2, "0")} / {String(CHAPTERS.length).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* Chapter content */}
        <div className="px-5 md:px-10 xl:px-16 py-8 max-w-[860px]">
          <ChapterHeader chapterMeta={activeChapter} number={activeIndex + 1} role={role} />

          {BodyComponent && (
            <div className="mt-2">
              <BodyComponent role={role} />
            </div>
          )}

          {/* Prev / Next navigation */}
          <div className="flex gap-3 mt-14 pt-8 border-t border-border-subtle">
            {prevChapter ? (
              <button
                onClick={() => navigate(prevChapter.id)}
                className="flex-1 flex items-center gap-3 px-4 py-3.5 rounded-xl bg-card border border-border-subtle hover:border-border-default transition-colors text-left group"
              >
                <CaretLeft
                  size={16}
                  weight="bold"
                  className="text-text-muted shrink-0 group-hover:text-text-secondary transition-colors"
                />
                <div className="min-w-0">
                  <p className="font-mono text-[9px] text-text-muted uppercase tracking-widest mb-0.5">
                    Previous
                  </p>
                  <p className="font-sans text-[13px] font-semibold text-text-primary truncate">
                    {prevChapter.title}
                  </p>
                </div>
              </button>
            ) : (
              <div className="flex-1" />
            )}

            {nextChapter ? (
              <button
                onClick={() => navigate(nextChapter.id)}
                className="flex-1 flex items-center justify-end gap-3 px-4 py-3.5 rounded-xl bg-card border border-border-subtle hover:border-border-default transition-colors text-right group"
              >
                <div className="min-w-0">
                  <p className="font-mono text-[9px] text-text-muted uppercase tracking-widest mb-0.5">
                    Next
                  </p>
                  <p className="font-sans text-[13px] font-semibold text-text-primary truncate">
                    {nextChapter.title}
                  </p>
                </div>
                <CaretRight
                  size={16}
                  weight="bold"
                  className="text-text-muted shrink-0 group-hover:text-text-secondary transition-colors"
                />
              </button>
            ) : (
              <div className="flex-1" />
            )}
          </div>

          {/* Footer */}
          <footer className="mt-12 pb-16 text-center">
            <p className="font-mono text-[10px] text-text-muted/50">
              Titan Journal CRM &middot; Documentation &middot; {CHAPTERS.length} chapters
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}

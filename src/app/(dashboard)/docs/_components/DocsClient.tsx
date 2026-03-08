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
  const [navOpen, setNavOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Only show chapters accessible to the current user's role.
  // When role is undefined (public/unauthenticated), all chapters are visible.
  const visibleChapters = useMemo(
    () => CHAPTERS.filter((ch) => !getIsRestricted(ch.access, role)),
    [role],
  );

  const activeChapter =
    visibleChapters.find((c) => c.id === activeChapterId) ??
    visibleChapters[0] ??
    CHAPTERS[0];
  const activeIndex   = visibleChapters.indexOf(activeChapter);
  const prevChapter   = activeIndex > 0 ? visibleChapters[activeIndex - 1] : undefined;
  const nextChapter   = activeIndex < visibleChapters.length - 1 ? visibleChapters[activeIndex + 1] : undefined;
  const BodyComponent = CHAPTER_BODY_MAP[activeChapter.id];

  // Auto-navigate to first visible chapter if current becomes restricted
  useEffect(() => {
    const isCurrentVisible = visibleChapters.some((ch) => ch.id === activeChapterId);
    if (!isCurrentVisible && visibleChapters.length > 0) {
      setActiveChapterId(visibleChapters[0].id);
    }
  }, [visibleChapters, activeChapterId]);

  const filteredChapters = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return visibleChapters;
    return visibleChapters.filter(
      (ch) =>
        ch.title.toLowerCase().includes(q) ||
        ch.summary.toLowerCase().includes(q) ||
        ch.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [search, visibleChapters]);

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
        const Icon     = ch.icon;
        const isActive = ch.id === activeChapter.id;
        const globalIdx = CHAPTERS.indexOf(ch);
        return (
          <button
            key={ch.id}
            onClick={() => navigate(ch.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3.5 py-2.5 text-left transition-colors relative",
              isActive
                ? "bg-crimson/8 text-crimson"
                : "text-text-secondary hover:text-text-primary hover:bg-elevated/50",
            )}
          >
            {isActive && (
              <span className="absolute left-0 inset-y-2 w-[3px] bg-crimson rounded-full" />
            )}
            <Icon
              size={14}
              weight={isActive ? "fill" : "regular"}
              className="shrink-0 mt-px"
            />
            <span className="flex-1 min-w-0">
              <span className="block font-mono text-[9px] text-text-muted leading-none mb-0.5">
                {String(globalIdx + 1).padStart(2, "0")}
              </span>
              <span
                className={cn(
                  "block text-xs leading-tight truncate",
                  isActive ? "font-semibold text-crimson" : "font-medium",
                )}
              >
                {ch.title}
              </span>
            </span>
          </button>
        );
      })}
      {filteredChapters.length === 0 && (
        <p className="px-4 py-8 text-xs text-text-muted text-center font-sans">
          No chapters match &ldquo;{search}&rdquo;
        </p>
      )}
    </>
  );

  return (
    /* Full-bleed: parent (page.tsx or docs-public layout) has already
       removed padding, so DocsClient fills the entire content area. */
    <div className="flex h-[calc(100dvh-3.5rem)] overflow-hidden">

      {/* ── Left chapter navigator ─────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-52 xl:w-56 shrink-0 border-r border-border-subtle bg-base h-full overflow-hidden">
        {/* Search — starts at the very top, no brand header (main nav handles branding) */}
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
              className="w-full h-8 pl-7 pr-7 rounded-md bg-elevated border border-border-subtle text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-default transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
              >
                <X size={11} weight="bold" />
              </button>
            )}
          </div>
        </div>

        {/* Chapter list */}
        <nav className="flex-1 overflow-y-auto py-1 scrollbar-hide">
          <NavList />
        </nav>

        {/* Role badge */}
        {role && (
          <div className="shrink-0 px-3 py-2.5 border-t border-border-subtle bg-elevated/30">
            <p className="font-mono text-[9px] text-text-muted uppercase tracking-widest mb-1.5">
              Viewing as
            </p>
            <AccessBadge roles={[role]} />
          </div>
        )}
      </aside>

      {/* ── Mobile nav overlay (< md) ──────────────────────────────────── */}
      {navOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setNavOpen(false)}
          />
          <aside className="relative z-10 flex flex-col w-64 max-w-[80vw] h-full bg-base border-r border-border-subtle">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
              <p className="font-display font-semibold text-sm text-text-primary">Chapters</p>
              <button
                onClick={() => setNavOpen(false)}
                className="w-7 h-7 rounded-md flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-elevated transition-colors"
              >
                <X size={14} weight="bold" />
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
                  className="w-full h-8 pl-7 pr-7 rounded-md bg-elevated border border-border-subtle text-xs text-text-primary placeholder:text-text-muted focus:outline-none transition-colors"
                />
              </div>
            </div>
            <nav className="flex-1 overflow-y-auto py-1">
              <NavList />
            </nav>
            {role && (
              <div className="shrink-0 px-3 py-2.5 border-t border-border-subtle bg-elevated/30">
                <p className="font-mono text-[9px] text-text-muted uppercase tracking-widest mb-1.5">
                  Viewing as
                </p>
                <AccessBadge roles={[role]} />
              </div>
            )}
          </aside>
        </div>
      )}

      {/* ── Content area ──────────────────────────────────────────────── */}
      <div ref={contentRef} className="flex-1 min-w-0 h-full overflow-y-auto">

        {/* Sticky content topbar */}
        <div className="sticky top-0 z-20 flex items-center gap-3 px-4 md:px-6 h-10 bg-base/90 backdrop-blur-xl border-b border-border-subtle">
          {/* Mobile nav toggle */}
          <button
            onClick={() => setNavOpen(true)}
            className="md:hidden flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors"
          >
            <List size={14} weight="bold" />
            <span className="text-xs font-medium">Chapters</span>
          </button>

          {/* Breadcrumb */}
          <div className="hidden md:flex items-center gap-1.5 font-mono text-[10px] text-text-muted">
            <Books size={11} />
            <span>Docs</span>
            <span className="text-border-default mx-0.5">/</span>
            <span className="text-text-secondary truncate max-w-[300px]">
              {activeChapter.title}
            </span>
          </div>

          {/* Progress + role */}
          <div className="ml-auto flex items-center gap-2">
            {role && (
              <span className="hidden sm:block">
                <AccessBadge roles={[role]} />
              </span>
            )}
            <span className="font-mono text-[10px] text-text-muted tabular-nums">
              {String(activeIndex + 1).padStart(2, "0")}&thinsp;/&thinsp;{String(visibleChapters.length).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* Chapter content */}
        <div className="px-5 md:px-8 py-6">
          <ChapterHeader chapterMeta={activeChapter} number={CHAPTERS.indexOf(activeChapter) + 1} role={role} />

          {BodyComponent && (
            <div className="mt-1">
              <BodyComponent role={role} />
            </div>
          )}

          {/* Prev / Next navigation */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-border-subtle">
            {prevChapter ? (
              <button
                onClick={() => navigate(prevChapter.id)}
                className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border border-border-subtle hover:border-border-default bg-elevated/30 hover:bg-elevated/60 transition-colors text-left group"
              >
                <CaretLeft
                  size={14}
                  weight="bold"
                  className="text-text-muted shrink-0 group-hover:text-text-secondary transition-colors"
                />
                <div className="min-w-0">
                  <p className="font-mono text-[9px] text-text-muted uppercase tracking-widest mb-0.5">
                    Previous
                  </p>
                  <p className="text-sm font-semibold text-text-primary truncate">
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
                className="flex-1 flex items-center justify-end gap-3 px-4 py-3 rounded-xl border border-border-subtle hover:border-border-default bg-elevated/30 hover:bg-elevated/60 transition-colors text-right group"
              >
                <div className="min-w-0">
                  <p className="font-mono text-[9px] text-text-muted uppercase tracking-widest mb-0.5">
                    Next
                  </p>
                  <p className="text-sm font-semibold text-text-primary truncate">
                    {nextChapter.title}
                  </p>
                </div>
                <CaretRight
                  size={14}
                  weight="bold"
                  className="text-text-muted shrink-0 group-hover:text-text-secondary transition-colors"
                />
              </button>
            ) : (
              <div className="flex-1" />
            )}
          </div>

          {/* Footer */}
          <footer className="mt-8 pb-10 text-center">
            <p className="font-mono text-[10px] text-text-muted/40 tracking-wide">
              Titan Journal CRM &middot; Documentation &middot; {visibleChapters.length} chapter{visibleChapters.length !== 1 ? "s" : ""}
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}

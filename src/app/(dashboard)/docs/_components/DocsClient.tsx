"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/types/enums";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
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

  const [activeChapter, setActiveChapter] = useState<string>(CHAPTERS[0].id);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const tabsRef = useRef<HTMLDivElement>(null);

  // Scroll-spy: highlight active chapter tab as user scrolls
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          const topmost = visible.reduce((a, b) =>
            a.boundingClientRect.top < b.boundingClientRect.top ? a : b
          );
          setActiveChapter(topmost.target.id);
        }
      },
      { rootMargin: "-10% 0px -60% 0px", threshold: 0 }
    );

    const refs = sectionRefs.current;
    Object.values(refs).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Auto-scroll the active tab button into view in the tab bar
  useEffect(() => {
    const bar = tabsRef.current;
    if (!bar) return;
    const btn = bar.querySelector<HTMLButtonElement>(`[data-chapter="${activeChapter}"]`);
    if (btn) {
      btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeChapter]);

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveChapter(id);
    }
  }

  function secRef(id: string) {
    return (el: HTMLElement | null) => {
      sectionRefs.current[id] = el;
    };
  }

  return (
    <div className="bg-void -m-4 md:-m-5">

      {/* ── Sticky horizontal chapter tab bar ──────────────────────────── */}
      <div className="sticky top-0 z-20 bg-base/95 backdrop-blur-xl border-b border-border-subtle">
        <div
          ref={tabsRef}
          className="flex gap-1.5 overflow-x-auto scrollbar-hide px-5 py-2.5"
        >
          {CHAPTERS.map((ch, idx) => {
            const Icon = ch.icon;
            const isActive = activeChapter === ch.id;
            const restricted = getIsRestricted(ch.access, role);
            return (
              <button
                key={ch.id}
                data-chapter={ch.id}
                onClick={() => scrollTo(ch.id)}
                className={cn(
                  "shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-sans font-medium transition-colors",
                  isActive
                    ? "bg-crimson/15 text-crimson"
                    : "bg-elevated text-text-secondary hover:bg-elevated/80 hover:text-text-primary",
                  restricted && "opacity-50"
                )}
              >
                <Icon
                  size={12}
                  weight={isActive ? "fill" : "regular"}
                  className="shrink-0"
                />
                <span className="font-mono text-[10px] opacity-50 mr-0.5">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                {ch.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Hero header ──────────────────────────────────────────────────── */}
      <div className="border-b border-border-subtle bg-base px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-mono text-crimson uppercase tracking-widest mb-1">
            Titan Journal CRM
          </p>
          <h1 className="text-3xl font-display font-bold text-text-primary">
            User Documentation
          </h1>
          <p className="mt-2 text-text-secondary max-w-xl">
            Complete guide covering all features, roles, and workflows. Use the tabs above to
            navigate between chapters or scroll continuously.
          </p>
          {role && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-text-muted font-mono">Viewing as:</span>
              <AccessBadge roles={[role]} />
            </div>
          )}
        </div>
      </div>

      {/* ── Chapter content ───────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-24">
        {CHAPTERS.map((ch, idx) => {
          const BodyComponent = CHAPTER_BODY_MAP[ch.id];
          return (
            <section
              key={ch.id}
              id={ch.id}
              ref={secRef(ch.id)}
            >
              <ChapterHeader chapterMeta={ch} number={idx + 1} role={role} />
              {BodyComponent && <BodyComponent role={role} />}
            </section>
          );
        })}

        {/* Footer */}
        <footer className="pt-6 pb-20 text-center">
          <Separator className="mb-8" />
          <p className="text-xs font-mono text-text-muted">
            Titan Journal CRM &middot; Documentation &middot; All rights reserved
          </p>
          <p className="text-xs text-text-muted mt-1">
            {CHAPTERS.length} chapters &middot; Last updated {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </div>
  );
}

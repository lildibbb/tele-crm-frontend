"use client";

import React, { useState, useEffect } from "react";
import {
  MagnifyingGlass,
  X,
  CaretLeft,
  CaretRight,
  Books,
  Lock,
} from "@phosphor-icons/react";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/types/enums";
import { cn } from "@/lib/utils";
import {
  CHAPTERS,
  CHAPTER_BODY_MAP,
  ChapterMeta,
  AccessLevel,
  getIsRestricted,
} from "@/app/(dashboard)/docs/_components/chapterBodies";

// ── Access pill ────────────────────────────────────────────────────────────────

function AccessPill({ access }: { access: AccessLevel }) {
  if (access === "all") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-elevated text-text-muted border border-border-subtle">
        All roles
      </span>
    );
  }
  const labels: Record<UserRole, string> = {
    SUPERADMIN: "SA",
    OWNER:      "Owner",
    ADMIN:      "Admin",
    STAFF:      "Staff",
  };
  const roleColors: Record<UserRole, string> = {
    SUPERADMIN: "bg-amber-500/10 text-amber-400",
    OWNER:      "bg-crimson/10 text-crimson",
    ADMIN:      "bg-blue-500/10 text-blue-400",
    STAFF:      "bg-elevated text-text-secondary",
  };
  return (
    <div className="flex items-center gap-1">
      {(access as UserRole[]).map((r) => (
        <span key={r} className={cn("inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-mono font-semibold", roleColors[r])}>
          {labels[r]}
        </span>
      ))}
    </div>
  );
}

// ── Chapter card ───────────────────────────────────────────────────────────────

function ChapterCard({
  chapter,
  index,
  onClick,
  hasAccess,
}: {
  chapter: ChapterMeta;
  index: number;
  onClick: () => void;
  hasAccess: boolean;
}) {
  const Icon = chapter.icon;
  return (
    <button
      onClick={onClick}
      disabled={!hasAccess}
      className={cn(
        "relative flex flex-col gap-3 p-4 rounded-2xl border text-left transition-all active:scale-[0.97]",
        hasAccess
          ? "bg-card border-border-subtle hover:border-border-default"
          : "bg-card/40 border-border-subtle/50 opacity-50"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="w-11 h-11 rounded-xl bg-elevated flex items-center justify-center shrink-0">
          <Icon size={20} weight="fill" className="text-text-secondary" />
        </span>
        <span className="font-mono text-[10px] text-text-muted/60 font-semibold pt-1">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <div>
        <h3 className="font-sans font-semibold text-[13px] text-text-primary leading-snug mb-1">
          {chapter.title}
        </h3>
        <p className="font-sans text-[11px] text-text-muted leading-relaxed line-clamp-2">
          {chapter.summary}
        </p>
      </div>
      <AccessPill access={chapter.access} />
      {!hasAccess && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl">
          <Lock size={18} className="text-text-muted/40" weight="bold" />
        </div>
      )}
    </button>
  );
}

// ── Chapter detail ─────────────────────────────────────────────────────────────

function ChapterDetail({
  chapter,
  index,
  role,
  onBack,
  onPrev,
  onNext,
}: {
  chapter: ChapterMeta;
  index: number;
  role?: UserRole;
  onBack: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  const Icon = chapter.icon;
  const BodyComponent = CHAPTER_BODY_MAP[chapter.id];
  const accessRoles =
    chapter.access === "all"
      ? ["SUPERADMIN", "OWNER", "ADMIN", "STAFF"]
      : (chapter.access as UserRole[]).map((r) => r.toString());

  return (
    <div className="flex flex-col pb-8">
      {/* Back row */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border-subtle sticky top-0 z-10 bg-base/95 backdrop-blur-xl">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 min-h-[36px] px-2 -ml-1 rounded-xl font-sans text-[13px] font-semibold text-crimson active:bg-crimson/10 transition-colors"
        >
          <CaretLeft size={16} weight="bold" />
          Docs
        </button>
        <span className="font-mono text-[10px] text-text-muted ml-auto">
          {String(index + 1).padStart(2, "0")} / {CHAPTERS.length.toString().padStart(2, "0")}
        </span>
      </div>

      {/* Hero */}
      <div className="px-4 pt-5 pb-4 border-b border-border-subtle">
        <div className="flex items-start gap-4">
          <span className="w-14 h-14 rounded-2xl bg-elevated border border-border-subtle flex items-center justify-center shrink-0">
            <Icon size={26} weight="duotone" className="text-crimson" />
          </span>
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="font-mono text-[9px] text-crimson uppercase tracking-widest mb-0.5">
              Chapter {String(index + 1).padStart(2, "0")}
            </p>
            <h1 className="font-display font-bold text-[20px] text-text-primary leading-tight">
              {chapter.title}
            </h1>
            <p className="font-sans text-[13px] text-text-muted mt-1 leading-relaxed">
              {chapter.summary}
            </p>
          </div>
        </div>

        {/* Access badges */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {accessRoles.map((r) => {
            const colors: Record<string, string> = {
              SUPERADMIN: "bg-amber-500/10 text-amber-400 border-amber-500/20",
              OWNER:      "bg-crimson/10 text-crimson border-crimson/20",
              ADMIN:      "bg-blue-500/10 text-blue-400 border-blue-500/20",
              STAFF:      "bg-elevated text-text-secondary border-border-default",
            };
            return (
              <span key={r} className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border", colors[r])}>
                {r}
              </span>
            );
          })}
        </div>

        {/* Restricted banner */}
        {getIsRestricted(chapter.access, role) && chapter.access !== "all" && (
          <div className="mt-3 flex gap-2 rounded-lg border border-crimson/20 bg-crimson/5 px-3 py-2.5">
            <Lock size={16} weight="fill" className="text-crimson mt-0.5 flex-shrink-0" />
            <p className="text-xs text-text-secondary leading-relaxed">
              Requires{" "}
              <strong className="text-crimson">
                {(chapter.access as UserRole[]).map((r) => r.toString()).join(" or ")}
              </strong>{" "}
              role. Viewing as documentation only.
            </p>
          </div>
        )}
      </div>

      {/* Rich chapter body */}
      <div className="px-4 pt-5">
        {BodyComponent ? (
          <BodyComponent role={role} />
        ) : (
          <p className="text-sm text-text-muted">Content coming soon.</p>
        )}
      </div>

      {/* Tags */}
      {chapter.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-4 mt-4">
          {chapter.tags.map((tag) => (
            <span key={tag} className="px-2.5 py-1 rounded-full bg-elevated font-mono text-[10px] text-text-muted">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Prev / Next navigation */}
      <div className="mx-4 mt-6 flex gap-3">
        {onPrev && (
          <button
            onClick={onPrev}
            className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl bg-elevated border border-border-subtle font-sans text-[12px] font-semibold text-text-secondary active:bg-card transition-colors"
          >
            <CaretLeft size={14} weight="bold" className="shrink-0" />
            <span className="truncate">Previous</span>
          </button>
        )}
        {onNext && (
          <button
            onClick={onNext}
            className="flex-1 flex items-center justify-end gap-2 px-4 py-3 rounded-xl bg-elevated border border-border-subtle font-sans text-[12px] font-semibold text-text-secondary active:bg-card transition-colors"
          >
            <span className="truncate text-right">Next</span>
            <CaretRight size={14} weight="bold" className="shrink-0" />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function MobileDocsPage() {
  const { user } = useAuthStore();
  const role = user?.role as UserRole | undefined;
  const [selectedChapter, setSelectedChapter] = useState<ChapterMeta | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Scroll to top whenever chapter selection changes
  useEffect(() => {
    const el = document.getElementById("mobile-main");
    if (el) el.scrollTop = 0;
  }, [selectedChapter]);

  function hasAccess(chapter: ChapterMeta): boolean {
    if (chapter.access === "all") return true;
    if (!role) return false;
    return (chapter.access as UserRole[]).includes(role);
  }

  const filteredChapters = searchQuery.trim()
    ? CHAPTERS.filter((ch) =>
        ch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ch.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ch.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : CHAPTERS;

  if (selectedChapter) {
    const index = CHAPTERS.indexOf(selectedChapter);
    const prevChapter = index > 0 ? CHAPTERS[index - 1] : undefined;
    const nextChapter = index < CHAPTERS.length - 1 ? CHAPTERS[index + 1] : undefined;
    return (
      <ChapterDetail
        chapter={selectedChapter}
        index={index}
        role={role}
        onBack={() => setSelectedChapter(null)}
        onPrev={prevChapter ? () => setSelectedChapter(prevChapter) : undefined}
        onNext={nextChapter ? () => setSelectedChapter(nextChapter) : undefined}
      />
    );
  }

  return (
    <div className="flex flex-col pb-6">
      {/* Hero */}
      <div className="px-4 pt-4 pb-3">
        <div className="rounded-2xl bg-card border border-border-subtle p-4 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-elevated border border-border-subtle flex items-center justify-center shrink-0">
            <Books size={24} weight="fill" className="text-text-secondary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-mono text-[10px] text-crimson uppercase tracking-widest mb-0.5">
              Titan Journal CRM
            </p>
            <h1 className="font-display font-bold text-[18px] text-text-primary leading-tight">
              Documentation
            </h1>
            <p className="font-sans text-[12px] text-text-muted mt-0.5 leading-relaxed">
              {CHAPTERS.length} chapters · Full feature guide
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 mb-3">
        <div className="relative">
          <MagnifyingGlass
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search chapters…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[42px] pl-9 pr-9 rounded-xl bg-elevated border border-border-subtle font-sans text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-default transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
            >
              <X size={14} weight="bold" />
            </button>
          )}
        </div>
      </div>

      {/* Role context */}
      {role && (
        <div className="px-4 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-sans text-[11px] text-text-muted">Viewing as</span>
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border",
                role === "SUPERADMIN" && "bg-amber-500/10 text-amber-400 border-amber-500/20",
                role === "OWNER"      && "bg-crimson/10 text-crimson border-crimson/20",
                role === "ADMIN"      && "bg-blue-500/10 text-blue-400 border-blue-500/20",
                role === "STAFF"      && "bg-elevated text-text-secondary border-border-subtle"
              )}
            >
              {role}
            </span>
          </div>
        </div>
      )}

      {/* Chapter grid */}
      <div className="px-4 grid grid-cols-2 gap-3">
        {filteredChapters.map((chapter) => (
          <ChapterCard
            key={chapter.id}
            chapter={chapter}
            index={CHAPTERS.indexOf(chapter)}
            hasAccess={hasAccess(chapter)}
            onClick={() => {
              if (hasAccess(chapter)) setSelectedChapter(chapter);
            }}
          />
        ))}
        {filteredChapters.length === 0 && (
          <div className="col-span-2 py-12 flex flex-col items-center gap-2 text-center">
            <MagnifyingGlass size={28} className="text-text-muted" />
            <p className="font-sans text-[13px] text-text-muted">No chapters match &ldquo;{searchQuery}&rdquo;</p>
          </div>
        )}
      </div>
    </div>
  );
}

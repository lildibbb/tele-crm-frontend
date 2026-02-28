"use client";

import React, { useState } from "react";
import {
  UsersThree,
  SignIn,
  ChartBar,
  Users,
  ChatText,
  Paperclip,
  Books,
  Terminal,
  Megaphone,
  UserPlus,
  ClipboardText,
  Sliders,
  Gear,
  HardDrives,
  Question,
  CaretLeft,
  CaretRight,
  MagnifyingGlass,
  Lock,
  X,
} from "@phosphor-icons/react";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/types/enums";
import { cn } from "@/lib/utils";

// ── Chapter definitions ────────────────────────────────────────────────────────

type Access = "all" | UserRole[];

interface Chapter {
  id: string;
  title: string;
  icon: React.ElementType;
  access: Access;
  summary: string;
  keyPoints: string[];
  tags: string[];
}

const CHAPTERS: Chapter[] = [
  {
    id: "roles-permissions",
    title: "Roles & Permissions",
    icon: UsersThree,
    access: "all",
    summary: "Understand what each role can do and the full permissions matrix.",
    keyPoints: [
      "SUPERADMIN: Full platform access including Google & Backup",
      "OWNER: Full IB business access, manages team and leads",
      "ADMIN: Manages leads, KB, commands, broadcasts; can invite STAFF",
      "STAFF: View leads, update status, view chat, manage attachments",
      "Each role has progressively restricted access to sensitive features",
    ],
    tags: ["roles", "access", "permissions"],
  },
  {
    id: "login-sessions",
    title: "Login & Sessions",
    icon: SignIn,
    access: "all",
    summary: "How to access the CRM via web browser or Telegram Mini App.",
    keyPoints: [
      "Access via web browser at your CRM domain",
      "Login with email and password",
      "Telegram Mini App access available for mobile use",
      "Sessions are tracked per device with IP logging",
      "Revoke any active session from the Profile → Sessions page",
    ],
    tags: ["login", "security", "sessions", "telegram"],
  },
  {
    id: "dashboard-analytics",
    title: "Dashboard & Analytics",
    icon: ChartBar,
    access: [UserRole.OWNER, UserRole.ADMIN],
    summary: "Monitor your IB funnel performance with real-time metrics and charts.",
    keyPoints: [
      "KPI cards: Total Leads, Verified, Depositing, Conversion Rate",
      "Time-series charts for lead growth and deposit trends",
      "Filterable by period: Today, Weekly, Monthly, Last 90 days",
      "Funnel breakdown: NEW → REGISTERED → DEPOSIT_REPORTED → CONFIRMED",
      "Real-time refresh with manual reload button",
    ],
    tags: ["analytics", "kpi", "charts", "funnel"],
  },
  {
    id: "lead-management",
    title: "Lead Management",
    icon: Users,
    access: "all",
    summary: "View, search, filter, and manage all leads in your CRM pipeline.",
    keyPoints: [
      "Lead statuses: NEW, REGISTERED, DEPOSIT_REPORTED, DEPOSIT_CONFIRMED, REJECTED",
      "Search by name, phone, Telegram username or ID",
      "Filter by status, date range, or assigned staff",
      "Edit lead details: name, phone, trading account, notes",
      "Verify or reject leads from the lead detail page",
    ],
    tags: ["leads", "status", "filter", "search"],
  },
  {
    id: "interactions-chat",
    title: "Interactions & Chat",
    icon: ChatText,
    access: "all",
    summary: "View the full conversation history for every lead and send manual replies.",
    keyPoints: [
      "Full Telegram conversation history per lead",
      "Timestamps and message delivery status",
      "Send manual messages directly from the CRM",
      "AI-generated responses shown with AI indicator",
      "Message history is read-only for STAFF role",
    ],
    tags: ["chat", "telegram", "messages", "history"],
  },
  {
    id: "attachments-media",
    title: "Attachments & Media",
    icon: Paperclip,
    access: "all",
    summary: "Review deposit proof (screenshots and videos) uploaded by leads via Telegram.",
    keyPoints: [
      "Leads submit deposit proof via Telegram messages",
      "Attachments stored securely and linked to lead profile",
      "Supports images and video files",
      "Download or preview attachments in the CRM",
      "Attachment history persists even after status changes",
    ],
    tags: ["attachments", "deposit", "media", "proof"],
  },
  {
    id: "knowledge-base",
    title: "Knowledge Base",
    icon: Books,
    access: [UserRole.OWNER, UserRole.ADMIN],
    summary: "Build the AI's knowledge so it can answer lead questions accurately.",
    keyPoints: [
      "Add articles, FAQs, and structured content for the AI",
      "AI uses KB to generate accurate responses to lead questions",
      "Organize by category for easy management",
      "Edit and delete KB entries at any time",
      "Changes take effect on the next AI response cycle",
    ],
    tags: ["ai", "knowledge", "faq", "content"],
  },
  {
    id: "command-menu",
    title: "Command Menu",
    icon: Terminal,
    access: [UserRole.OWNER, UserRole.ADMIN],
    summary: "Configure the / commands leads can type in Telegram to get instant responses.",
    keyPoints: [
      "Define custom /commands (e.g. /status, /deposit, /register)",
      "Each command maps to a specific AI response template",
      "Commands appear as suggestions in the Telegram interface",
      "Supports dynamic placeholders in command responses",
      "Enable or disable individual commands without deleting them",
    ],
    tags: ["commands", "telegram", "automation", "slash"],
  },
  {
    id: "broadcast-messaging",
    title: "Broadcast Messaging",
    icon: Megaphone,
    access: [UserRole.OWNER, UserRole.ADMIN],
    summary: "Send a single message to all leads who have a connected Telegram account.",
    keyPoints: [
      "One-click broadcast to all connected Telegram leads",
      "Compose rich text messages with variable substitution",
      "Preview before sending to catch errors",
      "Delivery tracked with sent/failed counts",
      "Broadcast history with timestamps and content",
    ],
    tags: ["broadcast", "messaging", "bulk", "telegram"],
  },
  {
    id: "users-invitations",
    title: "Users & Invitations",
    icon: UserPlus,
    access: [UserRole.OWNER, UserRole.ADMIN, UserRole.SUPERADMIN],
    summary: "Invite team members, assign roles, and manage access.",
    keyPoints: [
      "Invite by email — a one-time registration link is sent",
      "Assign role at invite time: ADMIN or STAFF",
      "View all active team members and their last login",
      "Deactivate users to revoke access without deleting",
      "OWNER can create ADMIN accounts; ADMIN can create STAFF",
    ],
    tags: ["team", "invite", "users", "roles"],
  },
  {
    id: "audit-logs",
    title: "Audit Logs",
    icon: ClipboardText,
    access: [UserRole.OWNER, UserRole.ADMIN, UserRole.SUPERADMIN],
    summary: "Track every important action taken in the CRM with a full before/after history.",
    keyPoints: [
      "Every create, update, delete action is logged with actor email",
      "Before/after diff view for changed records",
      "Filter by action type, actor email, or date range",
      "IP address and timestamp recorded per event",
      "Immutable — logs cannot be edited or deleted",
    ],
    tags: ["audit", "logs", "history", "security"],
  },
  {
    id: "system-configuration",
    title: "System Configuration",
    icon: Sliders,
    access: [UserRole.OWNER, UserRole.ADMIN],
    summary: "Control bot behaviour, AI settings, and enable/disable platform features.",
    keyPoints: [
      "Toggle AI auto-reply on or off",
      "Set bot response language and tone",
      "Configure lead status workflow (which transitions are allowed)",
      "Feature flags to enable/disable modules",
      "Changes take effect immediately on the bot",
    ],
    tags: ["config", "settings", "ai", "bot", "features"],
  },
  {
    id: "bot-settings",
    title: "Bot Settings",
    icon: Gear,
    access: [UserRole.OWNER, UserRole.SUPERADMIN],
    summary: "Control the bot's active status, reply templates, and safety settings.",
    keyPoints: [
      "Enable/disable the Telegram bot globally",
      "Set welcome message template for new leads",
      "Configure fallback response when AI can't answer",
      "Rate limiting to prevent spam responses",
      "Emergency stop to halt all bot activity instantly",
    ],
    tags: ["bot", "telegram", "templates", "safety"],
  },
  {
    id: "google-backup",
    title: "Google & Backup",
    icon: HardDrives,
    access: [UserRole.SUPERADMIN],
    summary: "Connect Google services and manage automated database backups.",
    keyPoints: [
      "Connect Google Analytics for traffic insights",
      "Configure automated daily database backups",
      "Download or restore from backup snapshots",
      "Backup retention policy configurable (default: 30 days)",
      "Email notification on backup success or failure",
    ],
    tags: ["backup", "google", "data", "recovery"],
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting & FAQ",
    icon: Question,
    access: "all",
    summary: "Solutions to common issues and answers to frequently asked questions.",
    keyPoints: [
      "Bot not responding: check bot active status and API key",
      "Lead not receiving messages: verify Telegram account is linked",
      "Login issues: check account status and password reset link",
      "Missing features: check your role — some features are role-restricted",
      "Contact SUPERADMIN for platform-level issues",
    ],
    tags: ["faq", "troubleshooting", "help", "issues"],
  },
];

// ── Access badge ───────────────────────────────────────────────────────────────

function AccessPill({ access }: { access: Access }) {
  if (access === "all") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-elevated text-text-muted border border-border-subtle">
        All roles
      </span>
    );
  }
  const labels: Record<UserRole, string> = {
    SUPERADMIN: "SA",
    OWNER: "Owner",
    ADMIN: "Admin",
    STAFF: "Staff",
  };
  return (
    <div className="flex items-center gap-1">
      {access.map((r) => (
        <span
          key={r}
          className={cn(
            "inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-mono font-semibold",
            r === "SUPERADMIN" && "bg-gold/10 text-gold",
            r === "OWNER" && "bg-crimson/10 text-crimson",
            r === "ADMIN" && "bg-info/10 text-info",
            r === "STAFF" && "bg-success/10 text-success",
          )}
        >
          {labels[r]}
        </span>
      ))}
    </div>
  );
}

// ── Chapter card (grid item) ───────────────────────────────────────────────────

function ChapterCard({
  chapter,
  index,
  onClick,
  hasAccess,
}: {
  chapter: Chapter;
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
          : "bg-card/40 border-border-subtle/50 opacity-50",
      )}
    >
      {/* Chapter number */}
      <div className="flex items-start justify-between gap-2">
        <span className="w-11 h-11 rounded-xl bg-elevated flex items-center justify-center shrink-0">
          <Icon size={20} weight="fill" className="text-text-secondary" />
        </span>
        <span className="font-mono text-[10px] text-text-muted/60 font-semibold pt-1">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      {/* Title + summary */}
      <div>
        <h3 className="font-sans font-semibold text-[13px] text-text-primary leading-snug mb-1">
          {chapter.title}
        </h3>
        <p className="font-sans text-[11px] text-text-muted leading-relaxed line-clamp-2">
          {chapter.summary}
        </p>
      </div>

      {/* Access badge */}
      <AccessPill access={chapter.access} />

      {/* Lock overlay for no-access */}
      {!hasAccess && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl">
          <Lock size={18} className="text-text-muted/40" weight="bold" />
        </div>
      )}
    </button>
  );
}

// ── Chapter detail view ────────────────────────────────────────────────────────

function ChapterDetail({
  chapter,
  index,
  onBack,
}: {
  chapter: Chapter;
  index: number;
  onBack: () => void;
}) {
  const Icon = chapter.icon;

  return (
    <div className="flex flex-col">
      {/* Back row */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border-subtle">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 min-h-[36px] px-2 -ml-1 rounded-xl font-sans text-[13px] font-semibold text-crimson active:bg-crimson/10 transition-colors"
        >
          <CaretLeft size={16} weight="bold" />
          All Chapters
        </button>
        <span className="font-mono text-[10px] text-text-muted ml-auto">
          {String(index + 1).padStart(2, "0")} / {CHAPTERS.length.toString().padStart(2, "0")}
        </span>
      </div>

      {/* Hero */}
      <div className="px-4 pt-5 pb-4">
        <div className="flex items-start gap-4">
          <span className="w-14 h-14 rounded-2xl bg-elevated border border-border-subtle flex items-center justify-center shrink-0">
            <Icon size={26} weight="fill" className="text-text-secondary" />
          </span>
          <div className="flex-1 min-w-0 pt-0.5">
            <h1 className="font-display font-bold text-[20px] text-text-primary leading-tight">
              {chapter.title}
            </h1>
            <p className="font-sans text-[13px] text-text-muted mt-1 leading-relaxed">
              {chapter.summary}
            </p>
          </div>
        </div>

        {/* Access */}
        <div className="flex items-center gap-2 mt-3">
          <span className="font-sans text-[11px] text-text-muted">Access:</span>
          <AccessPill access={chapter.access} />
        </div>
      </div>

      {/* Key points */}
      <div className="px-4 pb-6">
        <div className="rounded-2xl bg-card border border-border-subtle overflow-hidden">
          <div className="px-4 py-3 border-b border-border-subtle">
            <span className="font-sans font-semibold text-[12px] text-text-muted uppercase tracking-wider">
              Key Points
            </span>
          </div>
          <div className="divide-y divide-border-subtle">
            {chapter.keyPoints.map((point, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3.5">
                <span className="shrink-0 w-5 h-5 rounded-full bg-elevated flex items-center justify-center mt-0.5">
                  <span className="font-mono text-[10px] font-bold text-text-muted">
                    {i + 1}
                  </span>
                </span>
                <p className="font-sans text-[13px] text-text-primary leading-relaxed">
                  {point}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-4">
          {chapter.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-full bg-elevated font-mono text-[10px] text-text-muted"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Prev / Next navigation */}
      <div className="mx-4 mb-2 flex gap-3">
        {index > 0 && (
          <button
            onClick={() => {
              onBack();
            }}
            className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl bg-elevated border border-border-subtle font-sans text-[12px] font-semibold text-text-secondary active:bg-card transition-colors"
          >
            <CaretLeft size={14} weight="bold" className="shrink-0" />
            <span className="truncate">Back to list</span>
          </button>
        )}
        <button
          onClick={onBack}
          className="flex-1 flex items-center justify-end gap-2 px-4 py-3 rounded-xl bg-elevated border border-border-subtle font-sans text-[12px] font-semibold text-text-secondary active:bg-card transition-colors"
        >
          <span className="truncate text-right">All chapters</span>
          <CaretRight size={14} weight="bold" className="shrink-0" />
        </button>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function MobileDocsPage() {
  const { user } = useAuthStore();
  const role = user?.role as UserRole | undefined;
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  function hasAccess(chapter: Chapter): boolean {
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
    return (
      <ChapterDetail
        chapter={selectedChapter}
        index={index}
        onBack={() => setSelectedChapter(null)}
      />
    );
  }

  return (
    <div className="flex flex-col pb-6">
      {/* ── Hero ─────────────────────────────────────────────────── */}
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
              {CHAPTERS.length} chapters · Quick reference guide
            </p>
          </div>
        </div>
      </div>

      {/* ── Search ───────────────────────────────────────────────── */}
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

      {/* ── Role context ─────────────────────────────────────────── */}
      {role && (
        <div className="px-4 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-sans text-[11px] text-text-muted">Viewing as</span>
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border",
                role === "SUPERADMIN" && "bg-gold/10 text-gold border-gold/20",
                role === "OWNER" && "bg-crimson/10 text-crimson border-crimson/20",
                role === "ADMIN" && "bg-info/10 text-info border-info/20",
                role === "STAFF" && "bg-elevated text-text-secondary border-border-subtle",
              )}
            >
              {role}
            </span>
            <span className="font-sans text-[11px] text-text-muted">
              — locked chapters require higher access
            </span>
          </div>
        </div>
      )}

      {/* ── Chapter grid ─────────────────────────────────────────── */}
      {filteredChapters.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 px-6">
          <span className="w-14 h-14 rounded-2xl bg-elevated flex items-center justify-center">
            <MagnifyingGlass size={28} weight="duotone" className="text-text-muted" />
          </span>
          <div className="text-center">
            <p className="font-sans font-semibold text-[15px] text-text-primary">
              No chapters found
            </p>
            <p className="font-sans text-[12px] text-text-muted mt-1">
              Try a different search term
            </p>
          </div>
          <button
            onClick={() => setSearchQuery("")}
            className="px-4 py-2 rounded-xl bg-elevated font-sans text-[12px] font-semibold text-text-secondary"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="px-4 grid grid-cols-2 gap-3">
          {filteredChapters.map((chapter, i) => {
            const realIndex = CHAPTERS.indexOf(chapter);
            return (
              <ChapterCard
                key={chapter.id}
                chapter={chapter}
                index={realIndex}
                onClick={() => setSelectedChapter(chapter)}
                hasAccess={hasAccess(chapter)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

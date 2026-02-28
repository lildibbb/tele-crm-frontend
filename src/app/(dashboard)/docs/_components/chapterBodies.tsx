/**
 * chapterBodies.tsx
 * Shared chapter metadata + rich documentation content used by both
 * DocsClient (desktop) and MobileDocsPage (mobile).
 */

import React from "react";
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
  Image as ImageIcon,
  Lock,
  Lightbulb,
  Warning as PhWarning,
} from "@phosphor-icons/react";
import { UserRole } from "@/types/enums";
import { Separator } from "@/components/ui/separator";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type AccessLevel = UserRole[] | "all";

export type ChapterMeta = {
  id: string;
  title: string;
  icon: React.ElementType;
  access: AccessLevel;
  summary: string;
  tags: string[];
};

// ─────────────────────────────────────────────────────────────────────────────
// Shared display components
// ─────────────────────────────────────────────────────────────────────────────

export function ScreenshotPlaceholder({ caption }: { caption: string }) {
  return (
    <div className="my-4 rounded-xl border border-border-default bg-elevated/50 flex flex-col items-center justify-center gap-2 py-10 px-4 text-center">
      <ImageIcon size={28} className="text-text-muted" weight="light" />
      <p className="text-xs text-text-muted font-mono">{caption}</p>
    </div>
  );
}

export function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 flex gap-3 rounded-lg border border-success/20 bg-success/5 px-4 py-3">
      <Lightbulb size={18} weight="fill" className="text-success mt-0.5 flex-shrink-0" />
      <p className="text-sm text-text-secondary leading-relaxed">{children}</p>
    </div>
  );
}

export function Warn({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 flex gap-3 rounded-lg border border-warning/20 bg-warning/5 px-4 py-3">
      <PhWarning size={18} weight="fill" className="text-warning mt-0.5 flex-shrink-0" />
      <p className="text-sm text-text-secondary leading-relaxed">{children}</p>
    </div>
  );
}

export function AccessBadge({ roles }: { roles: string[] }) {
  const styleMap: Record<string, string> = {
    SUPERADMIN: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    OWNER:      "bg-crimson/10 text-crimson border border-crimson/20",
    ADMIN:      "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    STAFF:      "bg-elevated text-text-secondary border border-border-default",
  };
  return (
    <div className="flex flex-wrap gap-1.5">
      {roles.map((r) => (
        <span
          key={r}
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-medium ${styleMap[r] ?? "bg-elevated text-text-secondary border border-border-default"}`}
        >
          {r}
        </span>
      ))}
    </div>
  );
}

export function RestrictedBanner({ access }: { access: UserRole[] }) {
  return (
    <div className="mt-4 flex gap-3 rounded-lg border border-crimson/20 bg-crimson/5 px-4 py-3">
      <Lock size={18} weight="fill" className="text-crimson mt-0.5 flex-shrink-0" />
      <p className="text-sm text-text-secondary leading-relaxed">
        This feature requires the{" "}
        <strong className="text-crimson">{access.map((r) => r.toString()).join(" or ")}</strong>{" "}
        role. You are viewing this chapter as documentation only.
      </p>
    </div>
  );
}

export function getIsRestricted(access: AccessLevel, role?: UserRole): boolean {
  if (access === "all") return false;
  if (!role) return false;
  return !(access as UserRole[]).includes(role);
}

export function ChapterHeader({
  chapterMeta,
  number,
  role,
}: {
  chapterMeta: ChapterMeta;
  number: number;
  role?: UserRole;
}) {
  const Icon = chapterMeta.icon;
  const restricted = getIsRestricted(chapterMeta.access, role);
  const accessRoles =
    chapterMeta.access === "all"
      ? ["SUPERADMIN", "OWNER", "ADMIN", "STAFF"]
      : (chapterMeta.access as UserRole[]).map((r) => r.toString());

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-xs font-mono text-text-muted">Chapter {String(number).padStart(2, "0")}</span>
        <AccessBadge roles={accessRoles} />
      </div>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 p-2 rounded-lg bg-crimson/10 mt-0.5">
          <Icon size={22} className="text-crimson" weight="duotone" />
        </div>
        <div>
          <h2 className="text-2xl font-display font-bold text-text-primary leading-tight">
            {chapterMeta.title}
          </h2>
          <p className="mt-1 text-text-secondary font-sans">{chapterMeta.summary}</p>
        </div>
      </div>
      {restricted && chapterMeta.access !== "all" && (
        <RestrictedBanner access={chapterMeta.access as UserRole[]} />
      )}
      <Separator className="mt-6" />
    </div>
  );
}

export function SectionH3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-lg font-display font-semibold text-text-primary mb-3 mt-6">{children}</h3>
  );
}

export function StepList({ steps }: { steps: string[] }) {
  return (
    <ol className="space-y-2 mb-4">
      {steps.map((step, i) => (
        <li key={i} className="flex gap-3 text-text-secondary text-sm">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-crimson/10 text-crimson text-xs font-mono font-bold flex items-center justify-center mt-0.5">
            {i + 1}
          </span>
          <span className="leading-relaxed">{step}</span>
        </li>
      ))}
    </ol>
  );
}

export function SimpleTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border-subtle mb-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-elevated border-b border-border-subtle">
            {headers.map((h) => (
              <th key={h} className="text-left px-4 py-3 text-text-secondary font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={`border-b border-border-subtle last:border-0 ${i % 2 === 0 ? "bg-base" : "bg-elevated/30"}`}>
              {row.map((cell, ci) => (
                <td key={ci} className="px-4 py-2.5 text-text-secondary">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Chapter metadata
// ─────────────────────────────────────────────────────────────────────────────

export const CHAPTERS: ChapterMeta[] = [
  { id: "roles-permissions",  title: "Roles & Permissions",   icon: UsersThree,    access: "all",                                                   summary: "Understand what each role can do and the full permissions matrix.", tags: ["roles","access","permissions","matrix"] },
  { id: "login-sessions",     title: "Login & Sessions",      icon: SignIn,        access: "all",                                                   summary: "How to access the CRM via web browser or Telegram Mini App.",       tags: ["login","sessions","telegram","password","tma"] },
  { id: "dashboard-analytics",title: "Dashboard & Analytics", icon: ChartBar,      access: [UserRole.OWNER, UserRole.ADMIN],                         summary: "Monitor your IB funnel performance with real-time metrics.",        tags: ["dashboard","analytics","funnel","kpi","export"] },
  { id: "lead-management",    title: "Lead Management",       icon: Users,         access: "all",                                                   summary: "View, search, filter, and manage all leads in your CRM pipeline.", tags: ["leads","filter","search","status","handover","bulk"] },
  { id: "interactions-chat",  title: "Interactions & Chat",   icon: ChatText,      access: "all",                                                   summary: "View the full conversation history for every lead and send manual replies.", tags: ["chat","interactions","reply","handover","timeline"] },
  { id: "attachments-media",  title: "Attachments & Media",   icon: Paperclip,     access: "all",                                                   summary: "Review deposit proof (screenshots and videos) uploaded by leads.", tags: ["attachments","deposit","proof","media","verify"] },
  { id: "knowledge-base",     title: "Knowledge Base",        icon: Books,         access: [UserRole.OWNER, UserRole.ADMIN],                         summary: "Build the AI's knowledge so it can answer lead questions accurately.", tags: ["knowledge","kb","ai","text","url","file","rag"] },
  { id: "command-menu",       title: "Command Menu",          icon: Terminal,      access: [UserRole.OWNER, UserRole.ADMIN],                         summary: "Configure the /commands leads can type in Telegram.",               tags: ["commands","telegram","slash","shortcuts"] },
  { id: "broadcast-messaging",title: "Broadcast Messaging",   icon: Megaphone,     access: [UserRole.OWNER, UserRole.ADMIN],                         summary: "Send a single message to all leads with a connected Telegram account.", tags: ["broadcast","messaging","bulk","telegram","campaign"] },
  { id: "users-invitations",  title: "Users & Invitations",   icon: UserPlus,      access: [UserRole.OWNER, UserRole.ADMIN, UserRole.SUPERADMIN],    summary: "Invite team members, assign roles, and manage access.",             tags: ["users","team","invite","roles","deactivate"] },
  { id: "audit-logs",         title: "Audit Logs",            icon: ClipboardText, access: [UserRole.OWNER, UserRole.ADMIN, UserRole.SUPERADMIN],    summary: "Track every important action taken in the CRM.",                   tags: ["audit","logs","history","security","compliance"] },
  { id: "system-configuration",title: "System Configuration", icon: Sliders,       access: [UserRole.OWNER, UserRole.ADMIN],                         summary: "Control bot behaviour, AI settings, and enable/disable features.", tags: ["config","settings","ai","bot","features","flags"] },
  { id: "bot-settings",       title: "Bot Settings",          icon: Gear,          access: [UserRole.OWNER, UserRole.SUPERADMIN],                    summary: "Control the bot's active status, reply templates, and safety settings.", tags: ["bot","telegram","templates","safety","hyde","admin"] },
  { id: "google-backup",      title: "Google & Backup",       icon: HardDrives,    access: [UserRole.SUPERADMIN],                                    summary: "Connect Google services and manage automated database backups.",    tags: ["backup","google","sheets","drive","recovery","cron"] },
  { id: "troubleshooting",    title: "Troubleshooting & FAQ", icon: Question,      access: "all",                                                   summary: "Solutions to common issues and answers to frequently asked questions.", tags: ["faq","troubleshooting","help","issues","errors"] },
];

// ─────────────────────────────────────────────────────────────────────────────
// Permissions matrix
// ─────────────────────────────────────────────────────────────────────────────

export const PERM_MATRIX: [string, string, string, string, string][] = [
  ["Login",                  "✅ Full",    "✅ Full",    "✅ Full",    "✅ Full"],
  ["Dashboard & Analytics",  "✅ Full",    "✅ Full",    "✅ Full",    "❌ None"],
  ["Lead Management",        "✅ Full",    "✅ Full",    "✅ Full",    "🔸 Limited"],
  ["Chat History",           "✅ Full",    "✅ Full",    "✅ Full",    "✅ Full"],
  ["Attachments",            "✅ Full",    "✅ Full",    "✅ Full",    "✅ Full"],
  ["Knowledge Base",         "✅ Full",    "✅ Full",    "✅ Full",    "❌ None"],
  ["Command Menu",           "✅ Full",    "✅ Full",    "✅ Full",    "❌ None"],
  ["Broadcast",              "✅ Full",    "✅ Full",    "✅ Full",    "❌ None"],
  ["User Management",        "✅ Full",    "✅ Full",    "🔸 Limited", "❌ None"],
  ["Audit Logs",             "✅ Full",    "✅ Full",    "✅ Full",    "❌ None"],
  ["System Config",          "✅ Full",    "✅ Full",    "✅ Full",    "❌ None"],
  ["Bot Settings",           "✅ Full",    "✅ Full",    "❌ None",    "❌ None"],
  ["Google Integrations",    "✅ Full",    "❌ None",    "❌ None",    "❌ None"],
  ["Backup & Recovery",      "✅ Full",    "❌ None",    "❌ None",    "❌ None"],
];

// ─────────────────────────────────────────────────────────────────────────────
// Chapter body components
// ─────────────────────────────────────────────────────────────────────────────

export function Ch01RolesPermissions({ role }: { role?: UserRole }) {
  return (
    <>
      <SectionH3>Role Overview</SectionH3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {[
          { r: "SUPERADMIN", style: "border-amber-500/30 bg-amber-500/5",   badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",  desc: "Platform-level administrator with full technical access. Manages system configuration, Google integrations, backups, and OWNER accounts. Typically a developer or platform operator." },
          { r: "OWNER",      style: "border-crimson/30 bg-crimson/5",       badge: "bg-crimson/10 text-crimson border-crimson/20",        desc: "IB business owner with nearly full access. Can manage leads, knowledge base, broadcasts, analytics, and team members. Has all features except Google integrations and backups." },
          { r: "ADMIN",      style: "border-blue-500/30 bg-blue-500/5",     badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",    desc: "Senior team member who can manage leads, knowledge base, commands, and broadcasts, and invite STAFF. Cannot access bot settings or system-level configuration." },
          { r: "STAFF",      style: "border-border-default bg-elevated/50", badge: "bg-elevated text-text-secondary border-border-default", desc: "Front-line team member with limited access. Can view leads, update lead statuses, view chat history, and manage attachments. Cannot access analytics, configuration, or broadcasts." },
        ].map((item) => (
          <div key={item.r} className={`rounded-xl border ${item.style} p-4`}>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-medium border ${item.badge} mb-2`}>{item.r}</span>
            <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      <ScreenshotPlaceholder caption="Settings → Team — role labels shown next to each user" />

      <SectionH3>Permissions Matrix</SectionH3>
      <div className="overflow-x-auto rounded-xl border border-border-subtle mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-elevated border-b border-border-subtle">
              <th className="text-left px-4 py-3 text-text-secondary font-medium">Feature</th>
              {["SUPERADMIN", "OWNER", "ADMIN", "STAFF"].map((h) => (
                <th key={h} className="text-center px-3 py-3 text-text-secondary font-medium font-mono text-xs">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERM_MATRIX.map(([feature, sa, owner, admin, staff], i) => (
              <tr key={feature} className={`border-b border-border-subtle last:border-0 ${i % 2 === 0 ? "bg-base" : "bg-elevated/30"}`}>
                <td className="px-4 py-2.5 text-text-primary font-sans">{feature}</td>
                {[sa, owner, admin, staff].map((val, vi) => (
                  <td key={vi} className="px-3 py-2.5 text-center text-xs">
                    <span className={val.startsWith("✅") ? "text-success" : val.startsWith("🔸") ? "text-warning" : "text-text-muted"}>{val}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ScreenshotPlaceholder caption="403 response — permissions enforced for unauthorised role access" />
    </>
  );
}

export function Ch02LoginSessions({ role }: { role?: UserRole }) {
  return (
    <>
      <SectionH3>Web Login</SectionH3>
      <StepList steps={[
        "Navigate to your dashboard URL in a web browser.",
        "Enter your email address and password in the login form.",
        "Click the Sign In button.",
        "You will be redirected to the CRM dashboard on successful authentication.",
      ]} />

      <SectionH3>Telegram Mini App (TMA) Login</SectionH3>
      <StepList steps={[
        "Open the CRM bot in Telegram.",
        "Tap the Open App button to launch the Mini App.",
        "If your Telegram account is already linked, you will be logged in automatically.",
        "If it is your first time, enter your email and password to bind your account.",
        "Future opens will auto-login without requiring credentials.",
      ]} />
      <Tip>
        If you see a{" "}
        <code className="font-mono text-xs bg-elevated px-1 py-0.5 rounded">TELEGRAM_NOT_LINKED</code>{" "}
        error, your Telegram account isn&apos;t bound yet — log in once with email and password to link it, and future opens will be automatic.
      </Tip>

      <SectionH3>Changing Your Password</SectionH3>
      <StepList steps={[
        "Go to Settings in the sidebar.",
        "Navigate to the Profile tab.",
        "Click Change Password.",
        "Enter your current password, then your new password.",
        "Confirm and save. You will remain logged in on all current sessions.",
      ]} />

      <SectionH3>Managing Sessions</SectionH3>
      <p className="text-text-secondary text-sm mb-4">
        Navigate to <strong className="text-text-primary">Settings → Sessions</strong> to view all active sessions. Each entry shows the device, IP address, and last active time. Click <strong className="text-text-primary">Revoke</strong> on any session to invalidate it immediately.
      </p>
      <ScreenshotPlaceholder caption="Login form — email and password fields with Sign In button" />
      <ScreenshotPlaceholder caption="Sessions tab — active sessions list with device info and revoke buttons" />
    </>
  );
}

export function Ch03DashboardAnalytics({ role }: { role?: UserRole }) {
  return (
    <>
      <SectionH3>Overview Widgets</SectionH3>
      <p className="text-text-secondary text-sm mb-4">
        The top of the dashboard shows four key metric cards:{" "}
        <strong className="text-text-primary">New Leads</strong>,{" "}
        <strong className="text-text-primary">Registered</strong>,{" "}
        <strong className="text-text-primary">Deposits / FTDs</strong>, and{" "}
        <strong className="text-text-primary">Active Conversations</strong>. Click any widget to drill into the filtered lead list for that metric.
      </p>

      <SectionH3>The Funnel</SectionH3>
      <p className="text-text-secondary text-sm mb-3">Leads move through a structured pipeline. Each stage represents a meaningful conversion milestone:</p>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {[
          { label: "NEW",               color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
          { label: "CONTACTED",         color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
          { label: "REGISTERED",        color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
          { label: "DEPOSIT_REPORTED",  color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
          { label: "DEPOSIT_CONFIRMED", color: "bg-success/10 text-success border-success/20" },
          { label: "CLOSED",            color: "bg-elevated text-text-muted border-border-default" },
        ].map((s, i, arr) => (
          <React.Fragment key={s.label}>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-medium border ${s.color}`}>{s.label}</span>
            {i < arr.length - 1 && <span className="text-text-muted text-xs">→</span>}
          </React.Fragment>
        ))}
      </div>

      <SectionH3>Date Range Filter</SectionH3>
      <p className="text-text-secondary text-sm mb-2">Use the date range selector at the top of the dashboard to filter all metrics. Available presets:</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {["Today", "Yesterday", "This Week", "This Month", "Last 30 Days", "Last 90 Days", "All Time"].map((d) => (
          <span key={d} className="px-2.5 py-1 rounded-lg bg-elevated border border-border-subtle text-xs text-text-secondary font-mono">{d}</span>
        ))}
      </div>

      <SectionH3>AI Score Leaderboard</SectionH3>
      <p className="text-text-secondary text-sm mb-3">The leaderboard lists your top leads sorted by AI engagement score. Scores indicate how conversion-ready a lead is:</p>
      <div className="flex gap-3 mb-4">
        {[
          { label: "Hot",  range: "≥ 70", c: "text-danger  bg-danger/10  border-danger/20" },
          { label: "Warm", range: "≥ 40", c: "text-warning bg-warning/10 border-warning/20" },
          { label: "Cold", range: "< 40",  c: "text-info   bg-info/10    border-info/20" },
        ].map((s) => (
          <div key={s.label} className={`flex-1 rounded-lg border px-3 py-2 text-center ${s.c}`}>
            <p className="text-sm font-bold">{s.label}</p>
            <p className="text-xs font-mono mt-0.5">{s.range}</p>
          </div>
        ))}
      </div>

      <SectionH3>Exporting Data</SectionH3>
      <p className="text-text-secondary text-sm mb-4">
        Click the <strong className="text-text-primary">Export CSV</strong> button at the top right of the dashboard to download the currently filtered dataset as a comma-separated values file, ready for import into Excel or Google Sheets.
      </p>
      <Warn>Dashboard data updates every few minutes. For real-time lead status, check the Lead list directly rather than relying on dashboard counters.</Warn>
      <ScreenshotPlaceholder caption="Dashboard overview — metric widgets and funnel visualisation" />
      <ScreenshotPlaceholder caption="AI score leaderboard and date range filter controls" />
    </>
  );
}

export function Ch04LeadManagement({ role }: { role?: UserRole }) {
  return (
    <>
      <SectionH3>Lead List</SectionH3>
      <p className="text-text-secondary text-sm mb-4">
        The lead list displays all leads with the following columns:{" "}
        <strong className="text-text-primary">Name</strong>,{" "}
        <strong className="text-text-primary">Telegram ID</strong>,{" "}
        <strong className="text-text-primary">Status</strong>,{" "}
        <strong className="text-text-primary">Registered</strong> (boolean),{" "}
        <strong className="text-text-primary">Deposit Balance</strong>,{" "}
        <strong className="text-text-primary">AI Score</strong>,{" "}
        <strong className="text-text-primary">Last Seen</strong>, and{" "}
        <strong className="text-text-primary">Handover</strong> toggle.
      </p>

      <SectionH3>Filtering & Search</SectionH3>
      <p className="text-text-secondary text-sm mb-4">
        Use the filter bar above the lead list to narrow results. Filter by{" "}
        <strong className="text-text-primary">status</strong>, search by{" "}
        <strong className="text-text-primary">name or email</strong>, filter by{" "}
        <strong className="text-text-primary">balance range</strong>, and toggle{" "}
        <strong className="text-text-primary">registered leads only</strong>. Multiple filters can be combined simultaneously.
      </p>

      <SectionH3>Lead Statuses</SectionH3>
      <div className="overflow-x-auto rounded-xl border border-border-subtle mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-elevated border-b border-border-subtle">
              <th className="text-left px-4 py-3 text-text-secondary font-medium w-44">Status</th>
              <th className="text-left px-4 py-3 text-text-secondary font-medium">Description</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["NEW",               "bg-blue-500/10 text-blue-400 border-blue-500/20",      "Lead just started a conversation with the bot. No contact made yet."],
              ["CONTACTED",         "bg-purple-500/10 text-purple-400 border-purple-500/20","Team has reached out or bot has initiated a conversation."],
              ["REGISTERED",        "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",       "Lead has completed account registration on the trading platform."],
              ["DEPOSIT_REPORTED",  "bg-amber-500/10 text-amber-400 border-amber-500/20",    "Lead submitted deposit proof (screenshot/video) for review."],
              ["DEPOSIT_CONFIRMED", "bg-success/10 text-success border-success/20",          "Deposit has been verified. Lead is a converted client."],
              ["CLOSED",            "bg-elevated text-text-muted border-border-default",    "Lead has been closed (no longer in active pipeline)."],
              ["LOST",              "bg-danger/10 text-danger border-danger/20",            "Lead disengaged or chose not to proceed."],
            ].map(([status, badge, desc], i) => (
              <tr key={status} className={`border-b border-border-subtle last:border-0 ${i % 2 === 0 ? "bg-base" : "bg-elevated/30"}`}>
                <td className="px-4 py-2.5"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono border ${badge}`}>{status}</span></td>
                <td className="px-4 py-2.5 text-text-secondary">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ScreenshotPlaceholder caption="Lead list — table view with filter bar and search" />

      <SectionH3>Lead Profile</SectionH3>
      <p className="text-text-secondary text-sm mb-4">
        Click any lead row to open the full lead profile. This displays: contact info (name, Telegram ID, email, phone), a complete activity timeline, deposit history, an AI-generated conversation summary, and a detailed AI score breakdown showing exactly why the score was assigned.
      </p>

      <SectionH3>Updating Status</SectionH3>
      <StepList steps={[
        "Open the lead profile by clicking a lead row.",
        "Find the Status dropdown in the lead profile header.",
        "Select the new status from the dropdown.",
        "Click Save to apply the change.",
        "Alternatively, select multiple leads with checkboxes and use Bulk Update Status.",
      ]} />

      <SectionH3>Handover Mode</SectionH3>
      <p className="text-text-secondary text-sm mb-4">
        Toggle the <strong className="text-text-primary">Handover</strong> switch on a lead to pause the bot and allow your team to reply manually. The bot will not send any automated responses while handover is active. Toggle it off to re-enable the bot for that lead.
      </p>

      <SectionH3>Bulk Actions</SectionH3>
      <p className="text-text-secondary text-sm mb-4">
        Select multiple leads using the checkboxes on the left of each row. A bulk action toolbar appears at the bottom with:{" "}
        <strong className="text-text-primary">Bulk Update Status</strong> and{" "}
        <strong className="text-text-primary">Bulk Toggle Handover</strong>. Ideal for batch-processing large segments of your pipeline.
      </p>
      <Tip>STAFF users can view leads and update statuses but cannot access analytics, configuration, or broadcasts. Contact your OWNER or ADMIN for a role upgrade if needed.</Tip>
      <ScreenshotPlaceholder caption="Lead profile panel — contact info, timeline, AI score breakdown" />
      <ScreenshotPlaceholder caption="Bulk select mode — checkbox selection with action toolbar" />
    </>
  );
}

export function Ch05InteractionsChat({ role }: { role?: UserRole }) {
  return (
    <>
      <SectionH3>Viewing Conversations</SectionH3>
      <p className="text-text-secondary text-sm mb-4">
        Open any lead profile and navigate to the{" "}
        <strong className="text-text-primary">Interactions</strong> tab. You will see a chronological timeline of all messages, bot replies, manual replies, and system events for that lead.
      </p>

      <SectionH3>Interaction Types</SectionH3>
      <div className="overflow-x-auto rounded-xl border border-border-subtle mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-elevated border-b border-border-subtle">
              <th className="text-left px-4 py-3 text-text-secondary font-medium w-44">Type</th>
              <th className="text-left px-4 py-3 text-text-secondary font-medium">Description</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["INCOMING",     "Message sent by the lead to the Telegram bot."],
              ["OUTGOING",     "Automated reply sent by the bot to the lead."],
              ["OWNER_REPLY",  "Manual reply sent from the dashboard by a team member."],
              ["STATUS_CHANGE","System event: the lead's status was updated."],
              ["HANDOVER_ON",  "Handover mode was enabled for this lead."],
              ["HANDOVER_OFF", "Handover mode was disabled; bot resumed."],
              ["AI_FALLBACK",  "The AI could not find a relevant answer and used a fallback response."],
            ].map(([type, desc], i) => (
              <tr key={type} className={`border-b border-border-subtle last:border-0 ${i % 2 === 0 ? "bg-base" : "bg-elevated/30"}`}>
                <td className="px-4 py-2.5"><code className="text-xs font-mono text-crimson">{type}</code></td>
                <td className="px-4 py-2.5 text-text-secondary">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SectionH3>Sending a Manual Reply</SectionH3>
      <StepList steps={[
        "Open the lead profile and ensure Handover Mode is toggled ON.",
        "Navigate to the Interactions tab.",
        "Type your message in the reply box at the bottom of the chat timeline.",
        "Click the send button or press Enter.",
        "Your message is delivered via Telegram and logged as OWNER_REPLY in the timeline.",
      ]} />
      <Tip>Always enable Handover Mode before sending manual replies. Without it, the bot may also respond to the lead simultaneously, causing duplicate messages.</Tip>
      <ScreenshotPlaceholder caption="Interactions tab — chronological conversation timeline with message types" />
      <ScreenshotPlaceholder caption="Manual reply box — text input at bottom of interactions panel" />
    </>
  );
}

export function Ch06AttachmentsMedia({ role }: { role?: UserRole }) {
  return (
    <>
      <SectionH3>How Leads Submit Proof</SectionH3>
      <p className="text-text-secondary text-sm mb-4">
        Leads submit deposit proof directly through the Telegram bot by sending a screenshot or video to the chat. The CRM automatically captures and stores the file, linking it to the lead&apos;s profile. No manual upload is required from the team.
      </p>

      <SectionH3>Viewing Attachments</SectionH3>
      <p className="text-text-secondary text-sm mb-4">
        Open any lead profile and navigate to the{" "}
        <strong className="text-text-primary">Attachments</strong> tab. Files are displayed in a thumbnail grid. Click any thumbnail to open the full-size viewer.
      </p>

      <SectionH3>Supported File Types</SectionH3>
      <div className="flex flex-wrap gap-2 mb-4">
        {["JPEG", "PNG", "WebP", "MP4 Video", "PDF"].map((t) => (
          <span key={t} className="px-2.5 py-1 rounded-lg bg-elevated border border-border-subtle text-xs text-text-secondary font-mono">{t}</span>
        ))}
      </div>

      <SectionH3>Verifying a Deposit</SectionH3>
      <StepList steps={[
        "Open the lead profile and go to the Attachments tab.",
        "Click on the deposit proof thumbnail to view the full file.",
        "Confirm that the deposit details (amount, account number) match your records.",
        "Click the Verify button on the attachment.",
        "The lead status automatically updates to DEPOSIT_CONFIRMED and is logged in the Audit Log.",
      ]} />
      <Warn>Once verified, the deposit confirmation is recorded in the Audit Log and cannot be undone automatically. To reverse, manually update the lead status and note the correction.</Warn>
      <ScreenshotPlaceholder caption="Attachments tab — thumbnail grid of uploaded deposit proofs" />
      <ScreenshotPlaceholder caption="Full-size attachment viewer with Verify button" />
    </>
  );
}

export function Ch07KnowledgeBase({ role }: { role?: UserRole }) {
  return (
    <>
      <SectionH3>What the Knowledge Base Does</SectionH3>
      <p className="text-text-secondary text-sm mb-4">
        Every active Knowledge Base entry is embedded as a vector and retrieved by the AI when a lead asks a question. The AI searches for relevant entries and uses them to construct accurate, on-brand answers. A richer Knowledge Base means better, more accurate bot responses.
      </p>

      <SectionH3>Entry Types</SectionH3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {[
          { type: "TEXT", desc: "Write content manually. Best for FAQs, policies, and product descriptions." },
          { type: "URL",  desc: "Paste a URL and the system scrapes and processes the page content automatically." },
          { type: "FILE", desc: "Upload a PDF or DOCX document. Content is extracted and indexed." },
        ].map((item) => (
          <div key={item.type} className="rounded-xl border border-border-default bg-elevated/50 p-4">
            <code className="text-xs font-mono text-crimson">{item.type}</code>
            <p className="text-sm text-text-secondary mt-1.5 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      <SectionH3>Adding a Text Entry</SectionH3>
      <StepList steps={[
        "Navigate to Knowledge Base in the sidebar.",
        "Click Add Entry.",
        "Select the Text tab.",
        "Fill in the Title and Body fields with your content.",
        "Click Save. The entry begins processing immediately.",
      ]} />

      <SectionH3>Adding a URL Entry</SectionH3>
      <StepList steps={[
        "Navigate to Knowledge Base → Add Entry → URL tab.",
        "Paste the full URL of the page you want to index.",
        "Click Save. The system will scrape and process the content automatically.",
      ]} />

      <SectionH3>Uploading a File</SectionH3>
      <StepList steps={[
        "Navigate to Knowledge Base → Add Entry → File tab.",
        "Drag and drop a PDF or DOCX file into the upload zone, or click to browse.",
        "Click Upload. The document is processed in the background.",
      ]} />

      <SectionH3>Entry Statuses</SectionH3>
      <div className="flex flex-wrap gap-2 mb-3">
        {[
          { s: "PENDING",    c: "bg-elevated text-text-muted border-border-default" },
          { s: "PROCESSING", c: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
          { s: "ACTIVE",     c: "bg-success/10 text-success border-success/20" },
          { s: "FAILED",     c: "bg-danger/10 text-danger border-danger/20" },
        ].map(({ s, c }) => (
          <span key={s} className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono border ${c}`}>{s}</span>
        ))}
      </div>
      <p className="text-text-secondary text-sm mb-4">
        Entries progress from{" "}
        <code className="font-mono text-xs text-text-muted">PENDING</code> →{" "}
        <code className="font-mono text-xs text-amber-400">PROCESSING</code> →{" "}
        <code className="font-mono text-xs text-success">ACTIVE</code>. Failed entries must be deleted and re-created.
      </p>

      <SectionH3>Enable / Disable Entries</SectionH3>
      <p className="text-text-secondary text-sm mb-4">
        Toggle the switch on any KB entry to include or exclude it from AI retrieval without permanently deleting it. Disabled entries are ignored by the AI until re-enabled.
      </p>
      <Tip>Disable entries during testing or review so they don&apos;t affect live bot responses while you refine the content.</Tip>
      <ScreenshotPlaceholder caption="Knowledge Base list — entries with status badges and enable/disable toggles" />
      <ScreenshotPlaceholder caption="Add Entry dialog — tabs for Text, URL, and File upload" />
    </>
  );
}

export function Ch08CommandMenu({ role }: { role?: UserRole }) {
  return (
    <>
      <SectionH3>What Commands Do</SectionH3>
      <p className="text-text-secondary text-sm mb-4">
        Telegram bot commands are shortcuts that begin with{" "}
        <code className="font-mono text-xs bg-elevated px-1 py-0.5 rounded text-crimson">/</code>. When a lead types a command (e.g.{" "}
        <code className="font-mono text-xs bg-elevated px-1 py-0.5 rounded">/register</code>), the bot immediately sends the pre-configured reply — no AI processing required. Use commands for frequently requested links, instructions, or information.
      </p>

      <SectionH3>Viewing Commands</SectionH3>
      <p className="text-text-secondary text-sm mb-4">
        Navigate to <strong className="text-text-primary">Settings → Commands</strong> to see the full list of configured commands, their descriptions, and their reply content.
      </p>

      <SectionH3>Creating a Command</SectionH3>
      <StepList steps={[
        "Click Add Command in the Commands tab.",
        "Enter the command name (e.g. register) — no leading slash needed.",
        "Enter a short description shown in Telegram's command list.",
        "Enter the full reply text the bot will send when the command is used.",
        "Click Save. The command syncs to Telegram automatically within seconds.",
      ]} />

      <SectionH3>Editing a Command</SectionH3>
      <p className="text-text-secondary text-sm mb-4">
        Click the <strong className="text-text-primary">edit icon</strong> next to any command to open the edit form. Update any fields and click Save. Changes sync to Telegram immediately.
      </p>

      <SectionH3>Deleting a Command</SectionH3>
      <p className="text-text-secondary text-sm mb-4">
        Click the <strong className="text-text-primary">delete icon</strong> on a command and confirm the deletion. The command is removed from the Telegram bot menu immediately.
      </p>
      <ScreenshotPlaceholder caption="Commands list — configured /commands with descriptions and edit/delete actions" />
      <ScreenshotPlaceholder caption="Add Command form — command name, description, and reply text fields" />
    </>
  );
}

export function Ch09BroadcastMessaging({ role }: { role?: UserRole }) {
  return (
    <>
      <SectionH3>What a Broadcast Is</SectionH3>
      <p className="text-text-secondary text-sm mb-4">
        A broadcast sends one message to all leads simultaneously — every lead with a connected Telegram account will receive it. Use broadcasts for announcements, promotional campaigns, platform updates, or re-engagement campaigns.
      </p>

      <SectionH3>Composing a Broadcast</SectionH3>
      <StepList steps={[
        "Navigate to Broadcasts in the sidebar.",
        "Click New Broadcast.",
        "Type your message in the text area (maximum 4,096 characters, Telegram's limit).",
        "Optionally add a photo by pasting an image URL.",
        "Review your message in the preview panel.",
      ]} />

      <SectionH3>Sending</SectionH3>
      <StepList steps={[
        "Click Send to All.",
        "A confirmation dialog shows the exact number of recipients.",
        "Click Confirm to enqueue the broadcast.",
        "The system processes and dispatches messages in the background.",
      ]} />

      <SectionH3>Broadcast History</SectionH3>
      <p className="text-text-secondary text-sm mb-4">
        View all past broadcasts in the Broadcasts page. Each entry shows: message preview, status (
        <code className="font-mono text-xs text-text-muted">QUEUED</code> /{" "}
        <code className="font-mono text-xs text-amber-400">SENDING</code> /{" "}
        <code className="font-mono text-xs text-success">SENT</code> /{" "}
        <code className="font-mono text-xs text-danger">FAILED</code>), recipient count, and timestamp.
      </p>
      <Warn>Broadcasts send to ALL connected leads simultaneously. There is no way to undo or recall a broadcast once confirmed. Always review your message carefully before confirming.</Warn>
      <Warn>If the broadcast button is disabled or you receive a 403 error, the Broadcast feature has been turned off in System Configuration by your SUPERADMIN. Contact them to re-enable it.</Warn>
      <ScreenshotPlaceholder caption="New Broadcast form — message input with character counter and photo URL field" />
      <ScreenshotPlaceholder caption="Broadcast history list — past broadcasts with status badges and recipient counts" />
    </>
  );
}

export function Ch10UsersInvitations({ role }: { role?: UserRole }) {
  return (
    <>
      <SectionH3>Viewing Users</SectionH3>
      <p className="text-text-secondary text-sm mb-4">
        Navigate to <strong className="text-text-primary">Settings → Team</strong> to see all users with their role, status (active / inactive), and last login timestamp.
      </p>

      <SectionH3>Inviting a New Member</SectionH3>
      <StepList steps={[
        "Click Invite User in the Team tab.",
        "Enter the team member's email address.",
        "Select the role to assign (see Role Limits below).",
        "Click Send Invitation.",
        "The invitee receives an email with a setup link to create their password.",
      ]} />

      <SectionH3>Resending an Invitation</SectionH3>
      <p className="text-text-secondary text-sm mb-4">
        If the invitee hasn&apos;t accepted yet, click <strong className="text-text-primary">Resend</strong> next to their pending invite in the Team tab. A new invitation email will be dispatched.
      </p>

      <SectionH3>Revoking an Invitation</SectionH3>
      <p className="text-text-secondary text-sm mb-4">
        Cancel a pending invite by clicking <strong className="text-text-primary">Revoke</strong> next to it. This invalidates the setup link before the invitee can use it.
      </p>

      <SectionH3>Deactivating & Reactivating a User</SectionH3>
      <p className="text-text-secondary text-sm mb-4">
        Click the menu (<strong className="text-text-primary">⋯</strong>) on any active user and select <strong className="text-text-primary">Deactivate</strong>. The user immediately loses access to the CRM. To restore access, click <strong className="text-text-primary">Reactivate</strong> on a deactivated user.
      </p>

      <SectionH3>Role Limits</SectionH3>
      <SimpleTable headers={["Your Role", "Can Invite / Manage"]} rows={[
        ["SUPERADMIN", "OWNER, ADMIN, STAFF"],
        ["OWNER",      "ADMIN, STAFF"],
        ["ADMIN",      "STAFF only"],
        ["STAFF",      "No user management access"],
      ]} />
      <ScreenshotPlaceholder caption="Team tab — users list with roles, status, and last login" />
      <ScreenshotPlaceholder caption="Invite User dialog — email input and role selector" />
    </>
  );
}

export function Ch11AuditLogs({ role }: { role?: UserRole }) {
  return (
    <>
      <SectionH3>What&apos;s Tracked</SectionH3>
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          "USER_CREATED", "USER_DEACTIVATED", "USER_REACTIVATED", "USER_ROLE_CHANGED",
          "PASSWORD_CHANGED", "LEAD_STATUS_CHANGED", "LEAD_VERIFIED",
          "KB_CREATED", "KB_UPDATED", "KB_DELETED",
          "COMMAND_MENU_CREATED", "COMMAND_MENU_UPDATED", "COMMAND_MENU_DELETED",
          "SYSTEM_CONFIG_CHANGED",
        ].map((a) => (
          <code key={a} className="text-xs font-mono px-2 py-1 rounded bg-elevated border border-border-subtle text-text-secondary">{a}</code>
        ))}
      </div>

      <SectionH3>Viewing Logs</SectionH3>
      <p className="text-text-secondary text-sm mb-4">
        Navigate to <strong className="text-text-primary">Audit Logs</strong> in the sidebar. Logs are displayed in reverse-chronological order. Each entry shows: the actor (who did it), the action type, the affected resource, and the exact timestamp.
      </p>

      <SectionH3>Filtering</SectionH3>
      <p className="text-text-secondary text-sm mb-4">
        Use the filter controls to narrow logs by{" "}
        <strong className="text-text-primary">user</strong>,{" "}
        <strong className="text-text-primary">action type</strong>, or{" "}
        <strong className="text-text-primary">date range</strong>. Combine multiple filters to find specific events quickly.
      </p>

      <SectionH3>Before / After Values</SectionH3>
      <p className="text-text-secondary text-sm mb-4">
        Expand any log entry by clicking on it to see the full before-and-after diff. For example, a{" "}
        <code className="font-mono text-xs text-crimson">LEAD_STATUS_CHANGED</code> entry shows the previous status and the new status side by side.
      </p>

      <SectionH3>Privacy Note</SectionH3>
      <div className="rounded-lg border border-border-subtle bg-elevated/50 px-4 py-3 text-sm text-text-secondary mb-4">
        By design, <strong className="text-text-primary">OWNER</strong> and{" "}
        <strong className="text-text-primary">ADMIN</strong> users cannot see audit log entries generated by{" "}
        <strong className="text-text-primary">SUPERADMIN</strong> users. This is intentional to separate platform-level operations from business-level activity.
      </div>
      <ScreenshotPlaceholder caption="Audit Logs list — chronological entries with actor, action, and timestamp" />
      <ScreenshotPlaceholder caption="Audit log entry expanded — before/after diff view" />
    </>
  );
}

export function Ch12SystemConfiguration({ role }: { role?: UserRole }) {
  return (
    <>
      <SectionH3>Feature Flags</SectionH3>
      <p className="text-text-secondary text-sm mb-3">Toggle switches in System Configuration control which features are available across the entire platform:</p>
      <div className="space-y-2 mb-4">
        {[
          { name: "Knowledge Base Enabled", desc: "Allow the AI to use KB entries when formulating responses." },
          { name: "Broadcast Enabled",      desc: "Allow OWNER/ADMIN users to send broadcast messages." },
          { name: "Command Menu Enabled",   desc: "Allow leads to use /commands in Telegram." },
        ].map((f) => (
          <div key={f.name} className="flex items-start gap-3 rounded-lg border border-border-subtle bg-elevated/40 px-4 py-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-text-primary">{f.name}</p>
              <p className="text-xs text-text-muted mt-0.5">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <SectionH3>Maintenance Mode</SectionH3>
      <p className="text-text-secondary text-sm mb-4">
        Enable Maintenance Mode to pause the bot and display a maintenance banner across the dashboard for all users. Set a custom maintenance message to inform your team of what&apos;s happening and the expected resolution time.
      </p>

      <SectionH3>Bot Settings</SectionH3>
      <div className="space-y-2 mb-4">
        {[
          ["System Prompt",    "Instructions that define how the bot speaks and behaves."],
          ["Welcome Message",  "The first message sent to a new lead who starts a conversation."],
          ["Handover Message", "Message sent to a lead when handover mode is activated."],
          ["Registration URL", "The link shared when a lead asks how to register."],
          ["Deposit Form URL", "The link shared when a lead wants to make a deposit."],
        ].map(([field, desc]) => (
          <div key={field} className="flex items-start gap-3">
            <code className="text-xs font-mono text-crimson bg-crimson/5 border border-crimson/20 px-2 py-1 rounded whitespace-nowrap mt-0.5">{field}</code>
            <p className="text-sm text-text-secondary">{desc}</p>
          </div>
        ))}
      </div>

      <SectionH3>AI Settings</SectionH3>
      <div className="space-y-2 mb-4">
        {[
          ["Max Tokens",           "Maximum length of AI-generated responses."],
          ["Context Messages",     "Number of previous messages included for context."],
          ["Similarity Threshold", "Minimum relevance score for KB retrieval (RAG accuracy)."],
          ["Rate Limit / Min",     "Maximum messages a lead can send per minute before triggering the rate limit."],
        ].map(([field, desc]) => (
          <div key={field} className="flex items-start gap-3">
            <code className="text-xs font-mono text-blue-400 bg-blue-500/5 border border-blue-500/20 px-2 py-1 rounded whitespace-nowrap mt-0.5">{field}</code>
            <p className="text-sm text-text-secondary">{desc}</p>
          </div>
        ))}
      </div>

      <SectionH3>Persona</SectionH3>
      <p className="text-text-secondary text-sm mb-4">
        Configure how the bot introduces itself:{" "}
        <strong className="text-text-primary">Bot Name</strong>,{" "}
        <strong className="text-text-primary">Role Title</strong> (e.g. &ldquo;Account Manager&rdquo;), and{" "}
        <strong className="text-text-primary">Brand Name</strong>. These values are injected into the system prompt to give the bot a consistent identity.
      </p>
      <Warn>Changes to the System Prompt or AI settings take effect immediately and change bot behaviour for all new conversations. Test changes carefully before saving in production.</Warn>
      <ScreenshotPlaceholder caption="System Configuration — feature flag toggles and maintenance mode switch" />
      <ScreenshotPlaceholder caption="Bot Settings form — system prompt, welcome message, and URL fields" />
    </>
  );
}

export function Ch13BotSettings({ role }: { role?: UserRole }) {
  return (
    <>
      <SectionH3>Bot Active Toggle</SectionH3>
      <p className="text-text-secondary text-sm mb-4">
        The <strong className="text-text-primary">Bot Active</strong> toggle completely enables or disables the Telegram bot. When turned off, all incoming messages from leads are silently ignored — no replies are sent and no interactions are logged. Use this during maintenance or emergencies.
      </p>

      <SectionH3>Reply Templates</SectionH3>
      <p className="text-text-secondary text-sm mb-3">Configure canned responses for these system events:</p>
      <div className="space-y-2 mb-4">
        {[
          ["Rate Limit Exceeded",        "Sent when a lead messages too frequently."],
          ["Injection Attempt Detected", "Sent when a lead's message is flagged as a prompt injection attempt."],
          ["Session Cleared",            "Sent when a lead's conversation context is reset."],
          ["Handover Notice",            "Sent to inform a lead that a human is now handling the conversation."],
          ["File Received Confirmation", "Sent when a lead successfully uploads an attachment."],
          ["File Processing Status",     "Sent to update the lead on their file processing progress."],
        ].map(([event, desc]) => (
          <div key={event} className="flex items-start gap-3 rounded-lg border border-border-subtle bg-elevated/40 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-text-primary">{event}</p>
              <p className="text-xs text-text-muted mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <SectionH3>Rate Limiting</SectionH3>
      <p className="text-text-secondary text-sm mb-4">
        Set a <strong className="text-text-primary">time window (seconds)</strong> and a{" "}
        <strong className="text-text-primary">max messages per window</strong>. Leads who send more messages than the limit within the window will receive the rate limit reply and no AI response until the window resets.
      </p>

      <SectionH3>Suspicion Detection</SectionH3>
      <p className="text-text-secondary text-sm mb-4">
        Configure a <strong className="text-text-primary">max strikes</strong> count and a{" "}
        <strong className="text-text-primary">strike window</strong>. If a lead sends messages detected as suspicious or injection attempts within the window, they are flagged and receive the injection detection reply.
      </p>

      <SectionH3>HyDE — Hypothetical Document Embedding</SectionH3>
      <p className="text-text-secondary text-sm mb-4">
        HyDE is an AI technique where the model first generates a hypothetical ideal answer, then uses that as the search query against the Knowledge Base. This significantly improves retrieval quality for abstract or indirect questions.{" "}
        <strong className="text-text-primary">Enable</strong> for better KB results;{" "}
        <strong className="text-text-primary">disable</strong> for faster but less nuanced retrieval.
      </p>

      <SectionH3>Admin Telegram Commands</SectionH3>
      <p className="text-text-secondary text-sm mb-3">Admin users can control the CRM directly from their personal Telegram chat with the bot:</p>
      <div className="rounded-xl border border-border-subtle overflow-hidden mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-elevated border-b border-border-subtle">
              <th className="text-left px-4 py-3 text-text-secondary font-medium">Command</th>
              <th className="text-left px-4 py-3 text-text-secondary font-medium">Description</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["/adminstats [week|month]",      "Get pipeline statistics for the given period."],
              ["/adminlead <id>",               "Look up a specific lead by ID."],
              ["/adminsetstatus <id> <STATUS>", "Update a lead's status directly from Telegram."],
              ["/adminhandover <id> on|off",    "Toggle handover mode for a lead via Telegram."],
              ["/adminhelp",                    "List all available admin commands."],
            ].map(([cmd, desc], i) => (
              <tr key={cmd} className={`border-b border-border-subtle last:border-0 ${i % 2 === 0 ? "bg-base" : "bg-elevated/30"}`}>
                <td className="px-4 py-2.5"><code className="text-xs font-mono text-crimson">{cmd}</code></td>
                <td className="px-4 py-2.5 text-text-secondary">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ScreenshotPlaceholder caption="Bot Settings — active toggle, rate limiting, and suspicion detection config" />
      <ScreenshotPlaceholder caption="Reply Templates section — editable canned response text areas" />
    </>
  );
}

export function Ch14GoogleBackup({ role }: { role?: UserRole }) {
  return (
    <>
      <SectionH3>Google Sheets Integration</SectionH3>
      <StepList steps={[
        "Navigate to Admin → Google in the sidebar.",
        "Click Connect Google Sheets.",
        "Complete the OAuth authorisation flow in the popup.",
        "Select the Google Sheet to use as the data export destination.",
        "CRM data will sync to the sheet on the configured schedule.",
      ]} />

      <SectionH3>Google Drive Integration</SectionH3>
      <StepList steps={[
        "Navigate to Admin → Google in the sidebar.",
        "Click Connect Google Drive.",
        "Complete the OAuth authorisation flow.",
        "Select the Drive folder to use as the cloud storage destination.",
        "Uploaded attachments and exports will be stored in this folder.",
      ]} />

      <SectionH3>Enabling Automated Backup</SectionH3>
      <StepList steps={[
        "Navigate to Admin → Backup.",
        "Toggle Backup Enabled on.",
        "Set the backup schedule using cron format (e.g. 0 2 * * * for 2:00 AM daily).",
        "Set the retention period in days — older backups are automatically deleted.",
        "Save the configuration.",
      ]} />
      <Tip>
        A recommended backup schedule is{" "}
        <code className="font-mono text-xs bg-elevated px-1 py-0.5 rounded">0 2 * * *</code>{" "}
        (every day at 2:00 AM) with a 30-day retention period to balance safety and storage cost.
      </Tip>

      <SectionH3>Triggering a Manual Backup</SectionH3>
      <p className="text-text-secondary text-sm mb-4">
        Click <strong className="text-text-primary">Backup Now</strong> to trigger an immediate backup. A confirmation dialog will show the destination and estimated size. Click Confirm to start the backup job in the background.
      </p>

      <SectionH3>Backup History</SectionH3>
      <p className="text-text-secondary text-sm mb-4">
        The backup history table shows each backup with: date and time, file size, destination (S3 or Google Drive), and status (
        <code className="font-mono text-xs text-success">COMPLETED</code> or{" "}
        <code className="font-mono text-xs text-danger">FAILED</code>).
      </p>
      <Warn>Restoring a backup requires server-level access and cannot be performed from the dashboard. Contact your system administrator to initiate a restore procedure.</Warn>
      <ScreenshotPlaceholder caption="Google integrations — Sheets and Drive OAuth connection status" />
      <ScreenshotPlaceholder caption="Backup configuration — cron schedule, retention days, and backup history table" />
    </>
  );
}

export function Ch15Troubleshooting({ role }: { role?: UserRole }) {
  const faqs = [
    { q: "Bot is not responding to leads", a: "Check the Bot Active toggle in Bot Settings — it may have been turned off. Also verify that Maintenance Mode is not enabled in System Configuration. If the bot is active but still unresponsive, check the rate limit settings and confirm the Telegram webhook is connected." },
    { q: '"Broadcast feature is currently disabled" error', a: "This means the Broadcast feature flag has been disabled in System Configuration. Contact your SUPERADMIN and ask them to enable the feature.broadcast.enabled setting." },
    { q: '"Insufficient permissions" error', a: "Your current role does not have access to the feature you are trying to use. Refer to the Permissions Matrix in Chapter 1 to understand what your role can access. Contact your OWNER or ADMIN to request a role upgrade if needed." },
    { q: "Lead status is not updating", a: "Confirm you are logged in as OWNER, ADMIN, or STAFF with the correct permissions. If the problem persists, try refreshing the page — status updates require an active internet connection." },
    { q: "Invitation email was not received", a: "Ask the invitee to check their spam or junk folder first. If the email is not there, an OWNER or ADMIN can resend the invitation from Settings → Team by clicking Resend next to the pending invite." },
    { q: "Session expired and I cannot log in", a: "Clear your browser cookies and cache, then navigate to the login page and sign in fresh. For the Telegram Mini App, close and re-open the app from Telegram. If you are still unable to log in, contact your OWNER or ADMIN." },
    { q: 'Knowledge Base entry is stuck on "PENDING"', a: "Processing typically takes 1–2 minutes for most content and up to 5 minutes for large files. If an entry has been PENDING for more than 5 minutes, delete it and re-upload. If the issue persists, check with your SUPERADMIN that the embedding service is running." },
    { q: "Dashboard analytics showing zero for all metrics", a: "Check the date range filter — it may be set to a period with no data. Try switching to All Time. Dashboard data is updated every few minutes, so very recent leads may not appear immediately." },
    { q: "Can I undo a status change?", a: "Yes. Open the lead profile and change the status back to the previous value manually. All status changes are recorded in the Audit Logs, so you always have a complete history of what was changed and when." },
    { q: "Where do I find my bot's Telegram username?", a: "The Telegram bot username was configured during initial platform setup by your SUPERADMIN. Check with them or look in Bot Settings — the username is tied to the configured bot token." },
  ];
  return (
    <>
      <div className="space-y-4">
        {faqs.map(({ q, a }, i) => (
          <div key={i} className="rounded-xl border border-border-subtle bg-elevated/30 p-5">
            <div className="flex gap-3 items-start">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-crimson/10 text-crimson text-xs font-mono font-bold flex items-center justify-center mt-0.5">Q</span>
              <p className="text-sm font-semibold text-text-primary">{q}</p>
            </div>
            <div className="flex gap-3 items-start mt-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-success/10 text-success text-xs font-mono font-bold flex items-center justify-center mt-0.5">A</span>
              <p className="text-sm text-text-secondary leading-relaxed">{a}</p>
            </div>
          </div>
        ))}
      </div>
      <ScreenshotPlaceholder caption="Bot Settings — Bot Active toggle and webhook status indicator" />
      <ScreenshotPlaceholder caption="System Configuration — feature flags and maintenance mode toggle" />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Chapter body map — used by both DocsClient and MobileDocsPage
// ─────────────────────────────────────────────────────────────────────────────

export const CHAPTER_BODY_MAP: Record<string, React.FC<{ role?: UserRole }>> = {
  "roles-permissions":   Ch01RolesPermissions,
  "login-sessions":      Ch02LoginSessions,
  "dashboard-analytics": Ch03DashboardAnalytics,
  "lead-management":     Ch04LeadManagement,
  "interactions-chat":   Ch05InteractionsChat,
  "attachments-media":   Ch06AttachmentsMedia,
  "knowledge-base":      Ch07KnowledgeBase,
  "command-menu":        Ch08CommandMenu,
  "broadcast-messaging": Ch09BroadcastMessaging,
  "users-invitations":   Ch10UsersInvitations,
  "audit-logs":          Ch11AuditLogs,
  "system-configuration":Ch12SystemConfiguration,
  "bot-settings":        Ch13BotSettings,
  "google-backup":       Ch14GoogleBackup,
  "troubleshooting":     Ch15Troubleshooting,
};

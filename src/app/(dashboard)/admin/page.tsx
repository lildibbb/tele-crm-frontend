"use client";

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
gsap.registerPlugin(useGSAP);
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useT, K } from "@/i18n";

import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";

import { useAuthStore } from "@/store/authStore";
import { useSuperadminStore } from "@/store/superadminStore";
import { useSystemConfigStore } from "@/store/systemConfigStore";
import { useMaintenanceStore } from "@/store/maintenanceStore";
import { UserRole, AuditAction } from "@/types/enums";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";

import {
  Users,
  Pulse,
  PencilSimple,
  ProhibitInset,
  LockKey,
  UserPlus,
  Gear,
  ShieldStar,
  CheckCircle,
  ArrowClockwise,
  Database,
  Brain,
  Lightning,
  ArrowCounterClockwise,
  Warning,
  X,
  ChatText,
  DotsThreeVertical,
  CaretDown,
  Sliders,
  Robot,
  Timer,
  ShieldCheck,
  Cpu,
} from "@phosphor-icons/react";

import {
  auditIconMap as auditIconMapShared,
  auditColorMap as auditColorMapShared,
  formatAuditAction,
  auditFallbackIcon,
} from "@/lib/audit-utils";

import type { UserResponse } from "@/lib/schemas/user.schema";
import type { AuditLog } from "@/lib/schemas/auditLog.schema";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileAdminDashboard } from "@/components/mobile";
import { BackupPanel } from "@/components/superadmin/backup-panel";
import { SecretsPanel } from "@/components/superadmin/secrets-panel";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const auditIconMap = auditIconMapShared;
const auditColorMap = auditColorMapShared;

// ─── Sub-components ───────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: string }) {
  const cls: Record<string, string> = {
    SUPERADMIN: "badge badge-owner",
    OWNER: "badge badge-owner",
    ADMIN: "badge badge-admin",
    STAFF: "badge badge-staff",
  };
  return <span className={cls[role] ?? "badge"}>{role}</span>;
}

function StatusDot({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium ${active ? "text-success" : "text-danger"}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${active ? "bg-success" : "bg-danger"}`}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

interface KpiTileProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub: string;
  accent: "info" | "success" | "gold" | "crimson";
  loading?: boolean;
}

const ACCENT_COLORS: Record<string, { bg: string; text: string; grad: string }> = {
  info:    { bg: "bg-info/10",        text: "text-info",        grad: "color-mix(in srgb, var(--color-info) 9%, transparent)"    },
  success: { bg: "bg-success/10",     text: "text-success",     grad: "color-mix(in srgb, var(--color-success) 9%, transparent)" },
  gold:    { bg: "bg-[--gold]/10",    text: "text-[--gold]",    grad: "color-mix(in srgb, var(--color-gold) 9%, transparent)"    },
  crimson: { bg: "bg-[--crimson]/10", text: "text-[--crimson]", grad: "color-mix(in srgb, var(--color-crimson) 9%, transparent)" },
};

function KpiTile({ icon: Icon, label, value, sub, accent, loading }: KpiTileProps) {
  const { bg, text, grad } = ACCENT_COLORS[accent];
  return (
    <div
      className="kpi-tile bg-elevated rounded-xl p-5"
      style={{ backgroundImage: `linear-gradient(135deg, ${grad} 0%, transparent 65%)` }}
    >
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-32" />
        </div>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-text-secondary mb-1.5">{label}</p>
            <p className={`text-2xl font-bold data-mono ${text}`}>{value}</p>
            <p className="text-xs text-text-muted mt-1.5">{sub}</p>
          </div>
          <div className={`rounded-lg p-2 shrink-0 ${bg}`}>
            <Icon className={text} weight="duotone" size={22} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Column Definitions ───────────────────────────────────────────────────────

interface UserColumnsProps {
  onEdit: (u: UserResponse) => void;
  onPassword: (u: UserResponse) => void;
  onToggle: (u: UserResponse) => void;
  currentUserId: string;
}

function getUserColumns({
  onEdit,
  onPassword,
  onToggle,
  currentUserId,
}: UserColumnsProps): ColumnDef<UserResponse>[] {
  return [
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Email" />
      ),
      cell: ({ row }) => (
        <span className="text-sm font-medium text-text-primary data-mono">
          {row.original.email}
        </span>
      ),
      enableSorting: true,
      meta: {
        label: "Email",
        variant: "text",
        placeholder: "Search email…",
      },
    },
    {
      accessorKey: "role",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Role" />
      ),
      cell: ({ row }) => <RoleBadge role={row.original.role} />,
      enableSorting: false,
      filterFn: (row, _id, filterValues: string[]) => {
        if (!filterValues.length) return true;
        return filterValues.includes(row.original.role);
      },
      meta: {
        label: "Role",
        variant: "multiSelect",
        options: [
          { label: "Superadmin", value: UserRole.SUPERADMIN },
          { label: "Owner", value: UserRole.OWNER },
          { label: "Admin", value: UserRole.ADMIN },
          { label: "Staff", value: UserRole.STAFF },
        ],
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => <StatusDot active={row.original.isActive} />,
      enableSorting: false,
      enableColumnFilter: false,
    },
    {
      accessorKey: "lastLoginAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Last Login" />
      ),
      cell: ({ row }) => (
        <span className="text-xs text-text-muted">
          {row.original.lastLoginAt ? timeAgo(row.original.lastLoginAt) : "Never"}
        </span>
      ),
      enableSorting: true,
      enableColumnFilter: false,
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const u = row.original;
        const isSelf = u.id === currentUserId;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-text-secondary hover:text-text-primary"
              >
                <DotsThreeVertical size={16} weight="bold" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                onClick={() => onEdit(u)}
                disabled={isSelf}
                className="gap-2"
              >
                <PencilSimple size={14} className="text-gold" weight="duotone" />
                Change Role
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPassword(u)} className="gap-2">
                <LockKey size={14} className="text-warning" weight="duotone" />
                Reset Password
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onToggle(u)}
                disabled={isSelf}
                className={`gap-2 ${u.isActive ? "text-danger focus:text-danger" : "text-success focus:text-success"}`}
              >
                {u.isActive ? (
                  <ProhibitInset size={14} weight="duotone" />
                ) : (
                  <ArrowCounterClockwise size={14} weight="duotone" />
                )}
                {u.isActive ? "Deactivate" : "Reactivate"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      enableSorting: false,
      enableColumnFilter: false,
      enableHiding: false,
    },
  ];
}

function getAuditColumns(): ColumnDef<AuditLog>[] {
  return [
    {
      accessorKey: "action",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Action" />
      ),
      cell: ({ row }) => {
        const action = row.original.action;
        const IconComp = auditIconMap[action] ?? auditFallbackIcon;
        const colorCls = auditColorMap[action] ?? "text-text-secondary";
        return (
          <div className="flex items-center gap-2">
            <IconComp size={14} weight="duotone" className={colorCls} />
            <span className="text-xs font-medium text-text-primary">
              {formatAuditAction(action)}
            </span>
          </div>
        );
      },
      enableSorting: false,
      filterFn: (row, _id, filterValues: string[]) => {
        if (!filterValues.length) return true;
        return filterValues.includes(row.original.action);
      },
      meta: {
        label: "Action",
        variant: "multiSelect",
        options: Object.values(AuditAction).map((a) => ({
          label: formatAuditAction(a),
          value: a,
        })),
      },
    },
    {
      accessorKey: "resourceType",
      header: "Resource",
      cell: ({ row }) => {
        const { resourceType, resourceId } = row.original;
        if (!resourceType) return <span className="text-xs text-text-muted">—</span>;
        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-text-secondary">{resourceType}</span>
            {resourceId && (
              <span className="text-[10px] text-text-muted data-mono">
                {resourceId.slice(0, 8)}…
              </span>
            )}
          </div>
        );
      },
      enableSorting: false,
      enableColumnFilter: false,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Time" />
      ),
      cell: ({ row }) => (
        <span className="text-[11px] text-text-muted whitespace-nowrap">
          {timeAgo(row.original.createdAt)}
        </span>
      ),
      enableSorting: true,
      enableColumnFilter: false,
    },
  ];
}

// ─── Role Selector ────────────────────────────────────────────────────────────

const ROLE_OPTIONS = [
  { value: UserRole.STAFF, label: "Staff",  dot: "bg-text-muted"  },
  { value: UserRole.ADMIN, label: "Admin",  dot: "bg-info"        },
  { value: UserRole.OWNER, label: "Owner",  dot: "bg-gold"        },
] as const;

function RoleDropdown({
  value,
  onChange,
}: {
  value: UserRole;
  onChange: (r: UserRole) => void;
}) {
  const current = ROLE_OPTIONS.find((r) => r.value === value)!;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="w-full flex items-center justify-between h-9 px-3 rounded-md border border-input bg-transparent text-sm text-text-primary hover:bg-elevated/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-crimson/40"
        >
          <span className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${current.dot}`} />
            {current.label}
          </span>
          <CaretDown size={13} className="opacity-50 flex-shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={4}
        className="min-w-[var(--radix-dropdown-menu-trigger-width,180px)]"
      >
        {ROLE_OPTIONS.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="gap-2 cursor-pointer items-center"
          >
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${opt.dot}`} />
            <span className="flex-1 text-sm">{opt.label}</span>
            {value === opt.value && (
              <CheckCircle size={14} className="text-crimson flex-shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Create User Modal ────────────────────────────────────────────────────────

function CreateUserModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { createUser, isMutating, error } = useSuperadminStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.STAFF);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser({ email, password, role });
      setEmail(""); setPassword(""); setRole(UserRole.STAFF);
      onClose();
    } catch { /* error shown from store */ }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus size={18} weight="duotone" className="text-info" /> Create User
          </DialogTitle>
          <DialogDescription>
            Add a new CRM user directly (no invitation required).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="cu-email">Email</Label>
            <Input id="cu-email" type="email" placeholder="user@company.com"
              value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cu-password">Password</Label>
            <Input id="cu-password" type="password" placeholder="Min 8 characters"
              value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
          </div>
          <div className="space-y-1.5">
            <Label>Role</Label>
            <RoleDropdown value={role} onChange={setRole} />
          </div>
          {error && <p className="text-xs text-danger">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isMutating}>
              {isMutating ? "Creating…" : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Force Password Modal ─────────────────────────────────────────────────────

function ForcePasswordModal({ user, onClose }: { user: UserResponse | null; onClose: () => void }) {
  const { forcePasswordChange, isMutating } = useSuperadminStore();
  const [newPassword, setNewPassword] = useState("");
  const [err, setErr] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) { setErr("Password must be at least 8 characters"); return; }
    try {
      await forcePasswordChange(user!.id, { newPassword });
      setNewPassword(""); setErr(""); onClose();
    } catch { setErr("Failed to reset password"); }
  };

  return (
    <Dialog open={!!user} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LockKey size={18} weight="duotone" className="text-warning" /> Force Password Reset
          </DialogTitle>
          <DialogDescription>
            Reset password for{" "}
            <span className="font-medium text-text-primary">{user?.email}</span>.
            All sessions will be revoked.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="fp-password">New Password</Label>
            <Input id="fp-password" type="password" placeholder="Min 8 characters"
              value={newPassword} onChange={(e) => { setNewPassword(e.target.value); setErr(""); }}
              required minLength={8} />
          </div>
          {err && <p className="text-xs text-danger">{err}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isMutating} variant="destructive">
              {isMutating ? "Resetting…" : "Reset Password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Change Role Modal ────────────────────────────────────────────────────────

function ChangeRoleModal({ user, onClose }: { user: UserResponse | null; onClose: () => void }) {
  const { changeUserRole, isMutating } = useSuperadminStore();
  const [role, setRole] = useState<UserRole>(UserRole.STAFF);

  useEffect(() => { if (user) setRole(user.role as UserRole); }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await changeUserRole(user!.id, { role }); onClose(); }
    catch { /* handled in store */ }
  };

  return (
    <Dialog open={!!user} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PencilSimple size={18} weight="duotone" className="text-gold" /> Change Role
          </DialogTitle>
          <DialogDescription>
            Update role for{" "}
            <span className="font-medium text-text-primary">{user?.email}</span>.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>New Role</Label>
            <RoleDropdown value={role} onChange={(v) => setRole(v)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isMutating}>
              {isMutating ? "Saving…" : "Save Role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── System Config Panel ──────────────────────────────────────────────────────

type FieldDef = { key: string; label: string; description?: string; type: "text" | "textarea" | "number" | "toggle"; defaultValue?: string; };

/** Default values for keys that are not yet persisted in DB — must match backend fallback defaults */
const FIELD_DEFAULTS: Record<string, string> = {
  "bot.active":       "true",
  "bot.hydeEnabled":  "true",  // backend defaults to true (see bot.service.ts ?? true)
};

const CONFIG_SECTIONS: { title: string; icon: React.ElementType; color: string; fields: FieldDef[] }[] = [
  {
    title: "Persona", icon: Robot, color: "text-info",
    fields: [
      { key: "persona.name", label: "Bot Name", description: "Display name used in responses", type: "text" },
      { key: "persona.role", label: "Bot Role", description: "Role/title of the bot persona", type: "text" },
    ],
  },
  {
    title: "Bot Behaviour", icon: Gear, color: "text-gold",
    fields: [
      { key: "bot.active", label: "Bot Active", description: "Enable or disable the bot globally", type: "toggle" },
      { key: "bot.systemPrompt", label: "System Prompt", description: "Core instruction given to the AI", type: "textarea" },
      { key: "bot.welcomeMessage", label: "Welcome Message", description: "Sent to new leads on first contact", type: "textarea" },
      { key: "bot.handoverMessage", label: "Handover Message", description: "Sent when handing over to a human agent", type: "textarea" },
      { key: "bot.registrationUrl", label: "Registration URL", description: "URL linked in registration prompts", type: "text" },
      { key: "bot.depositFormUrl", label: "Deposit Form URL", description: "URL linked in deposit prompts", type: "text" },
      { key: "bot.groupId", label: "Group Forum ID", description: "Telegram supergroup ID for thread mirroring (e.g. -1001234567890)", type: "text" },
      { key: "bot.groupThreadEnabled", label: "Group Thread Mirroring", description: "Mirror lead DMs into group forum topics (default: off)", type: "toggle" },
    ],
  },
  {
    title: "Follow-Up Delays", icon: Timer, color: "text-warning",
    fields: [
      { key: "bot.followUpContactedDelayHours", label: "Contacted Delay (h)", description: "Hours after CONTACTED before follow-up", type: "number" },
      { key: "bot.followUpRegisteredDelayHours", label: "Registered Delay (h)", description: "Hours after REGISTERED before follow-up", type: "number" },
      { key: "bot.followUpDepositReportedDelayHours", label: "Deposit Delay (h)", description: "Hours after DEPOSIT_REPORTED before follow-up", type: "number" },
      { key: "bot.followUpMaxRetries", label: "Max Retries", description: "Maximum follow-up retry attempts", type: "number" },
    ],
  },
  {
    title: "Rate Limiting & Suspicion", icon: ShieldCheck, color: "text-danger",
    fields: [
      { key: "bot.rateLimitWindowSeconds", label: "Rate Limit Window (s)", description: "Window for counting messages", type: "number" },
      { key: "bot.rateLimitMaxMessages", label: "Max Messages / Window", description: "Max messages per window before throttle", type: "number" },
      { key: "bot.suspicionMaxStrikes", label: "Suspicion Max Strikes", description: "Strikes before marking lead as suspicious", type: "number" },
      { key: "bot.suspicionWindowSeconds", label: "Suspicion Window (s)", description: "Time window for suspicion strike counting", type: "number" },
      { key: "bot.handoverNotificationTtlSeconds", label: "Handover Notification TTL (s)", description: "How long handover alert persists", type: "number" },
    ],
  },
  {
    title: "AI / RAG", icon: Cpu, color: "text-crimson",
    fields: [
      { key: "bot.hydeEnabled", label: "HyDE Enabled", description: "Hypothetical Document Embedding for better retrieval", type: "toggle" },
      { key: "ai.maxTokens", label: "Max Tokens", description: "Max tokens per AI response", type: "number" },
      { key: "ai.contextMessages", label: "Context Messages", description: "Number of prior messages sent as context", type: "number" },
      { key: "ai.conversationTtlHours", label: "Conversation TTL (h)", description: "Hours before conversation context expires", type: "number" },
      { key: "ai.similarityThreshold", label: "Similarity Threshold", description: "Minimum cosine similarity for RAG retrieval (0-1)", type: "number" },
      { key: "ai.guardConfidenceThreshold", label: "Guard Confidence High", description: "Above this = definitely on-topic", type: "number" },
      { key: "ai.guardConfidenceLowThreshold", label: "Guard Confidence Low", description: "Below this = definitely off-topic", type: "number" },
      { key: "ai.rateLimitPerMinute", label: "AI Rate Limit / min", description: "Max AI calls per minute per user", type: "number" },
      { key: "ai.ragTopK", label: "RAG Top-K", description: "Number of KB chunks retrieved per query", type: "number" },
    ],
  },
];

// ─── Maintenance Config Panel ──────────────────────────────────────────────────

function MaintenanceConfigPanel() {
  const { entries, fetchAll, upsertMany } = useSystemConfigStore();
  const fetchPublicConfig = useMaintenanceStore((s) => s.fetchPublicConfig);

  const getVal = (key: string, def = "false") =>
    entries[key] ?? def;

  const DEFAULT_BANNER = "System under maintenance — read-only mode active.";

  const [maintenanceOn, setMaintenanceOn] = useState(false);
  const [bannerText, setBannerText] = useState(DEFAULT_BANNER);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingOn, setPendingOn] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  // Sync from store entries once loaded
  useEffect(() => {
    if (!entries || Object.keys(entries).length === 0) return;
    setMaintenanceOn(getVal("system.maintenanceMode") === "true");
    setBannerText(
      entries["system.maintenanceBanner"] ?? DEFAULT_BANNER
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries]);

  useEffect(() => { void fetchAll(); }, [fetchAll]);

  const toggleMaintenance = (on: boolean) => {
    if (on) {
      setPendingOn(true);
      setConfirmOpen(true);
    } else {
      void saveMaintenanceMode(false);
    }
  };

  const saveMaintenanceMode = async (on: boolean) => {
    setSaveErr(null);
    setIsSaving(true);
    try {
      await upsertMany({
        "system.maintenanceMode": on ? "true" : "false",
        // Never send empty string — backend @IsString() accepts it but semantics are wrong
        "system.maintenanceBanner": bannerText.trim() || DEFAULT_BANNER,
      });
      setMaintenanceOn(on);
      await fetchPublicConfig().catch(() => undefined);
      setSaved("maintenance");
      setTimeout(() => setSaved(null), 2500);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Save failed";
      setSaveErr(msg);
      setTimeout(() => setSaveErr(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const saveFeatureFlag = async (key: string, value: boolean) => {
    setSaveErr(null);
    setIsSaving(true);
    try {
      await upsertMany({ [key]: value ? "true" : "false" });
      await fetchPublicConfig().catch(() => undefined);
      setSaved(key);
      setTimeout(() => setSaved(null), 2000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Save failed";
      setSaveErr(msg);
      setTimeout(() => setSaveErr(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const featureFlags = [
    {
      key: "feature.knowledgeBase.enabled",
      label: "Knowledge Base Processing",
      description: "Enable KB file uploads and vector processing",
      defaultOn: true,
    },
    {
      key: "feature.broadcast.enabled",
      label: "Broadcast Messages",
      description: "Enable bulk message blasts to leads",
      defaultOn: true,
    },
    {
      key: "feature.commandMenu.enabled",
      label: "Command Menus",
      description: "Enable command menu management and bot serving",
      defaultOn: true,
    },
    {
      key: "followUp.enabled",
      label: "Follow-Up Automation",
      description: "Enable scheduled follow-up messages",
      defaultOn: true,
    },
  ];

  return (
    <>
      {/* Confirm dialog for enabling maintenance mode */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-400">
              <Warning size={18} weight="fill" />
              Enable Maintenance Mode?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will block all write operations for Owner, Admin, and Staff
              roles. The Telegram bot continues running and SuperAdmin retains
              full access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setPendingOn(false); }}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-amber-600 hover:bg-amber-500 text-white"
              onClick={() => {
                setConfirmOpen(false);
                void saveMaintenanceMode(pendingOn);
              }}
            >
              Enable Maintenance
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-4">
        {/* ── Maintenance Mode Card ─────────────────────────────────────────── */}
        <div className="page-panel rounded-xl overflow-hidden border border-amber-500/25 bg-amber-950/10">
          <div className="px-5 py-4 bg-amber-900/10 flex items-center justify-between border-b border-amber-500/20">
            <div>
              <h2 className="text-sm font-semibold text-amber-300 flex items-center gap-2">
                <Warning size={16} weight="fill" className="text-amber-400" />
                Maintenance Mode
              </h2>
              <p className="text-xs text-amber-200/60 mt-0.5">
                Blocks write operations for Owner / Admin / Staff. Bot stays online.
              </p>
            </div>
            {saved === "maintenance" && (
              <span className="text-xs text-success flex items-center gap-1">
                <CheckCircle size={13} /> Saved
              </span>
            )}
          </div>
          <div className="px-5 py-5 space-y-4">
            {/* Toggle row */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary">
                  Maintenance Mode
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  {maintenanceOn
                    ? "🔴 Active — staff/owners are in read-only mode"
                    : "🟢 Inactive — system is fully operational"}
                </p>
              </div>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => toggleMaintenance(!maintenanceOn)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:ring-2 ${
                  maintenanceOn ? "bg-amber-500" : "bg-border-subtle"
                }`}
              >
                <span
                  className={`inline-block h-4.5 w-4.5 rounded-full bg-white shadow transition-transform ${
                    maintenanceOn ? "translate-x-5.5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Banner message */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-text-secondary">
                Banner Message
              </Label>
              <Textarea
                value={bannerText}
                onChange={(e) => setBannerText(e.target.value)}
                placeholder="System under maintenance — read-only mode active."
                className="text-xs min-h-[60px] resize-none"
              />
            </div>

            {/* Live preview */}
            {bannerText && (
              <div className="space-y-1.5">
                <p className="text-[10px] text-text-muted uppercase tracking-wider">
                  Banner Preview
                </p>
                <div className="flex items-center gap-2 rounded-lg border border-amber-500/25 bg-amber-950/20 px-3 py-2 text-xs text-amber-200">
                  <Warning weight="fill" size={13} className="text-amber-400 shrink-0" />
                  <span className="font-medium">Maintenance Mode — </span>
                  {bannerText}
                </div>
              </div>
            )}

            {/* Save banner text button */}
            <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="ghost"
              disabled={isSaving}
              onClick={() => void saveMaintenanceMode(maintenanceOn)}
              className="h-7 px-3 text-xs text-amber-400 hover:bg-amber-800/20 border border-amber-500/20"
            >
              <Gear size={13} className="mr-1" />
              {isSaving ? "Saving…" : "Save Banner"}
            </Button>
            {saveErr && (
              <span className="text-xs text-crimson">{saveErr}</span>
            )}
            </div>
          </div>
        </div>

        {/* ── Feature Flags Card ──────────────────────────────────────────────── */}
        <div className="page-panel bg-elevated rounded-xl overflow-hidden">
          <div className="px-5 py-4 bg-card flex items-center justify-between border-b border-border-subtle">
            <div>
              <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <Lightning size={16} weight="duotone" className="text-info" />
                Feature Flags
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Toggle individual platform features independently
              </p>
            </div>
          </div>
          <div className="px-5 py-5 space-y-4">
            {featureFlags.map((flag) => {
              const isOn =
                getVal(flag.key, flag.defaultOn ? "true" : "false") !== "false";
              const isFlagSaved = saved === flag.key;
              return (
                <div
                  key={flag.key}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary">
                      {flag.label}
                      {isFlagSaved && (
                        <span className="ml-2 text-xs text-success">✓ Saved</span>
                      )}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {flag.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => void saveFeatureFlag(flag.key, !isOn)}
                    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                      isOn ? "bg-crimson" : "bg-border-subtle"
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                        isOn ? "translate-x-4.5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── System Configuration Panel ──────────────────────────────────────────────

function SystemConfigPanel() {
  const { entries, isLoading, isSaving, fetchAll, upsertMany } = useSystemConfigStore();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  useEffect(() => { void fetchAll(); }, [fetchAll]);

  // Sync drafts when entries load
  useEffect(() => {
    setDrafts((d) => {
      const merged = { ...d };
      for (const k of Object.keys(entries)) {
        if (!(k in merged)) merged[k] = entries[k];
      }
      return merged;
    });
  }, [entries]);

  const getValue = (key: string) => drafts[key] ?? entries[key] ?? FIELD_DEFAULTS[key] ?? "";
  const setValue = (key: string, val: string) => setDrafts((d) => ({ ...d, [key]: val }));

  const handleSaveSection = async (sectionTitle: string, fields: FieldDef[]) => {
    setErrMsg(null);
    const updates: Record<string, string> = {};
    for (const f of fields) updates[f.key] = getValue(f.key);
    try {
      await upsertMany(updates);
      setSaved(sectionTitle);
      setTimeout(() => setSaved(null), 2500);
    } catch {
      setErrMsg("Failed to save. Check the values and try again.");
    }
  };

  return (
    <div className="page-panel bg-elevated rounded-xl overflow-hidden">
      <div className="px-5 py-4 bg-card flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <Sliders size={16} weight="duotone" className="text-crimson" />
            System Configuration
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">All 27 platform config keys</p>
        </div>
        <button onClick={() => void fetchAll()} className="p-1.5 rounded-md text-text-muted hover:text-text-primary transition-colors">
          <ArrowClockwise size={14} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {errMsg && (
        <div className="mx-5 mb-2 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-xs">{errMsg}</div>
      )}

      <div className="px-5 pb-6 space-y-6">
        {CONFIG_SECTIONS.map((section) => {
          const Icon = section.icon;
          const isSectionSaved = saved === section.title;
          return (
            <div key={section.title} className="space-y-3">
              <div className="flex items-center justify-between pt-3">
                <h3 className={`text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 ${section.color}`}>
                  <Icon size={13} weight="duotone" />
                  {section.title}
                </h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => void handleSaveSection(section.title, section.fields)}
                  disabled={isSaving}
                  className={`h-7 px-3 text-xs gap-1 ${isSectionSaved ? "text-success" : "text-crimson hover:bg-crimson/10"}`}
                >
                  {isSectionSaved ? <CheckCircle size={13} /> : <Gear size={13} />}
                  {isSectionSaved ? "Saved!" : isSaving ? "Saving…" : "Save"}
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {section.fields.map((field) => (
                  <div key={field.key} className="space-y-1">
                    <Label className="text-[11px] font-medium text-text-secondary">{field.label}</Label>
                    {field.description && (
                      <p className="text-[10px] text-text-muted leading-snug">{field.description}</p>
                    )}
                    {field.type === "toggle" ? (
                      <button
                        type="button"
                        onClick={() => setValue(field.key, getValue(field.key) === "true" ? "false" : "true")}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:ring-2 ${getValue(field.key) === "true" ? "bg-crimson" : "bg-border-subtle"}`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${getValue(field.key) === "true" ? "translate-x-4.5" : "translate-x-0.5"}`} />
                      </button>
                    ) : field.type === "textarea" ? (
                      <Textarea
                        value={getValue(field.key)}
                        onChange={(e) => setValue(field.key, e.target.value)}
                        className="text-xs min-h-[80px] resize-none font-mono"
                      />
                    ) : (
                      <Input
                        type={field.type === "number" ? "number" : "text"}
                        value={getValue(field.key)}
                        onChange={(e) => setValue(field.key, e.target.value)}
                        className="h-8 text-xs"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const isMobile = useIsMobile();
  const router = useRouter();
  const { user: authUser } = useAuthStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const t = useT();

  if (isMobile) return <MobileAdminDashboard />;

  const {
    users,
    auditLogs,
    ragStats,
    isLoadingUsers,
    isLoadingLogs,
    isLoadingRag,
    queues,
    tokenUsage,
    kbHealth,
    isLoadingOps,
    fetchUsers,
    fetchAuditLogs,
    fetchRagStats,
    fetchOpsData,
    deactivateUser,
    reactivateUser,
  } = useSuperadminStore();

  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [roleModal, setRoleModal] = useState<UserResponse | null>(null);
  const [passwordModal, setPasswordModal] = useState<UserResponse | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<UserResponse | null>(null);

  // Table states
  const [userSorting, setUserSorting] = useState<SortingState>([]);
  const [userFilters, setUserFilters] = useState<ColumnFiltersState>([]);
  const [userVisibility, setUserVisibility] = useState<VisibilityState>({});

  const [auditSorting, setAuditSorting] = useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [auditFilters, setAuditFilters] = useState<ColumnFiltersState>([]);
  const [auditVisibility, setAuditVisibility] = useState<VisibilityState>({});

  // ── Guards & fetch ─────────────────────────────────────────────────
  useEffect(() => {
    if (authUser && authUser.role !== UserRole.SUPERADMIN) router.replace("/");
  }, [authUser, router]);

  useEffect(() => {
    if (authUser?.role === UserRole.SUPERADMIN) {
      fetchUsers();
      fetchAuditLogs({ take: 100 });
      fetchRagStats();
      fetchOpsData();
      const interval = setInterval(() => { fetchOpsData(); }, 30_000);
      return () => clearInterval(interval);
    }
  }, [authUser, fetchUsers, fetchAuditLogs, fetchRagStats, fetchOpsData]);

  // ── GSAP ───────────────────────────────────────────────────────────
  useGSAP(
    () => {
      gsap.from(".admin-header", { opacity: 0, y: -10, duration: 0.4, ease: "power2.out" });
      gsap.from(".kpi-tile", { opacity: 0, y: 18, scale: 0.97, stagger: 0.07, duration: 0.45, ease: "power2.out", delay: 0.1 });
      gsap.from(".page-panel", { opacity: 0, y: 20, stagger: 0.1, duration: 0.5, ease: "power2.out", delay: 0.3 });
    },
    { scope: containerRef },
  );

  // ── Deactivate confirm ─────────────────────────────────────────────
  const handleDeactivateConfirm = useCallback(async () => {
    if (!deactivateTarget) return;
    try {
      if (deactivateTarget.isActive) await deactivateUser(deactivateTarget.id);
      else await reactivateUser(deactivateTarget.id);
    } finally {
      setDeactivateTarget(null);
    }
  }, [deactivateTarget, deactivateUser, reactivateUser]);

  // ── Derived ────────────────────────────────────────────────────────
  const activeUsers = users.filter((u) => u.isActive).length;
  const ragHitRate = ragStats ? `${(ragStats.ragHitRate ?? 0).toFixed(1)}%` : "—";
  const ragTokens = ragStats ? `${(((ragStats.totalPromptTokens ?? 0) + (ragStats.totalCompletionTokens ?? 0)) / 1000).toFixed(1)}k` : "—";

  // ── Column defs ────────────────────────────────────────────────────
  const userColumns = useMemo(
    () =>
      getUserColumns({
        onEdit: setRoleModal,
        onPassword: setPasswordModal,
        onToggle: setDeactivateTarget,
        currentUserId: authUser?.id ?? "",
      }),
    [authUser?.id],
  );

  const auditColumns = useMemo(() => getAuditColumns(), []);

  // ── Tables ─────────────────────────────────────────────────────────
  const userTable = useReactTable({
    data: users,
    columns: userColumns,
    state: { sorting: userSorting, columnFilters: userFilters, columnVisibility: userVisibility },
    onSortingChange: setUserSorting,
    onColumnFiltersChange: setUserFilters,
    onColumnVisibilityChange: setUserVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const auditTable = useReactTable({
    data: auditLogs,
    columns: auditColumns,
    state: { sorting: auditSorting, columnFilters: auditFilters, columnVisibility: auditVisibility },
    onSortingChange: setAuditSorting,
    onColumnFiltersChange: setAuditFilters,
    onColumnVisibilityChange: setAuditVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    initialState: { pagination: { pageSize: 20 } },
  });

  if (!authUser || authUser.role !== UserRole.SUPERADMIN) return null;

  return (
    <TooltipProvider>
      <div ref={containerRef} className="space-y-6">

        {/* ── Modals ── */}
        <CreateUserModal open={showCreate} onClose={() => setShowCreate(false)} />
        <ChangeRoleModal user={roleModal} onClose={() => setRoleModal(null)} />
        <ForcePasswordModal user={passwordModal} onClose={() => setPasswordModal(null)} />

        <AlertDialog open={!!deactivateTarget} onOpenChange={(o) => !o && setDeactivateTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Warning size={18} weight="duotone" className="text-warning" />
                {deactivateTarget?.isActive ? "Deactivate User?" : "Reactivate User?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {deactivateTarget?.isActive
                  ? `This will immediately revoke all sessions for ${deactivateTarget?.email}.`
                  : `This will restore access for ${deactivateTarget?.email}.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeactivateConfirm}
                className={deactivateTarget?.isActive ? "bg-danger hover:bg-danger/90" : ""}
              >
                {deactivateTarget?.isActive ? "Deactivate" : "Reactivate"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* ── Header ── */}
        <div className="admin-header flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="rounded-lg p-1.5 bg-[--crimson]/10">
                <ShieldStar size={20} weight="duotone" className="text-[--crimson]" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-text-primary">Superadmin Panel</h1>
            </div>
            <p className="text-sm text-text-secondary pl-10">
              Platform-wide user management &amp; system monitoring
            </p>
          </div>
          <Button size="sm" className="gap-1.5 shrink-0" onClick={() => setShowCreate(true)}>
            <UserPlus size={15} weight="bold" /> Add User
          </Button>
        </div>

        {/* ── KPI Row ── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
          <KpiTile icon={Users} label="Total Users"
            value={isLoadingUsers ? "—" : users.length}
            sub={isLoadingUsers ? "Loading…" : `${activeUsers} active · ${users.length - activeUsers} inactive`}
            accent="info" loading={isLoadingUsers} />
          <KpiTile icon={CheckCircle} label="Active Users"
            value={isLoadingUsers ? "—" : activeUsers}
            sub="Currently enabled" accent="success" loading={isLoadingUsers} />
          <KpiTile icon={Brain} label="RAG Hit Rate"
            value={ragHitRate}
            sub={ragStats ? `${ragStats.totalRequests ?? 0} total requests` : "Loading…"}
            accent="gold" loading={isLoadingRag} />
          <KpiTile icon={Lightning} label="AI Tokens Used"
            value={ragTokens}
            sub={ragStats ? `Avg ${(ragStats.avgChunksPerRequest ?? 0).toFixed(1)} chunks/reply` : "Loading…"}
            accent="crimson" loading={isLoadingRag} />
        </div>

        {/* ── Ops Dashboard — Bot Health + Queue Monitor + Token Budget + KB Health ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Bot Health */}
          <div className="bg-elevated rounded-xl p-4 border border-border-subtle">
            <div className="flex items-center justify-between mb-3">
              <span className="font-sans font-semibold text-[13px] text-text-primary">{t(K.superadminOps.botHealth)}</span>
              <div className={`w-2 h-2 rounded-full ${ragStats ? "bg-emerald-400" : "bg-text-muted"}`} />
            </div>
            <div className="space-y-1.5 text-[11px] font-sans">
              {isLoadingRag ? (
                <Skeleton className="h-3 w-full" />
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-text-muted">{t(K.superadminOps.pendingUpdates)}</span>
                    <span className="data-mono text-text-primary">—</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">{t(K.superadminOps.lastError)}</span>
                    <span className="text-emerald-400">{t(K.superadminOps.noError)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Queue Monitor */}
          <div className="bg-elevated rounded-xl p-4 border border-border-subtle">
            <div className="flex items-center justify-between mb-3">
              <span className="font-sans font-semibold text-[13px] text-text-primary">{t(K.superadminOps.queues)}</span>
              {isLoadingOps && <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
            </div>
            {isLoadingOps && !queues ? (
              <div className="space-y-1"><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-3/4" /></div>
            ) : queues ? (
              <div className="space-y-1">
                {queues.queues.map((q) => (
                  <div key={q.name} className="flex items-center justify-between text-[10px] font-sans">
                    <span className="text-text-muted truncate max-w-[80px]">{q.name}</span>
                    <div className="flex gap-1.5">
                      <span className="text-text-muted">{t(K.superadminOps.waiting)} <span className="data-mono text-text-primary">{q.waiting}</span></span>
                      {q.failed > 0 && <span className="text-red-400 data-mono font-bold">{q.failed}F</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-[11px] text-text-muted font-sans">—</span>
            )}
          </div>

          {/* Token Budget */}
          <div className="bg-elevated rounded-xl p-4 border border-border-subtle">
            <div className="flex items-center justify-between mb-3">
              <span className="font-sans font-semibold text-[13px] text-text-primary">{t(K.superadminOps.tokenBudget)}</span>
            </div>
            {isLoadingOps && !tokenUsage ? (
              <Skeleton className="h-16 w-full" />
            ) : tokenUsage ? (
              <>
                <div className="text-[11px] font-sans space-y-0.5 mb-2">
                  <div className="flex justify-between">
                    <span className="text-text-muted">{t(K.superadminOps.rolling30d)}</span>
                    <span className="data-mono text-text-primary">{tokenUsage.rolling30dTokens.toLocaleString()} {t(K.superadminOps.tokens)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">{t(K.superadminOps.estimatedCost)}</span>
                    <span className="data-mono text-gold">${tokenUsage.rolling30dCostUsd.toFixed(4)}</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={36}>
                  <AreaChart data={tokenUsage.daily} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <Area type="monotone" dataKey="tokens" stroke="#C4232D" fill="#C4232D" fillOpacity={0.15} strokeWidth={1.5} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </>
            ) : (
              <span className="text-[11px] text-text-muted font-sans">—</span>
            )}
          </div>

          {/* KB Health */}
          <div className="bg-elevated rounded-xl p-4 border border-border-subtle">
            <div className="flex items-center justify-between mb-3">
              <span className="font-sans font-semibold text-[13px] text-text-primary">{t(K.superadminOps.kbHealth)}</span>
            </div>
            {isLoadingOps && !kbHealth ? (
              <Skeleton className="h-12 w-full" />
            ) : kbHealth ? (
              <div className="space-y-2">
                <div className="text-[11px] font-sans">
                  <div className="flex justify-between mb-1">
                    <span className="text-text-muted">{t(K.superadminOps.embeddingCoverage)}</span>
                    <span className="data-mono text-text-primary">
                      {kbHealth.embeddingCoverage.embedded}/{kbHealth.embeddingCoverage.total} {t(K.superadminOps.chunksEmbedded)}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-void/40">
                    <div
                      className="h-1.5 rounded-full bg-crimson"
                      style={{ width: kbHealth.embeddingCoverage.total > 0 ? `${(kbHealth.embeddingCoverage.embedded / kbHealth.embeddingCoverage.total) * 100}%` : "0%" }}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(kbHealth.byStatus).map(([status, count]) => (
                    <span key={status} className="text-[9px] font-sans px-1.5 py-0.5 rounded bg-accent/10 text-text-muted">
                      {status}: {count}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <span className="text-[11px] text-text-muted font-sans">—</span>
            )}
          </div>
        </div>

        {/* ── Users Table ── */}
        <div className="page-panel bg-elevated rounded-xl overflow-hidden">
          <div className="px-5 py-4 bg-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <Users size={16} weight="duotone" className="text-info" />
                User Management
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                {isLoadingUsers
                  ? "Loading…"
                  : `${userTable.getFilteredRowModel().rows.length} of ${users.length} users`}
              </p>
            </div>
            <Button
              size="sm" variant="ghost"
              className="gap-1.5 text-text-secondary hover:text-text-primary"
              onClick={() => fetchUsers()}
            >
              <ArrowClockwise size={14} weight="bold" /> Refresh
            </Button>
          </div>

          {isLoadingUsers ? (
            <div className="p-5 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="px-4 pb-4">
              <DataTable table={userTable}>
                <DataTableToolbar table={userTable} />
              </DataTable>
            </div>
          )}
        </div>

        {/* ── Audit + RAG ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

          {/* Audit Log — 2 cols */}
          <div className="page-panel xl:col-span-2 bg-elevated rounded-xl overflow-hidden">
            <div className="px-5 py-4 bg-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <Database size={16} weight="duotone" className="text-warning" />
                  Audit Log
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">Recent system events</p>
              </div>
              <Button
                size="sm" variant="ghost"
                className="gap-1.5 text-text-secondary hover:text-text-primary"
                onClick={() => fetchAuditLogs({ take: 100 })}
              >
                <ArrowClockwise size={14} weight="bold" /> Reload
              </Button>
            </div>

            {isLoadingLogs ? (
              <div className="p-5 space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="px-4 pb-4">
                <DataTable table={auditTable}>
                  <DataTableToolbar table={auditTable} />
                </DataTable>
              </div>
            )}
          </div>

          {/* RAG AI Stats — 1 col */}
          {ragStats ? (
            <div
              className="page-panel bg-elevated rounded-xl p-5"
              style={{ backgroundImage: "linear-gradient(135deg, color-mix(in srgb, var(--color-gold) 7%, transparent) 0%, transparent 60%)" }}
            >
              <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-5">
                <Brain size={16} weight="duotone" className="text-[--gold]" />
                AI / RAG Performance
              </h2>
              <div className="space-y-4">
                {[
                  { label: "Hit Rate", value: `${(ragStats.ragHitRate ?? 0).toFixed(1)}%`, sub: "Queries matched KB", color: "text-success" },
                  { label: "Avg Chunks / Reply", value: (ragStats.avgChunksPerRequest ?? 0).toFixed(2), sub: "Per reply retrieved", color: "text-info" },
                  { label: "Zero-Hit Queries", value: String(ragStats.zeroHitCount ?? 0), sub: "No KB match found", color: "text-danger" },
                  { label: "Total AI Tokens", value: `${(((ragStats.totalPromptTokens ?? 0) + (ragStats.totalCompletionTokens ?? 0)) / 1000).toFixed(1)}k`, sub: "Cumulative usage", color: "text-[--gold]" },
                ].map(({ label, value, sub, color }) => (
                  <div key={label} className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-text-secondary leading-tight">{label}</p>
                      <p className="text-[11px] text-text-muted mt-0.5">{sub}</p>
                    </div>
                    <p className={`text-lg font-bold data-mono shrink-0 ${color}`}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="page-panel bg-elevated rounded-xl p-5">
              <div className="space-y-3">
                <Skeleton className="h-4 w-32" />
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-lg" />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Maintenance Mode & Feature Flags ── */}
        <MaintenanceConfigPanel />

        {/* ── System Configuration ── */}
        <SystemConfigPanel />

        {/* ── Database Backup ── */}
        <BackupPanel />

        {/* ── Encrypted Secrets ── */}
        <SecretsPanel />

      </div>
    </TooltipProvider>
  );
}

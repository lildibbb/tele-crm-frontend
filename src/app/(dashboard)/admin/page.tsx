"use client";

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
gsap.registerPlugin(useGSAP);

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
import { UserRole, AuditAction } from "@/types/enums";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
} from "@phosphor-icons/react";

import type { UserResponse } from "@/lib/schemas/user.schema";
import type { AuditLog } from "@/lib/schemas/auditLog.schema";

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

const auditIconMap: Partial<Record<AuditAction, React.ElementType>> = {
  USER_CREATED: UserPlus,
  USER_DEACTIVATED: ProhibitInset,
  USER_REACTIVATED: ArrowCounterClockwise,
  USER_ROLE_CHANGED: PencilSimple,
  PASSWORD_CHANGED: LockKey,
  LEAD_STATUS_CHANGED: CheckCircle,
  LEAD_VERIFIED: CheckCircle,
  KB_CREATED: Database,
  KB_UPDATED: Gear,
  KB_DELETED: X,
  COMMAND_MENU_CREATED: ChatText,
  COMMAND_MENU_UPDATED: Gear,
  COMMAND_MENU_DELETED: X,
  SYSTEM_CONFIG_CHANGED: Gear,
};

const auditColorMap: Partial<Record<AuditAction, string>> = {
  USER_CREATED: "text-info",
  USER_DEACTIVATED: "text-danger",
  USER_REACTIVATED: "text-success",
  USER_ROLE_CHANGED: "text-gold",
  PASSWORD_CHANGED: "text-warning",
  LEAD_VERIFIED: "text-success",
  SYSTEM_CONFIG_CHANGED: "text-crimson",
};

function formatAuditAction(action: string): string {
  return action
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

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

const ACCENT_COLORS: Record<string, { bg: string; text: string }> = {
  info: { bg: "bg-info/10", text: "text-info" },
  success: { bg: "bg-success/10", text: "text-success" },
  gold: { bg: "bg-[--gold]/10", text: "text-[--gold]" },
  crimson: { bg: "bg-[--crimson]/10", text: "text-[--crimson]" },
};

function KpiTile({ icon: Icon, label, value, sub, accent, loading }: KpiTileProps) {
  const { bg, text } = ACCENT_COLORS[accent];
  return (
    <div className="kpi-tile bg-bg-elevated rounded-xl p-5">
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
        const IconComp = auditIconMap[action] ?? Pulse;
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
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={UserRole.STAFF}>Staff</SelectItem>
                <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                <SelectItem value={UserRole.OWNER}>Owner</SelectItem>
              </SelectContent>
            </Select>
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
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={UserRole.STAFF}>Staff</SelectItem>
                <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                <SelectItem value={UserRole.OWNER}>Owner</SelectItem>
              </SelectContent>
            </Select>
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter();
  const { user: authUser } = useAuthStore();
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    users,
    auditLogs,
    ragStats,
    isLoadingUsers,
    isLoadingLogs,
    isLoadingRag,
    fetchUsers,
    fetchAuditLogs,
    fetchRagStats,
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
    }
  }, [authUser, fetchUsers, fetchAuditLogs, fetchRagStats]);

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
  const ragHitRate = ragStats ? `${(ragStats.hitRate ?? 0).toFixed(1)}%` : "—";
  const ragTokens = ragStats ? `${((ragStats.totalTokens ?? 0) / 1000).toFixed(1)}k` : "—";

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
      <div ref={containerRef} className="space-y-6 p-4 md:p-6">

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
            sub={ragStats ? `${ragStats.analyzedReplies ?? 0} replies analysed` : "Loading…"}
            accent="gold" loading={isLoadingRag} />
          <KpiTile icon={Lightning} label="AI Tokens Used"
            value={ragTokens}
            sub={ragStats ? `Avg ${(ragStats.averageChunks ?? 0).toFixed(1)} chunks/reply` : "Loading…"}
            accent="crimson" loading={isLoadingRag} />
        </div>

        {/* ── Users Table ── */}
        <div className="page-panel bg-bg-elevated rounded-xl overflow-hidden">
          <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
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
          <div className="page-panel xl:col-span-2 bg-bg-elevated rounded-xl overflow-hidden">
            <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
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
            <div className="page-panel bg-bg-elevated rounded-xl p-5">
              <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-5">
                <Brain size={16} weight="duotone" className="text-[--gold]" />
                AI / RAG Performance
              </h2>
              <div className="space-y-4">
                {[
                  { label: "Hit Rate", value: `${(ragStats.hitRate ?? 0).toFixed(1)}%`, sub: "Queries matched KB", color: "text-success" },
                  { label: "Avg Chunks / Reply", value: (ragStats.averageChunks ?? 0).toFixed(2), sub: "Per reply retrieved", color: "text-info" },
                  { label: "Zero-Hit Queries", value: String(ragStats.zeroHitCount ?? 0), sub: "No KB match found", color: "text-danger" },
                  { label: "Total AI Tokens", value: `${((ragStats.totalTokens ?? 0) / 1000).toFixed(1)}k`, sub: "Cumulative usage", color: "text-[--gold]" },
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
            <div className="page-panel bg-bg-elevated rounded-xl p-5">
              <div className="space-y-3">
                <Skeleton className="h-4 w-32" />
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-lg" />
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </TooltipProvider>
  );
}

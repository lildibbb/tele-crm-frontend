"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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

import {
  useSuperadminUsers,
  useSuperadminRagStats,
  useCreateSuperadminUser,
  useDeactivateSuperadminUser,
  useReactivateSuperadminUser,
  useChangeSuperadminUserRole,
  useForceSuperadminPasswordChange,
} from "@/queries/useSuperadminQuery";
import { useAuditLogs } from "@/queries/useAuditLogsQuery";
import { useAuthStore } from "@/store/authStore";
import { UserRole, AuditAction } from "@/types/enums";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";

import {
  Users,
  PencilSimple,
  ProhibitInset,
  LockKey,
  UserPlus,
  CheckCircle,
  ArrowClockwise,
  Database,
  Brain,
  ArrowCounterClockwise,
  Warning,
  DotsThreeVertical,
  CaretDown,
  EnvelopeSimple,
  ListBullets,
} from "@phosphor-icons/react";

import {
  auditIconMap as auditIconMapShared,
  auditColorMap as auditColorMapShared,
  formatAuditAction,
  auditFallbackIcon,
} from "@/lib/audit-utils";

import { apiClient } from "@/lib/api/apiClient";
import { queryKeys } from "@/queries/queryKeys";
import type { ApiResponse } from "@/lib/schemas/common";
import type { UserResponse } from "@/lib/schemas/user.schema";
import type { AuditLog } from "@/lib/schemas/auditLog.schema";
import type { Lead } from "@/lib/schemas/lead.schema";

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
  return <Badge className={cls[role] ?? "badge"}>{role}</Badge>;
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

// ─── Column Definitions ───────────────────────────────────────────────────────

interface UserColumnsProps {
  onEdit: (u: UserResponse) => void;
  onPassword: (u: UserResponse) => void;
  onToggle: (u: UserResponse) => void;
  onChangeEmail: (u: UserResponse) => void;
  onViewLeads: (u: UserResponse) => void;
  currentUserId: string;
}

function getUserColumns({
  onEdit,
  onPassword,
  onToggle,
  onChangeEmail,
  onViewLeads,
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
              <DropdownMenuItem onClick={() => onChangeEmail(u)} className="gap-2">
                <EnvelopeSimple size={14} className="text-info" weight="duotone" />
                Change Email
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewLeads(u)} className="gap-2">
                <ListBullets size={14} className="text-text-secondary" weight="duotone" />
                View Leads
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
  const createUser = useCreateSuperadminUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.STAFF);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser.mutateAsync({ email, password, role });
      setEmail(""); setPassword(""); setRole(UserRole.STAFF);
      onClose();
    } catch { /* error shown from mutation */ }
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
          {createUser.error && <p className="text-xs text-danger">{(createUser.error as Error).message}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={createUser.isPending}>
              {createUser.isPending ? "Creating…" : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Force Password Modal ─────────────────────────────────────────────────────

function ForcePasswordModal({ user, onClose }: { user: UserResponse | null; onClose: () => void }) {
  const forcePasswordChange = useForceSuperadminPasswordChange();
  const [newPassword, setNewPassword] = useState("");
  const [err, setErr] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) { setErr("Password must be at least 8 characters"); return; }
    try {
      await forcePasswordChange.mutateAsync({ id: user!.id, data: { newPassword } });
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
            <Button type="submit" disabled={forcePasswordChange.isPending} variant="destructive">
              {forcePasswordChange.isPending ? "Resetting…" : "Reset Password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Change Role Modal ────────────────────────────────────────────────────────

function ChangeRoleModal({ user, onClose }: { user: UserResponse | null; onClose: () => void }) {
  const changeUserRole = useChangeSuperadminUserRole();
  const [role, setRole] = useState<UserRole>(UserRole.STAFF);

  useEffect(() => { if (user) setRole(user.role as UserRole); }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await changeUserRole.mutateAsync({ id: user!.id, data: { role } }); onClose(); }
    catch { /* handled by mutation */ }
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
            <Button type="submit" disabled={changeUserRole.isPending}>
              {changeUserRole.isPending ? "Saving…" : "Save Role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Change Email Modal ───────────────────────────────────────────────────────

function ChangeEmailModal({ user, onClose }: { user: UserResponse | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [newEmail, setNewEmail] = useState("");
  const [err, setErr] = useState("");

  const mutation = useMutation({
    mutationFn: (email: string) =>
      apiClient.patch<ApiResponse<UserResponse>>(`/superadmin/users/${user!.id}/email`, { email }),
    onSuccess: () => {
      toast.success("Email updated successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.superadmin.users() });
      setNewEmail("");
      setErr("");
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setErr("Please enter a valid email address");
      return;
    }
    mutation.mutate(newEmail);
  };

  return (
    <Dialog open={!!user} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <EnvelopeSimple size={18} weight="duotone" className="text-info" /> Change Email Address
          </DialogTitle>
          <DialogDescription>
            Update the email address for{" "}
            <span className="font-medium text-text-primary">{user?.email}</span>.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="ce-email">New Email</Label>
            <Input
              id="ce-email"
              type="email"
              placeholder="new@company.com"
              value={newEmail}
              onChange={(e) => { setNewEmail(e.target.value); setErr(""); }}
              required
            />
          </div>
          {err && <p className="text-xs text-danger">{err}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Updating…" : "Update Email"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── User Leads Sheet ─────────────────────────────────────────────────────────

function UserLeadsSheet({ user, onClose }: { user: UserResponse | null; onClose: () => void }) {
  const { data: leads, isLoading } = useQuery({
    queryKey: ["superadmin", "users", user?.id, "leads"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Lead[]>>(`/superadmin/users/${user!.id}/leads`);
      return res.data.data;
    },
    enabled: !!user,
  });

  return (
    <Sheet open={!!user} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ListBullets size={18} weight="duotone" className="text-info" />
            Leads for {user?.email}
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          ) : !leads?.length ? (
            <p className="text-sm text-text-muted text-center py-8">No leads found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-xs text-text-secondary font-medium">Telegram ID</th>
                    <th className="text-left py-2 px-3 text-xs text-text-secondary font-medium">Display Name</th>
                    <th className="text-left py-2 px-3 text-xs text-text-secondary font-medium">Status</th>
                    <th className="text-left py-2 px-3 text-xs text-text-secondary font-medium">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-b border-border/50 hover:bg-elevated/50">
                      <td className="py-2 px-3 text-xs data-mono text-text-secondary">{lead.telegramUserId}</td>
                      <td className="py-2 px-3 text-xs text-text-primary">{lead.displayName ?? "—"}</td>
                      <td className="py-2 px-3">
                        <Badge className="text-[10px]">{lead.status}</Badge>
                      </td>
                      <td className="py-2 px-3 text-xs text-text-muted">{timeAgo(lead.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Users Panel ──────────────────────────────────────────────────────────────

export function UsersPanel() {
  const { user: authUser } = useAuthStore();
  const { data: users = [], isLoading: isLoadingUsers, refetch: refetchUsers } = useSuperadminUsers();
  const { data: auditLogs = [], isLoading: isLoadingLogs, refetch: refetchAuditLogs } = useAuditLogs({ take: 100 });
  const { data: ragStats, isLoading: isLoadingRag } = useSuperadminRagStats();
  const deactivateUser = useDeactivateSuperadminUser();
  const reactivateUser = useReactivateSuperadminUser();

  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [roleModal, setRoleModal] = useState<UserResponse | null>(null);
  const [passwordModal, setPasswordModal] = useState<UserResponse | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<UserResponse | null>(null);
  const [changeEmailTarget, setChangeEmailTarget] = useState<UserResponse | null>(null);
  const [leadsTarget, setLeadsTarget] = useState<UserResponse | null>(null);

  // Table states
  const [userSorting, setUserSorting] = useState<SortingState>([]);
  const [userFilters, setUserFilters] = useState<ColumnFiltersState>([]);
  const [userVisibility, setUserVisibility] = useState<VisibilityState>({});

  const [auditSorting, setAuditSorting] = useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [auditFilters, setAuditFilters] = useState<ColumnFiltersState>([]);
  const [auditVisibility, setAuditVisibility] = useState<VisibilityState>({});

  const handleDeactivateConfirm = useCallback(async () => {
    if (!deactivateTarget) return;
    try {
      if (deactivateTarget.isActive) await deactivateUser.mutateAsync(deactivateTarget.id);
      else await reactivateUser.mutateAsync(deactivateTarget.id);
    } finally {
      setDeactivateTarget(null);
    }
  }, [deactivateTarget, deactivateUser, reactivateUser]);

  const userColumns = useMemo(
    () =>
      getUserColumns({
        onEdit: setRoleModal,
        onPassword: setPasswordModal,
        onToggle: setDeactivateTarget,
        onChangeEmail: setChangeEmailTarget,
        onViewLeads: setLeadsTarget,
        currentUserId: authUser?.id ?? "",
      }),
    [authUser?.id],
  );

  const auditColumns = useMemo(() => getAuditColumns(), []);

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

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* ── Modals ── */}
        <CreateUserModal open={showCreate} onClose={() => setShowCreate(false)} />
        <ChangeRoleModal user={roleModal} onClose={() => setRoleModal(null)} />
        <ForcePasswordModal user={passwordModal} onClose={() => setPasswordModal(null)} />
        <ChangeEmailModal user={changeEmailTarget} onClose={() => setChangeEmailTarget(null)} />
        <UserLeadsSheet user={leadsTarget} onClose={() => setLeadsTarget(null)} />

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
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Users</h1>
            <p className="text-sm text-text-secondary mt-1">Platform-wide user management</p>
          </div>
          <Button size="sm" className="gap-1.5 shrink-0" onClick={() => setShowCreate(true)}>
            <UserPlus size={15} weight="bold" /> Add User
          </Button>
        </div>

        {/* ── Users Table ── */}
        <div className="page-panel bg-elevated rounded-xl overflow-hidden">
          <div className="px-5 py-4 bg-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shadow-sm">
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
              onClick={() => refetchUsers()}
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
            <div className="px-5 py-4 bg-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shadow-sm">
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
                onClick={() => refetchAuditLogs()}
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
      </div>
    </TooltipProvider>
  );
}

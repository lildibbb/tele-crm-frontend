"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, UserMinus, ArrowCounterClockwise, ShieldChevron } from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/types/enums";
import {
  useUsersList,
  useInvitationsList,
  useInviteUser,
  useDeactivateUser,
  useReactivateUser,
  useChangeUserRole,
  useDeleteInvitation,
} from "@/queries/useUsersQuery";
import type { UserResponse, InvitationResponse } from "@/lib/schemas/user.schema";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface MobileSettingsTeamProps {}

// ── Helpers ───────────────────────────────────────────────────────────────────
const ROLE_LABELS: Record<string, string> = {
  SUPERADMIN: "Superadmin",
  OWNER: "Owner",
  ADMIN: "Admin",
  STAFF: "Staff",
};

function getInitial(email: string): string {
  return email.charAt(0).toUpperCase();
}

// ── Skeleton Card ─────────────────────────────────────────────────────────────
function SkeletonMemberCard() {
  return (
    <div className="rounded-2xl bg-card border border-border-subtle overflow-hidden">
      <div className="flex items-center gap-3 w-full px-4 py-3">
        <Skeleton className="w-9 h-9 rounded-full shrink-0" />
        <div className="flex-1 min-w-0 space-y-1.5">
          <Skeleton className="h-3.5 w-40 rounded" />
          <Skeleton className="h-3 w-24 rounded" />
        </div>
        <Skeleton className="h-5 w-12 rounded-full shrink-0" />
      </div>
    </div>
  );
}

// ── Member Card ───────────────────────────────────────────────────────────────
function MemberCard({
  member,
  isOwner,
  onTap,
}: {
  member: UserResponse;
  isOwner: boolean;
  onTap?: (member: UserResponse) => void;
}) {
  const initial = getInitial(member.email);
  const roleName = ROLE_LABELS[member.role] ?? member.role;

  const content = (
    <>
      <div className="w-9 h-9 rounded-full bg-crimson/10 border border-crimson/20 flex items-center justify-center shrink-0">
        <span className="text-sm font-bold text-crimson">{initial}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-sans text-[13px] font-semibold text-text-primary truncate">
          {member.email}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              member.isActive ? "bg-success" : "bg-text-muted",
            )}
          />
          <span className="text-[11px] text-text-muted">
            {member.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>
      <Badge variant="secondary" className="text-[10px] shrink-0">
        {roleName}
      </Badge>
    </>
  );

  return (
    <div className="rounded-2xl bg-card border border-border-subtle overflow-hidden">
      {isOwner && onTap ? (
        <button
          className="flex items-center gap-3 w-full px-4 py-3 active:bg-elevated transition-colors"
          onClick={() => onTap(member)}
        >
          {content}
        </button>
      ) : (
        <div className="flex items-center gap-3 w-full px-4 py-3">{content}</div>
      )}
    </div>
  );
}

// ── Pending Invite Chip ───────────────────────────────────────────────────────
function InviteChip({
  invite,
  onDelete,
  isDeleting,
}: {
  invite: InvitationResponse;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const roleName = ROLE_LABELS[invite.role] ?? invite.role;
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border-subtle">
      <div className="flex-1 min-w-0">
        <p className="font-sans text-[12px] text-text-secondary truncate">
          {invite.email ?? "No email"}
        </p>
        <p className="text-[10px] text-text-muted mt-0.5">{roleName} · Pending</p>
      </div>
      <button
        onClick={() => onDelete(invite.id)}
        disabled={isDeleting}
        className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-elevated active:bg-border-subtle transition-colors disabled:opacity-40"
        aria-label="Delete invitation"
      >
        <X size={13} className="text-text-muted" weight="bold" />
      </button>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function MobileSettingsTeam(_props: MobileSettingsTeamProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const role = (user?.role as UserRole) ?? UserRole.STAFF;
  const isOwner = role === UserRole.OWNER;

  // Redirect STAFF immediately
  useEffect(() => {
    if (role === UserRole.STAFF) {
      router.replace("/");
    }
  }, [role, router]);

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data: members = [], isLoading: membersLoading } = useUsersList();
  const { data: invitations = [], isLoading: invitesLoading } =
    useInvitationsList();

  // ── Mutations ──────────────────────────────────────────────────────────────
  const deactivate = useDeactivateUser();
  const reactivate = useReactivateUser();
  const changeRole = useChangeUserRole();
  const inviteUser = useInviteUser();
  const deleteInvitation = useDeleteInvitation();

  // ── UI state ───────────────────────────────────────────────────────────────
  const [selectedMember, setSelectedMember] = useState<UserResponse | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showChangeRoleSheet, setShowChangeRoleSheet] = useState(false);
  const [showInviteSheet, setShowInviteSheet] = useState(false);
  const [newRole, setNewRole] = useState<string>("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("STAFF");

  const handleMemberTap = (member: UserResponse) => {
    setSelectedMember(member);
    setShowActionSheet(true);
  };

  const handleDeactivateToggle = async () => {
    if (!selectedMember) return;
    setShowActionSheet(false);
    try {
      if (selectedMember.isActive) {
        await deactivate.mutateAsync(selectedMember.id);
        toast.success("User deactivated");
      } else {
        await reactivate.mutateAsync(selectedMember.id);
        toast.success("User reactivated");
      }
    } catch {
      toast.error("Action failed. Please try again.");
    }
  };

  const handleOpenChangeRole = () => {
    setShowActionSheet(false);
    setNewRole(selectedMember?.role ?? "STAFF");
    setShowChangeRoleSheet(true);
  };

  const handleChangeRole = async () => {
    if (!selectedMember || !newRole) return;
    try {
      await changeRole.mutateAsync({
        id: selectedMember.id,
        data: { role: newRole as UserRole },
      });
      toast.success("Role updated");
      setShowChangeRoleSheet(false);
    } catch {
      toast.error("Failed to change role. Please try again.");
    }
  };

  const handleSendInvite = async () => {
    if (!inviteEmail) return;
    try {
      await inviteUser.mutateAsync({
        email: inviteEmail,
        role: inviteRole as UserRole,
      });
      toast.success("Invitation sent");
      setShowInviteSheet(false);
      setInviteEmail("");
      setInviteRole("STAFF");
    } catch {
      toast.error("Failed to send invitation. Please try again.");
    }
  };

  const handleDeleteInvite = async (id: string) => {
    try {
      await deleteInvitation.mutateAsync(id);
      toast.success("Invitation deleted");
    } catch {
      toast.error("Failed to delete invitation.");
    }
  };

  if (role === UserRole.STAFF) return null;

  const showSkeleton = membersLoading && members.length === 0;
  const pendingInvites = invitations.filter((inv) => inv.email !== null || true);

  return (
    <>
      <div className="min-h-full bg-void pb-8">
        <div className="px-4 py-4 space-y-4">
          {/* ── Team Members Section ────────────────────────────────────── */}
          <div>
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest px-1 mb-2">
              Team Members
            </p>

            <div className="space-y-2">
              {showSkeleton ? (
                <>
                  <SkeletonMemberCard />
                  <SkeletonMemberCard />
                  <SkeletonMemberCard />
                </>
              ) : members.length === 0 ? (
                <div className="rounded-2xl bg-card border border-border-subtle px-4 py-8 text-center">
                  <p className="font-sans text-[13px] text-text-muted">
                    No team members yet
                  </p>
                </div>
              ) : (
                members.map((member) => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    isOwner={isOwner}
                    onTap={isOwner ? handleMemberTap : undefined}
                  />
                ))
              )}
            </div>
          </div>

          {/* ── Pending Invitations Section ─────────────────────────────── */}
          {isOwner && (invitesLoading || pendingInvites.length > 0) && (
            <div>
              <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest px-1 mb-2">
                Pending Invitations
              </p>
              <div className="space-y-2">
                {invitesLoading ? (
                  <>
                    <Skeleton className="h-14 rounded-xl" />
                    <Skeleton className="h-14 rounded-xl" />
                  </>
                ) : (
                  pendingInvites.map((inv) => (
                    <InviteChip
                      key={inv.id}
                      invite={inv}
                      onDelete={handleDeleteInvite}
                      isDeleting={deleteInvitation.isPending}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Invite FAB (OWNER only) ──────────────────────────────────────── */}
      {isOwner && (
        <button
          onClick={() => setShowInviteSheet(true)}
          className={cn(
            "fixed right-5 flex items-center justify-center",
            "w-14 h-14 rounded-full bg-crimson z-30",
            "shadow-[0_4px_20px_rgba(196,35,45,0.4)]",
            "active:scale-90 transition-transform duration-150",
          )}
          style={{ bottom: "calc(60px + env(safe-area-inset-bottom) + 20px)" }}
          aria-label="Invite team member"
        >
          <Plus size={24} className="text-white" weight="bold" />
        </button>
      )}

      {/* ── Action Sheet ────────────────────────────────────────────────── */}
      <Sheet open={showActionSheet} onOpenChange={setShowActionSheet}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl px-0 pb-[calc(env(safe-area-inset-bottom)+16px)]"
        >
          <SheetHeader className="px-5 pb-3 border-b border-border-subtle">
            <SheetTitle className="text-left text-[15px] font-semibold text-text-primary">
              {selectedMember?.email}
            </SheetTitle>
          </SheetHeader>

          <div className="mt-2 space-y-0.5">
            <button
              onClick={handleDeactivateToggle}
              disabled={deactivate.isPending || reactivate.isPending}
              className="flex items-center gap-3.5 w-full px-5 py-3.5 active:bg-elevated transition-colors disabled:opacity-40"
            >
              {selectedMember?.isActive ? (
                <UserMinus size={18} className="text-danger shrink-0" />
              ) : (
                <ArrowCounterClockwise size={18} className="text-success shrink-0" />
              )}
              <span
                className={cn(
                  "font-sans text-[14px] font-medium",
                  selectedMember?.isActive ? "text-danger" : "text-success",
                )}
              >
                {selectedMember?.isActive ? "Deactivate User" : "Reactivate User"}
              </span>
            </button>

            <button
              onClick={handleOpenChangeRole}
              className="flex items-center gap-3.5 w-full px-5 py-3.5 active:bg-elevated transition-colors"
            >
              <ShieldChevron size={18} className="text-text-secondary shrink-0" />
              <span className="font-sans text-[14px] font-medium text-text-primary">
                Change Role
              </span>
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Change Role Sheet ────────────────────────────────────────────── */}
      <Sheet open={showChangeRoleSheet} onOpenChange={setShowChangeRoleSheet}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl px-5 pb-[calc(env(safe-area-inset-bottom)+16px)]"
        >
          <SheetHeader className="pb-4">
            <SheetTitle className="text-left text-[15px] font-semibold text-text-primary">
              Change Role
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-4">
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="STAFF">Staff</SelectItem>
              </SelectContent>
            </Select>

            <button
              onClick={handleChangeRole}
              disabled={changeRole.isPending || !newRole}
              className={cn(
                "w-full h-12 rounded-xl font-sans text-[14px] font-semibold text-white",
                "bg-crimson active:bg-crimson/80 transition-colors",
                "disabled:opacity-40",
              )}
            >
              {changeRole.isPending ? "Saving…" : "Save Role"}
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Invite Sheet ─────────────────────────────────────────────────── */}
      <Sheet open={showInviteSheet} onOpenChange={setShowInviteSheet}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl px-5 pb-[calc(env(safe-area-inset-bottom)+16px)]"
        >
          <SheetHeader className="pb-4">
            <SheetTitle className="text-left text-[15px] font-semibold text-text-primary">
              Invite Team Member
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-3">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Email address"
              className={cn(
                "w-full h-12 px-4 rounded-xl border border-border-subtle bg-elevated",
                "font-sans text-[14px] text-text-primary placeholder:text-text-muted",
                "outline-none focus:border-border-default transition-colors",
              )}
            />

            <Select value={inviteRole} onValueChange={setInviteRole}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="STAFF">Staff</SelectItem>
              </SelectContent>
            </Select>

            <button
              onClick={handleSendInvite}
              disabled={inviteUser.isPending || !inviteEmail}
              className={cn(
                "w-full h-12 rounded-xl font-sans text-[14px] font-semibold text-white",
                "bg-crimson active:bg-crimson/80 transition-colors",
                "disabled:opacity-40",
              )}
            >
              {inviteUser.isPending ? "Sending…" : "Send Invite"}
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

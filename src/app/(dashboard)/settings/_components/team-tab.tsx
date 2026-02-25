"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus, Copy, Check, UserX, RefreshCw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { useUsersStore } from "@/store/usersStore";
import {
  InviteUserSchema,
  type InviteUserInput,
} from "@/lib/schemas/user.schema";
import { UserRole } from "@/types/enums";
import { toast } from "sonner";

const ROLE_CONFIG: Record<string, { label: string; cls: string }> = {
  OWNER: { label: "Owner", cls: "badge-owner" },
  ADMIN: { label: "Admin", cls: "badge-admin" },
  STAFF: { label: "Staff", cls: "badge-staff" },
  SUPERADMIN: { label: "Superadmin", cls: "badge-owner" },
};

export function TeamTab() {
  const [showModal, setShowModal] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    users,
    invitations,
    isLoading,
    fetchUsers,
    fetchInvitations,
    inviteUser,
    deactivateUser,
    reactivateUser,
    deleteInvitation,
  } = useUsersStore();

  useEffect(() => {
    fetchUsers();
    fetchInvitations();
  }, [fetchUsers, fetchInvitations]);

  const form = useForm<InviteUserInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(InviteUserSchema as any),
    defaultValues: { role: UserRole.STAFF, email: "" },
  });

  const onInvite = async (data: InviteUserInput) => {
    try {
      const inv = await inviteUser(data);
      setInviteLink(inv.telegramDeepLink);
      await fetchInvitations();
      toast.success("Invite generated");
    } catch {
      toast.error("Failed to generate invite");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setInviteLink(null);
    setCopied(false);
    form.reset();
  };

  const handleCopy = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeactivate = async (id: string) => {
    try {
      await deactivateUser(id);
      toast.success("User deactivated");
      await fetchUsers();
    } catch {
      toast.error("Failed to deactivate user");
    }
  };

  const handleReactivate = async (id: string) => {
    try {
      await reactivateUser(id);
      toast.success("User reactivated");
      await fetchUsers();
    } catch {
      toast.error("Failed to reactivate user");
    }
  };

  const handleDeleteInvitation = async (id: string) => {
    try {
      await deleteInvitation(id);
      toast.success("Invitation revoked");
    } catch {
      toast.error("Failed to revoke invitation");
    }
  };

  return (
    <div className="space-y-5 animate-in-up">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-text-primary">Team Members</h2>
        <Button onClick={() => setShowModal(true)} className="gap-1.5">
          <UserPlus className="h-4 w-4" /> Invite Member
        </Button>
      </div>

      {/* Members table */}
      <div className="bg-elevated rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-elevated/40 hover:bg-elevated/40">
                  {["Member", "Role", "Status", "Last Login", "Actions"].map(
                    (h) => (
                      <TableHead
                        key={h}
                        className="text-[11px] font-sans font-medium text-text-secondary uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </TableHead>
                    ),
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((m) => {
                  const roleConf = ROLE_CONFIG[m.role] ?? {
                    label: m.role,
                    cls: "badge-staff",
                  };
                  const initials = m.email.slice(0, 2).toUpperCase();
                  return (
                    <TableRow
                      key={m.id}
                      className={`border-border-subtle/50 ${!m.isActive ? "opacity-50" : ""}`}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] flex-shrink-0 ${m.role === UserRole.OWNER ? "bg-gold/20 border border-gold/40 text-gold" : "bg-crimson/20 border border-crimson/30 text-crimson"}`}
                          >
                            {initials}
                          </div>
                          <div>
                            <p className="font-sans font-medium text-[13px] text-text-primary whitespace-nowrap">
                              {m.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`badge ${roleConf.cls}`}>
                          {roleConf.label}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`badge ${m.isActive ? "badge-confirmed" : "badge-failed"}`}
                        >
                          {m.isActive ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="data-mono text-[12px] whitespace-nowrap">
                        {m.lastLoginAt
                          ? new Date(m.lastLoginAt).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {!m.isActive ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1.5 text-success hover:text-success h-7 text-xs"
                            onClick={() => handleReactivate(m.id)}
                          >
                            <RefreshCw className="h-3 w-3" /> Reactivate
                          </Button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs gap-1 text-danger hover:text-danger hover:bg-danger/10"
                              onClick={() => handleDeactivate(m.id)}
                            >
                              <UserX className="h-3 w-3" /> Deactivate
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Pending Invitations */}
      <div className="bg-elevated rounded-xl overflow-hidden">
        <div className="px-5 py-4 bg-card rounded-t-xl">
          <h3 className="font-sans font-semibold text-[14px] text-text-primary">
            Pending Invitations
          </h3>
        </div>
        <div className="px-5 pb-5 pt-4">
          {invitations.length === 0 ? (
            <p className="text-sm font-sans text-text-secondary">
              No pending invitations.
            </p>
          ) : (
            <div className="space-y-0">
              {invitations.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center gap-4 py-3 border-b border-border-subtle/50 last:border-0 flex-wrap sm:flex-nowrap"
                >
                  <p className="data-mono flex-1 min-w-[200px]">
                    {inv.email ?? "—"}
                  </p>
                  <span
                    className={`badge ${ROLE_CONFIG[inv.role]?.cls ?? "badge-staff"}`}
                  >
                    {ROLE_CONFIG[inv.role]?.label ?? inv.role}
                  </span>
                  <div className="flex items-center gap-1 text-warning text-xs font-sans whitespace-nowrap">
                    <Clock className="h-3 w-3" />
                    Expires {new Date(inv.expiresAt).toLocaleDateString()}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-danger hover:text-danger hover:bg-danger/10"
                    onClick={() => handleDeleteInvitation(inv.id)}
                  >
                    Revoke
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      <Dialog
        open={showModal}
        onOpenChange={(open) => {
          if (!open) closeModal();
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-bold text-xl text-text-primary">
              Invite Team Member
            </DialogTitle>
          </DialogHeader>

          {!inviteLink ? (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onInvite)}
                className="space-y-5"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-text-secondary">
                        Email Address (optional)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="colleague@company.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-text-secondary">
                        Role
                      </FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          {([UserRole.ADMIN, UserRole.STAFF] as const).map(
                            (r) => (
                              <button
                                key={r}
                                type="button"
                                onClick={() => field.onChange(r)}
                                className={`flex-1 py-2.5 rounded-lg text-sm font-sans font-medium transition-colors border ${field.value === r ? "border-crimson bg-crimson/10 text-text-primary" : "border-border-default bg-card text-text-secondary hover:text-text-primary"}`}
                              >
                                {ROLE_CONFIG[r].label}
                              </button>
                            ),
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <p className="text-[11px] font-sans text-text-muted">
                  They&apos;ll receive a Telegram deep link to set up their
                  account.
                </p>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={closeModal}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting
                      ? "Generating…"
                      : "Generate Invite Link"}
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/20">
                <Check className="h-4 w-4 text-success flex-shrink-0" />
                <p className="text-xs font-sans text-success">
                  Invite link generated successfully.
                </p>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-text-secondary">
                  Invite Deep Link
                </p>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={inviteLink}
                    className="text-xs font-mono flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className={`gap-1.5 flex-shrink-0 ${copied ? "border-success/30 bg-success/10 text-success hover:text-success" : ""}`}
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" /> Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <p className="text-[11px] font-sans text-text-muted">
                Share this Telegram deep link directly with your team member.
              </p>
              <Button variant="outline" className="w-full" onClick={closeModal}>
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

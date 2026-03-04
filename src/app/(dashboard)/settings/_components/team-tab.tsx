"use client";

import { useState } from "react";
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
import {
  useUsersList,
  useInvitationsList,
  useInviteUser,
  useDeactivateUser,
  useReactivateUser,
  useDeleteInvitation,
} from "@/queries/useUsersQuery";
import {
  InviteUserSchema,
  type InviteUserInput,
} from "@/lib/schemas/user.schema";
import { UserRole } from "@/types/enums";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const ROLE_CONFIG: Record<string, { label: string; cls: string }> = {
  OWNER: {
    label: "Owner",
    cls: "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-1 ring-inset ring-amber-500/25",
  },
  ADMIN: {
    label: "Admin",
    cls: "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/15 text-blue-700 dark:text-blue-400 ring-1 ring-inset ring-blue-500/25",
  },
  STAFF: {
    label: "Staff",
    cls: "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-muted text-text-secondary ring-1 ring-inset ring-border-subtle",
  },
  SUPERADMIN: {
    label: "Superadmin",
    cls: "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-1 ring-inset ring-amber-500/25",
  },
};

export function TeamTab() {
  const [showModal, setShowModal] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: users = [], isLoading } = useUsersList();
  const { data: invitations = [] } = useInvitationsList();
  const inviteUserMutation = useInviteUser();
  const deactivateUserMutation = useDeactivateUser();
  const reactivateUserMutation = useReactivateUser();
  const deleteInvitationMutation = useDeleteInvitation();

  const form = useForm<InviteUserInput>({
    // Zod v4 schemas require `as any` due to type mismatch with @hookform/resolvers
    resolver: zodResolver(InviteUserSchema as any), // eslint-disable-line @typescript-eslint/no-explicit-any
    defaultValues: { role: UserRole.STAFF, email: "" },
  });

  const onInvite = async (data: InviteUserInput) => {
    try {
      const res = await inviteUserMutation.mutateAsync(data);
      setInviteLink(res.data.data.telegramDeepLink);
      toast.success("Invite generated");
    } catch {
      toast.error("Couldn't create the invitation. Please try again.");
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
      await deactivateUserMutation.mutateAsync(id);
      toast.success("User deactivated");
    } catch {
      toast.error("Couldn't deactivate this user. Please try again.");
    }
  };

  const handleReactivate = async (id: string) => {
    try {
      await reactivateUserMutation.mutateAsync(id);
      toast.success("User reactivated");
    } catch {
      toast.error("Couldn't reactivate this user. Please try again.");
    }
  };

  const handleDeleteInvitation = async (id: string) => {
    try {
      await deleteInvitationMutation.mutateAsync(id);
      toast.success("Invitation revoked");
    } catch {
      toast.error("Couldn't revoke this invitation. Please try again.");
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
                    cls: "inline-flex items-center px-1.5 py-0 rounded text-[9px] font-semibold bg-muted text-text-secondary ring-1 ring-inset ring-border-subtle",
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
                        <Badge className={roleConf.cls}>{roleConf.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            m.isActive
                              ? "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-1 ring-inset ring-emerald-500/20"
                              : "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-700 dark:text-red-400 ring-1 ring-inset ring-red-500/20"
                          }
                        >
                          {m.isActive ? "Active" : "Inactive"}
                        </Badge>
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
        <div className="px-5 py-4 bg-card rounded-t-xl shadow-sm">
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
                    className={
                      ROLE_CONFIG[inv.role]?.cls ??
                      "inline-flex items-center px-1.5 py-0 rounded text-[9px] font-semibold bg-muted text-text-secondary ring-1 ring-inset ring-border-subtle"
                    }
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
                        Email Address <span className="text-crimson">*</span>
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

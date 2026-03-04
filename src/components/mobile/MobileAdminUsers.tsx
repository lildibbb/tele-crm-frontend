"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  MagnifyingGlass,
  Users,
  Warning,
  ArrowCounterClockwise,
  X,
  ShieldCheck,
  KeyReturn,
  CaretDown,
  CheckCircle,
  ProhibitInset,
} from "@phosphor-icons/react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { roleBadgeCls } from "@/lib/badge-config";
import {
  useSuperadminUsers,
  useDeactivateSuperadminUser,
  useReactivateSuperadminUser,
  useChangeSuperadminUserRole,
  useForceSuperadminPasswordChange,
} from "@/queries/useSuperadminQuery";
import type { UserResponse } from "@/lib/schemas/user.schema";
import { UserRole } from "@/types/enums";

// ── Constants ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;
const ROLES = [UserRole.SUPERADMIN, UserRole.OWNER, UserRole.STAFF] as const;

// ── Props ──────────────────────────────────────────────────────────────────────

export interface MobileAdminUsersProps {}

// ── Skeleton card ──────────────────────────────────────────────────────────────

function UserCardSkeleton() {
  return (
    <div className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl bg-card border border-border-subtle">
      <Skeleton className="w-9 h-9 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-40 rounded-md" />
        <Skeleton className="h-3 w-24 rounded-md" />
      </div>
    </div>
  );
}

// ── User action sheet ──────────────────────────────────────────────────────────

function UserActionSheet({
  user,
  onClose,
}: {
  user: UserResponse | null;
  onClose: () => void;
}) {
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState(false);
  const [rolePickerOpen, setRolePickerOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const deactivate = useDeactivateSuperadminUser();
  const reactivate = useReactivateSuperadminUser();
  const changeRole = useChangeSuperadminUserRole();
  const forcePassword = useForceSuperadminPasswordChange();

  // Reset sub-states when sheet closes
  useEffect(() => {
    if (!user) {
      setConfirmDeactivate(false);
      setConfirmPassword(false);
      setRolePickerOpen(false);
      setPasswordInput("");
      setPasswordError("");
    }
  }, [user]);

  if (!user) return null;

  const handleDeactivate = () => {
    deactivate.mutate(user.id, {
      onSuccess: () => {
        setConfirmDeactivate(false);
        onClose();
      },
    });
  };

  const handleReactivate = () => {
    reactivate.mutate(user.id, { onSuccess: onClose });
  };

  const handleChangeRole = (newRole: string) => {
    changeRole.mutate(
      { id: user.id, data: { role: newRole as UserResponse["role"] } },
      {
        onSuccess: () => {
          setRolePickerOpen(false);
          onClose();
        },
      },
    );
  };

  const handleForcePassword = () => {
    if (passwordInput.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }
    setPasswordError("");
    forcePassword.mutate(
      { id: user.id, data: { newPassword: passwordInput } },
      {
        onSuccess: () => {
          setConfirmPassword(false);
          setPasswordInput("");
          onClose();
        },
      },
    );
  };

  const isBusy =
    deactivate.isPending ||
    reactivate.isPending ||
    changeRole.isPending ||
    forcePassword.isPending;

  return (
    <>
      {/* ── Main action sheet ─────────────────────────────────────────── */}
      <SheetContent
        side="bottom"
        className="rounded-t-3xl bg-card border-border-subtle px-0 pb-[env(safe-area-inset-bottom)]"
      >
        <SheetHeader className="px-5 pb-4 border-b border-border-subtle">
          <div className="w-10 h-1 rounded-full bg-border-default mx-auto mb-4" />
          <SheetTitle className="font-display font-bold text-[17px] text-text-primary text-left">
            User Actions
          </SheetTitle>
        </SheetHeader>

        {/* User info */}
        <div className="px-5 py-4 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-crimson/10 flex items-center justify-center shrink-0">
              <span className="text-[15px] font-bold text-crimson">
                {user.email[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-text-primary truncate">
                {user.email}
              </p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span
                  className={cn(
                    "font-mono text-[10px] px-1.5 py-0.5 rounded-full font-semibold leading-none",
                    roleBadgeCls(user.role),
                  )}
                >
                  {user.role}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-text-muted">
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      user.isActive ? "bg-success" : "bg-text-muted",
                    )}
                  />
                  {user.isActive ? "Active" : "Inactive"}
                </span>
                <span className="text-[11px] text-text-muted font-mono">
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 py-3 space-y-2">
          {/* Deactivate / Reactivate */}
          {user.isActive ? (
            confirmDeactivate ? (
              <div className="rounded-2xl bg-danger/8 border border-danger/20 p-4 space-y-3">
                <p className="font-sans text-[13px] text-text-primary font-medium">
                  Deactivate <span className="font-bold">{user.email}</span>?
                  They won&apos;t be able to log in.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmDeactivate(false)}
                    className="flex-1 min-h-[44px] rounded-xl bg-elevated font-sans text-[13px] font-semibold text-text-secondary active:bg-card transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeactivate}
                    disabled={isBusy}
                    className="flex-1 min-h-[44px] rounded-xl bg-danger font-sans text-[13px] font-semibold text-white active:bg-danger/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
                  >
                    {deactivate.isPending ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <ProhibitInset size={14} weight="bold" />
                        Deactivate
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDeactivate(true)}
                disabled={isBusy}
                className="flex items-center gap-3 w-full min-h-[52px] px-4 rounded-2xl bg-elevated active:bg-card border border-border-subtle transition-colors disabled:opacity-50"
              >
                <span className="w-8 h-8 rounded-xl bg-danger/10 flex items-center justify-center shrink-0">
                  <ProhibitInset size={16} weight="fill" className="text-danger" />
                </span>
                <span className="font-sans text-[14px] font-medium text-text-primary">
                  Deactivate User
                </span>
              </button>
            )
          ) : (
            <button
              onClick={handleReactivate}
              disabled={isBusy}
              className="flex items-center gap-3 w-full min-h-[52px] px-4 rounded-2xl bg-elevated active:bg-card border border-border-subtle transition-colors disabled:opacity-50"
            >
              <span className="w-8 h-8 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
                {reactivate.isPending ? (
                  <span className="w-4 h-4 border-2 border-success border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle size={16} weight="fill" className="text-success" />
                )}
              </span>
              <span className="font-sans text-[14px] font-medium text-text-primary">
                Reactivate User
              </span>
            </button>
          )}

          {/* Change Role */}
          <button
            onClick={() => setRolePickerOpen(true)}
            disabled={isBusy}
            className="flex items-center gap-3 w-full min-h-[52px] px-4 rounded-2xl bg-elevated active:bg-card border border-border-subtle transition-colors disabled:opacity-50"
          >
            <span className="w-8 h-8 rounded-xl bg-info/10 flex items-center justify-center shrink-0">
              <ShieldCheck size={16} weight="fill" className="text-info" />
            </span>
            <span className="flex-1 font-sans text-[14px] font-medium text-text-primary text-left">
              Change Role
            </span>
            <CaretDown size={14} className="text-text-muted" />
          </button>

          {/* Force Password Reset */}
          {!confirmPassword ? (
            <button
              onClick={() => setConfirmPassword(true)}
              disabled={isBusy}
              className="flex items-center gap-3 w-full min-h-[52px] px-4 rounded-2xl bg-elevated active:bg-card border border-border-subtle transition-colors disabled:opacity-50"
            >
              <span className="w-8 h-8 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
                <KeyReturn size={16} weight="fill" className="text-warning" />
              </span>
              <span className="font-sans text-[14px] font-medium text-text-primary">
                Force Password Reset
              </span>
            </button>
          ) : (
            <div className="rounded-2xl bg-warning/8 border border-warning/20 p-4 space-y-3">
              <p className="font-sans text-[13px] text-text-primary font-medium">
                Set new password for{" "}
                <span className="font-bold">{user.email}</span>
              </p>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="New password (min 8 chars)"
                className="w-full h-11 px-3 rounded-xl bg-elevated border border-border-subtle text-[13px] font-sans text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-warning/50"
              />
              {passwordError && (
                <p className="text-[11px] text-danger">{passwordError}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setConfirmPassword(false);
                    setPasswordInput("");
                    setPasswordError("");
                  }}
                  className="flex-1 min-h-[44px] rounded-xl bg-elevated font-sans text-[13px] font-semibold text-text-secondary active:bg-card transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleForcePassword}
                  disabled={isBusy}
                  className="flex-1 min-h-[44px] rounded-xl bg-warning font-sans text-[13px] font-semibold text-white active:bg-warning/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
                >
                  {forcePassword.isPending ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <KeyReturn size={14} weight="bold" />
                      Set Password
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>

      {/* ── Role picker nested sheet ───────────────────────────────────── */}
      <Sheet open={rolePickerOpen} onOpenChange={setRolePickerOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl bg-card border-border-subtle px-0 pb-[env(safe-area-inset-bottom)]"
        >
          <SheetHeader className="px-5 pb-4 border-b border-border-subtle">
            <div className="w-10 h-1 rounded-full bg-border-default mx-auto mb-4" />
            <SheetTitle className="font-display font-bold text-[17px] text-text-primary text-left">
              Select Role
            </SheetTitle>
          </SheetHeader>
          <div className="px-4 py-3 space-y-2">
            {ROLES.map((r) => (
              <button
                key={r}
                onClick={() => handleChangeRole(r)}
                disabled={changeRole.isPending}
                className={cn(
                  "flex items-center gap-3 w-full min-h-[52px] px-4 rounded-2xl border transition-colors disabled:opacity-50",
                  user.role === r
                    ? "bg-crimson/8 border-crimson/30"
                    : "bg-elevated active:bg-card border-border-subtle",
                )}
              >
                <span
                  className={cn(
                    "font-mono text-[11px] px-2 py-0.5 rounded-full font-semibold leading-none",
                    roleBadgeCls(r),
                  )}
                >
                  {r}
                </span>
                {user.role === r && (
                  <CheckCircle
                    size={16}
                    weight="fill"
                    className="ml-auto text-crimson"
                  />
                )}
                {changeRole.isPending && user.role !== r && (
                  <span className="ml-auto w-4 h-4 border-2 border-text-muted border-t-transparent rounded-full animate-spin" />
                )}
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function MobileAdminUsers(_props: MobileAdminUsersProps) {
  const router = useRouter();
  const { user: authUser } = useAuthStore();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [page, setPage] = useState(1);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Role guard
  useEffect(() => {
    if (authUser && authUser.role !== UserRole.SUPERADMIN) {
      router.replace("/");
    }
  }, [authUser, router]);

  // Debounce search input
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 300);
  }, []);

  const { data: allUsers = [], isLoading, isError, refetch } = useSuperadminUsers();

  // Filter + paginate client-side (superadmin endpoint returns all users)
  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();
    if (!q) return allUsers;
    return allUsers.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q),
    );
  }, [allUsers, debouncedSearch]);

  const paginated = useMemo(
    () => filtered.slice(0, page * PAGE_SIZE),
    [filtered, page],
  );

  const hasMore = paginated.length < filtered.length;

  // Guard: don't render before auth check
  if (authUser && authUser.role !== UserRole.SUPERADMIN) return null;

  return (
    <div className="min-h-full bg-void pb-8">
      {/* ── Search bar ──────────────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-2">
        <div className="relative">
          <MagnifyingGlass
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
          />
          <input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full h-11 pl-9 pr-9 rounded-xl bg-elevated border border-border-subtle text-[13px] font-sans text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-crimson/30"
            placeholder="Search users…"
          />
          {search && (
            <button
              onClick={() => {
                setSearch("");
                setDebouncedSearch("");
                setPage(1);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg active:bg-elevated"
            >
              <X size={14} className="text-text-muted" />
            </button>
          )}
        </div>
      </div>

      {/* ── Stats row ────────────────────────────────────────────────── */}
      {!isLoading && !isError && allUsers.length > 0 && (
        <div className="flex gap-2 px-4 pb-3">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-elevated text-[11px] font-sans text-text-muted">
            <Users size={12} weight="fill" />
            {allUsers.length} total
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-elevated text-[11px] font-sans text-text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            {allUsers.filter((u) => u.isActive).length} active
          </span>
          {debouncedSearch && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-elevated text-[11px] font-sans text-text-muted">
              {filtered.length} results
            </span>
          )}
        </div>
      )}

      {/* ── Error state ──────────────────────────────────────────────── */}
      {isError && (
        <div className="flex items-center gap-2.5 mx-4 mt-2 px-3.5 py-3 rounded-xl bg-danger/10">
          <Warning size={16} weight="fill" className="text-danger shrink-0" />
          <span className="flex-1 font-sans text-[13px] text-danger">
            Failed to load users
          </span>
          <button
            onClick={() => void refetch()}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <ArrowCounterClockwise size={16} className="text-text-secondary" />
          </button>
        </div>
      )}

      {/* ── Skeleton ─────────────────────────────────────────────────── */}
      {isLoading && (
        <div className="px-4 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <UserCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────────────── */}
      {!isLoading && !isError && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 py-20 px-8">
          <span className="w-16 h-16 rounded-2xl bg-elevated flex items-center justify-center">
            <Users size={32} weight="duotone" className="text-text-muted" />
          </span>
          <div className="text-center space-y-1">
            <p className="font-sans font-bold text-[17px] text-text-primary">
              No users found
            </p>
            <p className="font-sans text-[13px] text-text-muted">
              {debouncedSearch
                ? `No users match "${debouncedSearch}"`
                : "No users exist yet."}
            </p>
          </div>
        </div>
      )}

      {/* ── User list ────────────────────────────────────────────────── */}
      {!isLoading && paginated.length > 0 && (
        <div className="px-4 space-y-2">
          {paginated.map((u) => (
            <button
              key={u.id}
              onClick={() => setSelectedUser(u)}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl bg-card border border-border-subtle active:bg-elevated transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-crimson/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-crimson">
                  {u.email[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[13px] font-semibold text-text-primary truncate">
                  {u.email}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full shrink-0",
                      u.isActive ? "bg-success" : "bg-text-muted",
                    )}
                  />
                  <span
                    className={cn(
                      "font-mono text-[10px] px-1.5 py-0.5 rounded-full font-semibold leading-none",
                      roleBadgeCls(u.role),
                    )}
                  >
                    {u.role}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ── Load more ────────────────────────────────────────────────── */}
      {!isLoading && hasMore && (
        <div className="flex justify-center px-4 pt-4 pb-2">
          <button
            onClick={() => setPage((p) => p + 1)}
            className="min-h-[44px] px-6 rounded-full bg-card border border-border-subtle font-sans text-[13px] font-semibold text-text-secondary active:bg-elevated transition-colors"
          >
            Load more
          </button>
        </div>
      )}

      {/* ── User actions sheet ───────────────────────────────────────── */}
      <Sheet open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <UserActionSheet
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      </Sheet>
    </div>
  );
}

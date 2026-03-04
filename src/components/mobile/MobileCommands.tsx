"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowUp,
  ArrowDown,
  Trash,
  Plus,
  CaretLeft,
  ListBullets,
} from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/types/enums";
import { commandMenuApi } from "@/lib/api/commandMenu";
import type { CommandMenu } from "@/lib/schemas/commandMenu.schema";
import { EMPTY_TIPTAP_DOC } from "@/lib/schemas/commandMenu.schema";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface MobileCommandsProps {}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function MobileCommands(_props: MobileCommandsProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const role = (user?.role as UserRole) ?? "STAFF";
  const queryClient = useQueryClient();

  const [editingCmd, setEditingCmd] = useState<CommandMenu | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newCommand, setNewCommand] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Role guard — redirect STAFF to home
  useEffect(() => {
    if (role === "STAFF") {
      router.replace("/");
    }
  }, [role, router]);

  // ── Query ──────────────────────────────────────────────────────────────────

  const { data, isLoading } = useQuery({
    queryKey: ["commandMenu"],
    queryFn: () => commandMenuApi.findAll().then((r) => r.data.data),
    enabled: role !== "STAFF",
  });

  const commands = data ?? [];

  // ── Invalidation helper ────────────────────────────────────────────────────

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["commandMenu"] });

  // ── Mutations ──────────────────────────────────────────────────────────────

  const updateMutation = useMutation({
    mutationFn: ({ id, label }: { id: string; label: string }) =>
      commandMenuApi.update(id, { label }),
    onSuccess: () => {
      invalidate();
      setEditingCmd(null);
    },
  });

  const createMutation = useMutation({
    mutationFn: ({ command, label }: { command: string; label: string }) =>
      commandMenuApi.create({ command, label, content: EMPTY_TIPTAP_DOC }),
    onSuccess: () => {
      invalidate();
      setShowAdd(false);
      setNewCommand("");
      setNewLabel("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => commandMenuApi.remove(id),
    onSuccess: () => {
      invalidate();
      setDeleteId(null);
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (ids: string[]) =>
      commandMenuApi.reorder({
        items: ids.map((id, order) => ({ id, order })),
      }),
    onSuccess: invalidate,
  });

  // ── Reorder handlers ───────────────────────────────────────────────────────

  function moveUp(idx: number) {
    if (idx === 0) return;
    const reordered = [...commands];
    [reordered[idx - 1], reordered[idx]] = [reordered[idx], reordered[idx - 1]];
    reorderMutation.mutate(reordered.map((c) => c.id));
  }

  function moveDown(idx: number) {
    if (idx === commands.length - 1) return;
    const reordered = [...commands];
    [reordered[idx], reordered[idx + 1]] = [reordered[idx + 1], reordered[idx]];
    reorderMutation.mutate(reordered.map((c) => c.id));
  }

  function openEdit(cmd: CommandMenu) {
    setEditingCmd(cmd);
    setEditLabel(cmd.label);
  }

  if (role === "STAFF") return null;

  return (
    <div className="flex flex-col min-h-screen bg-void text-text-primary font-sans">
      <div className="pt-[env(safe-area-inset-top)]" />

      {/* ── Header ──────────────────────────────────────────────────── */}
      <header className="flex items-center h-[52px] px-4 bg-base border-b border-border-subtle sticky top-0 z-20">
        <button
          onClick={() => router.back()}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-text-secondary active:opacity-70 transition-opacity"
          aria-label="Go back"
        >
          <CaretLeft size={22} weight="bold" />
        </button>
        <span className="flex-1 text-center font-sans font-semibold text-[17px] text-text-primary">
          Bot Commands
        </span>
        <div className="min-w-[44px]" />
      </header>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-[calc(80px+env(safe-area-inset-bottom))]">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[60px] rounded-2xl" />
            ))}
          </div>
        ) : commands.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-elevated border border-border-subtle flex items-center justify-center">
              <ListBullets size={24} className="text-text-muted" weight="fill" />
            </div>
            <p className="font-sans text-[13px] text-text-muted">No commands yet</p>
            <p className="font-sans text-[11px] text-text-muted/60">
              Tap + to add your first bot command
            </p>
          </div>
        ) : (
          <div className="rounded-2xl bg-card border border-border-subtle overflow-hidden divide-y divide-border-subtle">
            {commands.map((cmd, idx) => (
              <div key={cmd.id} className="flex items-center gap-3 px-4 py-3">
                <span className="text-[11px] font-mono text-text-muted w-5 shrink-0">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0" onClick={() => openEdit(cmd)}>
                  <p className="font-mono text-[13px] font-semibold text-crimson">
                    /{cmd.command}
                  </p>
                  <p className="text-[11px] text-text-secondary truncate">
                    {cmd.label}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => moveUp(idx)}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg active:bg-elevated disabled:opacity-30"
                    aria-label="Move up"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    onClick={() => moveDown(idx)}
                    disabled={idx === commands.length - 1}
                    className="p-1.5 rounded-lg active:bg-elevated disabled:opacity-30"
                    aria-label="Move down"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteId(cmd.id)}
                    className="p-1.5 rounded-lg active:bg-elevated"
                    aria-label="Delete command"
                  >
                    <Trash size={14} className="text-danger" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── FAB ─────────────────────────────────────────────────────── */}
      <div className="fixed bottom-[calc(24px+env(safe-area-inset-bottom))] right-5 z-30">
        <button
          onClick={() => setShowAdd(true)}
          className="w-14 h-14 rounded-full bg-crimson shadow-lg flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Add command"
        >
          <Plus size={22} weight="bold" className="text-white" />
        </button>
      </div>

      {/* ── Edit Sheet ──────────────────────────────────────────────── */}
      <Sheet
        open={!!editingCmd}
        onOpenChange={(open) => {
          if (!open) setEditingCmd(null);
        }}
      >
        <SheetContent
          side="bottom"
          className="rounded-t-2xl px-4 pb-[calc(24px+env(safe-area-inset-bottom))]"
        >
          <SheetHeader className="mb-4">
            <SheetTitle className="text-left font-display font-bold text-[17px]">
              Edit Command
            </SheetTitle>
          </SheetHeader>
          {editingCmd && (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1 block">
                  Trigger
                </label>
                <div className="h-[44px] px-3 flex items-center rounded-xl border border-border-subtle bg-elevated font-mono text-[13px] text-text-muted">
                  /{editingCmd.command}
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1 block">
                  Response
                </label>
                <Textarea
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  placeholder="Response text…"
                  className="resize-none font-sans text-[13px] min-h-[80px]"
                  autoFocus
                />
              </div>
              <button
                onClick={() =>
                  updateMutation.mutate({
                    id: editingCmd.id,
                    label: editLabel,
                  })
                }
                disabled={updateMutation.isPending || !editLabel.trim()}
                className="w-full h-[48px] rounded-xl bg-crimson text-white font-semibold text-[15px] active:opacity-80 transition-opacity disabled:opacity-50"
              >
                {updateMutation.isPending ? "Saving…" : "Save"}
              </button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ── Add Sheet ───────────────────────────────────────────────── */}
      <Sheet open={showAdd} onOpenChange={setShowAdd}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl px-4 pb-[calc(24px+env(safe-area-inset-bottom))]"
        >
          <SheetHeader className="mb-4">
            <SheetTitle className="text-left font-display font-bold text-[17px]">
              New Command
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1 block">
                Trigger
              </label>
              <Input
                value={newCommand}
                onChange={(e) =>
                  setNewCommand(e.target.value.replace(/[^a-z0-9]/g, ""))
                }
                placeholder="help"
                className="font-mono text-[13px]"
                autoFocus
              />
              <p className="text-[10px] text-text-muted mt-1">
                Lowercase letters and numbers only
              </p>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1 block">
                Response
              </label>
              <Textarea
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Response text…"
                className="resize-none font-sans text-[13px] min-h-[80px]"
              />
            </div>
            <button
              onClick={() =>
                createMutation.mutate({ command: newCommand, label: newLabel })
              }
              disabled={
                createMutation.isPending ||
                !newCommand.trim() ||
                !newLabel.trim()
              }
              className="w-full h-[48px] rounded-xl bg-crimson text-white font-semibold text-[15px] active:opacity-80 transition-opacity disabled:opacity-50"
            >
              {createMutation.isPending ? "Creating…" : "Create Command"}
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Delete Confirmation Sheet ────────────────────────────────── */}
      <Sheet
        open={!!deleteId}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
      >
        <SheetContent
          side="bottom"
          className="rounded-t-2xl px-4 pb-[calc(24px+env(safe-area-inset-bottom))]"
        >
          <SheetHeader className="mb-4">
            <SheetTitle className="text-left font-display font-bold text-[17px]">
              Delete Command
            </SheetTitle>
          </SheetHeader>
          <p className="font-sans text-[13px] text-text-secondary mb-5">
            Are you sure you want to delete this command? This action cannot be
            undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteId(null)}
              className="flex-1 h-[48px] rounded-xl border border-border-default font-semibold text-[15px] text-text-secondary active:bg-elevated transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
              className="flex-1 h-[48px] rounded-xl bg-danger text-white font-semibold text-[15px] active:opacity-80 transition-opacity disabled:opacity-50"
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

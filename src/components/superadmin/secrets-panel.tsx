"use client";

import { useState } from "react";
import { useSecretsList, useSetSecret, useDeleteSecret } from "@/queries/useSecretsQuery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
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
import type { SecretMeta } from "@/lib/api/superadmin";
import {
  LockKey,
  Plus,
  Trash,
  ArrowClockwise,
  Warning,
  Eye,
  EyeSlash,
  PencilSimple,
} from "@phosphor-icons/react";

// ── Well-known keys with labels ───────────────────────────────────────────────

const KNOWN_KEYS: { key: string; label: string; hint: string }[] = [
  { key: "google.serviceAccount", label: "Google Service Account JSON", hint: "Full service account JSON from Google Cloud console" },
  { key: "google.sheetId",        label: "Google Sheet ID",             hint: "Spreadsheet ID from the Google Sheet URL" },
  { key: "google.driveFolderId",  label: "Google Drive Folder ID",      hint: "Folder ID from the Google Drive URL" },
];

// ── SetSecretModal ────────────────────────────────────────────────────────────

function SetSecretModal({
  secret,
  onClose,
}: {
  secret: SecretMeta | { key: string; description: string | null; updatedBy: null; updatedAt: "" } | null;
  onClose: () => void;
}) {
  const setSecretMutation = useSetSecret();
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");

  const known = KNOWN_KEYS.find((k) => k.key === secret?.key);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || !secret) return;
    try {
      await setSecretMutation.mutateAsync({ key: secret.key, value: value.trim(), description: known?.label ?? secret.description ?? undefined });
      setValue("");
      setShow(false);
      setErr("");
      onClose();
    } catch {
      setErr("Failed to save secret — check the value and try again.");
    }
  };

  const isNew = !secret?.updatedAt;

  return (
    <Dialog open={!!secret} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LockKey size={18} weight="duotone" className="text-info" />
            {isNew ? "Set Secret" : "Replace Secret"}
          </DialogTitle>
          <DialogDescription>
            {isNew
              ? "Store a new encrypted credential."
              : "You cannot retrieve the existing value — only replace it."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1">
            <Label className="text-xs font-medium text-text-secondary">Key</Label>
            <p className="text-sm font-mono text-text-primary">{secret?.key}</p>
            {known && <p className="text-[10px] text-text-muted">{known.hint}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-text-secondary">Value</Label>
            <div className="relative">
              <Input
                type={show ? "text" : "password"}
                value={value}
                onChange={(e) => { setValue(e.target.value); setErr(""); }}
                placeholder="Paste secret value…"
                className="pr-9 text-xs"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                {show ? <EyeSlash size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          {err && <p className="text-xs text-danger">{err}</p>}
          <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/20 text-[11px] text-amber-300">
            ⚠️ Once saved, this value is encrypted at rest and <strong>cannot be retrieved</strong> — only replaced.
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={setSecretMutation.isPending || !value.trim()}>
              {setSecretMutation.isPending ? "Saving…" : "Save Secret"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── SecretsPanel ──────────────────────────────────────────────────────────────

export function SecretsPanel() {
  const { data: secrets = [], isLoading, refetch: refetchSecrets } = useSecretsList();
  const deleteSecretMutation = useDeleteSecret();
  const [editTarget, setEditTarget] = useState<typeof secrets[0] | null>(null);
  const [newKey, setNewKey] = useState<{ key: string; description: string | null; updatedBy: null; updatedAt: "" } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Merge known keys with stored secrets (show all known + any extras)
  const rows = KNOWN_KEYS.map((k) => {
    const stored = secrets.find((s) => s.key === k.key);
    return stored ?? { key: k.key, description: k.label, updatedBy: null, updatedAt: "" };
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await deleteSecretMutation.mutateAsync(deleteTarget); }
    catch { /* error handled by mutation */ }
    finally { setDeleteTarget(null); }
  };

  return (
    <>
      <SetSecretModal
        secret={editTarget ?? newKey}
        onClose={() => { setEditTarget(null); setNewKey(null); }}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-danger">
              <Trash size={16} weight="duotone" /> Delete Secret?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <span className="font-mono text-text-primary">{deleteTarget}</span>.
              The integration using this credential will stop working.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-danger hover:bg-danger/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="page-panel bg-elevated rounded-xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-card flex items-center justify-between border-b border-border-subtle shadow-sm">
          <div className="flex items-center gap-2">
            <LockKey size={16} weight="duotone" className="text-gold" />
            <div>
              <h2 className="text-sm font-semibold text-text-primary">Encrypted Secrets</h2>
              <p className="text-xs text-text-secondary mt-0.5">AES-256-GCM credentials — values never displayed</p>
            </div>
          </div>
          <button onClick={() => void refetchSecrets()} className="p-1.5 rounded-md text-text-muted hover:text-text-primary transition-colors">
            <ArrowClockwise size={14} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          {/* Warning banner */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-950/20 border border-amber-500/20 text-[11px] text-amber-200/80">
            <Warning size={13} weight="fill" className="text-amber-400 shrink-0 mt-0.5" />
            Values are encrypted at rest. You cannot retrieve a stored secret — only replace it.
          </div>

          {/* Secrets table */}
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-border-subtle overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border-subtle bg-card shadow-sm">
                    <th className="text-left px-4 py-2.5 font-medium text-text-muted">Key</th>
                    <th className="text-left px-3 py-2.5 font-medium text-text-muted">Description</th>
                    <th className="text-left px-3 py-2.5 font-medium text-text-muted">Last Updated</th>
                    <th className="px-3 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => {
                    const isStored = !!row.updatedAt;
                    const known = KNOWN_KEYS.find((k) => k.key === row.key);
                    return (
                      <tr key={row.key} className={`${idx !== 0 ? "border-t border-border-subtle" : ""}`}>
                        <td className="px-4 py-3 font-mono text-[10px] text-text-secondary">{row.key}</td>
                        <td className="px-3 py-3 text-text-muted">{known?.label ?? row.description ?? "—"}</td>
                        <td className="px-3 py-3 text-text-muted whitespace-nowrap">
                          {isStored ? (
                            <div>
                              <p>{new Date(row.updatedAt).toLocaleDateString()}</p>
                              {row.updatedBy && <p className="text-[10px]">{row.updatedBy}</p>}
                            </div>
                          ) : (
                            <span className="text-text-muted/40">Not set</span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-[11px] gap-1 text-text-muted hover:text-text-primary"
                              disabled={deleteSecretMutation.isPending}
                              onClick={() => {
                                if (isStored) {
                                  setEditTarget(row as SecretMeta);
                                } else {
                                  setNewKey({ key: row.key, description: row.description, updatedBy: null, updatedAt: "" });
                                }
                              }}
                            >
                              {isStored ? (
                                <><PencilSimple size={12} /> Replace</>
                              ) : (
                                <><Plus size={12} /> Set</>
                              )}
                            </Button>
                            {isStored && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-[11px] gap-1 text-danger/60 hover:text-danger hover:bg-danger/10"
                                disabled={deleteSecretMutation.isPending}
                                onClick={() => setDeleteTarget(row.key)}
                              >
                                <Trash size={12} />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

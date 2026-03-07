"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import {
  useSecretsList,
  useSetSecret,
  useDeleteSecret,
} from "@/queries/useSecretsQuery";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LockKey,
  Eye,
  EyeSlash,
  Trash,
  Warning,
  CheckCircle,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { SecretMeta } from "@/lib/api/superadmin";

// ── Well-known keys (must match desktop secrets-panel) ────────────────────────
const KNOWN_KEYS: { key: string; label: string; hint: string }[] = [
  {
    key: "google.serviceAccount",
    label: "Google Service Account JSON",
    hint: "Full service account JSON from Google Cloud console",
  },
  {
    key: "google.sheetId",
    label: "Google Sheet ID",
    hint: "Spreadsheet ID from the Google Sheet URL",
  },
  {
    key: "google.driveFolderId",
    label: "Google Drive Folder ID",
    hint: "Folder ID from the Google Drive URL",
  },
];

// ── Component ──────────────────────────────────────────────────────────────────
export default function MobileAdminSecrets() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user?.role !== "SUPERADMIN") router.replace("/");
  }, [user, router]);

  const { data: secrets = [], isLoading } = useSecretsList();
  const setSecretMutation = useSetSecret();
  const deleteSecretMutation = useDeleteSecret();

  const [editSecret, setEditSecret] = useState<SecretMeta | null>(null);
  const [newValue, setNewValue] = useState("");
  const [showValue, setShowValue] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  if (user?.role !== "SUPERADMIN") return <div />;

  // Merge known keys with stored secrets so Google fields always appear
  const mergedSecrets: SecretMeta[] = KNOWN_KEYS.map((k) => {
    const stored = secrets.find((s) => s.key === k.key);
    return (
      stored ??
      ({
        key: k.key,
        description: k.label,
        updatedBy: null,
        updatedAt: "",
      } as unknown as SecretMeta)
    );
  });
  // Add any extra secrets from API that aren't in KNOWN_KEYS
  for (const s of secrets) {
    if (!KNOWN_KEYS.some((k) => k.key === s.key)) mergedSecrets.push(s);
  }

  const openEdit = (secret: SecretMeta) => {
    setEditSecret(secret);
    setNewValue("");
    setShowValue(false);
  };

  const handleSave = async () => {
    if (!editSecret || !newValue) return;
    setSaving(true);
    try {
      await setSecretMutation.mutateAsync({
        key: editSecret.key,
        value: newValue,
      });
      setSavedKey(editSecret.key);
      setTimeout(() => setSavedKey(null), 2000);
      setEditSecret(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteSecretMutation.mutateAsync(deleteTarget);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-full bg-void pb-8">
      <div className="px-4 py-4 space-y-4">
        {/* Security notice — values are NEVER shown */}
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-warning/10 border border-warning/20">
          <LockKey size={16} className="text-warning shrink-0" weight="fill" />
          <p className="font-sans text-[12px] text-warning font-medium">
            Secret values are never displayed in plaintext
          </p>
        </div>

        {/* Header count */}
        <p className="font-sans text-[11px] font-bold text-text-muted uppercase tracking-[0.08em] px-1">
          Secrets ({mergedSecrets.length})
        </p>

        {/* List */}
        {isLoading ? (
          <div className="rounded-2xl bg-card border border-border-subtle overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="px-4 py-3.5 space-y-2 border-b border-border-subtle last:border-0"
              >
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))}
          </div>
        ) : mergedSecrets.length === 0 ? (
          <div className="rounded-2xl bg-card border border-border-subtle p-8 text-center">
            <LockKey size={28} className="text-text-muted mx-auto mb-2" />
            <p className="font-sans text-[13px] text-text-muted">
              No secrets configured
            </p>
          </div>
        ) : (
          <div className="rounded-2xl bg-card border border-border-subtle overflow-hidden shadow-[var(--shadow-card)]">
            <div className="divide-y divide-border-subtle">
              {mergedSecrets.map((secret) => {
                const isSet = !!secret.updatedAt;
                const isSaved = savedKey === secret.key;
                const known = KNOWN_KEYS.find((k) => k.key === secret.key);
                return (
                  <div
                    key={secret.key}
                    className="flex items-center gap-3 px-4 py-3.5 min-h-[56px]"
                  >
                    <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-elevated shrink-0">
                      <LockKey
                        size={15}
                        className="text-text-secondary"
                        weight="fill"
                      />
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-[12px] font-semibold text-text-primary truncate">
                          {secret.key}
                        </p>
                        {isSaved && (
                          <CheckCircle
                            size={12}
                            className="text-success shrink-0"
                            weight="bold"
                          />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={cn(
                            "inline-flex items-center px-1.5 py-0 h-4 rounded text-[9px] font-semibold border",
                            isSet
                              ? "bg-success/10 text-success border-success/20"
                              : "bg-elevated text-text-muted border-border-subtle",
                          )}
                        >
                          {isSet ? "Set" : "Not set"}
                        </span>
                        {secret.updatedAt && (
                          <span className="font-sans text-[10px] text-text-muted">
                            {new Date(secret.updatedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Set/update value */}
                      <button
                        onClick={() => openEdit(secret)}
                        className="h-8 px-3 rounded-xl bg-elevated border border-border-subtle active:scale-[0.93] transition-transform font-sans text-[12px] font-semibold text-text-secondary flex items-center gap-1.5"
                        aria-label={`Set secret ${secret.key}`}
                      >
                        <Eye size={13} className="text-text-muted" />
                        {isSet ? "Replace" : "Set"}
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => setDeleteTarget(secret.key)}
                        className="flex items-center justify-center w-9 h-9 rounded-xl active:scale-[0.93] transition-transform"
                        aria-label={`Delete secret ${secret.key}`}
                      >
                        <Trash size={15} className="text-danger" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Set/update secret sheet */}
      <Sheet
        open={!!editSecret}
        onOpenChange={(v) => !v && setEditSecret(null)}
      >
        <SheetContent
          side="bottom"
          className="p-0 border-t border-border-subtle rounded-t-[20px] bg-base focus:outline-none"
          style={{ maxHeight: "60dvh" }}
        >
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-8 h-1 rounded-full bg-border-default" />
          </div>
          {editSecret && (
            <div className="px-5 pb-6 space-y-4">
              <div>
                <p className="font-sans font-semibold text-[15px] text-text-primary">
                  Set Secret
                </p>
                <p className="font-mono text-[11px] text-text-muted mt-0.5">
                  {editSecret.key}
                </p>
              </div>

              {/* Masked password input — value is NEVER shown, only written */}
              <div className="relative">
                <Input
                  type={showValue ? "text" : "password"}
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="Enter new value…"
                  className="h-11 text-sm pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowValue((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
                  aria-label={showValue ? "Hide value" : "Show value"}
                >
                  {showValue ? <EyeSlash size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <p className="font-sans text-[11px] text-text-muted">
                Values are encrypted at rest and never returned by the API.
              </p>

              <button
                onClick={() => void handleSave()}
                disabled={saving || !newValue}
                className="w-full h-12 rounded-2xl bg-crimson text-white font-sans font-semibold text-[14px] active:scale-[0.98] transition-transform disabled:opacity-50"
              >
                {saving ? "Saving…" : "Set Secret"}
              </button>
            </div>
          )}
          <div style={{ height: "max(16px, env(safe-area-inset-bottom))" }} />
        </SheetContent>
      </Sheet>

      {/* Delete confirmation sheet */}
      <Sheet
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <SheetContent
          side="bottom"
          className="p-0 border-t border-border-subtle rounded-t-[20px] bg-base focus:outline-none"
        >
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-8 h-1 rounded-full bg-border-default" />
          </div>
          <div className="px-5 pb-4 pt-2 space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-danger/10 shrink-0">
                <Warning size={24} className="text-danger" weight="fill" />
              </span>
              <div className="min-w-0">
                <p className="font-sans font-semibold text-[16px] text-text-primary">
                  Delete Secret
                </p>
                <p className="font-mono text-[12px] text-text-muted mt-0.5 truncate">
                  {deleteTarget}
                </p>
              </div>
            </div>
            <p className="font-sans text-[13px] text-text-secondary">
              This permanently deletes the secret. Services that rely on it may
              stop working.
            </p>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 h-12 rounded-2xl bg-elevated text-text-secondary font-sans font-semibold text-[14px] active:scale-[0.98] transition-transform"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleDelete()}
                disabled={deleting}
                className="flex-1 h-12 rounded-2xl bg-danger text-white font-sans font-semibold text-[14px] active:scale-[0.98] transition-transform disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
          <div style={{ height: "max(16px, env(safe-area-inset-bottom))" }} />
        </SheetContent>
      </Sheet>
    </div>
  );
}

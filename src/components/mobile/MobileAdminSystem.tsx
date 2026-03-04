"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useSystemConfig, useUpsertSystemConfig } from "@/queries/useSystemConfigQuery";
import { CONFIG_SECTIONS } from "@/components/superadmin/system-config-panel";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Check, X, Sliders } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface MobileAdminSystemProps {}

interface EditState {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "toggle";
  currentValue: string;
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function MobileAdminSystem(_props: MobileAdminSystemProps) {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user?.role !== "SUPERADMIN") router.replace("/");
  }, [user, router]);

  const { data: entries = {}, isLoading } = useSystemConfig();
  const upsert = useUpsertSystemConfig();

  const [editState, setEditState] = useState<EditState | null>(null);
  const [draftValue, setDraftValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  if (user?.role !== "SUPERADMIN") return null;

  const openEdit = (field: { key: string; label: string; type: "text" | "textarea" | "number" | "toggle" }) => {
    setEditState({ ...field, currentValue: entries[field.key] ?? "" });
    setDraftValue(entries[field.key] ?? "");
  };

  const handleSave = async () => {
    if (!editState) return;
    setSaving(true);
    try {
      await upsert.mutateAsync({ key: editState.key, value: draftValue });
      setSavedKey(editState.key);
      setTimeout(() => setSavedKey(null), 2000);
      setEditState(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-full bg-void pb-8">
      <div className="px-4 py-4 space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="rounded-2xl bg-card border border-border-subtle p-4">
                <Skeleton className="h-4 w-1/3 mb-3" />
                <div className="space-y-2">
                  <Skeleton className="h-11 w-full" />
                  <Skeleton className="h-11 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : Object.keys(entries).length === 0 && !isLoading ? (
          <div className="rounded-2xl bg-card border border-border-subtle p-8 text-center">
            <Sliders size={28} className="text-text-muted mx-auto mb-2" />
            <p className="font-sans text-[13px] text-text-muted">No config entries found</p>
          </div>
        ) : (
          CONFIG_SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.title}
                className="rounded-2xl bg-card border border-border-subtle overflow-hidden shadow-[var(--shadow-card)]"
              >
                {/* Section header */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border-subtle bg-elevated/50">
                  <Icon size={14} weight="duotone" className={section.color} />
                  <p className={cn("font-sans text-[11px] font-bold uppercase tracking-[0.08em]", section.color)}>
                    {section.title}
                  </p>
                </div>

                {/* Fields */}
                <div className="divide-y divide-border-subtle">
                  {section.fields.map((field) => {
                    const value = entries[field.key] ?? "";
                    const isSaved = savedKey === field.key;
                    return (
                      <button
                        key={field.key}
                        onClick={() => openEdit(field)}
                        className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-elevated transition-colors min-h-[52px]"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-sans text-[12px] font-medium text-text-secondary">{field.label}</p>
                          <p className="font-mono text-[11px] text-text-muted truncate mt-0.5">
                            {value !== "" ? value : <span className="italic opacity-40">not set</span>}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge
                            variant="secondary"
                            className="text-[9px] px-1.5 py-0 h-4 font-mono uppercase"
                          >
                            {field.type}
                          </Badge>
                          {isSaved && <Check size={14} className="text-success" weight="bold" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit bottom sheet */}
      <Sheet open={!!editState} onOpenChange={(v) => !v && setEditState(null)}>
        <SheetContent
          side="bottom"
          className="p-0 border-t border-border-subtle rounded-t-[20px] bg-base focus:outline-none"
          style={{ maxHeight: "70dvh" }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-8 h-1 rounded-full bg-border-default" />
          </div>

          {editState && (
            <div className="px-5 pb-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-sans font-semibold text-[15px] text-text-primary">{editState.label}</p>
                  <p className="font-mono text-[11px] text-text-muted mt-0.5 truncate">{editState.key}</p>
                </div>
                <button
                  onClick={() => setEditState(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-elevated ml-3 shrink-0"
                >
                  <X size={14} weight="bold" className="text-text-muted" />
                </button>
              </div>

              {editState.type === "toggle" ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setDraftValue(draftValue === "true" ? "false" : "true")}
                    className={cn(
                      "relative w-[52px] h-[30px] rounded-full transition-colors duration-200",
                      draftValue === "true" ? "bg-success" : "bg-elevated",
                    )}
                    role="switch"
                    aria-checked={draftValue === "true"}
                  >
                    <span
                      className={cn(
                        "absolute w-[24px] h-[24px] rounded-full bg-white shadow-md transition-transform duration-200",
                        draftValue === "true" ? "translate-x-[25px]" : "translate-x-[3px]",
                      )}
                    />
                  </button>
                  <span className="font-sans text-[14px] text-text-primary">
                    {draftValue === "true" ? "Enabled" : "Disabled"}
                  </span>
                </div>
              ) : (
                <Input
                  type={editState.type === "number" ? "number" : "text"}
                  value={draftValue}
                  onChange={(e) => setDraftValue(e.target.value)}
                  className="h-11 text-sm font-mono"
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus
                />
              )}

              <button
                onClick={() => void handleSave()}
                disabled={saving}
                className="w-full h-12 rounded-2xl bg-crimson text-white font-sans font-semibold text-[14px] active:scale-[0.98] transition-transform disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          )}
          <div style={{ height: "max(16px, env(safe-area-inset-bottom))" }} />
        </SheetContent>
      </Sheet>
    </div>
  );
}

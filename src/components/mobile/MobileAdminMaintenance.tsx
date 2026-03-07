"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import {
  useSystemConfig,
  useUpsertSystemConfig,
} from "@/queries/useSystemConfigQuery";
import { useMaintenanceConfig } from "@/queries/useMaintenanceQuery";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Lightning,
  Warning,
  Brain,
  Megaphone,
  TerminalWindow,
  ClockCounterClockwise,
  CheckCircle,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface MobileAdminMaintenanceProps {}

const FEATURE_FLAGS: {
  key: string;
  label: string;
  desc: string;
  Icon: React.ElementType;
  color: string;
  defaultOn: boolean;
}[] = [
  {
    key: "feature.knowledgeBase.enabled",
    label: "Knowledge Base",
    desc: "KB file uploads & vector processing",
    Icon: Brain,
    color: "text-info",
    defaultOn: true,
  },
  {
    key: "feature.broadcast.enabled",
    label: "Broadcast",
    desc: "Bulk message blasts to leads",
    Icon: Megaphone,
    color: "text-purple-400",
    defaultOn: true,
  },
  {
    key: "feature.commandMenu.enabled",
    label: "Command Menus",
    desc: "Bot command menu management",
    Icon: TerminalWindow,
    color: "text-gold",
    defaultOn: true,
  },
  {
    key: "followUp.enabled",
    label: "Follow-Up Automation",
    desc: "Scheduled follow-up messages",
    Icon: ClockCounterClockwise,
    color: "text-success",
    defaultOn: true,
  },
];

// ── Component ──────────────────────────────────────────────────────────────────
export default function MobileAdminMaintenance(
  _props: MobileAdminMaintenanceProps,
) {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user?.role !== "SUPERADMIN") router.replace("/");
  }, [user, router]);

  const { data: entries = {} } = useSystemConfig();
  const { refetch: refetchMaintenance } = useMaintenanceConfig();
  const upsert = useUpsertSystemConfig();

  const [maintenanceOn, setMaintenanceOn] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingState, setPendingState] = useState(false);

  // Sync from loaded entries
  useEffect(() => {
    if (!entries || Object.keys(entries).length === 0) return;
    setMaintenanceOn(entries["system.maintenanceMode"] === "true");
  }, [entries]);

  if (user?.role !== "SUPERADMIN") return <div />;

  const getVal = (key: string, def = "false") => entries[key] ?? def;

  const saveMaintenance = async (on: boolean) => {
    setSaving(true);
    try {
      await upsert.mutateAsync({
        key: "system.maintenanceMode",
        value: on ? "true" : "false",
      });
      setMaintenanceOn(on);
      await refetchMaintenance().catch(() => undefined);
      setSavedKey("system.maintenanceMode");
      setTimeout(() => setSavedKey(null), 2500);
    } finally {
      setSaving(false);
    }
  };

  const saveFlag = async (key: string, value: boolean) => {
    setSaving(true);
    try {
      await upsert.mutateAsync({ key, value: value ? "true" : "false" });
      setSavedKey(key);
      setTimeout(() => setSavedKey(null), 2000);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleMaintenance = (on: boolean) => {
    if (on) {
      setPendingState(true);
      setConfirmOpen(true);
    } else {
      void saveMaintenance(false);
    }
  };

  return (
    <div className="min-h-full bg-void pb-8">
      <div className="px-4 py-4 space-y-4">
        {/* ── Maintenance Mode Card ─────────────────────────────────────── */}
        <div className="rounded-2xl bg-card border border-border-subtle overflow-hidden shadow-[var(--shadow-card)]">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-2xl transition-colors",
                    maintenanceOn ? "bg-warning/10" : "bg-elevated",
                  )}
                >
                  <Lightning
                    size={22}
                    className={
                      maintenanceOn ? "text-warning" : "text-text-secondary"
                    }
                    weight="fill"
                  />
                </span>
                <div>
                  <p className="font-sans text-[15px] font-semibold text-text-primary">
                    Maintenance Mode
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full animate-pulse",
                        maintenanceOn ? "bg-warning" : "bg-success",
                      )}
                    />
                    <span
                      className={cn(
                        "font-sans text-[11px] font-bold tracking-wider",
                        maintenanceOn ? "text-warning" : "text-success",
                      )}
                    >
                      {maintenanceOn ? "ACTIVE" : "INACTIVE"}
                    </span>
                    {savedKey === "system.maintenanceMode" && (
                      <CheckCircle
                        size={12}
                        className="text-success"
                        weight="bold"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Large prominent toggle */}
              <button
                onClick={() => handleToggleMaintenance(!maintenanceOn)}
                disabled={saving}
                className={cn(
                  "relative w-[56px] h-[32px] rounded-full transition-colors duration-200 flex items-center disabled:opacity-50",
                  maintenanceOn ? "bg-warning" : "bg-elevated",
                )}
                role="switch"
                aria-checked={maintenanceOn}
              >
                <span
                  className={cn(
                    "absolute w-[26px] h-[26px] rounded-full bg-white shadow-md transition-transform duration-200",
                    maintenanceOn ? "translate-x-[27px]" : "translate-x-[3px]",
                  )}
                />
              </button>
            </div>
          </div>

          {/* Warning banner — shown when ON */}
          {maintenanceOn && (
            <div className="mx-4 mb-4 flex items-start gap-2 rounded-xl bg-warning/10 border border-warning/20 px-3 py-2.5">
              <Warning
                size={14}
                className="text-warning mt-0.5 shrink-0"
                weight="fill"
              />
              <p className="font-sans text-[12px] text-warning font-medium leading-snug">
                ⚠ Users cannot access the system while maintenance mode is
                active
              </p>
            </div>
          )}
        </div>

        {/* ── Feature Flags ─────────────────────────────────────────────── */}
        <p className="font-sans text-[11px] font-bold text-text-muted uppercase tracking-[0.08em] px-1">
          Feature Flags
        </p>

        <div className="rounded-2xl bg-card border border-border-subtle overflow-hidden shadow-[var(--shadow-card)]">
          <div className="divide-y divide-border-subtle">
            {FEATURE_FLAGS.map((flag) => {
              const isOn =
                getVal(flag.key, flag.defaultOn ? "true" : "false") !== "false";
              const isSaved = savedKey === flag.key;
              return (
                <div
                  key={flag.key}
                  className="flex items-center gap-3 px-4 py-3.5 min-h-[60px]"
                >
                  <span
                    className={cn(
                      "flex items-center justify-center w-9 h-9 rounded-xl shrink-0 transition-opacity",
                      isOn ? "bg-elevated" : "bg-elevated/40 opacity-50",
                    )}
                  >
                    <flag.Icon
                      size={18}
                      className={flag.color}
                      weight="duotone"
                    />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-sans text-[13px] font-semibold text-text-primary">
                        {flag.label}
                      </p>
                      {isSaved && (
                        <CheckCircle
                          size={12}
                          className="text-success"
                          weight="bold"
                        />
                      )}
                    </div>
                    <p className="font-sans text-[11px] text-text-muted">
                      {flag.desc}
                    </p>
                  </div>
                  <button
                    onClick={() => void saveFlag(flag.key, !isOn)}
                    disabled={saving}
                    className={cn(
                      "relative w-[52px] h-[30px] rounded-full transition-colors duration-200 shrink-0 flex items-center disabled:opacity-50",
                      isOn ? "bg-success" : "bg-elevated",
                    )}
                    role="switch"
                    aria-checked={isOn}
                  >
                    <span
                      className={cn(
                        "absolute w-[24px] h-[24px] rounded-full bg-white shadow-md transition-transform duration-200",
                        isOn ? "translate-x-[25px]" : "translate-x-[3px]",
                      )}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Confirm enable maintenance sheet */}
      <Sheet
        open={confirmOpen}
        onOpenChange={(v) => !v && setConfirmOpen(false)}
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
              <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-warning/10 shrink-0">
                <Warning size={24} className="text-warning" weight="fill" />
              </span>
              <div>
                <p className="font-sans font-semibold text-[16px] text-text-primary">
                  Enable Maintenance Mode?
                </p>
                <p className="font-sans text-[12px] text-text-muted mt-0.5">
                  Blocks access for non-superadmin users
                </p>
              </div>
            </div>
            <p className="font-sans text-[13px] text-text-secondary">
              Staff and Owner roles will be blocked. The Telegram bot continues
              running. You retain full access as SuperAdmin.
            </p>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => {
                  setPendingState(false);
                  setConfirmOpen(false);
                }}
                className="flex-1 h-12 rounded-2xl bg-elevated text-text-secondary font-sans font-semibold text-[14px] active:scale-[0.98] transition-transform"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setConfirmOpen(false);
                  void saveMaintenance(pendingState);
                }}
                className="flex-1 h-12 rounded-2xl bg-warning text-black font-sans font-semibold text-[14px] active:scale-[0.98] transition-transform"
              >
                Enable
              </button>
            </div>
          </div>
          <div style={{ height: "max(16px, env(safe-area-inset-bottom))" }} />
        </SheetContent>
      </Sheet>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useSystemConfigStore } from "@/store/systemConfigStore";
import { useMaintenanceStore } from "@/store/maintenanceStore";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CheckCircle, Warning, Gear, Lightning } from "@phosphor-icons/react";

export function MaintenancePanel() {
  const { entries, fetchAll, upsertMany } = useSystemConfigStore();
  const fetchPublicConfig = useMaintenanceStore((s) => s.fetchPublicConfig);

  const getVal = (key: string, def = "false") =>
    entries[key] ?? def;

  const DEFAULT_BANNER = "System under maintenance — read-only mode active.";

  const [maintenanceOn, setMaintenanceOn] = useState(false);
  const [bannerText, setBannerText] = useState(DEFAULT_BANNER);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingOn, setPendingOn] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  // Sync from store entries once loaded
  useEffect(() => {
    if (!entries || Object.keys(entries).length === 0) return;
    setMaintenanceOn(getVal("system.maintenanceMode") === "true");
    setBannerText(
      entries["system.maintenanceBanner"] ?? DEFAULT_BANNER
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries]);

  useEffect(() => { void fetchAll(); }, [fetchAll]);

  const toggleMaintenance = (on: boolean) => {
    if (on) {
      setPendingOn(true);
      setConfirmOpen(true);
    } else {
      void saveMaintenanceMode(false);
    }
  };

  const saveMaintenanceMode = async (on: boolean) => {
    setSaveErr(null);
    setIsSaving(true);
    try {
      await upsertMany({
        "system.maintenanceMode": on ? "true" : "false",
        // Never send empty string — backend @IsString() accepts it but semantics are wrong
        "system.maintenanceBanner": bannerText.trim() || DEFAULT_BANNER,
      });
      setMaintenanceOn(on);
      await fetchPublicConfig().catch(() => undefined);
      setSaved("maintenance");
      setTimeout(() => setSaved(null), 2500);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Save failed";
      setSaveErr(msg);
      setTimeout(() => setSaveErr(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const saveFeatureFlag = async (key: string, value: boolean) => {
    setSaveErr(null);
    setIsSaving(true);
    try {
      await upsertMany({ [key]: value ? "true" : "false" });
      await fetchPublicConfig().catch(() => undefined);
      setSaved(key);
      setTimeout(() => setSaved(null), 2000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Save failed";
      setSaveErr(msg);
      setTimeout(() => setSaveErr(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const featureFlags = [
    {
      key: "feature.knowledgeBase.enabled",
      label: "Knowledge Base Processing",
      description: "Enable KB file uploads and vector processing",
      defaultOn: true,
    },
    {
      key: "feature.broadcast.enabled",
      label: "Broadcast Messages",
      description: "Enable bulk message blasts to leads",
      defaultOn: true,
    },
    {
      key: "feature.commandMenu.enabled",
      label: "Command Menus",
      description: "Enable command menu management and bot serving",
      defaultOn: true,
    },
    {
      key: "followUp.enabled",
      label: "Follow-Up Automation",
      description: "Enable scheduled follow-up messages",
      defaultOn: true,
    },
  ];

  return (
    <>
      {/* Confirm dialog for enabling maintenance mode */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-400">
              <Warning size={18} weight="fill" />
              Enable Maintenance Mode?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will block all write operations for Owner, Admin, and Staff
              roles. The Telegram bot continues running and SuperAdmin retains
              full access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setPendingOn(false); }}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-amber-600 hover:bg-amber-500 text-white"
              onClick={() => {
                setConfirmOpen(false);
                void saveMaintenanceMode(pendingOn);
              }}
            >
              Enable Maintenance
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-4">
        {/* ── Maintenance Mode Card ─────────────────────────────────────────── */}
        <div className="page-panel rounded-xl overflow-hidden border border-amber-500/25 bg-amber-950/10">
          <div className="px-5 py-4 bg-amber-900/10 flex items-center justify-between border-b border-amber-500/20">
            <div>
              <h2 className="text-sm font-semibold text-amber-300 flex items-center gap-2">
                <Warning size={16} weight="fill" className="text-amber-400" />
                Maintenance Mode
              </h2>
              <p className="text-xs text-amber-200/60 mt-0.5">
                Blocks write operations for Owner / Admin / Staff. Bot stays online.
              </p>
            </div>
            {saved === "maintenance" && (
              <span className="text-xs text-success flex items-center gap-1">
                <CheckCircle size={13} /> Saved
              </span>
            )}
          </div>
          <div className="px-5 py-5 space-y-4">
            {/* Toggle row */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary">
                  Maintenance Mode
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  {maintenanceOn
                    ? "🔴 Active — staff/owners are in read-only mode"
                    : "🟢 Inactive — system is fully operational"}
                </p>
              </div>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => toggleMaintenance(!maintenanceOn)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:ring-2 ${
                  maintenanceOn ? "bg-amber-500" : "bg-border-subtle"
                }`}
              >
                <span
                  className={`inline-block h-4.5 w-4.5 rounded-full bg-white shadow transition-transform ${
                    maintenanceOn ? "translate-x-5.5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Banner message */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-text-secondary">
                Banner Message
              </Label>
              <Textarea
                value={bannerText}
                onChange={(e) => setBannerText(e.target.value)}
                placeholder="System under maintenance — read-only mode active."
                className="text-xs min-h-[60px] resize-none"
              />
            </div>

            {/* Live preview */}
            {bannerText && (
              <div className="space-y-1.5">
                <p className="text-[10px] text-text-muted uppercase tracking-wider">
                  Banner Preview
                </p>
                <div className="flex items-center gap-2 rounded-lg border border-amber-500/25 bg-amber-950/20 px-3 py-2 text-xs text-amber-200">
                  <Warning weight="fill" size={13} className="text-amber-400 shrink-0" />
                  <span className="font-medium">Maintenance Mode — </span>
                  {bannerText}
                </div>
              </div>
            )}

            {/* Save banner text button */}
            <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="ghost"
              disabled={isSaving}
              onClick={() => void saveMaintenanceMode(maintenanceOn)}
              className="h-7 px-3 text-xs text-amber-400 hover:bg-amber-800/20 border border-amber-500/20"
            >
              <Gear size={13} className="mr-1" />
              {isSaving ? "Saving…" : "Save Banner"}
            </Button>
            {saveErr && (
              <span className="text-xs text-crimson">{saveErr}</span>
            )}
            </div>
          </div>
        </div>

        {/* ── Feature Flags Card ──────────────────────────────────────────────── */}
        <div className="page-panel bg-elevated rounded-xl overflow-hidden">
          <div className="px-5 py-4 bg-card flex items-center justify-between border-b border-border-subtle">
            <div>
              <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <Lightning size={16} weight="duotone" className="text-info" />
                Feature Flags
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Toggle individual platform features independently
              </p>
            </div>
          </div>
          <div className="px-5 py-5 space-y-4">
            {featureFlags.map((flag) => {
              const isOn =
                getVal(flag.key, flag.defaultOn ? "true" : "false") !== "false";
              const isFlagSaved = saved === flag.key;
              return (
                <div
                  key={flag.key}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary">
                      {flag.label}
                      {isFlagSaved && (
                        <span className="ml-2 text-xs text-success">✓ Saved</span>
                      )}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {flag.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => void saveFeatureFlag(flag.key, !isOn)}
                    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                      isOn ? "bg-crimson" : "bg-border-subtle"
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                        isOn ? "translate-x-4.5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

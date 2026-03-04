"use client";

import { useState, useEffect } from "react";
import { useT, K } from "@/i18n";
import { useSystemConfig, useUpsertManySystemConfig } from "@/queries/useSystemConfigQuery";
import { useMaintenanceConfig } from "@/queries/useMaintenanceQuery";
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
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Warning,
  Gear,
  Lightning,
  Brain,
  Megaphone,
  TerminalWindow,
  ClockCounterClockwise,
} from "@phosphor-icons/react";

export function MaintenancePanel() {
  const t = useT();
  const { data: entries = {} } = useSystemConfig();
  const upsertManyMutation = useUpsertManySystemConfig();
  const { refetch: refetchMaintenanceConfig } = useMaintenanceConfig();

  const getVal = (key: string, def = "false") => entries[key] ?? def;

  const DEFAULT_BANNER = "System under maintenance — read-only mode active.";

  const [maintenanceOn, setMaintenanceOn] = useState(false);
  const [bannerText, setBannerText] = useState(DEFAULT_BANNER);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingOn, setPendingOn] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  useEffect(() => {
    if (!entries || Object.keys(entries).length === 0) return;
    setMaintenanceOn(entries["system.maintenanceMode"] === "true");
    setBannerText(entries["system.maintenanceBanner"] ?? DEFAULT_BANNER);
  }, [entries]);

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
      await upsertManyMutation.mutateAsync({
        "system.maintenanceMode": on ? "true" : "false",
        "system.maintenanceBanner": bannerText.trim() || DEFAULT_BANNER,
      });
      setMaintenanceOn(on);
      await refetchMaintenanceConfig().catch(() => undefined);
      setSaved("maintenance");
      setTimeout(() => setSaved(null), 2500);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? t(K.superadmin.maintenance.saveFailed);
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
      await upsertManyMutation.mutateAsync({ [key]: value ? "true" : "false" });
      await refetchMaintenanceConfig().catch(() => undefined);
      setSaved(key);
      setTimeout(() => setSaved(null), 2000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? t(K.superadmin.maintenance.saveFailed);
      setSaveErr(msg);
      setTimeout(() => setSaveErr(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const featureFlags = [
    {
      key: "feature.knowledgeBase.enabled",
      label: t(K.superadmin.maintenance.knowledgeBase),
      description: t(K.superadmin.maintenance.knowledgeBaseDesc),
      icon: <Brain size={22} weight="duotone" className="text-blue-500" />,
      defaultOn: true,
    },
    {
      key: "feature.broadcast.enabled",
      label: t(K.superadmin.maintenance.broadcast),
      description: t(K.superadmin.maintenance.broadcastDesc),
      icon: (
        <Megaphone size={22} weight="duotone" className="text-purple-500" />
      ),
      defaultOn: true,
    },
    {
      key: "feature.commandMenu.enabled",
      label: t(K.superadmin.maintenance.commandMenus),
      description: t(K.superadmin.maintenance.commandMenusDesc),
      icon: (
        <TerminalWindow size={22} weight="duotone" className="text-amber-500" />
      ),
      defaultOn: true,
    },
    {
      key: "followUp.enabled",
      label: t(K.superadmin.maintenance.followUpAutomation),
      description: t(K.superadmin.maintenance.followUpAutomationDesc),
      icon: (
        <ClockCounterClockwise
          size={22}
          weight="duotone"
          className="text-emerald-500"
        />
      ),
      defaultOn: true,
    },
  ];

  return (
    <>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-500">
              <Warning size={18} weight="fill" />
              {t(K.superadmin.maintenance.enableMaintenance)}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(K.superadmin.maintenance.enableMaintenanceDesc)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setPendingOn(false);
              }}
            >
              {t(K.superadmin.maintenance.cancel)}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-amber-600 hover:bg-amber-500 text-white"
              onClick={() => {
                setConfirmOpen(false);
                void saveMaintenanceMode(pendingOn);
              }}
            >
              {t(K.superadmin.maintenance.enableBtn)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-6">
        {/* ── Maintenance Mode Card ─────────────────────────────────────────── */}
        <Card className="border-border">
          <CardHeader className="border-b border-border-subtle bg-muted/20 px-5 py-4 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-sm flex items-center gap-2">
                <Warning size={16} weight="fill" className="text-amber-500" />
                {t(K.superadmin.maintenance.maintenanceMode)}
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                {t(K.superadmin.maintenance.maintenanceModeDesc)}
              </CardDescription>
            </div>
            {saved === "maintenance" && (
              <span className="text-xs text-success flex items-center gap-1 font-medium bg-success/10 px-2.5 py-1 rounded-full border border-success/20">
                <CheckCircle size={14} weight="bold" /> {t(K.superadmin.maintenance.saved)}
              </span>
            )}
          </CardHeader>

          <CardContent className="px-5 py-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">{t(K.superadmin.maintenance.modeStatus)}</Label>
                <p className="text-xs text-text-muted">
                  {maintenanceOn
                    ? t(K.superadmin.maintenance.modeActive)
                    : t(K.superadmin.maintenance.modeInactive)}
                </p>
              </div>
              <Switch
                checked={maintenanceOn}
                onCheckedChange={(checked) => toggleMaintenance(checked)}
                disabled={isSaving}
              />
            </div>

            <div className="space-y-3 pt-4 border-t border-border-subtle">
              <div>
                <Label className="text-sm font-semibold">{t(K.superadmin.maintenance.bannerMessage)}</Label>
                <p className="text-xs text-text-muted mt-0.5">
                  {t(K.superadmin.maintenance.bannerHint)}
                </p>
              </div>
              <Textarea
                value={bannerText}
                onChange={(e) => setBannerText(e.target.value)}
                placeholder="System under maintenance — read-only mode active."
                className="resize-none min-h-[80px] text-sm"
              />
            </div>

            {bannerText && (
              <div className="space-y-2 bg-background rounded-lg p-4 border border-border-subtle shadow-sm">
                <Label className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">
                  {t(K.superadmin.maintenance.preview)}
                </Label>
                <div className="flex items-center gap-2 rounded-md border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-600 dark:text-amber-400">
                  <Warning
                    weight="fill"
                    size={16}
                    className="shrink-0 text-amber-500"
                  />
                  <div>
                    <span className="font-semibold">{t(K.superadmin.maintenance.maintenanceModePrefix)}</span>
                    {bannerText}
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="border-t border-border-subtle bg-muted/10 px-5 py-4 flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={isSaving}
              onClick={() => void saveMaintenanceMode(maintenanceOn)}
              className="h-8 shadow-sm"
            >
              <Gear size={15} className="mr-2" />
              {isSaving ? t(K.superadmin.maintenance.savingConfig) : t(K.superadmin.maintenance.saveConfiguration)}
            </Button>
            {saveErr && (
              <span className="text-sm text-destructive">{saveErr}</span>
            )}
          </CardFooter>
        </Card>

        {/* ── Feature Flags Card ──────────────────────────────────────────────── */}
        <Card className="border-border">
          <CardHeader className="border-b border-border-subtle bg-muted/20 px-5 py-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Lightning size={16} weight="duotone" className="text-info" />
              {t(K.superadmin.maintenance.featureFlags)}
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              {t(K.superadmin.maintenance.featureFlagsDesc)}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            <div className="divide-y divide-border-subtle flex flex-col">
              {featureFlags.map((flag) => {
                const isOn =
                  getVal(flag.key, flag.defaultOn ? "true" : "false") !==
                  "false";
                const isFlagSaved = saved === flag.key;

                return (
                  <div
                    key={flag.key}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-muted/5 transition-colors gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border shadow-sm transition-colors ${
                          isOn
                            ? "border-border-subtle bg-background"
                            : "border-transparent bg-muted/40 grayscale opacity-60"
                        }`}
                      >
                        <span className="text-lg leading-none block">
                          {flag.icon}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Label
                            htmlFor={`switch-${flag.key}`}
                            className="text-sm font-semibold cursor-pointer text-text-primary leading-none"
                          >
                            {flag.label}
                          </Label>
                          {isFlagSaved && (
                            <CheckCircle
                              size={14}
                              weight="bold"
                              className="text-success"
                            />
                          )}
                        </div>
                        <p className="text-xs text-text-secondary leading-snug">
                          {flag.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t border-border-subtle sm:border-0 pl-13 sm:pl-0">
                      <span
                        className={`text-xs font-semibold ${
                          isOn ? "text-emerald-500" : "text-text-muted"
                        }`}
                      >
                        {isOn ? t(K.superadmin.maintenance.enabled) : t(K.superadmin.maintenance.disabled)}
                      </span>
                      <Switch
                        id={`switch-${flag.key}`}
                        checked={isOn}
                        onCheckedChange={(checked) =>
                          void saveFeatureFlag(flag.key, checked)
                        }
                        disabled={isSaving}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

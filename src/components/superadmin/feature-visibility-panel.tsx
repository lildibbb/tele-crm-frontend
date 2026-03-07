"use client";

import { useState } from "react";
import { useT, K } from "@/i18n";
import {
  useSystemConfig,
  useUpsertManySystemConfig,
} from "@/queries/useSystemConfigQuery";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Eye,
  EyeSlash,
  Warning,
  Timer,
  GoogleLogo,
  HardDrives,
  Table,
} from "@phosphor-icons/react";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────────────

interface VisibilityItem {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  group: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function FeatureVisibilityPanel() {
  const t = useT();
  const { data: entries = {} } = useSystemConfig();
  const upsertManyMutation = useUpsertManySystemConfig();
  const { refetch: refetchPublicConfig } = useMaintenanceConfig();

  const getVal = (key: string, def = "true") => entries[key] ?? def;

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);

  const integrationsGroup = t(K.superadmin.featureVisibility.integrations);
  const featuresGroup = t(K.superadmin.featureVisibility.features);

  const visibilityItems: VisibilityItem[] = [
    {
      key: "visibility.feature.googleSheets",
      label: t(K.superadmin.featureVisibility.googleSheets),
      description: t(K.superadmin.featureVisibility.googleSheetsDesc),
      icon: <Table size={18} weight="duotone" className="text-text-muted" />,
      group: integrationsGroup,
    },
    {
      key: "visibility.feature.googleDriveServiceAccount",
      label: t(K.superadmin.featureVisibility.googleDriveServiceAccount),
      description: t(K.superadmin.featureVisibility.googleDriveServiceAccountDesc),
      icon: <HardDrives size={18} weight="duotone" className="text-text-muted" />,
      group: integrationsGroup,
    },
    {
      key: "visibility.feature.googleDriveOAuth2",
      label: t(K.superadmin.featureVisibility.googleDriveOAuth2),
      description: t(K.superadmin.featureVisibility.googleDriveOAuth2Desc),
      icon: <GoogleLogo size={18} weight="duotone" className="text-text-muted" />,
      group: integrationsGroup,
    },
    {
      key: "visibility.feature.followUps",
      label: t(K.superadmin.featureVisibility.followUps),
      description: t(K.superadmin.featureVisibility.followUpsDesc),
      icon: <Timer size={18} weight="duotone" className="text-text-muted" />,
      group: featuresGroup,
    },
  ];

  const groups = [integrationsGroup, featuresGroup];

  const isVisible = (item: VisibilityItem): boolean =>
    getVal(item.key, "true") !== "false";

  const handleToggle = (item: VisibilityItem, newValue: boolean) => {
    if (!newValue) {
      setPendingKey(item.key);
      setConfirmOpen(true);
    } else {
      void saveVisibility(item.key, true);
    }
  };

  const saveVisibility = async (key: string, visible: boolean) => {
    setIsSaving(true);
    try {
      await upsertManyMutation.mutateAsync({ [key]: visible ? "true" : "false" });
      await refetchPublicConfig().catch(() => undefined);
      setSaved(key);
      setTimeout(() => setSaved(null), 2500);
    } catch {
      toast.error(t(K.superadmin.featureVisibility.saveFailed));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* ── Confirmation dialog — shown when toggling a feature OFF */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-500">
              <EyeSlash size={18} weight="fill" />
              {t(K.superadmin.featureVisibility.confirmDisableTitle)}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(K.superadmin.featureVisibility.confirmDisableDesc)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setPendingKey(null);
              }}
            >
              {t(K.common.cancel)}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-500 text-white"
              onClick={() => {
                setConfirmOpen(false);
                if (pendingKey) void saveVisibility(pendingKey, false);
                setPendingKey(null);
              }}
            >
              {t(K.superadmin.featureVisibility.disableBtn)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="page-panel bg-elevated rounded-xl overflow-hidden">
        {/* ── Panel header */}
        <div className="px-5 py-4 bg-card flex items-center gap-2 border-b border-border-subtle shadow-sm">
          <Eye size={16} weight="fill" className="text-text-muted" />
          <div>
            <h2 className="text-sm font-semibold text-text-primary">
              {t(K.superadmin.featureVisibility.title)}
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              {t(K.superadmin.featureVisibility.subtitle)}
            </p>
          </div>
        </div>

        {/* ── Feature groups */}
        {groups.map((group) => {
          const groupItems = visibilityItems.filter((i) => i.group === group);
          return (
            <div
              key={group}
              className="px-5 py-4 border-b border-border-subtle last:border-b-0"
            >
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                {group}
              </p>
              <div className="space-y-4">
                {groupItems.map((item) => {
                  const on = isVisible(item);
                  const justSaved = saved === item.key;

                  return (
                    <div
                      key={item.key}
                      className="flex items-center justify-between gap-4"
                    >
                      {/* Label + description */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="shrink-0">{item.icon}</div>
                        <div className="min-w-0">
                          <Label className="text-sm font-medium text-text-primary cursor-pointer leading-none">
                            {item.label}
                          </Label>
                          <p className="text-xs text-text-secondary mt-1 leading-snug">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {/* Status + toggle */}
                      <div className="flex items-center gap-3 shrink-0">
                        {justSaved && (
                          <span className="text-xs text-green-500 font-medium">
                            {t(K.superadmin.featureVisibility.saved)}
                          </span>
                        )}
                        {!on && !justSaved && (
                          <span className="text-xs text-red-400 flex items-center gap-1 font-medium">
                            <Warning size={12} weight="fill" />
                            {t(K.superadmin.featureVisibility.hidden)}
                          </span>
                        )}
                        <Switch
                          checked={on}
                          onCheckedChange={(v) => handleToggle(item, v)}
                          disabled={isSaving}
                          aria-label={`Toggle ${item.label}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

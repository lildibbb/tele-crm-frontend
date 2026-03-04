"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CaretLeft,
  ArrowsClockwise,
  CheckCircle,
  Eye,
  EyeSlash,
  Warning,
  Link,
} from "@phosphor-icons/react";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useSystemConfig, useUpsertManySystemConfig } from "@/queries/useSystemConfigQuery";
import { integrationsApi } from "@/lib/api/integrations";
import { parseApiData } from "@/lib/api/parseResponse";
import { useAuthStore } from "@/store/authStore";
import type { SecretMeta } from "@/lib/api/superadmin";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface MobileIntegrationsProps {}

type ConnectionStatus = "ready" | "needs-id" | "awaiting-setup" | "disabled";

// ── Status pill ────────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: ConnectionStatus }) {
  const config = {
    ready:            { dot: "bg-success",         text: "text-success",      label: "Ready to sync" },
    "needs-id":       { dot: "bg-amber-400",        text: "text-amber-400",    label: "Paste ID to connect" },
    "awaiting-setup": { dot: "bg-text-muted/40",    text: "text-text-muted",   label: "Awaiting technical setup" },
    disabled:         { dot: "bg-text-muted/30",    text: "text-text-muted",   label: "Disabled" },
  }[status];

  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-medium", config.text)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}

// ── Credential Input Sheet ─────────────────────────────────────────────────────
function CredentialSheet({
  open,
  onClose,
  secretKey,
  label,
  existingMeta,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  secretKey: string;
  label: string;
  existingMeta: SecretMeta | undefined;
  onSaved: () => void;
}) {
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleClose = () => {
    setValue("");
    setShow(false);
    setErr(null);
    onClose();
  };

  const handleSave = async () => {
    if (!value.trim()) return;
    setSaving(true);
    setErr(null);
    try {
      await integrationsApi.setCredential({ key: secretKey, value: value.trim(), description: label });
      setValue("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onSaved();
      handleClose();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to save";
      setErr(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && handleClose()}>
      <SheetContent
        side="bottom"
        className="p-0 border-t border-border-subtle rounded-t-[20px] bg-base focus:outline-none"
        style={{ maxHeight: "70dvh" }}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-8 h-1 rounded-full bg-border-default" />
        </div>
        <div className="px-5 pb-6 space-y-4">
          <SheetHeader className="text-left">
            <SheetTitle className="font-sans font-bold text-[17px] text-text-primary">
              {existingMeta ? "Update" : "Connect"} {label}
            </SheetTitle>
            <p className="font-sans text-[13px] text-text-muted">
              {existingMeta
                ? `Last updated ${new Date(existingMeta.updatedAt).toLocaleDateString()}`
                : "Paste the ID to connect this service"}
            </p>
          </SheetHeader>

          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={existingMeta ? "Paste new ID to update…" : "Paste ID here…"}
              className="w-full h-11 px-3.5 pr-11 rounded-xl bg-card border border-border-subtle font-mono text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-crimson/40 transition-colors"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
            >
              {show ? <EyeSlash size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {err && (
            <p className="font-sans text-[12px] text-danger flex items-center gap-1.5">
              <Warning size={13} weight="fill" /> {err}
            </p>
          )}

          <button
            onClick={() => void handleSave()}
            disabled={!value.trim() || saving}
            className="w-full h-[52px] rounded-2xl bg-crimson text-white font-sans font-bold text-[15px] flex items-center justify-center gap-2 active:opacity-80 transition-opacity disabled:opacity-40"
          >
            {saving ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : saved ? (
              <><CheckCircle size={18} weight="bold" /> Saved!</>
            ) : (
              <><Link size={18} weight="bold" /> {existingMeta ? "Update" : "Connect"}</>
            )}
          </button>
          <button
            onClick={handleClose}
            className="w-full h-[44px] rounded-2xl font-sans text-[15px] text-text-secondary active:opacity-70"
          >
            Cancel
          </button>
        </div>
        <div style={{ height: "max(8px, env(safe-area-inset-bottom))" }} />
      </SheetContent>
    </Sheet>
  );
}

// ── Integration Card ───────────────────────────────────────────────────────────
function IntegrationCard({
  icon,
  name,
  description,
  enabled,
  status,
  onToggle,
  onConnect,
  disabled,
}: {
  icon: React.ReactNode;
  name: string;
  description: string;
  enabled: boolean;
  status: ConnectionStatus;
  onToggle: (v: boolean) => void;
  onConnect: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-card border border-border-subtle p-4 shadow-[var(--shadow-card)] space-y-3">
      <div className="flex items-start gap-3">
        <span className="w-10 h-10 rounded-xl bg-elevated flex items-center justify-center shrink-0">
          {icon}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-sans font-semibold text-[14px] text-text-primary">{name}</p>
            <Switch
              checked={enabled}
              onCheckedChange={onToggle}
              disabled={disabled}
              className="data-[state=checked]:bg-crimson data-[state=unchecked]:bg-border-default shrink-0"
            />
          </div>
          <p className="font-sans text-[12px] text-text-muted mt-0.5">{description}</p>
          <div className="mt-2">
            <StatusPill status={status} />
          </div>
        </div>
      </div>
      {enabled && status !== "disabled" && status !== "awaiting-setup" && (
        <button
          onClick={onConnect}
          disabled={disabled}
          className={cn(
            "w-full h-10 rounded-xl font-sans font-semibold text-[13px] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform",
            status === "ready"
              ? "bg-success/10 border border-success/20 text-success"
              : "bg-crimson/10 border border-crimson/20 text-crimson",
          )}
        >
          <Link size={15} weight="bold" />
          {status === "ready" ? "Update ID" : "Connect Now"}
        </button>
      )}
      {enabled && status === "awaiting-setup" && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-warning/8 border border-warning/20">
          <Warning size={14} className="text-warning shrink-0 mt-0.5" weight="fill" />
          <p className="font-sans text-[12px] text-warning font-medium">
            Service account setup required. Contact your technical admin.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function MobileIntegrations(_props: MobileIntegrationsProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const role = user?.role ?? "STAFF";

  const { data: entries = {}, isLoading: configLoading, refetch: refetchConfig } = useSystemConfig();
  const upsertMany = useUpsertManySystemConfig();

  const [credentials, setCredentials] = useState<SecretMeta[]>([]);
  const [loadingCreds, setLoadingCreds] = useState(false);
  const [activeSheet, setActiveSheet] = useState<{ key: string; label: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadCredentials = async () => {
    setLoadingCreds(true);
    try {
      const res = await integrationsApi.listCredentials();
      setCredentials(parseApiData<SecretMeta[]>(res.data) ?? []);
    } catch {
      // owner may not have creds yet
    } finally {
      setLoadingCreds(false);
    }
  };

  useEffect(() => {
    void loadCredentials();
  }, []);

  const getVal = (key: string, def = "false") => entries[key] ?? def;
  const cred = (key: string) => credentials.find((c) => c.key === key);

  const sheetsEnabled = getVal("integration.googleSheets.enabled") === "true";
  const driveEnabled  = getVal("integration.googleDrive.enabled") === "true";
  const serviceAccountReady = getVal("integration.serviceAccount.configured") === "true";
  const isLoading = configLoading || loadingCreds;

  const sheetsStatus = (): ConnectionStatus => {
    if (!sheetsEnabled) return "disabled";
    if (!serviceAccountReady) return "awaiting-setup";
    if (!cred("google.sheetId")) return "needs-id";
    return "ready";
  };

  const driveStatus = (): ConnectionStatus => {
    if (!driveEnabled) return "disabled";
    if (!serviceAccountReady) return "awaiting-setup";
    if (!cred("google.driveFolderId")) return "needs-id";
    return "ready";
  };

  const handleToggle = async (key: string, value: boolean) => {
    setIsSaving(true);
    try {
      await upsertMany.mutateAsync({ [key]: value ? "true" : "false" });
      void refetchConfig();
    } finally {
      setIsSaving(false);
    }
  };

  // Only OWNER, ADMIN, SUPERADMIN can access integrations
  if (role !== "OWNER" && role !== "ADMIN" && role !== "SUPERADMIN") {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-void text-text-primary font-sans">
      <div className="pt-[env(safe-area-inset-top)]" />

      {/* ── Header ────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 flex items-center h-[56px] px-4 bg-base/80 backdrop-blur-xl border-b border-border-subtle">
        <button
          onClick={() => router.back()}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-text-secondary active:bg-elevated transition-colors"
        >
          <CaretLeft size={22} weight="bold" />
        </button>
        <span className="flex-1 text-center font-sans font-bold text-[17px] text-text-primary tracking-tight">
          Integrations
        </span>
        <button
          onClick={() => { void refetchConfig(); void loadCredentials(); }}
          disabled={isLoading}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-text-secondary active:bg-elevated transition-colors disabled:opacity-50"
        >
          <ArrowsClockwise size={18} className={isLoading ? "animate-spin" : ""} />
        </button>
      </header>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <main className="flex-1 px-4 py-5 space-y-5 pb-[calc(32px+env(safe-area-inset-bottom))]">

        {/* ── Section header ─────────────────────────────────────────── */}
        <div>
          <p className="font-sans font-bold text-[16px] text-text-primary">Google Integrations</p>
          <p className="font-sans text-[13px] text-text-muted mt-0.5">
            Sync leads to Google Sheets and store files in Google Drive
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-2xl bg-card border border-border-subtle p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Google Sheets */}
            <IntegrationCard
              icon={<Icon icon="logos:google-sheets" className="w-5 h-5" />}
              name="Google Sheets"
              description="Auto-export new leads and status updates to a spreadsheet"
              enabled={sheetsEnabled}
              status={sheetsStatus()}
              disabled={isSaving}
              onToggle={(v) => void handleToggle("integration.googleSheets.enabled", v)}
              onConnect={() => setActiveSheet({ key: "google.sheetId", label: "Spreadsheet ID" })}
            />

            {/* Google Drive */}
            <IntegrationCard
              icon={<Icon icon="logos:google-drive" className="w-5 h-5" />}
              name="Google Drive"
              description="Upload lead attachments and files to a shared Drive folder"
              enabled={driveEnabled}
              status={driveStatus()}
              disabled={isSaving}
              onToggle={(v) => void handleToggle("integration.googleDrive.enabled", v)}
              onConnect={() => setActiveSheet({ key: "google.driveFolderId", label: "Drive Folder ID" })}
            />
          </div>
        )}

        {/* ── Info note ────────────────────────────────────────────────── */}
        {!serviceAccountReady && !isLoading && (
          <div className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-warning/8 border border-warning/20">
            <Warning size={16} className="text-warning shrink-0 mt-0.5" weight="fill" />
            <p className="font-sans text-[12px] text-warning font-medium leading-relaxed">
              Google service account has not been configured yet. Contact your technical admin (Superadmin) to complete the initial setup.
            </p>
          </div>
        )}
      </main>

      {/* ── Credential sheet ────────────────────────────────────────── */}
      {activeSheet && (
        <CredentialSheet
          open
          onClose={() => setActiveSheet(null)}
          secretKey={activeSheet.key}
          label={activeSheet.label}
          existingMeta={cred(activeSheet.key)}
          onSaved={() => void loadCredentials()}
        />
      )}
    </div>
  );
}

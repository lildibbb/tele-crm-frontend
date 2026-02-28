"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSystemConfigStore } from "@/store/systemConfigStore";
import { integrationsApi } from "@/lib/api/integrations";
import type { SecretMeta } from "@/lib/api/superadmin";
import { Icon } from "@iconify/react";
import {
  CheckCircle,
  ArrowClockwise,
  Warning,
  Eye,
  EyeSlash,
  Question,
  Lock,
} from "@phosphor-icons/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// ── Google Product Icons ───────────────────────────────────────────────────────

function GoogleSheetsIcon({ className }: { className?: string }) {
  return <Icon icon="logos:google-sheets" className={className ?? "w-5 h-5"} />;
}

function GoogleDriveIcon({ className }: { className?: string }) {
  return <Icon icon="logos:google-drive" className={className ?? "w-5 h-5"} />;
}

// ── Status pill ────────────────────────────────────────────────────────────────

type ConnectionStatus = "ready" | "needs-id" | "awaiting-setup" | "disabled";

function StatusPill({ status }: { status: ConnectionStatus }) {
  const config = {
    ready:            { dot: "bg-success",       text: "text-success",     label: "Ready to sync" },
    "needs-id":       { dot: "bg-amber-400",     text: "text-amber-400",   label: "Paste your ID below to connect" },
    "awaiting-setup": { dot: "bg-text-muted/40", text: "text-text-muted",  label: "Awaiting technical setup" },
    disabled:         { dot: "bg-text-muted/30", text: "text-text-muted",  label: "Disabled" },
  }[status];

  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

// ── Inline toggle ──────────────────────────────────────────────────────────────

function InlineToggle({
  value,
  onChange,
  disabled,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus-visible:ring-2 ${value ? "bg-crimson" : "bg-border-subtle"} disabled:opacity-50`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${value ? "translate-x-4.5" : "translate-x-0.5"}`}
      />
    </button>
  );
}

// ── ID Input (friendly, non-technical) ────────────────────────────────────────

function IdInput({
  secretKey,
  label,
  placeholder,
  helpTitle,
  helpContent,
  existingMeta,
  disabled,
  onSaved,
}: {
  secretKey: string;
  label: string;
  placeholder?: string;
  helpTitle: string;
  helpContent: React.ReactNode;
  existingMeta: SecretMeta | undefined;
  disabled?: boolean;
  onSaved: () => void;
}) {
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSave = async () => {
    if (!value.trim()) return;
    setSaving(true);
    setErr(null);
    try {
      await integrationsApi.setCredential({ key: secretKey, value: value.trim(), description: label });
      setValue("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      onSaved();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to save";
      setErr(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Label className="text-xs font-medium text-text-secondary">{label}</Label>
        <Popover>
          <PopoverTrigger asChild>
            <button type="button" className="text-text-muted hover:text-text-secondary transition-colors">
              <Question size={13} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 text-xs space-y-1.5 p-3">
            <p className="font-semibold text-text-primary">{helpTitle}</p>
            <div className="text-text-secondary leading-snug">{helpContent}</div>
          </PopoverContent>
        </Popover>
      </div>
      {existingMeta && (
        <p className="text-[10px] text-text-muted">
          ✓ Connected · Last updated {new Date(existingMeta.updatedAt).toLocaleDateString()}
          {existingMeta.updatedBy ? ` by ${existingMeta.updatedBy}` : ""}
        </p>
      )}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type={show ? "text" : "password"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={disabled}
            placeholder={existingMeta ? "Paste new ID to update…" : (placeholder ?? "Paste ID here…")}
            className="h-8 text-xs pr-8"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
          >
            {show ? <EyeSlash size={13} /> : <Eye size={13} />}
          </button>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleSave}
          disabled={!value.trim() || saving || disabled}
          className={`h-8 px-3 text-xs shrink-0 ${saved ? "text-success border-success/40" : ""}`}
        >
          {saved ? <CheckCircle size={13} className="mr-1" /> : null}
          {saving ? "Saving…" : saved ? "Saved!" : existingMeta ? "Update" : "Connect"}
        </Button>
      </div>
      {err && <p className="text-[10px] text-danger">{err}</p>}
    </div>
  );
}

// ── Main Tab ───────────────────────────────────────────────────────────────────

export function IntegrationsTab() {
  const { entries, isLoading: configLoading, fetchAll, upsertMany } = useSystemConfigStore();
  const [credentials, setCredentials] = useState<SecretMeta[]>([]);
  const [loadingCreds, setLoadingCreds] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  const loadCredentials = async () => {
    setLoadingCreds(true);
    try {
      const res = await integrationsApi.listCredentials();
      setCredentials((res.data as any).data ?? []);
    } catch {
      // silently ignore — owner may not have creds yet
    } finally {
      setLoadingCreds(false);
    }
  };

  useEffect(() => {
    void fetchAll();
    void loadCredentials();
  }, [fetchAll]);

  const getVal = (key: string, def = "false") => entries[key] ?? def;

  const handleToggle = async (key: string, value: boolean) => {
    setSaveErr(null);
    setIsSaving(true);
    try {
      await upsertMany({ [key]: value ? "true" : "false" });
      setSaved(key);
      setTimeout(() => setSaved(null), 2000);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Save failed";
      setSaveErr(msg);
      setTimeout(() => setSaveErr(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const sheetsEnabled = getVal("integration.googleSheets.enabled") === "true";
  const driveEnabled  = getVal("integration.googleDrive.enabled") === "true";

  const cred = (key: string) => credentials.find((c) => c.key === key);

  // Service account is managed by Superadmin only.
  // We detect setup status via the integration.serviceAccount.configured system config key.
  const serviceAccountReady = getVal("integration.serviceAccount.configured") === "true";
  const isAwaitingSetup = !serviceAccountReady;

  const sheetsStatus = (): ConnectionStatus => {
    if (!sheetsEnabled) return "disabled";
    if (isAwaitingSetup) return "awaiting-setup";
    if (!cred("google.sheetId")) return "needs-id";
    return "ready";
  };

  const driveStatus = (): ConnectionStatus => {
    if (!driveEnabled) return "disabled";
    if (isAwaitingSetup) return "awaiting-setup";
    if (!cred("google.driveFolderId")) return "needs-id";
    return "ready";
  };

  return (
    <div className="space-y-5 animate-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Google Integrations</h2>
          <p className="text-text-secondary text-sm font-sans mt-1">
            Sync your leads to Google Sheets and store files in Google Drive
          </p>
        </div>
        <button
          onClick={() => { void fetchAll(); void loadCredentials(); }}
          className="p-1.5 rounded-md text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowClockwise size={14} className={configLoading || loadingCreds ? "animate-spin" : ""} />
        </button>
      </div>

      {saveErr && (
        <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-xs flex gap-2">
          <Warning size={13} className="shrink-0 mt-0.5" /> {saveErr}
        </div>
      )}

      {/* Awaiting setup banner */}
      {isAwaitingSetup && (
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-elevated border border-border-subtle">
          <Lock size={16} weight="duotone" className="text-text-muted shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-text-primary">Google connection not yet set up</p>
            <p className="text-xs text-text-secondary mt-0.5">
              Your technical admin needs to connect a Google account before you can use these features.
              Contact your admin to complete the setup — then come back here to add your spreadsheet and folder.
            </p>
          </div>
        </div>
      )}

      {/* ── Google Sheets ─────────────────────────────────────────────────────── */}
      <div className="page-panel bg-elevated rounded-xl overflow-hidden border border-border-subtle">
        <div className="px-5 py-4 bg-card flex items-center justify-between border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <GoogleSheetsIcon className="w-7 h-7 shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Google Sheets</h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Automatically copy your leads into a Google Spreadsheet
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {saved === "integration.googleSheets.enabled" && (
              <span className="text-xs text-success flex items-center gap-1">
                <CheckCircle size={12} /> Saved
              </span>
            )}
            <InlineToggle
              value={sheetsEnabled}
              onChange={(v) => void handleToggle("integration.googleSheets.enabled", v)}
              disabled={isSaving}
            />
          </div>
        </div>

        <div className="px-5 py-5 space-y-4">
          <StatusPill status={sheetsStatus()} />

          <IdInput
            secretKey="google.sheetId"
            label="Your Spreadsheet"
            placeholder="e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
            helpTitle="How to find your Spreadsheet ID"
            helpContent={
              <div className="space-y-1">
                <p>1. Open your Google Sheets spreadsheet</p>
                <p>2. Look at the URL bar — copy the long code:</p>
                <p className="font-mono text-[10px] bg-card px-2 py-1 rounded break-all">
                  docs.google.com/spreadsheets/d/<strong className="text-info">ID</strong>/edit
                </p>
                <p>3. Paste that code above</p>
              </div>
            }
            existingMeta={cred("google.sheetId")}
            disabled={isAwaitingSetup}
            onSaved={loadCredentials}
          />
        </div>
      </div>

      {/* ── Google Drive ──────────────────────────────────────────────────────── */}
      <div className="page-panel bg-elevated rounded-xl overflow-hidden border border-border-subtle">
        <div className="px-5 py-4 bg-card flex items-center justify-between border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <GoogleDriveIcon className="w-7 h-7 shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Google Drive</h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Automatically save lead attachments to a Google Drive folder
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {saved === "integration.googleDrive.enabled" && (
              <span className="text-xs text-success flex items-center gap-1">
                <CheckCircle size={12} /> Saved
              </span>
            )}
            <InlineToggle
              value={driveEnabled}
              onChange={(v) => void handleToggle("integration.googleDrive.enabled", v)}
              disabled={isSaving}
            />
          </div>
        </div>

        <div className="px-5 py-5 space-y-4">
          <StatusPill status={driveStatus()} />

          <IdInput
            secretKey="google.driveFolderId"
            label="Your Drive Folder"
            placeholder="e.g. 1A2b3C4d5E6f7G8h9I0j"
            helpTitle="How to find your Drive Folder ID"
            helpContent={
              <div className="space-y-1">
                <p>1. Open Google Drive and go to your folder</p>
                <p>2. Look at the URL bar — copy the code at the end:</p>
                <p className="font-mono text-[10px] bg-card px-2 py-1 rounded break-all">
                  drive.google.com/drive/folders/<strong className="text-info">ID</strong>
                </p>
                <p>3. Paste that code above</p>
              </div>
            }
            existingMeta={cred("google.driveFolderId")}
            disabled={isAwaitingSetup}
            onSaved={loadCredentials}
          />

          <p className="text-[11px] text-text-muted">
            Uses the same Google connection as Sheets — no separate setup needed.
          </p>
        </div>
      </div>

      {/* Footer note */}
      <p className="text-[11px] text-text-muted px-1">
        Your IDs are stored securely and never shared with third parties.
        Changes take effect on the next sync cycle.
      </p>
    </div>
  );
}

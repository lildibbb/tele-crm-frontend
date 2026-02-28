"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSystemConfigStore } from "@/store/systemConfigStore";
import { integrationsApi } from "@/lib/api/integrations";
import type { SecretMeta } from "@/lib/api/superadmin";
import {
  CheckCircle,
  ArrowClockwise,
  Warning,
  Eye,
  EyeSlash,
} from "@phosphor-icons/react";

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

// ── Credential input ───────────────────────────────────────────────────────────

function CredentialInput({
  secretKey,
  label,
  placeholder,
  hint,
  existingMeta,
  onSaved,
}: {
  secretKey: string;
  label: string;
  placeholder?: string;
  hint?: string;
  existingMeta: SecretMeta | undefined;
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
      <Label className="text-xs font-medium text-text-secondary">{label}</Label>
      {existingMeta && (
        <p className="text-[10px] text-text-muted">
          Last updated{" "}
          {new Date(existingMeta.updatedAt).toLocaleDateString()}
          {existingMeta.updatedBy ? ` by ${existingMeta.updatedBy}` : ""}
          {" · "}
          <span className="text-amber-400">Value encrypted — enter new value to replace</span>
        </p>
      )}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type={show ? "text" : "password"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder ?? (existingMeta ? "Enter new value to replace…" : "Paste value…")}
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
          disabled={!value.trim() || saving}
          className={`h-8 px-3 text-xs shrink-0 ${saved ? "text-success border-success/40" : ""}`}
        >
          {saved ? <CheckCircle size={13} className="mr-1" /> : null}
          {saving ? "Saving…" : saved ? "Saved!" : existingMeta ? "Update" : "Save"}
        </Button>
      </div>
      {hint && <p className="text-[10px] text-text-muted leading-snug">{hint}</p>}
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
      // silently ignore — user may not have creds yet
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
  const driveEnabled = getVal("integration.googleDrive.enabled") === "true";

  const cred = (key: string) => credentials.find((c) => c.key === key);

  return (
    <div className="space-y-5 animate-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Integrations</h2>
          <p className="text-text-secondary text-sm font-sans mt-1">
            Connect Google Sheets & Drive to sync leads and attachments
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

      {/* ── Google Sheets ─────────────────────────────────────────────────────── */}
      <div className="page-panel bg-elevated rounded-xl overflow-hidden border border-border-subtle">
        <div className="px-5 py-4 bg-card flex items-center justify-between border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-emerald-400 fill-current" aria-hidden="true"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Google Sheets Sync</h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Automatically sync leads to a Google Spreadsheet
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
          <CredentialInput
            secretKey="google.sheetId"
            label="Google Sheet ID"
            placeholder="e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
            hint="The spreadsheet ID from the Google Sheet URL: docs.google.com/spreadsheets/d/{ID}/..."
            existingMeta={cred("google.sheetId")}
            onSaved={loadCredentials}
          />
          <CredentialInput
            secretKey="google.serviceAccount"
            label="Service Account JSON"
            placeholder='{"type":"service_account","project_id":"…"}'
            hint="Paste your full Google Cloud service account JSON. The value is encrypted at rest and never displayed again."
            existingMeta={cred("google.serviceAccount")}
            onSaved={loadCredentials}
          />
        </div>
      </div>

      {/* ── Google Drive ──────────────────────────────────────────────────────── */}
      <div className="page-panel bg-elevated rounded-xl overflow-hidden border border-border-subtle">
        <div className="px-5 py-4 bg-card flex items-center justify-between border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-blue-400 fill-current" aria-hidden="true"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Google Drive Sync</h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Automatically upload lead attachments to Google Drive
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
          <CredentialInput
            secretKey="google.driveFolderId"
            label="Drive Folder ID"
            placeholder="e.g. 1A2b3C4d5E6f7G8h9I0j"
            hint="The folder ID from the Google Drive URL: drive.google.com/drive/folders/{ID}. Attachments will be uploaded here."
            existingMeta={cred("google.driveFolderId")}
            onSaved={loadCredentials}
          />
          <p className="text-[11px] text-text-muted">
            The same Service Account set in Google Sheets is used for Drive access. Set the Service Account JSON above.
          </p>
        </div>
      </div>

      {/* Info note */}
      <p className="text-[11px] text-text-muted px-1">
        ℹ️ All credentials are encrypted at rest using AES-256-GCM. Once saved, values cannot be retrieved — only replaced.
      </p>
    </div>
  );
}

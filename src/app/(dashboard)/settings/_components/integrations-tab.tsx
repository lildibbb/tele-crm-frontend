"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useSystemConfig,
  useUpsertManySystemConfig,
} from "@/queries/useSystemConfigQuery";
import { integrationsApi } from "@/lib/api/integrations";
import type { SecretMeta } from "@/lib/api/superadmin";
import { parseApiData } from "@/lib/api/parseResponse";
import { Icon } from "@iconify/react";
import {
  CheckCircle,
  ArrowClockwise,
  Warning,
  Eye,
  EyeSlash,
  Lock,
  Copy,
  ShareNetwork,
  LinkSimple,
  PlugsConnected,
  CaretDown,
  Play,
  CheckFat,
  FrameCorners,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n";
import K from "@/i18n/keys";
import { GoogleDriveConnectionCard } from "@/components/google/GoogleDriveConnectionCard";
import { useFeatureVisibility } from "@/queries/useMaintenanceQuery";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/types/enums";

// ── Google Product Icons ────────────────────────────────────────────────────────

function GoogleSheetsIcon({ className }: { className?: string }) {
  return (
    <Icon
      icon="simple-icons:googlesheets"
      className={cn("text-[#34A853]", className)}
    />
  );
}

function GoogleDriveIcon({ className }: { className?: string }) {
  return <Icon icon="logos:google-drive" className={className} />;
}

// ── Connection status type ─────────────────────────────────────────────────────

type ConnectionStatus = "ready" | "needs-id" | "awaiting-setup" | "disabled";

// ── Smart video embed ──────────────────────────────────────────────────────────
// Detects YouTube / Loom and embeds inline; falls back to a styled link.

function getEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    // YouTube: youtube.com/watch?v=ID  or  youtu.be/ID
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
    if (u.hostname === "youtu.be") {
      const v = u.pathname.slice(1);
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
    // Loom: loom.com/share/ID
    if (u.hostname.includes("loom.com") && u.pathname.startsWith("/share/")) {
      const id = u.pathname.split("/share/")[1]?.split("?")[0];
      if (id) return `https://www.loom.com/embed/${id}`;
    }
  } catch {
    // invalid URL — ignore
  }
  return null;
}

function VideoCTA({ url }: { url: string }) {
  const t = useT();
  const embedUrl = getEmbedUrl(url);
  const [expanded, setExpanded] = useState(false);

  if (embedUrl) {
    return (
      <div className="rounded-xl overflow-hidden border border-border-subtle">
        <button
          type="button"
          onClick={() => setExpanded((s) => !s)}
          className="w-full flex items-center justify-between px-4 py-3 bg-card hover:bg-elevated transition-colors cursor-pointer group"
        >
          <span className="flex items-center gap-2.5 text-xs font-medium text-text-secondary group-hover:text-text-primary transition-colors">
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-crimson/10 group-hover:bg-crimson/15 transition-colors shrink-0">
              <Play
                size={11}
                weight="fill"
                className="text-crimson translate-x-0.5"
              />
            </span>
            {t(K.integrations.guide.watchWalkthrough)}
            <span className="text-text-muted text-[10px]">
              — {t(K.integrations.guide.videoMinutes)}
            </span>
          </span>
          <FrameCorners
            size={14}
            className={cn(
              "text-text-muted transition-transform duration-200",
              expanded ? "rotate-180" : "",
            )}
          />
        </button>
        {expanded && (
          <div className="aspect-video bg-void border-t border-border-subtle">
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={t(K.integrations.guide.watchWalkthrough)}
            />
          </div>
        )}
      </div>
    );
  }

  // Fallback: styled link
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-card border border-border-subtle hover:border-crimson/30 hover:bg-crimson/3 transition-all cursor-pointer"
    >
      <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-crimson/10 group-hover:bg-crimson/15 transition-colors shrink-0">
        <Play
          size={13}
          weight="fill"
          className="text-crimson translate-x-0.5"
        />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-text-secondary group-hover:text-text-primary transition-colors">
          {t(K.integrations.guide.watchWalkthrough)}
        </p>
        <p className="text-[10px] text-text-muted">
          {t(K.integrations.guide.videoMinutes)}
        </p>
      </div>
      <span className="text-[11px] text-text-muted group-hover:text-crimson transition-colors">
        →
      </span>
    </a>
  );
}

// ── Status pill ─────────────────────────────────────────────────────────────────
// Minimal: dot + text only. No coloured background boxes.

function StatusPill({ status }: { status: ConnectionStatus }) {
  const t = useT();

  const config: Record<
    ConnectionStatus,
    {
      dot: string;
      text: string;
      label: string;
      pulse?: boolean;
    }
  > = {
    ready: {
      dot: "bg-success",
      text: "text-success",
      label: t(K.integrations.status.ready),
      pulse: true,
    },
    "needs-id": {
      dot: "bg-amber-400",
      text: "text-amber-400",
      label: t(K.integrations.status.needsId),
    },
    "awaiting-setup": {
      dot: "bg-text-muted/40",
      text: "text-text-muted",
      label: t(K.integrations.status.awaiting),
    },
    disabled: {
      dot: "bg-text-muted/30",
      text: "text-text-muted",
      label: t(K.integrations.status.disabled),
    },
  };

  const c = config[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[11px] font-medium font-sans",
        c.text,
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full shrink-0",
          c.dot,
          c.pulse && "animate-pulse",
        )}
      />
      {c.label}
    </span>
  );
}

// ── Status sub-text ─────────────────────────────────────────────────────────────

function StatusSubText({ status }: { status: ConnectionStatus }) {
  const t = useT();
  const map: Record<ConnectionStatus, string> = {
    ready: t(K.integrations.status.readySub),
    "needs-id": t(K.integrations.status.needsIdSub),
    "awaiting-setup": t(K.integrations.status.awaitingSub),
    disabled: t(K.integrations.status.disabledSub),
  };
  return (
    <p className="text-[10px] text-text-muted font-sans leading-snug">
      {map[status]}
    </p>
  );
}

// ── Inline toggle ───────────────────────────────────────────────────────────────

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
      aria-checked={value}
      role="switch"
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus-visible:ring-2 disabled:opacity-50 cursor-pointer",
        value ? "bg-crimson" : "bg-border-default",
      )}
    >
      <span
        className={cn(
          "inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200",
          value ? "translate-x-4.5" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

// ── ID Input ────────────────────────────────────────────────────────────────────

function IdInput({
  secretKey,
  label,
  placeholder,
  existingMeta,
  disabled,
  onSaved,
}: {
  secretKey: string;
  label: string;
  placeholder?: string;
  existingMeta: SecretMeta | undefined;
  disabled?: boolean;
  onSaved: () => void;
}) {
  const t = useT();
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
      await integrationsApi.setCredential({
        key: secretKey,
        value: value.trim(),
        description: label,
      });
      setValue("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      onSaved();
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? t(K.integrations.saveFailed);
      setErr(msg);
    } finally {
      setSaving(false);
    }
  };

  const connectedDate = existingMeta
    ? t(K.integrations.credential.connected).replace(
        "{{date}}",
        new Date(existingMeta.updatedAt).toLocaleDateString(),
      )
    : null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs font-medium text-text-secondary font-sans">
          {label}
        </Label>
        {connectedDate && (
          <span className="inline-flex items-center gap-1 text-[11px] text-success font-medium font-sans shrink-0">
            <CheckFat size={10} weight="fill" />
            {connectedDate}
          </span>
        )}
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type={show ? "text" : "password"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={disabled}
            placeholder={
              existingMeta
                ? t(K.integrations.credential.placeholderUpdate)
                : (placeholder ?? t(K.integrations.credential.placeholder))
            }
            className="h-9 text-xs pr-9 font-mono bg-card border-border-default focus:border-crimson/50 transition-colors"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
            aria-label={show ? "Hide" : "Show"}
          >
            {show ? <EyeSlash size={13} /> : <Eye size={13} />}
          </button>
        </div>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!value.trim() || saving || disabled}
          className={cn(
            "h-9 px-4 text-xs shrink-0 font-semibold font-sans transition-all",
            saved
              ? "bg-success/10 text-success border border-success/25 hover:bg-success/10"
              : "bg-crimson text-white hover:bg-crimson/90",
          )}
        >
          {saved ? (
            <>
              <CheckCircle size={13} className="mr-1.5" />
              {t(K.integrations.credential.saved)}
            </>
          ) : saving ? (
            t(K.integrations.credential.saving)
          ) : existingMeta ? (
            t(K.integrations.credential.update)
          ) : (
            t(K.integrations.credential.connect)
          )}
        </Button>
      </div>
      {err && (
        <p className="text-[10px] text-danger flex items-center gap-1 font-sans">
          <Warning size={10} />
          {err}
        </p>
      )}
    </div>
  );
}

// ── Email copy chip ─────────────────────────────────────────────────────────────

function EmailCopyChip({ email }: { email: string }) {
  const t = useT();
  const [copied, setCopied] = useState(false);

  const copy = () => {
    void navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={copy}
      title="Click to copy"
      className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg bg-card border border-border-subtle font-mono text-[11px] text-text-primary hover:border-border-default active:scale-[0.99] transition-all group cursor-pointer"
    >
      <span className="flex-1 text-left truncate text-text-secondary">
        {email}
      </span>
      <span
        className={cn(
          "flex items-center gap-1 text-[10px] font-medium font-sans shrink-0 px-2 py-0.5 rounded-full transition-all",
          copied
            ? "text-success bg-success/10"
            : "text-text-muted group-hover:text-text-primary",
        )}
      >
        {copied ? (
          <>
            <CheckCircle size={10} />
            {t(K.integrations.copied)}
          </>
        ) : (
          <>
            <Copy size={10} />
            {t(K.integrations.copy)}
          </>
        )}
      </span>
    </button>
  );
}

// ── URL anatomy diagram ─────────────────────────────────────────────────────────

function URLAnatomyDiagram({ type }: { type: "sheets" | "drive" }) {
  const parts =
    type === "sheets"
      ? { prefix: "docs.google.com/spreadsheets/d/", suffix: "/edit" }
      : { prefix: "drive.google.com/drive/folders/", suffix: "" };

  return (
    <div className="flex flex-wrap items-center font-mono text-[10px] bg-card border border-border-subtle rounded-lg px-3 py-2.5 text-text-muted overflow-x-auto">
      <span className="opacity-60">{parts.prefix}</span>
      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-crimson/10 text-crimson border border-crimson/20 mx-0.5 select-all font-semibold">
        YOUR-ID
      </span>
      {parts.suffix && <span className="opacity-60">{parts.suffix}</span>}
    </div>
  );
}

// ── Setup guide ─────────────────────────────────────────────────────────────────

function SetupGuide({
  type,
  email,
  videoUrl,
  defaultOpen = false,
}: {
  type: "sheets" | "drive";
  email: string;
  videoUrl?: string;
  defaultOpen?: boolean;
}) {
  const t = useT();
  const [open, setOpen] = useState(defaultOpen);
  const hasEmail = Boolean(email?.trim());

  const steps = [
    {
      icon: ShareNetwork,
      title:
        type === "sheets"
          ? t(K.integrations.guide.step1Title)
          : t(K.integrations.guide.step1TitleDrive),
      body:
        type === "sheets"
          ? t(K.integrations.guide.step1Body)
          : t(K.integrations.guide.step1BodyDrive),
      extra: "email" as const,
    },
    {
      icon: LinkSimple,
      title:
        type === "sheets"
          ? t(K.integrations.guide.step2Title)
          : t(K.integrations.guide.step2TitleDrive),
      body: t(K.integrations.guide.step2Body),
      extra: "url" as const,
    },
    {
      icon: PlugsConnected,
      title: t(K.integrations.guide.step3Title),
      body: t(K.integrations.guide.step3Body),
      extra: null,
    },
  ] as const;

  return (
    <div className="rounded-xl border border-border-subtle overflow-hidden">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-card hover:bg-elevated transition-colors group cursor-pointer"
      >
        <span className="flex items-center gap-2 text-xs font-medium text-text-secondary group-hover:text-text-primary transition-colors font-sans">
          <span className="flex items-center justify-center w-5 h-5 rounded-md bg-elevated group-hover:bg-crimson/10 border border-border-subtle transition-colors">
            <span className="text-[10px] font-bold text-text-muted group-hover:text-crimson transition-colors">
              3
            </span>
          </span>
          {t(K.integrations.guide.trigger)}
        </span>
        <CaretDown
          size={12}
          className={cn(
            "text-text-muted transition-transform duration-200",
            open ? "rotate-180" : "",
          )}
        />
      </button>

      {/* Body */}
      {open && (
        <div className="bg-elevated border-t border-border-subtle px-5 py-4 space-y-0">
          {steps.map((step, i) => {
            const StepIcon = step.icon;
            const isLast = i === steps.length - 1;
            return (
              <div key={i} className="flex gap-4">
                {/* Left connector column */}
                <div className="flex flex-col items-center shrink-0">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-crimson/8 border border-crimson/15 shrink-0 mt-0.5">
                    <StepIcon
                      size={11}
                      weight="duotone"
                      className="text-crimson"
                    />
                  </div>
                  {!isLast && (
                    <div
                      className="w-px flex-1 bg-border-subtle mt-1 mb-1"
                      style={{ minHeight: "20px" }}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="pb-4 flex-1 min-w-0">
                  <p className="text-xs font-semibold text-text-primary font-sans mb-1">
                    {step.title}
                  </p>
                  <p className="text-[11px] text-text-secondary font-sans leading-relaxed mb-2">
                    {step.body}
                  </p>

                  {step.extra === "email" && (
                    <div className="space-y-1.5">
                      {hasEmail ? (
                        <EmailCopyChip email={email} />
                      ) : (
                        <p className="text-[10px] text-amber-400/80 leading-snug font-sans">
                          {t(K.integrations.guide.emailMissing)}
                        </p>
                      )}
                      <p className="text-[10px] text-amber-400/70 font-sans leading-snug">
                        {t(K.integrations.guide.step1Warning)}
                      </p>
                    </div>
                  )}

                  {step.extra === "url" && <URLAnatomyDiagram type={type} />}
                </div>
              </div>
            );
          })}

          {videoUrl && (
            <div className="pt-1">
              <VideoCTA url={videoUrl} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Integration Card ────────────────────────────────────────────────────────────

function IntegrationCard({
  icon,
  title,
  description,
  enabled,
  onToggle,
  isSaving,
  justSaved,
  status,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: (v: boolean) => void;
  isSaving: boolean;
  justSaved: boolean;
  status: ConnectionStatus;
  children: React.ReactNode;
}) {
  const t = useT();

  return (
    <div className="rounded-2xl border border-border-subtle bg-elevated overflow-hidden shadow-[var(--shadow-card)]">
      {/* Card header */}
      <div className="px-5 py-4 bg-card border-b border-border-subtle flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {/* Icon — no border box, just the brand icon */}
          <div
            className={cn(
              "shrink-0 transition-opacity",
              !enabled && "opacity-40",
            )}
          >
            {icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-text-primary font-sans">
                {title}
              </h3>
              {justSaved && (
                <span className="inline-flex items-center gap-1 text-[10px] text-success font-medium font-sans">
                  <CheckCircle size={11} />
                  {t(K.integrations.credential.saved)}
                </span>
              )}
            </div>
            <p className="text-[11px] text-text-muted font-sans mt-0.5 truncate">
              {description}
            </p>
          </div>
        </div>
        <InlineToggle value={enabled} onChange={onToggle} disabled={isSaving} />
      </div>

      {/* Card body */}
      <div className="px-5 py-4">
        {/* Status row */}
        <div className="flex items-start gap-1.5 mb-4">
          <StatusPill status={status} />
          <span className="text-text-muted text-[10px] mt-px">·</span>
          <StatusSubText status={status} />
        </div>

        <div className="space-y-4">{children}</div>
      </div>
    </div>
  );
}

// ── Main Tab ────────────────────────────────────────────────────────────────────

export function IntegrationsTab() {
  const t = useT();
  const {
    data: entries = {},
    isLoading: configLoading,
    refetch: refetchConfig,
  } = useSystemConfig();
  const upsertManyMutation = useUpsertManySystemConfig();
  const [credentials, setCredentials] = useState<SecretMeta[]>([]);
  const [loadingCreds, setLoadingCreds] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  const visibility = useFeatureVisibility();
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === UserRole.SUPERADMIN;

  const loadCredentials = async () => {
    setLoadingCreds(true);
    try {
      const res = await integrationsApi.listCredentials();
      setCredentials(parseApiData<SecretMeta[]>(res.data) ?? []);
    } catch {
      // silently ignore
    } finally {
      setLoadingCreds(false);
    }
  };

  useEffect(() => {
    void loadCredentials();
  }, []);

  const getVal = (key: string, def = "false") => entries[key] ?? def;
  const cred = (key: string) => credentials.find((c) => c.key === key);

  const handleToggle = async (key: string, value: boolean) => {
    setSaveErr(null);
    setIsSaving(true);
    try {
      await upsertManyMutation.mutateAsync({ [key]: value ? "true" : "false" });
      setSaved(key);
      setTimeout(() => setSaved(null), 2000);
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? t(K.integrations.saveFailed);
      setSaveErr(msg);
      setTimeout(() => setSaveErr(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const sheetsEnabled = getVal("integration.googleSheets.enabled") === "true";
  const driveEnabled = getVal("integration.googleDrive.enabled") === "true";
  const serviceAccountEmail = getVal("integration.serviceAccount.email", "");
  const sheetsVideoUrl =
    getVal("integration.googleSheets.guideVideoUrl", "") || undefined;
  const driveVideoUrl =
    getVal("integration.googleDrive.guideVideoUrl", "") || undefined;
  const serviceAccountReady =
    getVal("integration.serviceAccount.configured") === "true";
  const isAwaitingSetup = !configLoading && !serviceAccountReady;

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
    <div className="space-y-6 animate-in-up">
      {/* ── Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-text-primary font-sans">
            {t(K.integrations.title)}
          </h2>
          <p className="text-text-secondary text-sm font-sans mt-1">
            {t(K.integrations.subtitle)}
          </p>
        </div>
        <button
          onClick={() => {
            void refetchConfig();
            void loadCredentials();
          }}
          className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-elevated border border-transparent hover:border-border-subtle transition-all mt-0.5 cursor-pointer"
          aria-label={t(K.integrations.refresh)}
        >
          <ArrowClockwise
            size={14}
            className={configLoading || loadingCreds ? "animate-spin" : ""}
          />
        </button>
      </div>

      {/* ── Error banner */}
      {saveErr && (
        <div className="px-3.5 py-2.5 rounded-xl bg-danger/8 border border-danger/15 text-danger text-xs flex gap-2 items-center font-sans">
          <Warning size={13} className="shrink-0" />
          {saveErr}
        </div>
      )}

      {/* ── Awaiting setup banner */}
      {isAwaitingSetup && (
        <div className="flex items-start gap-3.5 px-4 py-3.5 rounded-2xl bg-elevated border border-border-subtle">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-card border border-border-subtle shrink-0 mt-0.5">
            <Lock size={14} weight="duotone" className="text-text-muted" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary font-sans">
              {t(K.integrations.setupBanner.title)}
            </p>
            <p className="text-xs text-text-secondary font-sans mt-1 leading-relaxed">
              {t(K.integrations.setupBanner.desc)}
            </p>
          </div>
        </div>
      )}

      {/* ── Google Sheets card */}
      {(isSuperAdmin || visibility.googleSheets) && (
      <IntegrationCard
        icon={<GoogleSheetsIcon className="w-[22px] h-[22px]" />}
        title={t(K.integrations.sheets.name)}
        description={t(K.integrations.sheets.description)}
        enabled={sheetsEnabled}
        onToggle={(v) =>
          void handleToggle("integration.googleSheets.enabled", v)
        }
        isSaving={isSaving}
        justSaved={saved === "integration.googleSheets.enabled"}
        status={sheetsStatus()}
      >
        <IdInput
          secretKey="google.sheetId"
          label={t(K.integrations.credential.yourSpreadsheet)}
          placeholder="e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
          existingMeta={cred("google.sheetId")}
          disabled={isAwaitingSetup}
          onSaved={loadCredentials}
        />
        <SetupGuide
          type="sheets"
          email={serviceAccountEmail}
          videoUrl={sheetsVideoUrl}
          defaultOpen={sheetsStatus() === "needs-id"}
        />
      </IntegrationCard>
      )}

      {/* ── Google Drive card */}
      {(isSuperAdmin || visibility.googleDriveServiceAccount) && (
      <IntegrationCard
        icon={<GoogleDriveIcon className="w-[22px] h-[22px]" />}
        title={t(K.integrations.drive.name)}
        description={t(K.integrations.drive.description)}
        enabled={driveEnabled}
        onToggle={(v) =>
          void handleToggle("integration.googleDrive.enabled", v)
        }
        isSaving={isSaving}
        justSaved={saved === "integration.googleDrive.enabled"}
        status={driveStatus()}
      >
        <IdInput
          secretKey="google.driveFolderId"
          label={t(K.integrations.credential.yourDriveFolder)}
          placeholder="e.g. 1A2b3C4d5E6f7G8h9I0j"
          existingMeta={cred("google.driveFolderId")}
          disabled={isAwaitingSetup}
          onSaved={loadCredentials}
        />
        <SetupGuide
          type="drive"
          email={serviceAccountEmail}
          videoUrl={driveVideoUrl}
          defaultOpen={driveStatus() === "needs-id"}
        />
      </IntegrationCard>
      )}

      {/* ── Google Drive OAuth2 Connection (Owner-only) */}
      {(isSuperAdmin || visibility.googleDriveOAuth2) && (
        <GoogleDriveConnectionCard />
      )}

      {/* ── Footer note */}
      <p className="text-[11px] text-text-muted font-sans text-center px-1">
        {t(K.integrations.securityNote)}
      </p>
    </div>
  );
}

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
  Lock,
  ShareNetwork,
  LinkSimple,
  PlugsConnected,
  CaretDown,
  Play,
  Copy,
  CheckFat,
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
import {
  useSystemConfig,
  useUpsertManySystemConfig,
} from "@/queries/useSystemConfigQuery";
import { integrationsApi } from "@/lib/api/integrations";
import { parseApiData } from "@/lib/api/parseResponse";
import { useAuthStore } from "@/store/authStore";
import type { SecretMeta } from "@/lib/api/superadmin";
import { useT } from "@/i18n";
import K from "@/i18n/keys";
import { GoogleDriveConnectionCard } from "../google/GoogleDriveConnectionCard";
import { useFeatureVisibility } from "@/queries/useMaintenanceQuery";
import { UserRole } from "@/types/enums";

// ── Types ───────────────────────────────────────────────────────────────────────
export interface MobileIntegrationsProps {}

type ConnectionStatus = "ready" | "needs-id" | "awaiting-setup" | "disabled";

// ── Smart video embed ──────────────────────────────────────────────────────────
function getEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
    if (u.hostname === "youtu.be") {
      const v = u.pathname.slice(1);
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
    if (u.hostname.includes("loom.com") && u.pathname.startsWith("/share/")) {
      const id = u.pathname.split("/share/")[1]?.split("?")[0];
      if (id) return `https://www.loom.com/embed/${id}`;
    }
  } catch {
    /* invalid URL */
  }
  return null;
}

function MobileVideoCTA({ url }: { url: string }) {
  const t = useT();
  const embedUrl = getEmbedUrl(url);
  const [expanded, setExpanded] = useState(false);

  if (embedUrl) {
    return (
      <div className="rounded-xl overflow-hidden border border-border-subtle mt-3">
        <button
          type="button"
          onClick={() => setExpanded((s) => !s)}
          className="w-full flex items-center justify-between px-4 py-3 bg-card active:bg-elevated transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2.5 font-sans text-xs font-medium text-text-secondary">
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-crimson/10 shrink-0">
              <Play
                size={11}
                weight="fill"
                className="text-crimson translate-x-0.5"
              />
            </span>
            {t(K.integrations.guide.watchWalkthrough)}
            <span className="text-[10px] text-text-muted">
              — {t(K.integrations.guide.videoMinutes)}
            </span>
          </span>
          <CaretDown
            size={12}
            className={cn(
              "text-text-muted transition-transform duration-200 shrink-0",
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

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 w-full mt-3 px-4 py-3 rounded-xl bg-card border border-border-subtle active:bg-elevated transition-colors"
    >
      <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-crimson/10 shrink-0">
        <Play
          size={13}
          weight="fill"
          className="text-crimson translate-x-0.5"
        />
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-sans text-xs font-semibold text-text-secondary">
          {t(K.integrations.guide.watchWalkthrough)}
        </p>
        <p className="font-sans text-[10px] text-text-muted">
          {t(K.integrations.guide.videoMinutes)}
        </p>
      </div>
      <span className="text-[11px] text-text-muted">→</span>
    </a>
  );
}

// ── Email copy chip ─────────────────────────────────────────────────────────────
function MobileEmailChip({ email }: { email: string }) {
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
      className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg bg-elevated border border-border-subtle font-mono text-[11px] text-text-secondary active:bg-card transition-colors cursor-pointer"
    >
      <span className="flex-1 text-left truncate">{email}</span>
      <span
        className={cn(
          "flex items-center gap-1 text-[10px] font-medium font-sans shrink-0 px-2 py-0.5 rounded-full transition-all",
          copied ? "text-success bg-success/10" : "text-text-muted",
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
function URLDiagram({ type }: { type: "sheets" | "drive" }) {
  const prefix =
    type === "sheets"
      ? "docs.google.com/spreadsheets/d/"
      : "drive.google.com/drive/folders/";
  const suffix = type === "sheets" ? "/edit" : "";
  return (
    <div className="flex flex-wrap items-center font-mono text-[10px] bg-elevated border border-border-subtle rounded-lg px-3 py-2 text-text-muted overflow-x-auto">
      <span className="opacity-50">{prefix}</span>
      <span className="inline-flex px-1.5 py-0.5 rounded bg-crimson/10 text-crimson border border-crimson/20 mx-0.5 font-semibold">
        YOUR-ID
      </span>
      {suffix && <span className="opacity-50">{suffix}</span>}
    </div>
  );
}

// ── Mobile Setup Guide ──────────────────────────────────────────────────────────
function MobileSetupGuide({
  type,
  email,
  videoUrl,
}: {
  type: "sheets" | "drive";
  email: string;
  videoUrl?: string;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
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
    <div className="rounded-xl border border-border-subtle overflow-hidden mt-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-card active:bg-elevated transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-2 font-sans text-[12px] font-medium text-text-secondary">
          <span className="flex items-center justify-center w-5 h-5 rounded-md bg-elevated border border-border-subtle shrink-0">
            <span className="text-[10px] font-bold text-text-muted">3</span>
          </span>
          {t(K.integrations.guide.trigger)}
        </span>
        <CaretDown
          size={12}
          className={cn(
            "text-text-muted transition-transform duration-200 shrink-0",
            open ? "rotate-180" : "",
          )}
        />
      </button>

      {open && (
        <div className="bg-elevated border-t border-border-subtle px-4 py-4 space-y-0">
          {steps.map((step, i) => {
            const StepIcon = step.icon;
            const isLast = i === steps.length - 1;
            return (
              <div key={i} className="flex gap-3">
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
                      style={{ minHeight: "16px" }}
                    />
                  )}
                </div>
                <div className="pb-4 flex-1 min-w-0">
                  <p className="font-sans text-[12px] font-semibold text-text-primary mb-1">
                    {step.title}
                  </p>
                  <p className="font-sans text-[11px] text-text-secondary leading-relaxed mb-2">
                    {step.body}
                  </p>
                  {step.extra === "email" && (
                    <div className="space-y-1.5">
                      {hasEmail ? (
                        <MobileEmailChip email={email} />
                      ) : (
                        <p className="font-sans text-[10px] text-amber-400/80 leading-snug">
                          {t(K.integrations.guide.emailMissing)}
                        </p>
                      )}
                      <p className="font-sans text-[10px] text-amber-400/70 leading-snug">
                        {t(K.integrations.guide.step1Warning)}
                      </p>
                    </div>
                  )}
                  {step.extra === "url" && <URLDiagram type={type} />}
                </div>
              </div>
            );
          })}

          {videoUrl && <MobileVideoCTA url={videoUrl} />}
        </div>
      )}
    </div>
  );
}

// ── Status pill ─────────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: ConnectionStatus }) {
  const t = useT();

  const config: Record<
    ConnectionStatus,
    { dot: string; text: string; label: string; pulse?: boolean }
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
        "inline-flex items-center gap-1.5 font-sans text-[11px] font-medium",
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

// ── Credential Sheet ────────────────────────────────────────────────────────────
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
  const t = useT();
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
      await integrationsApi.setCredential({
        key: secretKey,
        value: value.trim(),
        description: label,
      });
      setValue("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onSaved();
      handleClose();
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? t(K.integrations.saveFailed);
      setErr(msg);
    } finally {
      setSaving(false);
    }
  };

  const connectedLabel = existingMeta
    ? t(K.integrations.mobile.pasteIdUpdate).replace(
        "{{date}}",
        new Date(existingMeta.updatedAt).toLocaleDateString(),
      )
    : t(K.integrations.mobile.pasteId);

  return (
    <Sheet open={open} onOpenChange={(v) => !v && handleClose()}>
      <SheetContent
        side="bottom"
        className="p-0 border-t border-border-subtle rounded-t-[20px] bg-base focus:outline-none"
        style={{ maxHeight: "75dvh" }}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-8 h-1 rounded-full bg-border-default" />
        </div>

        <div className="px-5 pb-6 space-y-4 overflow-y-auto">
          <SheetHeader className="text-left">
            <SheetTitle className="font-sans font-bold text-[17px] text-text-primary">
              {existingMeta
                ? t(K.integrations.credential.update)
                : t(K.integrations.credential.connect)}{" "}
              {label}
            </SheetTitle>
            <p className="font-sans text-[13px] text-text-muted">
              {connectedLabel}
            </p>
          </SheetHeader>

          {/* Input */}
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={
                existingMeta
                  ? t(K.integrations.credential.placeholderUpdate)
                  : t(K.integrations.credential.placeholder)
              }
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
              <Warning size={13} weight="fill" />
              {err}
            </p>
          )}

          {/* Primary action */}
          <button
            onClick={() => void handleSave()}
            disabled={!value.trim() || saving}
            className="w-full h-[52px] rounded-2xl bg-crimson text-white font-sans font-bold text-[15px] flex items-center justify-center gap-2 active:opacity-80 transition-opacity disabled:opacity-40 cursor-pointer"
          >
            {saving ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : saved ? (
              <>
                <CheckCircle size={18} weight="bold" />
                {t(K.integrations.credential.saved)}
              </>
            ) : (
              <>
                <Link size={18} weight="bold" />
                {existingMeta
                  ? t(K.integrations.credential.update)
                  : t(K.integrations.credential.connect)}
              </>
            )}
          </button>

          {/* Cancel */}
          <button
            onClick={handleClose}
            className="w-full h-[44px] rounded-2xl font-sans text-[15px] text-text-secondary active:opacity-70 cursor-pointer"
          >
            {t(K.integrations.cancel)}
          </button>
        </div>

        <div style={{ height: "max(8px, env(safe-area-inset-bottom))" }} />
      </SheetContent>
    </Sheet>
  );
}

// ── Integration Card ─────────────────────────────────────────────────────────────
function IntegrationCard({
  icon,
  name,
  description,
  enabled,
  status,
  onToggle,
  onConnect,
  isSaving,
  type,
  email,
  videoUrl,
}: {
  icon: React.ReactNode;
  name: string;
  description: string;
  enabled: boolean;
  status: ConnectionStatus;
  onToggle: (v: boolean) => void;
  onConnect: () => void;
  isSaving?: boolean;
  type: "sheets" | "drive";
  email: string;
  videoUrl?: string;
}) {
  const t = useT();
  const canConnect =
    enabled && status !== "disabled" && status !== "awaiting-setup";
  const isReady = status === "ready";

  return (
    <div className="rounded-2xl bg-card border border-border-subtle overflow-hidden shadow-[var(--shadow-card)]">
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-border-subtle">
        {/* Brand icon — no box wrapper */}
        <div
          className={cn(
            "shrink-0 transition-opacity",
            !enabled && "opacity-40",
          )}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-sans font-semibold text-[14px] text-text-primary">
            {name}
          </p>
          <p className="font-sans text-[11px] text-text-muted mt-0.5 truncate">
            {description}
          </p>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={onToggle}
          disabled={isSaving}
          className="data-[state=checked]:bg-crimson data-[state=unchecked]:bg-border-default shrink-0"
        />
      </div>

      {/* Status + actions */}
      <div className="px-4 py-3 space-y-3">
        {/* Status pill */}
        <StatusPill status={status} />

        {/* Connect / Update button */}
        {canConnect && (
          <button
            onClick={onConnect}
            disabled={isSaving}
            className={cn(
              "w-full h-10 rounded-xl font-sans font-semibold text-[13px] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform cursor-pointer",
              isReady
                ? "bg-success/10 border border-success/20 text-success"
                : "bg-crimson/10 border border-crimson/20 text-crimson",
            )}
          >
            <Link size={15} weight="bold" />
            {isReady
              ? t(K.integrations.mobile.updateId)
              : t(K.integrations.mobile.connectNow)}
          </button>
        )}

        {/* Awaiting setup warning */}
        {enabled && status === "awaiting-setup" && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-elevated border border-border-subtle">
            <Lock
              size={13}
              weight="duotone"
              className="text-text-muted shrink-0 mt-0.5"
            />
            <p className="font-sans text-[11px] text-text-secondary leading-snug">
              {t(K.integrations.mobile.setupRequired)}
            </p>
          </div>
        )}

        {/* Setup guide (only show when enabled) */}
        {enabled && (
          <MobileSetupGuide type={type} email={email} videoUrl={videoUrl} />
        )}
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────────
export default function MobileIntegrations(_props: MobileIntegrationsProps) {
  const t = useT();
  const router = useRouter();
  const { user } = useAuthStore();
  const role = user?.role ?? "STAFF";
  const isSuperAdmin = (role as UserRole) === UserRole.SUPERADMIN;

  const {
    googleSheets: visGoogleSheets,
    googleDriveServiceAccount: visGoogleDriveSA,
    googleDriveOAuth2: visGoogleDriveOAuth2,
    isLoading: visibilityLoading,
  } = useFeatureVisibility();

  const {
    data: entries = {},
    isLoading: configLoading,
    refetch: refetchConfig,
  } = useSystemConfig();
  const upsertMany = useUpsertManySystemConfig();

  const [credentials, setCredentials] = useState<SecretMeta[]>([]);
  const [loadingCreds, setLoadingCreds] = useState(false);
  const [activeSheet, setActiveSheet] = useState<{
    key: string;
    label: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadCredentials = async () => {
    setLoadingCreds(true);
    try {
      const res = await integrationsApi.listCredentials();
      setCredentials(parseApiData<SecretMeta[]>(res.data) ?? []);
    } catch {
      /* ignore */
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
  const driveEnabled = getVal("integration.googleDrive.enabled") === "true";
  const serviceAccountReady =
    getVal("integration.serviceAccount.configured") === "true";
  const serviceAccountEmail = getVal("integration.serviceAccount.email", "");
  const sheetsVideoUrl =
    getVal("integration.googleSheets.guideVideoUrl", "") || undefined;
  const driveVideoUrl =
    getVal("integration.googleDrive.guideVideoUrl", "") || undefined;
  const isLoading = configLoading || loadingCreds;
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

  const handleToggle = async (key: string, value: boolean) => {
    setIsSaving(true);
    try {
      await upsertMany.mutateAsync({ [key]: value ? "true" : "false" });
      void refetchConfig();
    } finally {
      setIsSaving(false);
    }
  };

  // Role guard
  if (role !== "OWNER" && role !== "ADMIN" && role !== "SUPERADMIN")
    return null;

  // Visibility guard — redirect away when all Google features are disabled for this role.
  // Wait for visibility data to arrive (isLoading) before redirecting to avoid
  // a false redirect during initial load.
  const allGoogleHidden =
    !visibilityLoading &&
    !isSuperAdmin &&
    !visGoogleSheets &&
    !visGoogleDriveSA &&
    !visGoogleDriveOAuth2;
  if (allGoogleHidden) {
    router.replace("/settings");
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-void text-text-primary font-sans">
      <div className="pt-[env(safe-area-inset-top)]" />

      {/* ── Header */}
      <header className="sticky top-0 z-30 flex items-center h-[56px] px-4 bg-base/80 backdrop-blur-xl border-b border-border-subtle">
        <button
          onClick={() => router.back()}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-text-secondary active:bg-elevated transition-colors cursor-pointer"
        >
          <CaretLeft size={22} weight="bold" />
        </button>
        <span className="flex-1 text-center font-sans font-bold text-[17px] text-text-primary tracking-tight">
          {t(K.settings.integrations)}
        </span>
        <button
          onClick={() => {
            void refetchConfig();
            void loadCredentials();
          }}
          disabled={isLoading}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-text-secondary active:bg-elevated transition-colors disabled:opacity-50 cursor-pointer"
        >
          <ArrowsClockwise
            size={18}
            className={isLoading ? "animate-spin" : ""}
          />
        </button>
      </header>

      {/* ── Main content */}
      <main className="flex-1 px-4 py-5 space-y-5 pb-[calc(32px+env(safe-area-inset-bottom))]">
        {/* Section header */}
        <div>
          <p className="font-sans font-semibold text-[16px] text-text-primary">
            {t(K.integrations.title)}
          </p>
          <p className="font-sans text-[13px] text-text-muted mt-0.5">
            {t(K.integrations.subtitle)}
          </p>
        </div>

        {/* Awaiting setup global banner */}
        {isAwaitingSetup && !isLoading && (
          <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl bg-elevated border border-border-subtle">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-card border border-border-subtle shrink-0 mt-0.5">
              <Lock size={14} weight="duotone" className="text-text-muted" />
            </div>
            <div>
              <p className="font-sans font-semibold text-[13px] text-text-primary">
                {t(K.integrations.setupBanner.title)}
              </p>
              <p className="font-sans text-[12px] text-text-secondary mt-1 leading-relaxed">
                {t(K.integrations.setupBanner.desc)}
              </p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="rounded-2xl bg-card border border-border-subtle p-4 space-y-3"
              >
                <div className="flex items-start gap-3">
                  <Skeleton className="w-6 h-6 rounded-lg" />
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
            {(isSuperAdmin || visGoogleSheets) && (
              <IntegrationCard
                icon={
                  <Icon
                    icon="simple-icons:googlesheets"
                    className="w-5 h-5 text-[#34A853]"
                  />
                }
                name={t(K.integrations.sheets.name)}
                description={t(K.integrations.sheets.description)}
                enabled={sheetsEnabled}
                status={sheetsStatus()}
                isSaving={isSaving}
                type="sheets"
                email={serviceAccountEmail}
                videoUrl={sheetsVideoUrl}
                onToggle={(v) =>
                  void handleToggle("integration.googleSheets.enabled", v)
                }
                onConnect={() =>
                  setActiveSheet({
                    key: "google.sheetId",
                    label: t(K.integrations.mobile.sheetIdLabel),
                  })
                }
              />
            )}

            {/* Google Drive (Service Account) */}
            {(isSuperAdmin || visGoogleDriveSA) && (
              <IntegrationCard
                icon={<Icon icon="logos:google-drive" className="w-5 h-5" />}
                name={t(K.integrations.drive.name)}
                description={t(K.integrations.drive.description)}
                enabled={driveEnabled}
                status={driveStatus()}
                isSaving={isSaving}
                type="drive"
                email={serviceAccountEmail}
                videoUrl={driveVideoUrl}
                onToggle={(v) =>
                  void handleToggle("integration.googleDrive.enabled", v)
                }
                onConnect={() =>
                  setActiveSheet({
                    key: "google.driveFolderId",
                    label: t(K.integrations.mobile.driveFolderIdLabel),
                  })
                }
              />
            )}

            {/* Google Drive OAuth2 */}
            {(isSuperAdmin || visGoogleDriveOAuth2) && (
              <GoogleDriveConnectionCard />
            )}
          </div>
        )}

        {/* Footer note */}
        <p className="font-sans text-[11px] text-text-muted text-center px-2 leading-relaxed">
          {t(K.integrations.securityNote)}
        </p>
      </main>

      {/* Credential bottom sheet */}
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

"use client";

import { useState, useEffect, useRef } from "react";
import { useT, K } from "@/i18n";
import {
  useSystemConfig,
  useUpsertManySystemConfig,
} from "@/queries/useSystemConfigQuery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle,
  ArrowClockwise,
  Sliders,
  Gear,
  Robot,
  Timer,
  ShieldCheck,
  Cpu,
  CurrencyDollar,
  DownloadSimple,
  ChatText,
  Plug,
} from "@phosphor-icons/react";
import { Switch } from "@/components/ui/switch";
import { apiClient } from "@/lib/api/apiClient";

// --- Types & Constants ---

type FieldDef = {
  key: string;
  label: string;
  description?: string;
  type: "text" | "textarea" | "number" | "toggle";
  defaultValue?: string;
};

/** Default values for keys that are not yet persisted in DB — must match backend fallback defaults */
export const FIELD_DEFAULTS: Record<string, string> = {
  "bot.active": "true",
  "bot.hydeEnabled": "true",
};

export const CONFIG_SECTIONS: {
  title: string;
  icon: React.ElementType;
  color: string;
  fields: FieldDef[];
}[] = [
  {
    title: "Persona",
    icon: Robot,
    color: "text-info",
    fields: [
      {
        key: "persona.name",
        label: "Bot Name",
        description: "Display name used in responses",
        type: "text",
      },
      {
        key: "persona.role",
        label: "Bot Role",
        description: "Role/title of the bot persona",
        type: "text",
      },
    ],
  },
  {
    title: "Bot Behaviour",
    icon: Gear,
    color: "text-gold",
    fields: [
      {
        key: "bot.active",
        label: "Bot Active",
        description: "Enable or disable the bot globally",
        type: "toggle",
      },
      {
        key: "bot.systemPrompt",
        label: "System Prompt",
        description: "Core instruction given to the AI",
        type: "textarea",
      },
      {
        key: "bot.welcomeMessage",
        label: "Welcome Message",
        description: "Sent to new leads on first contact",
        type: "textarea",
      },
      {
        key: "bot.handoverMessage",
        label: "Handover Message",
        description: "Sent when handing over to a human agent",
        type: "textarea",
      },
      {
        key: "bot.registrationUrl",
        label: "Registration URL",
        description: "URL linked in registration prompts",
        type: "text",
      },
      {
        key: "bot.depositFormUrl",
        label: "Deposit Form URL",
        description: "URL linked in deposit prompts",
        type: "text",
      },
      {
        key: "bot.groupId",
        label: "Group Forum ID",
        description:
          "Telegram supergroup ID for thread mirroring (e.g. -1001234567890)",
        type: "text",
      },
      {
        key: "bot.groupThreadEnabled",
        label: "Group Thread Mirroring",
        description: "Mirror lead DMs into group forum topics (default: off)",
        type: "toggle",
      },
    ],
  },
  {
    title: "Bot Messages",
    icon: ChatText,
    color: "text-primary",
    fields: [
      {
        key: "bot.helpMessage",
        label: "Help Message",
        description: "Shown when user sends /help command",
        type: "textarea",
      },
      {
        key: "bot.resetMessage",
        label: "Reset Message",
        description: "Shown when conversation is reset",
        type: "textarea",
      },
      {
        key: "bot.errorMessage",
        label: "Error Message",
        description: "Shown when an error occurs",
        type: "textarea",
      },
    ],
  },
  {
    title: "Follow-Up Delays",
    icon: Timer,
    color: "text-warning",
    fields: [
      {
        key: "bot.followUpContactedDelayHours",
        label: "Contacted Delay (h)",
        description: "Hours after CONTACTED before follow-up",
        type: "number",
      },
      {
        key: "bot.followUpDepositReportedDelayHours",
        label: "Deposit Delay (h)",
        description: "Hours after DEPOSIT_REPORTED before follow-up",
        type: "number",
      },
      {
        key: "bot.followUpMaxRetries",
        label: "Max Retries",
        description: "Maximum follow-up retry attempts",
        type: "number",
      },
    ],
  },
  {
    title: "Rate Limiting & Suspicion",
    icon: ShieldCheck,
    color: "text-danger",
    fields: [
      {
        key: "bot.rateLimitWindowSeconds",
        label: "Rate Limit Window (s)",
        description: "Window for counting messages",
        type: "number",
      },
      {
        key: "bot.rateLimitMaxMessages",
        label: "Max Messages / Window",
        description: "Max messages per window before throttle",
        type: "number",
      },
      {
        key: "bot.suspicionMaxStrikes",
        label: "Suspicion Max Strikes",
        description: "Strikes before marking lead as suspicious",
        type: "number",
      },
      {
        key: "bot.suspicionWindowSeconds",
        label: "Suspicion Window (s)",
        description: "Time window for suspicion strike counting",
        type: "number",
      },
      {
        key: "bot.handoverNotificationTtlSeconds",
        label: "Handover Notification TTL (s)",
        description: "How long handover alert persists",
        type: "number",
      },
    ],
  },
  {
    title: "AI / RAG",
    icon: Cpu,
    color: "text-crimson",
    fields: [
      {
        key: "bot.hydeEnabled",
        label: "HyDE Enabled",
        description: "Hypothetical Document Embedding for better retrieval",
        type: "toggle",
      },
      {
        key: "ai.maxTokens",
        label: "Max Tokens",
        description: "Max tokens per AI response",
        type: "number",
      },
      {
        key: "ai.contextMessages",
        label: "Context Messages",
        description: "Number of prior messages sent as context",
        type: "number",
      },
      {
        key: "ai.conversationTtlHours",
        label: "Conversation TTL (h)",
        description: "Hours before conversation context expires",
        type: "number",
      },
      {
        key: "ai.similarityThreshold",
        label: "Similarity Threshold",
        description: "Minimum cosine similarity for RAG retrieval (0-1)",
        type: "number",
      },
      {
        key: "ai.guardConfidenceThreshold",
        label: "Guard Confidence High",
        description: "Above this = definitely on-topic",
        type: "number",
      },
      {
        key: "ai.guardConfidenceLowThreshold",
        label: "Guard Confidence Low",
        description: "Below this = definitely off-topic",
        type: "number",
      },
      {
        key: "ai.rateLimitPerMinute",
        label: "AI Rate Limit / min",
        description: "Max AI calls per minute per user",
        type: "number",
      },
      {
        key: "ai.ragTopK",
        label: "RAG Top-K",
        description: "Number of KB chunks retrieved per query",
        type: "number",
      },
    ],
  },
  {
    title: "AI Models & Costs",
    icon: CurrencyDollar,
    color: "text-success",
    fields: [
      {
        key: "ai.defaultProvider",
        label: "Default AI Provider",
        description: "openai or google",
        type: "text",
      },
      {
        key: "ai.openaiChatModel",
        label: "OpenAI Chat Model",
        description: "e.g. gpt-4o-mini, gpt-4o",
        type: "text",
      },
      {
        key: "ai.googleChatModel",
        label: "Google Chat Model",
        description: "e.g. gemini-1.5-flash",
        type: "text",
      },
      {
        key: "ai.openaiEmbeddingModel",
        label: "OpenAI Embedding Model",
        description: "e.g. text-embedding-3-small",
        type: "text",
      },
      {
        key: "ai.googleEmbeddingModel",
        label: "Google Embedding Model",
        description: "e.g. text-embedding-004",
        type: "text",
      },
      {
        key: "ai.costPerInputToken",
        label: "Cost Per Input Token ($)",
        description: "USD per token, e.g. 0.000000150",
        type: "number",
      },
      {
        key: "ai.costPerOutputToken",
        label: "Cost Per Output Token ($)",
        description: "USD per token, e.g. 0.000000600",
        type: "number",
      },
    ],
  },
  {
    title: "Integrations",
    icon: Plug,
    color: "text-primary",
    fields: [
      {
        key: "integration.googleSheets.enabled",
        label: "Google Sheets Enabled",
        description:
          "Allow owners/admins to connect a Google Spreadsheet for lead sync",
        type: "toggle",
      },
      {
        key: "integration.googleDrive.enabled",
        label: "Google Drive Enabled",
        description:
          "Allow owners/admins to connect a Google Drive folder for attachment uploads",
        type: "toggle",
      },
      {
        key: "integration.googleSheets.guideVideoUrl",
        label: "Sheets Setup Video URL",
        description:
          "Optional Loom/YouTube link shown in the Sheets setup guide (e.g. https://loom.com/share/…). Leave blank to hide.",
        type: "text",
      },
      {
        key: "integration.googleDrive.guideVideoUrl",
        label: "Drive Setup Video URL",
        description:
          "Optional Loom/YouTube link shown in the Drive setup guide (e.g. https://loom.com/share/…). Leave blank to hide.",
        type: "text",
      },
    ],
  },
];

// --- System Config Panel ---

export function SystemConfigPanel() {
  const t = useT();
  const {
    data: entries = {},
    isLoading,
    refetch: refetchConfig,
  } = useSystemConfig();
  const upsertManyMutation = useUpsertManySystemConfig();
  const isSaving = upsertManyMutation.isPending;
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Sync drafts when entries load — guard against infinite loop from React Query
  // returning new object references on background refetches (staleTime=0).
  const lastEntriesRef = useRef<string>("");
  useEffect(() => {
    const serialized = JSON.stringify(entries);
    if (serialized === lastEntriesRef.current) return;
    lastEntriesRef.current = serialized;
    setDrafts((d) => {
      const merged = { ...d };
      for (const k of Object.keys(entries)) {
        if (!(k in merged)) merged[k] = entries[k];
      }
      return merged;
    });
  }, [entries]);

  const getValue = (key: string) =>
    drafts[key] ?? entries[key] ?? FIELD_DEFAULTS[key] ?? "";
  const setValue = (key: string, val: string) =>
    setDrafts((d) => ({ ...d, [key]: val }));

  const handleSaveSection = async (
    sectionTitle: string,
    fields: FieldDef[],
  ) => {
    setErrMsg(null);
    const updates: Record<string, string> = {};
    for (const f of fields) updates[f.key] = getValue(f.key);
    try {
      await upsertManyMutation.mutateAsync(updates);
      setSaved(sectionTitle);
      setTimeout(() => setSaved(null), 2500);
    } catch {
      setErrMsg(t(K.superadmin.system.saveFailed));
    }
  };

  const handleExportAuditLogs = async () => {
    setIsExporting(true);
    try {
      const response = await apiClient.get("/audit-logs/export", {
        responseType: "blob",
      });
      const url = URL.createObjectURL(new Blob([response.data as BlobPart]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "audit-logs.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setErrMsg("Failed to export audit logs.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="page-panel bg-elevated rounded-xl overflow-hidden">
      <div className="px-5 py-4 bg-card flex items-center justify-between shadow-sm">
        <div>
          <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <Sliders size={16} weight="duotone" className="text-crimson" />
            {t(K.superadmin.system.header)}
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            {t(K.superadmin.system.headerDesc)}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-text-muted hover:text-text-primary"
          onClick={() => void refetchConfig()}
        >
          <ArrowClockwise
            size={14}
            className={isLoading ? "animate-spin" : ""}
          />
        </Button>
      </div>

      {errMsg && (
        <div className="mx-5 mb-2 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-xs">
          {errMsg}
        </div>
      )}

      <div className="px-5 pb-6 space-y-6">
        {CONFIG_SECTIONS.map((section) => {
          const Icon = section.icon;
          const isSectionSaved = saved === section.title;
          return (
            <div key={section.title} className="space-y-3">
              <div className="flex items-center justify-between pt-3">
                <h3
                  className={`text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 ${section.color}`}
                >
                  <Icon size={13} weight="duotone" />
                  {section.title}
                </h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    void handleSaveSection(section.title, section.fields)
                  }
                  disabled={isSaving}
                  className={`h-7 px-3 text-xs gap-1 ${isSectionSaved ? "text-success" : "text-crimson hover:bg-crimson/10"}`}
                >
                  {isSectionSaved ? (
                    <CheckCircle size={13} />
                  ) : (
                    <Gear size={13} />
                  )}
                  {isSectionSaved
                    ? t(K.superadmin.system.saved)
                    : isSaving
                      ? t(K.superadmin.system.saving)
                      : t(K.superadmin.system.save)}
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {section.fields.map((field) => (
                  <div key={field.key} className="space-y-1">
                    <Label className="text-[11px] font-medium text-text-secondary">
                      {field.key === "persona.name"
                        ? t(K.botConfig.botName)
                        : field.key === "bot.systemPrompt"
                          ? t(K.botConfig.systemPrompt)
                          : field.label}
                    </Label>
                    {field.description && (
                      <p className="text-[10px] text-text-muted leading-snug">
                        {field.description}
                      </p>
                    )}
                    {field.type === "toggle" ? (
                      <Switch
                        checked={getValue(field.key) === "true"}
                        onCheckedChange={(checked) =>
                          setValue(field.key, checked ? "true" : "false")
                        }
                      />
                    ) : field.type === "textarea" ? (
                      <Textarea
                        value={getValue(field.key)}
                        onChange={(e) => setValue(field.key, e.target.value)}
                        className="text-xs min-h-[80px] resize-none font-mono"
                      />
                    ) : (
                      <Input
                        type={field.type === "number" ? "number" : "text"}
                        value={getValue(field.key)}
                        onChange={(e) => setValue(field.key, e.target.value)}
                        className="h-8 text-xs"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Admin Tools */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pt-3">
            <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 text-text-muted">
              <DownloadSimple size={13} weight="duotone" />
              {t(K.superadmin.system.adminTools)}
            </h3>
          </div>
          <div className="rounded-lg border border-border-subtle bg-card p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-text-primary">
                {t(K.superadmin.system.exportAuditLogs)}
              </p>
              <p className="text-[10px] text-text-muted mt-0.5">
                {t(K.superadmin.system.exportAuditLogsDesc)}
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => void handleExportAuditLogs()}
              disabled={isExporting}
              className="h-7 px-3 text-xs gap-1 text-crimson hover:bg-crimson/10 shrink-0"
            >
              <DownloadSimple size={13} />
              {isExporting
                ? t(K.superadmin.system.exporting)
                : t(K.superadmin.system.exportCsv)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

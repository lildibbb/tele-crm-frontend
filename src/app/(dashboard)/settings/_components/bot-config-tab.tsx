"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { MobileSettings } from "@/components/mobile";
import { toast } from "sonner";
import { useSystemConfig, useUpsertManySystemConfig } from "@/queries/useSystemConfigQuery";
import { useFeatureVisibility } from "@/queries/useMaintenanceQuery";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/types/enums";
import { useT, K } from "@/i18n";

export function BotConfigTab() {
  const { data: entries = {}, isLoading } = useSystemConfig();
  const upsertManyMutation = useUpsertManySystemConfig();
  const isSaving = upsertManyMutation.isPending;
  const isMobile = useIsMobile();
  const t = useT();

  // Auth + visibility — must live before the isMobile early return
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === UserRole.SUPERADMIN;
  const visibility = useFeatureVisibility();
  const showFollowUps = isSuperAdmin || visibility.followUps;

  // Local draft state (initialised from store once loaded)
  const [draft, setDraft] = useState({
    name: "",
    systemPrompt: "",
    greeting: "",
    groupId: "",
    groupThreadEnabled: false,
    forwardEnabled: true,
    active: true,
    followUpEnabled: true,
    registrationUrl: "",
  });
  const [initialised, setInitialised] = useState(false);

  // Sync store → draft once (runs when query settles, even if entries is empty)
  useEffect(() => {
    if (initialised || isLoading) return;
    setDraft({
      name: entries["persona.name"] ?? "TitanBot",
      systemPrompt: entries["bot.systemPrompt"] ?? "",
      greeting: entries["bot.welcomeMessage"] ?? "",
      groupId: entries["bot.groupId"] ?? "",
      groupThreadEnabled: entries["bot.groupThreadEnabled"] === "true",
      forwardEnabled: entries["bot.forwardEnabled"] !== "false",
      active: entries["bot.active"] !== "false",
      followUpEnabled: entries["followUp.enabled"] !== "false",
      registrationUrl: entries["bot.registrationUrl"] ?? "",
    });
    setInitialised(true);
  }, [entries, isLoading, initialised]);

  const handleSave = async () => {
    try {
      const updates: Record<string, string> = {
        "persona.name": draft.name,
        "bot.systemPrompt": draft.systemPrompt,
        "bot.welcomeMessage": draft.greeting,
        "bot.groupThreadEnabled": String(draft.groupThreadEnabled),
        "bot.forwardEnabled": String(draft.forwardEnabled),
        "bot.active": String(draft.active),
      };
      // Only persist groupId if non-empty (it is optional)
      if (draft.groupId.trim()) updates["bot.groupId"] = draft.groupId.trim();
      // Always persist registrationUrl — empty string clears the key (lets admin remove the URL)
      updates["bot.registrationUrl"] = draft.registrationUrl.trim();
      // Only persist follow-up toggle when the feature is visible for this user
      if (showFollowUps) updates["followUp.enabled"] = String(draft.followUpEnabled);

      await upsertManyMutation.mutateAsync(updates);
      toast.success("Bot configuration saved.");
    } catch {
      toast.error("Failed to save configuration. Please try again.");
    }
  };

  if (isMobile) {
    return <MobileSettings />;
  }

  return (
    <div data-testid="bot-config-tab" className="space-y-5 animate-in-up">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">
            {t(K.botConfig.title)}
          </h2>
          <p className="text-text-secondary text-sm font-sans mt-1">
            {t(K.botConfig.subtitle)}
          </p>
        </div>
        <Button data-testid="bot-config-save-btn" onClick={() => void handleSave()} disabled={isSaving || isLoading} className="gap-2">
          <Save className="h-4 w-4" />
          {isSaving ? t(K.botConfig.saving) : t(K.botConfig.saveChanges)}
        </Button>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {/* General Settings */}
        <div className="bg-elevated rounded-xl overflow-hidden md:col-span-2 lg:col-span-1">
          <div className="px-5 py-4 bg-card rounded-t-xl shadow-sm">
            <h3 className="font-sans font-semibold text-sm text-text-primary">
              {t(K.botConfig.generalSettings)}
            </h3>
          </div>
          <div className="px-5 pb-5 pt-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="bot-name">{t(K.botConfig.botName)}</Label>
              <Input
                data-testid="bot-config-bot-name-input"
                id="bot-name"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder={t(K.botConfig.botNamePlaceholder)}
                className="text-sm"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bot-greeting">{t(K.botConfig.greeting)}</Label>
              <Textarea
                data-testid="bot-config-greeting-input"
                id="bot-greeting"
                value={draft.greeting}
                onChange={(e) => setDraft({ ...draft, greeting: e.target.value })}
                placeholder={t(K.botConfig.greetingPlaceholder)}
                rows={3}
                className="resize-none"
                disabled={isLoading}
              />
              <p className="text-xs text-text-muted mt-1 font-sans">
                {t(K.botConfig.greetingHint)}
              </p>
            </div>

            {/* Telegram Group Forum */}
            <div className="space-y-1.5 border-t border-border-subtle pt-4">
              <Label htmlFor="group-id">{t(K.botConfig.groupId)}</Label>
              <Input
                id="group-id"
                value={draft.groupId}
                onChange={(e) => setDraft({ ...draft, groupId: e.target.value })}
                placeholder={t(K.botConfig.groupIdPlaceholder)}
                className="text-sm font-mono"
                disabled={isLoading}
              />
              <p className="text-xs text-text-muted mt-1 font-sans">
                {t(K.botConfig.groupIdHint)}
              </p>
            </div>

            {/* Broker Registration URL */}
            <div className="space-y-1.5">
              <Label htmlFor="registration-url">{t(K.botConfig.registrationUrl)}</Label>
              <Input
                data-testid="bot-config-registration-url-input"
                id="registration-url"
                value={draft.registrationUrl}
                onChange={(e) => setDraft({ ...draft, registrationUrl: e.target.value })}
                placeholder={t(K.botConfig.registrationUrlPlaceholder)}
                className="text-sm font-mono"
                disabled={isLoading}
              />
              <p className="text-xs text-text-muted mt-1 font-sans">
                {t(K.botConfig.registrationUrlHint)}
              </p>
            </div>

            {/* Group Thread Enable toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
              <div>
                <p className="font-sans text-sm font-medium text-text-primary">{t(K.botConfig.groupThread)}</p>
                <p className="font-sans text-xs text-text-muted mt-0.5">
                  {t(K.botConfig.groupThreadHint)}
                </p>
              </div>
              <Switch
                checked={draft.groupThreadEnabled}
                onCheckedChange={(c) => setDraft({ ...draft, groupThreadEnabled: c })}
                disabled={isLoading || !draft.groupId.trim()}
              />
            </div>
          </div>
        </div>

        {/* AI Behavior */}
        <div className="bg-elevated rounded-xl overflow-hidden md:col-span-2 lg:col-span-1">
          <div className="px-5 py-4 bg-card rounded-t-xl flex items-center justify-between shadow-sm">
            <h3 className="font-sans font-semibold text-sm text-text-primary">
              {t(K.botConfig.aiBehavior)}
            </h3>
            <Switch
              data-testid="bot-config-active-toggle"
              checked={draft.active}
              onCheckedChange={(c) => setDraft({ ...draft, active: c })}
              disabled={isLoading}
            />
          </div>
          <div className="px-5 pb-5 pt-4 space-y-4">
            <div className="space-y-1.5">
              <Label>{t(K.botConfig.systemPrompt)}</Label>
              <Textarea
                data-testid="bot-config-system-prompt-input"
                value={draft.systemPrompt}
                onChange={(e) => setDraft({ ...draft, systemPrompt: e.target.value })}
                placeholder={t(K.botConfig.systemPromptPlaceholder)}
                rows={5}
                className="resize-none font-mono text-xs"
                disabled={isLoading}
              />
              <p className="text-xs text-text-muted mt-1 font-sans">
                {t(K.botConfig.systemPromptHint)}
              </p>
            </div>

            {/* Follow-up toggle — hidden when superadmin has disabled feature visibility */}
            {showFollowUps && (
              <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
                <div>
                  <p className="font-sans text-sm font-medium text-text-primary">{t(K.botConfig.autoFollowUps)}</p>
                  <p className="font-sans text-xs text-text-muted mt-0.5">
                    {t(K.botConfig.autoFollowUpsHint)}
                  </p>
                </div>
                <Switch
                  checked={draft.followUpEnabled}
                  onCheckedChange={(c) => setDraft({ ...draft, followUpEnabled: c })}
                  disabled={isLoading}
                />
              </div>
            )}

            {/* Forward to admin toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
              <div>
                <p className="font-sans text-sm font-medium text-text-primary">{t(K.botConfig.forwardMessages)}</p>
                <p className="font-sans text-xs text-text-muted mt-0.5">
                  {t(K.botConfig.forwardMessagesHint)}
                </p>
              </div>
              <Switch
                checked={draft.forwardEnabled}
                onCheckedChange={(c) => setDraft({ ...draft, forwardEnabled: c })}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

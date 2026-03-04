"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CaretLeft,
  Robot,
  Brain,
  ChatCircleDots,
  Hash,
  ArrowsClockwise,
  FlowArrow,
  FloppyDisk,
  ToggleLeft,
} from "@phosphor-icons/react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useSystemConfig, useUpsertManySystemConfig } from "@/queries/useSystemConfigQuery";

// ── Section Card ──────────────────────────────────────────────────────────────
function SectionHeader({ label }: { label: string }) {
  return (
    <p className="font-sans text-[11px] font-semibold text-text-muted uppercase tracking-wider px-1 mb-2">
      {label}
    </p>
  );
}

function FieldCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-card border border-border-subtle overflow-hidden mb-3">
      {children}
    </div>
  );
}

function FieldRow({
  icon,
  label,
  hint,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-4 py-3 space-y-2">
      <div className="flex items-center gap-2">
        <span className="w-7 h-7 rounded-lg bg-elevated flex items-center justify-center shrink-0">
          {icon}
        </span>
        <p className="font-sans text-[14px] font-medium text-text-primary">{label}</p>
      </div>
      {children}
      {hint && (
        <p className="font-sans text-[11px] text-text-muted leading-relaxed">{hint}</p>
      )}
    </div>
  );
}

function ToggleRow({
  icon,
  label,
  hint,
  checked,
  onCheckedChange,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  hint?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <div className="flex items-center gap-3 flex-1 min-w-0 mr-3">
        <span className="w-7 h-7 rounded-lg bg-elevated flex items-center justify-center shrink-0">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="font-sans text-[14px] font-medium text-text-primary">{label}</p>
          {hint && (
            <p className="font-sans text-[11px] text-text-muted mt-0.5 leading-snug">{hint}</p>
          )}
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function MobileBotConfig() {
  const router = useRouter();
  const { data: entries = {}, isLoading } = useSystemConfig();
  const upsertMany = useUpsertManySystemConfig();
  const isSaving = upsertMany.isPending;

  const [draft, setDraft] = useState({
    name: "",
    systemPrompt: "",
    greeting: "",
    groupId: "",
    groupThreadEnabled: false,
    forwardEnabled: true,
    active: true,
    followUpEnabled: true,
  });
  const [initialised, setInitialised] = useState(false);

  useEffect(() => {
    if (initialised || isLoading) return;
    if (Object.keys(entries).length === 0) return;
    setDraft({
      name: entries["persona.name"] ?? "TitanBot",
      systemPrompt: entries["bot.systemPrompt"] ?? "",
      greeting: entries["bot.welcomeMessage"] ?? "",
      groupId: entries["bot.groupId"] ?? "",
      groupThreadEnabled: entries["bot.groupThreadEnabled"] === "true",
      forwardEnabled: entries["bot.forwardEnabled"] !== "false",
      active: entries["bot.active"] !== "false",
      followUpEnabled: entries["followUp.enabled"] !== "false",
    });
    setInitialised(true);
  }, [entries, isLoading, initialised]);

  const handleSave = async () => {
    try {
      await upsertMany.mutateAsync({
        "persona.name": draft.name,
        "bot.systemPrompt": draft.systemPrompt,
        "bot.welcomeMessage": draft.greeting,
        "bot.groupId": draft.groupId,
        "bot.groupThreadEnabled": String(draft.groupThreadEnabled),
        "bot.forwardEnabled": String(draft.forwardEnabled),
        "bot.active": String(draft.active),
        "followUp.enabled": String(draft.followUpEnabled),
      });
      toast.success("Bot configuration saved");
    } catch {
      toast.error("Failed to save configuration");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-[env(safe-area-inset-bottom)]">
      {/* ── Header ── */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border-subtle">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-elevated active:bg-card transition-colors"
          >
            <CaretLeft size={18} className="text-text-primary" weight="bold" />
          </button>
          <h1 className="font-sans font-bold text-[17px] text-text-primary">Bot Configuration</h1>
          <button
            onClick={() => void handleSave()}
            disabled={isSaving || isLoading}
            className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-crimson text-white font-sans text-[13px] font-semibold disabled:opacity-50 active:scale-95 transition-transform"
          >
            {isSaving ? (
              <ArrowsClockwise size={14} className="animate-spin" />
            ) : (
              <FloppyDisk size={14} weight="bold" />
            )}
            Save
          </button>
        </div>
      </div>

      <div className="px-4 pt-5 space-y-6 pb-8">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : (
          <>
            {/* General Settings */}
            <div>
              <SectionHeader label="General Settings" />
              <FieldCard>
                <FieldRow icon={<Robot size={15} className="text-text-secondary" />} label="Bot Name">
                  <Input
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    placeholder="TitanBot"
                    className="h-10 text-[14px]"
                  />
                </FieldRow>
                <div className="h-px bg-border-subtle mx-4" />
                <FieldRow
                  icon={<ChatCircleDots size={15} className="text-text-secondary" />}
                  label="Welcome Message"
                  hint="Sent to new leads when they first contact the bot"
                >
                  <Textarea
                    value={draft.greeting}
                    onChange={(e) => setDraft({ ...draft, greeting: e.target.value })}
                    placeholder="Hi! Welcome to our service..."
                    rows={3}
                    className="resize-none text-[14px]"
                  />
                </FieldRow>
                <div className="h-px bg-border-subtle mx-4" />
                <FieldRow
                  icon={<Hash size={15} className="text-text-secondary" />}
                  label="Telegram Group ID"
                  hint="Optional: Telegram group for forwarded messages"
                >
                  <Input
                    value={draft.groupId}
                    onChange={(e) => setDraft({ ...draft, groupId: e.target.value })}
                    placeholder="-100123456789"
                    className="h-10 text-[14px] font-mono"
                  />
                </FieldRow>
              </FieldCard>

              <FieldCard>
                <ToggleRow
                  icon={<ToggleLeft size={15} className="text-text-secondary" />}
                  label="Group Thread Mode"
                  hint="Organise messages into separate threads per lead"
                  checked={draft.groupThreadEnabled}
                  onCheckedChange={(c) => setDraft({ ...draft, groupThreadEnabled: c })}
                  disabled={!draft.groupId.trim()}
                />
              </FieldCard>
            </div>

            {/* AI Behaviour */}
            <div>
              <SectionHeader label="AI Behaviour" />
              <FieldCard>
                <ToggleRow
                  icon={<Robot size={15} className="text-text-secondary" />}
                  label="AI Enabled"
                  hint="Allow the bot to respond automatically using AI"
                  checked={draft.active}
                  onCheckedChange={(c) => setDraft({ ...draft, active: c })}
                />
                <div className="h-px bg-border-subtle mx-4" />
                <FieldRow
                  icon={<Brain size={15} className="text-text-secondary" />}
                  label="System Prompt"
                  hint="Instructions that define the AI's personality and behaviour"
                >
                  <Textarea
                    value={draft.systemPrompt}
                    onChange={(e) => setDraft({ ...draft, systemPrompt: e.target.value })}
                    placeholder="You are a helpful assistant for..."
                    rows={5}
                    className="resize-none text-[13px] font-mono"
                  />
                </FieldRow>
              </FieldCard>

              <FieldCard>
                <ToggleRow
                  icon={<ArrowsClockwise size={15} className="text-text-secondary" />}
                  label="Auto Follow-ups"
                  hint="Automatically follow up with leads who haven't responded"
                  checked={draft.followUpEnabled}
                  onCheckedChange={(c) => setDraft({ ...draft, followUpEnabled: c })}
                />
                <div className="h-px bg-border-subtle mx-4" />
                <ToggleRow
                  icon={<FlowArrow size={15} className="text-text-secondary" />}
                  label="Forward to Admin"
                  hint="Send a copy of lead messages to the admin group"
                  checked={draft.forwardEnabled}
                  onCheckedChange={(c) => setDraft({ ...draft, forwardEnabled: c })}
                />
              </FieldCard>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { MobileSettings } from "@/components/mobile";

export function BotConfigTab() {
  const [config, setConfig] = useState({
    name: "TitanBot",
    systemPrompt: "You are a helpful assistant for Titan Journal...",
    greeting: "Welcome to Titan Journal CRM! How can I help you today?",
    active: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const isMobile = useIsMobile();

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 800));
    setIsSaving(false);
  };

  if (isMobile) {
    return <MobileSettings />;
  }

  return (
    <div className="space-y-5 animate-in-up">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">
            Bot Configuration
          </h2>
          <p className="text-text-secondary text-sm font-sans mt-1">
            Manage your AI assistant&apos;s behavior and tone
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {/* General Settings */}
        <div className="bg-elevated rounded-xl overflow-hidden md:col-span-2 lg:col-span-1">
          <div className="px-5 py-4 bg-card rounded-t-xl">
            <h3 className="font-sans font-semibold text-[14px] text-text-primary">
              General Settings
            </h3>
          </div>
          <div className="px-5 pb-5 pt-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="bot-name">Bot Name</Label>
              <Input
                id="bot-name"
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                placeholder="e.g. Sales Assistant"
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bot-greeting">Greeting Message</Label>
              <Textarea
                id="bot-greeting"
                value={config.greeting}
                onChange={(e) =>
                  setConfig({ ...config, greeting: e.target.value })
                }
                placeholder="e.g. Hi there! How can I assist you today?"
                rows={3}
                className="resize-none"
              />
              <p className="text-[11px] text-text-muted mt-1 font-sans">
                This is the first message the bot sends to new WhatsApp leads.
              </p>
            </div>
          </div>
        </div>

        {/* AI Behavior */}
        <div className="bg-elevated rounded-xl overflow-hidden md:col-span-2 lg:col-span-1">
          <div className="px-5 py-4 bg-card rounded-t-xl flex items-center justify-between">
            <h3 className="font-sans font-semibold text-[14px] text-text-primary">
              AI Behavior
            </h3>
            <Switch
              checked={config.active}
              onCheckedChange={(c) => setConfig({ ...config, active: c })}
            />
          </div>
          <div className="px-5 pb-5 pt-4 space-y-4">
            <div className="space-y-1.5">
              <Label>System Prompt</Label>
              <Textarea
                value={config.systemPrompt}
                onChange={(e) =>
                  setConfig({ ...config, systemPrompt: e.target.value })
                }
                placeholder="Instructions for the AI..."
                rows={5}
                className="resize-none font-mono text-xs"
              />
              <p className="text-[11px] text-text-muted mt-1 font-sans">
                Define the bot&apos;s personality, expertise, and boundaries.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

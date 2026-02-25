import { Metadata } from "next";
import { SettingsTabs } from "./_components/settings-tabs";
import { SettingsMobileGate } from "./_components/settings-mobile-gate";

export const metadata: Metadata = {
  title: "Settings | Titan Journal CRM",
  description: "Configure your CRM, bot behavior, and team",
};

export default function SettingsPage() {
  return (
    <SettingsMobileGate>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-in-up">
          <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
          <p className="text-text-secondary text-sm font-sans mt-1">
            Configure your CRM, bot behavior, and team
          </p>
        </div>

        <SettingsTabs />
      </div>
    </SettingsMobileGate>
  );
}

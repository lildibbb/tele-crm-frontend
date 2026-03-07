"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Bot, BookOpen, Terminal, Users, Brain, Link2 } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from "@/components/ui/motion-tabs";
import { BotConfigTab } from "./bot-config-tab";
import { KnowledgeBaseTab } from "./knowledge-base-tab";
import { CommandsTab } from "./commands-tab";
import { TeamTab } from "./team-tab";
import { AiFeedbackTab } from "./ai-feedback-tab";
import { IntegrationsTab } from "./integrations-tab";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/types/enums";
import { useFeatureVisibility } from "@/queries/useMaintenanceQuery";

const ALL_SETTINGS_TABS = [
  {
    name: "Bot Config",
    value: "bot-config",
    icon: Bot,
    content: <BotConfigTab />,
    roles: [UserRole.OWNER, UserRole.ADMIN, UserRole.STAFF, UserRole.SUPERADMIN],
  },
  {
    name: "Knowledge Base",
    value: "knowledge-base",
    icon: BookOpen,
    content: <KnowledgeBaseTab />,
    roles: [UserRole.OWNER, UserRole.ADMIN, UserRole.SUPERADMIN],
  },
  {
    name: "Commands",
    value: "commands",
    icon: Terminal,
    content: <CommandsTab />,
    roles: [UserRole.OWNER, UserRole.ADMIN, UserRole.SUPERADMIN],
  },
  {
    name: "Team",
    value: "team",
    icon: Users,
    content: <TeamTab />,
    roles: [UserRole.OWNER, UserRole.ADMIN, UserRole.SUPERADMIN],
  },
  {
    name: "Integrations",
    value: "integrations",
    icon: Link2,
    content: <IntegrationsTab />,
    roles: [UserRole.OWNER, UserRole.ADMIN, UserRole.SUPERADMIN],
  },
  {
    name: "AI Feedback",
    value: "ai-feedback",
    icon: Brain,
    content: <AiFeedbackTab />,
    roles: [UserRole.SUPERADMIN],
  },
];

export function SettingsTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const role = user?.role as UserRole | undefined;

  const {
    googleSheets,
    googleDriveServiceAccount,
    googleDriveOAuth2,
  } = useFeatureVisibility();
  const isSuperAdmin = role === UserRole.SUPERADMIN;

  /**
   * Hide the Integrations tab when the superadmin has toggled all three Google
   * features off. During initial load DEFAULT_VISIBILITY is all-false, so the
   * tab is hidden until the real data confirms at least one feature is on —
   * this eliminates FOUC for the "feature-off" case.
   * Superadmins always see the tab regardless of flags.
   */
  const allGoogleHidden =
    !isSuperAdmin && !googleSheets && !googleDriveServiceAccount && !googleDriveOAuth2;

  const SETTINGS_TABS = useMemo(() => {
    const byRole = ALL_SETTINGS_TABS.filter((t) => role && t.roles.includes(role));
    if (allGoogleHidden) return byRole.filter((t) => t.value !== "integrations");
    return byRole;
  }, [role, allGoogleHidden]);

  const tabQuery = searchParams.get("tab");
  const defaultTab = SETTINGS_TABS.some((t) => t.value === tabQuery)
    ? tabQuery
    : "bot-config";

  const [activeTab, setActiveTab] = useState(defaultTab as string);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const params = new URLSearchParams(searchParams);
    if (value === "bot-config") {
      params.delete("tab");
    } else {
      params.set("tab", value);
    }
    const newUrl = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;
    router.push(newUrl, { scroll: false });
  };

  useEffect(() => {
    const currentTab = searchParams.get("tab") || "bot-config";
    if (
      currentTab !== activeTab &&
      SETTINGS_TABS.some((t) => t.value === currentTab)
    ) {
      setActiveTab(currentTab);
    }
  }, [searchParams, activeTab, SETTINGS_TABS]);

  return (
    <div className="flex w-full flex-col">
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="gap-6 animate-in-up"
      >
        {/* Pill segment tab bar */}
        <TabsList
          className="bg-elevated rounded-xl p-1 w-full sm:w-auto overflow-x-auto scrollbar-none flex-nowrap"
          activeClassName="bg-card rounded-lg shadow-sm"
        >
          {SETTINGS_TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-text-secondary data-[state=active]:text-crimson whitespace-nowrap rounded-lg transition-colors"
            >
              <tab.icon size={15} strokeWidth={1.8} />
              {tab.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex flex-col pb-2 relative overflow-hidden">
          <TabsContents className="min-h-[500px]">
            {SETTINGS_TABS.map((tab) => (
              <TabsContent
                key={tab.value}
                value={tab.value}
                className="w-full focus-visible:outline-none"
              >
                {tab.content}
              </TabsContent>
            ))}
          </TabsContents>
        </div>
      </Tabs>
    </div>
  );
}


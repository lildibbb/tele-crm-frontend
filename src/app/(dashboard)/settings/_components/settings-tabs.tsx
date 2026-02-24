"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
import { SessionsTab } from "./sessions-tab";

const SETTINGS_TABS = [
  {
    name: "Bot Config",
    value: "bot-config",
    content: <BotConfigTab />,
  },
  {
    name: "Knowledge Base",
    value: "knowledge-base",
    content: <KnowledgeBaseTab />,
  },
  {
    name: "Command Menu",
    value: "commands",
    content: <CommandsTab />,
  },
  {
    name: "Team",
    value: "team",
    content: <TeamTab />,
  },
  {
    name: "Sessions",
    value: "sessions",
    content: <SessionsTab />,
  },
];

export function SettingsTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Read tab from URL or default to bot-config
  const tabQuery = searchParams.get("tab");
  const defaultTab = SETTINGS_TABS.some((t) => t.value === tabQuery)
    ? tabQuery
    : "bot-config";

  const [activeTab, setActiveTab] = useState(defaultTab as string);

  // Sync URL with active tab state
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

  // Keep state in sync if URL changes externally
  useEffect(() => {
    const currentTab = searchParams.get("tab") || "bot-config";
    if (
      currentTab !== activeTab &&
      SETTINGS_TABS.some((t) => t.value === currentTab)
    ) {
      setActiveTab(currentTab);
    }
  }, [searchParams, activeTab]);

  return (
    <div className="flex w-full flex-col">
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="gap-6 animate-in-up"
      >
        <TabsList className="flex items-center bg-transparent overflow-x-auto pb-2">
          {SETTINGS_TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="px-4 py-3 text-sm font-sans font-medium text-text-secondary hover:text-text-primary data-[active=true]:text-text-primary data-[active=true]:bg-slate-500/10 whitespace-nowrap"
            >
              {tab.name}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="flex flex-col mt-4 pb-2 relative overflow-hidden">
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

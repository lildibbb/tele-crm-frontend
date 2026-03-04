"use client";

import { redirect } from "next/navigation";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { MobileBotConfig } from "@/components/mobile";

export default function BotConfigPage() {
  const isMobile = useIsMobile();
  if (isMobile) return <MobileBotConfig />;
  redirect("/settings?tab=bot-config");
}

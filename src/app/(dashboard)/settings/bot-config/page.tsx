"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useIsMobileHydrated } from "@/lib/hooks/useIsMobile";
import { MobileBotConfig } from "@/components/mobile";

export default function BotConfigPage() {
  const isMobile = useIsMobileHydrated();
  const router = useRouter();

  useEffect(() => {
    if (isMobile === false) {
      router.replace("/settings?tab=bot-config");
    }
  }, [isMobile, router]);

  if (isMobile === undefined) return null;
  if (isMobile) return <MobileBotConfig />;
  return null;
}

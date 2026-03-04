"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useIsMobileHydrated } from "@/lib/hooks/useIsMobile";
import { MobileSettingsTeam } from "@/components/mobile";

export default function TeamPage() {
  const isMobile = useIsMobileHydrated();
  const router = useRouter();

  useEffect(() => {
    if (isMobile === false) {
      router.replace("/settings?tab=team");
    }
  }, [isMobile, router]);

  if (isMobile === undefined) return null;
  if (isMobile) return <MobileSettingsTeam />;
  return null;
}

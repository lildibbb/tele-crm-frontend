"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { MobileSettingsTeam } from "@/components/mobile";

export default function TeamPage() {
  const isMobile = useIsMobile();
  const router = useRouter();

  useEffect(() => {
    if (!isMobile) {
      router.replace("/settings?tab=team");
    }
  }, [isMobile, router]);

  if (isMobile) return <MobileSettingsTeam />;

  return null;
}

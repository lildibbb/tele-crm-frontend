"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useIsMobileHydrated } from "@/lib/hooks/useIsMobile";
import { MobileCommands } from "@/components/mobile";

export default function CommandsPage() {
  const isMobile = useIsMobileHydrated();
  const router = useRouter();

  useEffect(() => {
    if (isMobile === false) {
      router.replace("/settings?tab=commands");
    }
  }, [isMobile, router]);

  if (isMobile === undefined) return null;
  if (isMobile) return <MobileCommands />;
  return null;
}

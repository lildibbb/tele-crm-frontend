"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useIsMobileHydrated } from "@/lib/hooks/useIsMobile";
import { MobileIntegrations } from "@/components/mobile";

export default function IntegrationsPage() {
  const isMobile = useIsMobileHydrated();
  const router = useRouter();

  useEffect(() => {
    if (isMobile === false) {
      router.replace("/settings?tab=integrations");
    }
  }, [isMobile, router]);

  if (isMobile === undefined) return null;
  if (isMobile) return <MobileIntegrations />;
  return null;
}

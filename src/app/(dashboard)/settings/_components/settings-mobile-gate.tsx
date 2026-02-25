"use client";

import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { MobileSettings } from "@/components/mobile";

export function SettingsMobileGate({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  if (isMobile) return <MobileSettings />;
  return <>{children}</>;
}

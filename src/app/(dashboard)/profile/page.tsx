"use client";

import { MobileProfile } from "@/components/mobile";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

export default function ProfilePage() {
  const isMobile = useIsMobile();

  // Desktop: profile is accessible via avatar/settings
  if (!isMobile) return null;

  return <MobileProfile />;
}

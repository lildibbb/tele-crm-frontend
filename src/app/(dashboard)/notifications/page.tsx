"use client";

import { MobileNotifications } from "@/components/mobile";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

export default function NotificationsPage() {
  const isMobile = useIsMobile();

  // Desktop: notifications are shown inline in the header bell icon
  if (!isMobile) return null;

  return <MobileNotifications />;
}

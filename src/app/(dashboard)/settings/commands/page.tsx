"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { MobileCommands } from "@/components/mobile";

export default function CommandsPage() {
  const isMobile = useIsMobile();
  const router = useRouter();

  useEffect(() => {
    if (!isMobile) {
      router.replace("/settings?tab=commands");
    }
  }, [isMobile, router]);

  if (isMobile) return <MobileCommands />;
  return null;
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useIsMobileHydrated } from "@/lib/hooks/useIsMobile";
import { MobileKnowledgeBase } from "@/components/mobile";

export default function KnowledgeBaseRedirect() {
  const isMobile = useIsMobileHydrated();
  const router = useRouter();

  useEffect(() => {
    if (isMobile === false) {
      router.replace("/settings?tab=knowledge-base");
    }
  }, [isMobile, router]);

  if (isMobile === undefined) return null;
  if (isMobile) return <MobileKnowledgeBase />;
  return null;
}

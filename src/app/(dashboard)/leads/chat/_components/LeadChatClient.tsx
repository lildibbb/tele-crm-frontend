"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useIsMobileHydrated } from "@/lib/hooks/useIsMobile";
import MobileLeadChat from "@/components/mobile/MobileLeadChat";

export default function LeadChatClient() {
  const isMobile = useIsMobileHydrated();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";

  useEffect(() => {
    if (isMobile === false) {
      router.replace(`/leads/detail?id=${id}`);
    }
  }, [isMobile, router, id]);

  if (isMobile === undefined) return null;
  if (isMobile) return <MobileLeadChat />;
  return null;
}

"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useIsMobileHydrated } from "@/lib/hooks/useIsMobile";
import MobileLeadChat from "@/components/mobile/MobileLeadChat";

export default function LeadChatPage() {
  const isMobile = useIsMobileHydrated();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    if (isMobile === false) {
      router.replace(`/leads/${id}`);
    }
  }, [isMobile, router, id]);

  if (isMobile === undefined) return null;
  if (isMobile) return <MobileLeadChat />;
  return null;
}

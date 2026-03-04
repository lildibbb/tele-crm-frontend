"use client";

import { redirect } from "next/navigation";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { MobileKnowledgeBase } from "@/components/mobile";

export default function KnowledgeBaseRedirect() {
  const isMobile = useIsMobile();
  if (isMobile) return <MobileKnowledgeBase />;
  redirect("/settings?tab=knowledge-base");
}

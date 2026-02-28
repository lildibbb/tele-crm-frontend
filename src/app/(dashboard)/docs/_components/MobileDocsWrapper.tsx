"use client";

import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { DocsClient } from "./DocsClient";
import MobileDocsPage from "@/components/mobile/MobileDocsPage";

export default function MobileDocsWrapper() {
  const isMobile = useIsMobile();
  if (isMobile) return <MobileDocsPage />;
  return <DocsClient />;
}

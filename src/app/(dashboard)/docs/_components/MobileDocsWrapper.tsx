"use client";

import dynamic from "next/dynamic";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import DocsLoading from "@/app/(dashboard)/docs/loading";

const DocsClient = dynamic(() => import("./DocsClient").then((m) => ({ default: m.DocsClient })), {
  loading: () => <DocsLoading />,
  ssr: false,
});

const MobileDocsPage = dynamic(() => import("@/components/mobile/MobileDocsPage"), {
  loading: () => <DocsLoading />,
  ssr: false,
});

export default function MobileDocsWrapper() {
  const isMobile = useIsMobile();
  if (isMobile) return <MobileDocsPage />;
  return <DocsClient />;
}


"use client";
import { OverviewPanel } from "@/components/superadmin/overview-panel";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import MobileAdminOverview from "@/components/mobile/MobileAdminOverview";

export default function AdminOverviewPage() {
  const isMobile = useIsMobile();
  if (isMobile) return <MobileAdminOverview />;
  return (
    <div data-testid="admin-overview-page">
      <OverviewPanel />
    </div>
  );
}

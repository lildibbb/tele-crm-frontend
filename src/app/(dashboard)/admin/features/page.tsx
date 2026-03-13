"use client";
import { FeatureVisibilityPanel } from "@/components/superadmin/feature-visibility-panel";
import { useT, K } from "@/i18n";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import MobileAdminFeatures from "@/components/mobile/MobileAdminFeatures";

export default function AdminFeaturesPage() {
  const t = useT();
  const isMobile = useIsMobile();

  if (isMobile) return <MobileAdminFeatures />;

  return (
    <div className="space-y-6" data-testid="admin-features-page">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          {t(K.superadmin.featureVisibility.title)}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {t(K.superadmin.featureVisibility.subtitle)}
        </p>
      </div>
      <FeatureVisibilityPanel />
    </div>
  );
}

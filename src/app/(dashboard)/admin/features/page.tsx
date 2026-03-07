"use client";
import { FeatureVisibilityPanel } from "@/components/superadmin/feature-visibility-panel";
import { useT, K } from "@/i18n";

export default function AdminFeaturesPage() {
  const t = useT();
  return (
    <div className="space-y-6">
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

'use client';

import { Info } from '@phosphor-icons/react';

interface Props {
  feature: string;
  message?: string;
}

/**
 * Yellow callout shown at the top of a feature page/tab when that feature
 * is disabled via a feature flag in SystemConfig.
 */
export function FeatureDisabledBanner({ feature, message }: Props) {
  const defaultMsg = `${feature} is temporarily disabled by an administrator.`;
  return (
    <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-950/20 px-4 py-3 text-sm text-amber-200 dark:bg-amber-900/15">
      <Info weight="fill" className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
      <span>{message ?? defaultMsg}</span>
    </div>
  );
}

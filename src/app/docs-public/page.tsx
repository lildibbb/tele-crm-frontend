import { DocsClient } from "@/app/(dashboard)/docs/_components/DocsClient";

/**
 * Public docs page served on the docs.* subdomain.
 * DocsClient handles its own mobile-overlay nav and is fully standalone.
 * role = undefined (no auth) — all chapters shown, role-restricted sections
 * gracefully degrade (no "Viewing as:" badge, no restricted banners).
 */
export default function DocsPublicPage() {
  return <DocsClient />;
}

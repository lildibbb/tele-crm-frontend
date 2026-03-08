import MobileDocsPageWrapper from "@/app/(dashboard)/docs/_components/MobileDocsWrapper";

/**
 * Public docs page served on the docs.* subdomain.
 * MobileDocsPageWrapper handles its own mobile/desktop switching.
 */
export default function DocsPublicPage() {
  return <MobileDocsPageWrapper />;
}

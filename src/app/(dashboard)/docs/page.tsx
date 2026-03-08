import { Metadata } from "next";
import MobileDocsPageWrapper from "./_components/MobileDocsWrapper";

export const metadata: Metadata = {
  title: "Documentation | Titan Journal CRM",
  description: "Complete feature guide for Titan Journal CRM",
};

export default function DocsPage() {
  return (
    /* Escape the dashboard layout's px-4 lg:px-6 py-4 md:py-6 padding
       so DocsClient fills the SidebarInset content area edge-to-edge */
    <div className="-mx-4 -my-4 md:-my-6 lg:-mx-6 overflow-hidden">
      <MobileDocsPageWrapper />
    </div>
  );
}

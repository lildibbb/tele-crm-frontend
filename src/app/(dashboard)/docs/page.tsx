import { Metadata } from "next";
import { DocsClient } from "./_components/DocsClient";

export const metadata: Metadata = {
  title: "Documentation | Titan Journal CRM",
  description: "Complete feature guide for Titan Journal CRM",
};

export default function DocsPage() {
  return <DocsClient />;
}

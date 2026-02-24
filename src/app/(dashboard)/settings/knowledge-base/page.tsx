import { redirect } from "next/navigation";

export default function KnowledgeBaseRedirect() {
  redirect("/settings?tab=knowledge-base");
}

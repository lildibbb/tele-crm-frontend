import { Suspense } from "react";
import LeadDetailClient from "./_components/LeadDetailClient";

export default function LeadDetailPage() {
  return (
    <Suspense>
      <LeadDetailClient />
    </Suspense>
  );
}

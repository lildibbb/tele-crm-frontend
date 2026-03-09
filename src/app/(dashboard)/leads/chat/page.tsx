import { Suspense } from "react";
import LeadChatClient from "./_components/LeadChatClient";

export default function LeadChatPage() {
  return (
    <Suspense>
      <LeadChatClient />
    </Suspense>
  );
}

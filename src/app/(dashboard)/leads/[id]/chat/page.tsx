import LeadChatClient from "./_components/LeadChatClient";

// Static export requires at least one pre-generated path.
// Actual routing is handled client-side via useParams().
export function generateStaticParams() {
  return [{ id: '0' }];
}

export default function LeadChatPage() {
  return <LeadChatClient />;
}

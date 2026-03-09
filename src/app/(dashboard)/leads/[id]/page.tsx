import LeadDetailClient from "./_components/LeadDetailClient";

// Static export requires at least one pre-generated path.
// Actual routing is handled client-side via useParams().
export function generateStaticParams() {
  return [{ id: '0' }];
}

export default function LeadDetailPage() {
  return <LeadDetailClient />;
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Submit Your Registration Proof',
  description:
    'Complete your account registration by submitting your HFM Account ID and deposit details.',
  openGraph: {
    title: 'Submit Your Registration Proof',
    description:
      'Complete your account registration by submitting your HFM Account ID and deposit details.',
  },
};

export default function SubmitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

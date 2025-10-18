/**
 * Create Proposal Page - Create proposal for request with Glass design system
 */

'use client';

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

import GlassCreateProposalScreen from './GlassCreateProposalScreen';

interface CreateProposalPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CreateProposalPage({ params }: CreateProposalPageProps) {
  const { id } = await params;
  return <GlassCreateProposalScreen requestId={id} />;
}
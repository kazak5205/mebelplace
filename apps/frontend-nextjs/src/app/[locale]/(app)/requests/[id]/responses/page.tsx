/**
 * Request Responses Page - View responses to request with Glass design system
 */

'use client';

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

import GlassRequestResponsesScreen from './GlassRequestResponsesScreen';

interface RequestResponsesPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function RequestResponsesPage({ params }: RequestResponsesPageProps) {
  const { id } = await params;
  return <GlassRequestResponsesScreen requestId={id} />;
}
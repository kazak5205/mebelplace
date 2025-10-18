/**
 * Request Details Page - Individual request screen with Glass design system
 */

'use client';

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

import GlassRequestDetailsScreen from './GlassRequestDetailsScreen';

interface RequestDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function RequestDetailsPage({ params }: RequestDetailsPageProps) {
  const { id } = await params;
  return <GlassRequestDetailsScreen requestId={id} />;
}
/**
 * Video Detail Page - Individual video screen with Glass design system
 */

'use client';

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

import GlassVideoDetailScreen from './GlassVideoDetailScreen';

interface VideoDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function VideoDetailPage({ params }: VideoDetailPageProps) {
  const { id } = await params;
  return <GlassVideoDetailScreen videoId={id} />;
}
/**
 * Video Comments Page - Comments for specific video with Glass design system
 */

'use client';

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

import GlassCommentsScreen from './GlassCommentsScreen';

interface VideoCommentsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function VideoCommentsPage({ params }: VideoCommentsPageProps) {
  const { id } = await params;
  return <GlassCommentsScreen videoId={id} />;
}
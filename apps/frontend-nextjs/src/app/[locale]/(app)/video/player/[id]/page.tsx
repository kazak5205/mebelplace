/**
 * Video Player Page - Full-screen video player with Glass design system
 */

'use client';

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

import GlassVideoPlayerScreen from './GlassVideoPlayerScreen';

interface VideoPlayerPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function VideoPlayerPage({ params }: VideoPlayerPageProps) {
  const { id } = await params;
  return <GlassVideoPlayerScreen videoId={id} />;
}
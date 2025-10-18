/**
 * Channel Page - User channel with videos and info with Glass design system
 */

'use client';

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

import GlassChannelPage from './GlassChannelPage';

interface ChannelPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ChannelPage({ params }: ChannelPageProps) {
  const { id } = await params;
  return <GlassChannelPage channelId={id} />;
}

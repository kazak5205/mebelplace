/**
 * Live Streaming Page - Live streaming functionality with Glass design system
 */

'use client';

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

import GlassLiveStreamingScreen from './GlassLiveStreamingScreen';

export default function LiveStreamingPage() {
  return <GlassLiveStreamingScreen />;
}

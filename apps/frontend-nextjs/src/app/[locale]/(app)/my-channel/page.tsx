/**
 * My Channel Page - User's own channel management with Glass design system
 */

'use client';

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

import GlassMyChannelScreen from './GlassMyChannelScreen';

export default function MyChannelPage() {
  return <GlassMyChannelScreen />;
}

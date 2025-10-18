/**
 * My Videos Page - User's video management with Glass design system
 */

'use client';

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

import GlassMyVideosScreen from './GlassMyVideosScreen';

export default function MyVideosPage() {
  return <GlassMyVideosScreen />;
}

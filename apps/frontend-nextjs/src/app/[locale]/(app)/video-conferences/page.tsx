/**
 * Video Conferences Page - Video conferencing functionality with Glass design system
 */

'use client';

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

import GlassVideoConferencesScreen from './GlassVideoConferencesScreen';

export default function VideoConferencesPage() {
  return <GlassVideoConferencesScreen />;
}

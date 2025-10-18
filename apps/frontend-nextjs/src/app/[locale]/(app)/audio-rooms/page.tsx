/**
 * Audio Rooms Page - Voice chat rooms with Glass design system
 */

'use client';

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

import GlassAudioRoomsScreen from './GlassAudioRoomsScreen';

export default function AudioRoomsPage() {
  return <GlassAudioRoomsScreen />;
}

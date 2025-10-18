/**
 * Upload Page - Video upload with Glass design system
 */

'use client';

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

import GlassUploadVideoScreen from './GlassUploadVideoScreen';

export default function UploadPage() {
  return <GlassUploadVideoScreen />;
}

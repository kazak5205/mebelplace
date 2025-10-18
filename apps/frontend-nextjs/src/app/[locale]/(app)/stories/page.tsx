/**
 * Stories Page - Stories feed with Glass design system
 */

'use client';

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

import GlassStoriesScreen from './GlassStoriesScreen';

export default function StoriesPage() {
  return <GlassStoriesScreen />;
}
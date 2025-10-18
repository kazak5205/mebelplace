/**
 * Search Page - Advanced search with Glass design system
 */

'use client';

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

import GlassSearchScreen from './GlassSearchScreen';

export default function SearchPage() {
  return <GlassSearchScreen />;
}
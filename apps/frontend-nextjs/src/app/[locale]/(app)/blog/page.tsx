/**
 * Blog Page - Blog and articles with Glass design system
 */

'use client';

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

import GlassBlogScreen from './GlassBlogScreen';

export default function BlogPage() {
  return <GlassBlogScreen />;
}

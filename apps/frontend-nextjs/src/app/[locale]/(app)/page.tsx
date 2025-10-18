/**
 * Homepage - Main landing page with Glass design system
 */

'use client';

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

import GlassFeedScreen from './GlassFeedScreen';

export default function HomePage() {
  return <GlassFeedScreen />;
}

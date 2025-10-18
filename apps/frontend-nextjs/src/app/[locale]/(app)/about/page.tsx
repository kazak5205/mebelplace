/**
 * About Page - About company information with Glass design system
 */

'use client';

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

import GlassAboutScreen from './GlassAboutScreen';

export default function AboutPage() {
  return <GlassAboutScreen />;
}

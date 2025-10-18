/**
 * Requests Page - Requests list with Glass design system
 */

'use client';

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

import GlassRequestScreen from './GlassRequestScreen';

export default function RequestsPage() {
  return <GlassRequestScreen />;
}
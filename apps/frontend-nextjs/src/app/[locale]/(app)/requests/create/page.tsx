/**
 * Create Request Page - Create new furniture request with Glass design system
 */

'use client';

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

import GlassCreateRequestScreen from './GlassCreateRequestScreen';

export default function CreateRequestPage() {
  return <GlassCreateRequestScreen />;
}

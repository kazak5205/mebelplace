/**
 * My Proposals Page - User's proposals management with Glass design system
 */

'use client';

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

import GlassMyProposalsScreen from './GlassMyProposalsScreen';

export default function MyProposalsPage() {
  return <GlassMyProposalsScreen />;
}

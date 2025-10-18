/**
 * My Requests Page - User's requests management with Glass design system
 */

'use client';

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

import GlassMyRequestsScreen from './GlassMyRequestsScreen';

export default function MyRequestsPage() {
  return <GlassMyRequestsScreen />;
}

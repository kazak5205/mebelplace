/**
 * Request Analytics Page - Request analytics dashboard with Glass design system
 */

'use client';

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

import GlassRequestAnalyticsScreen from './GlassRequestAnalyticsScreen';

export default function RequestAnalyticsPage() {
  return <GlassRequestAnalyticsScreen />;
}

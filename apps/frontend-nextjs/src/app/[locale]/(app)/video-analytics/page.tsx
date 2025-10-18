/**
 * Video Analytics Page - Video analytics dashboard with Glass design system
 */

'use client';

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

import GlassVideoAnalyticsScreen from './GlassVideoAnalyticsScreen';

export default function VideoAnalyticsPage() {
  return <GlassVideoAnalyticsScreen />;
}

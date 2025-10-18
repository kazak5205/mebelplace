/**
 * Order Tracking Page - Order tracking system with Glass design system
 */

'use client';

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

import GlassOrderTrackingScreen from './GlassOrderTrackingScreen';

export default function OrderTrackingPage() {
  return <GlassOrderTrackingScreen />;
}

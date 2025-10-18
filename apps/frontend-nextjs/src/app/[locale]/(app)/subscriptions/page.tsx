/**
 * Subscriptions Page - Premium subscriptions with Glass design system
 */

'use client';

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

import GlassSubscriptionsScreen from './GlassSubscriptionsScreen';

export default function SubscriptionsPage() {
  return <GlassSubscriptionsScreen />;
}

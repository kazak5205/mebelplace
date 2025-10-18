/**
 * Notifications Page - Notifications management with Glass design system
 */

'use client';

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

import GlassNotificationsScreen from './GlassNotificationsScreen';

export default function NotificationsPage() {
  return <GlassNotificationsScreen />;
}

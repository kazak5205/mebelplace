/**
 * Orders Page - User orders list with Glass design system
 */

'use client';

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

import GlassMyOrdersScreen from './GlassMyOrdersScreen';

export default function OrdersPage() {
  return <GlassMyOrdersScreen />;
}
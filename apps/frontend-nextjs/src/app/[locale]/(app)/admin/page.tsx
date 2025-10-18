/**
 * Admin Dashboard Page - Admin panel with Glass design system
 */

'use client';

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

import GlassAdminDashboardScreen from './GlassAdminDashboardScreen';

export default function AdminPage() {
  return <GlassAdminDashboardScreen />;
}
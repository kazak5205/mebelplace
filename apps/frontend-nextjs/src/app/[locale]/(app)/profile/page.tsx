/**
 * Profile Page - User profile with Glass design system
 */

'use client';

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

import GlassProfileScreen from './GlassProfileScreen';

export default function ProfilePage() {
  return <GlassProfileScreen />;
}
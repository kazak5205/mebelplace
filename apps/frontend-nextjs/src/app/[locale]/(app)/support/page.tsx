/**
 * Support Page - Customer support and help center with Glass design system
 */

'use client';

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

import GlassSupportScreen from './GlassSupportScreen';

export default function SupportPage() {
  return <GlassSupportScreen />;
}

/**
 * Careers Page - Job opportunities with Glass design system
 */

'use client';

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

import GlassCareersScreen from './GlassCareersScreen';

export default function CareersPage() {
  return <GlassCareersScreen />;
}

/**
 * Terms of Service Page - Terms and conditions with Glass design system
 */

'use client';

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

import GlassTermsOfServiceScreen from './GlassTermsOfServiceScreen';

export default function TermsPage() {
  return <GlassTermsOfServiceScreen />;
}

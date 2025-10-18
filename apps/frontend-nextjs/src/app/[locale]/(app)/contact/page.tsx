/**
 * Contact Page - Contact information and form with Glass design system
 */

'use client';

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

import GlassContactScreen from './GlassContactScreen';

export default function ContactPage() {
  return <GlassContactScreen />;
}

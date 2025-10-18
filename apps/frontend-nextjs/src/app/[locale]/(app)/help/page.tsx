/**
 * Help Page - Help center with Glass design system
 */

'use client';

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

import GlassHelpScreen from './GlassHelpScreen';

export default function HelpPage() {
  return <GlassHelpScreen />;
}

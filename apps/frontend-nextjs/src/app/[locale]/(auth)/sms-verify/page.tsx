/**
 * SMS Verification Page - Phone number verification with i18n
 * Uses Glass design system
 */

'use client';

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

import GlassSmsVerificationScreen from './GlassSmsVerificationScreen';

export default function SmsVerificationPage() {
  return <GlassSmsVerificationScreen />;
}

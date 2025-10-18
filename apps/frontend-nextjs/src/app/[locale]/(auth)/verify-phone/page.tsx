/**
 * Phone Verification Page - Phone number verification with i18n
 * Uses Glass design system
 */

'use client';

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

import GlassVerifyPhoneScreen from './GlassVerifyPhoneScreen';

export default function VerifyPhonePage() {
  return <GlassVerifyPhoneScreen />;
}

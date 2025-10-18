/**
 * Email Verification Page - Email verification with i18n
 * Uses Glass design system
 */

'use client';

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

import GlassVerifyEmailScreen from './GlassVerifyEmailScreen';

export default function VerifyEmailPage() {
  return <GlassVerifyEmailScreen />;
}

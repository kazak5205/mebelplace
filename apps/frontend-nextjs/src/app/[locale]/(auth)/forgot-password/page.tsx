/**
 * Forgot Password Page - Password recovery with i18n
 * Uses Glass design system
 */

'use client';

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

import GlassForgotPasswordScreen from './GlassForgotPasswordScreen';

export default function ForgotPasswordPage() {
  return <GlassForgotPasswordScreen />;
}
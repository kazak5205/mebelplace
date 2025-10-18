/**
 * Register Page - New user registration with i18n
 * Uses Glass design system
 */

'use client';

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

import GlassRegisterScreen from './GlassRegisterScreen';

export default function RegisterPage() {
  return <GlassRegisterScreen />;
}


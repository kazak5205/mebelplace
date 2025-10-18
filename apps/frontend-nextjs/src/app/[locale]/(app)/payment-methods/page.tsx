/**
 * Payment Methods Page - Payment methods management with Glass design system
 */

'use client';

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

import GlassPaymentMethodsScreen from './GlassPaymentMethodsScreen';

export default function PaymentMethodsPage() {
  return <GlassPaymentMethodsScreen />;
}

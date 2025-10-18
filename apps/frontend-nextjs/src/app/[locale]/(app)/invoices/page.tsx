/**
 * Invoices Page - Invoices management with Glass design system
 */

'use client';

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

import GlassInvoicesScreen from './GlassInvoicesScreen';

export default function InvoicesPage() {
  return <GlassInvoicesScreen />;
}

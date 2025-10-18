/**
 * Feed Page - Video feed with Glass design system
 */

'use client';

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

import GlassVideoFeedTab from './GlassVideoFeedTab';

export default function FeedPage() {
  return <GlassVideoFeedTab />;
}
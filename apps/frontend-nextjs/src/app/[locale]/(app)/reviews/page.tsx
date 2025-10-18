/**
 * Reviews Page - Reviews and ratings system with Glass design system
 */

'use client';

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

import GlassReviewsScreen from './GlassReviewsScreen';

export default function ReviewsPage() {
  return <GlassReviewsScreen />;
}

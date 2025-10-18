/**
 * Marketplace Page - Marketplace for furniture and materials with Glass design system
 */

'use client';

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

import GlassMarketplaceScreen from './GlassMarketplaceScreen';

export default function MarketplacePage() {
  return <GlassMarketplaceScreen />;
}

/**
 * Furniture Configurator Page - 3D furniture configurator with Glass design system
 */

'use client';

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

import GlassFurnitureConfiguratorScreen from './GlassFurnitureConfiguratorScreen';

export default function ConfiguratorPage() {
  return <GlassFurnitureConfiguratorScreen />;
}

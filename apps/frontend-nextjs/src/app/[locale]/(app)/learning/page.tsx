/**
 * Learning Page - Learning and education platform with Glass design system
 */

'use client';

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

import GlassLearningScreen from './GlassLearningScreen';

export default function LearningPage() {
  return <GlassLearningScreen />;
}

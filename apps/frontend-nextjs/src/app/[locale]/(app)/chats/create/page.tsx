/**
 * Create Chat Page - Create new chat with Glass design system
 */

'use client';

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

import GlassCreateChatScreen from './GlassCreateChatScreen';

export default function CreateChatPage() {
  return <GlassCreateChatScreen />;
}

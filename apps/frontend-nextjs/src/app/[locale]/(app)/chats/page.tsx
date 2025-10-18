/**
 * Chats Page - Chats list with Glass design system
 */

'use client';

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

import GlassChatsListScreen from './GlassChatsListScreen';

export default function ChatsPage() {
  return <GlassChatsListScreen />;
}
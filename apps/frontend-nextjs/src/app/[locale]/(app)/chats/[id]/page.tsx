/**
 * Chat Page - Individual chat screen with Glass design system
 */

'use client';

// Force dynamic rendering to avoid stale chunks
export const dynamic = 'force-dynamic';

import GlassChatScreen from './GlassChatScreen';

interface ChatPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { id } = await params;
  return <GlassChatScreen chatId={id} />;
}
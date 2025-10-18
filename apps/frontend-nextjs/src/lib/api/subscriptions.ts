/**
 * Channel Subscriptions API Client
 * Manages user subscriptions to channels with 3 notification levels
 */

import { apiClient } from './client';

export type SubscriptionLevel = 'all' | 'important' | 'off';

export interface ChannelSubscription {
  id: string;
  channel_id: string;
  level: SubscriptionLevel;
  created_at: string;
  updated_at: string;
}

export interface SubscribeRequest {
  channel_id: string;
  level: SubscriptionLevel;
}

/**
 * Subscribe to a channel or update subscription level
 * Levels:
 * - "all": All notifications (video, story, stream)
 * - "important": Only streams and stories
 * - "off": No notifications (but still subscribed to channel)
 */
export async function subscribeToChannel(channelId: string, level: SubscriptionLevel): Promise<ChannelSubscription> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/subscriptions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      channel_id: channelId,
      level,
    }),
  });
  const result = await response.json();
  return result.data;
}

/**
 * Unsubscribe from a channel completely
 */
export async function unsubscribeFromChannel(channelId: string): Promise<void> {
  await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/subscriptions/${channelId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Get subscription status for a specific channel
 */
export async function getChannelSubscription(channelId: string): Promise<ChannelSubscription | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/subscriptions/${channelId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
    });
    const result = await response.json();
    return result.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null; // Not subscribed
    }
    throw error;
  }
}

/**
 * Get all user's channel subscriptions
 */
export async function getMySubscriptions(): Promise<ChannelSubscription[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/subscriptions`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'Content-Type': 'application/json',
    },
  });
  const result = await response.json();
  return result.data;
}


/**
 * Subscriptions API Client
 * API для управления подписками на каналы
 */

import { apiClient } from './client';

export type SubscriptionLevel = 'all' | 'important' | 'off';

export interface Subscription {
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
 * Subscribe to a channel with specified notification level
 * @param channelId - Channel ID to subscribe to
 * @param level - Notification level: 'all' | 'important' | 'off'
 */
export async function subscribe(
  channelId: string,
  level: SubscriptionLevel
): Promise<Subscription> {
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
 * Unsubscribe from a channel
 * @param channelId - Channel ID to unsubscribe from
 */
export async function unsubscribe(channelId: string): Promise<void> {
  await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/subscriptions/${channelId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Get subscription for a specific channel
 * @param channelId - Channel ID
 */
export async function getSubscription(
  channelId: string
): Promise<Subscription | null> {
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
  } catch (error) {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 404) {
        return null; // Not subscribed
      }
    }
    throw error;
  }
}

/**
 * Get all subscriptions for the current user
 */
export async function getMySubscriptions(): Promise<Subscription[]> {
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

export const subscriptionsApi = {
  subscribe,
  unsubscribe,
  getSubscription,
  getMySubscriptions,
};


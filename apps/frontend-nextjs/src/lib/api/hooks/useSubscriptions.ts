/**
 * Subscriptions Hooks
 * React Query hooks для управления подписками
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { subscriptionsApi, Subscription, SubscriptionLevel } from '../subscriptionsApi';

/**
 * Get subscription for a specific channel
 */
export function useSubscription(channelId: string) {
  return useQuery({
    queryKey: ['subscription', channelId],
    queryFn: () => subscriptionsApi.getSubscription(channelId),
    enabled: !!channelId,
  });
}

/**
 * Get all subscriptions for current user
 */
export function useMySubscriptions() {
  return useQuery({
    queryKey: ['subscriptions', 'my'],
    queryFn: () => subscriptionsApi.getMySubscriptions(),
  });
}

/**
 * Subscribe to a channel
 */
export function useSubscribe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      channelId,
      level,
    }: {
      channelId: string;
      level: SubscriptionLevel;
    }) => subscriptionsApi.subscribe(channelId, level),
    onSuccess: (_, { channelId }) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['subscription', channelId] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions', 'my'] });
    },
  });
}

/**
 * Unsubscribe from a channel
 */
export function useUnsubscribe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (channelId: string) => subscriptionsApi.unsubscribe(channelId),
    onSuccess: (_, channelId) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['subscription', channelId] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions', 'my'] });
    },
  });
}


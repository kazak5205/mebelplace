/**
 * Custom hooks for Live Streams
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getLiveStreams,
  getStreamById,
  createStream,
  startStream,
  endStream,
  likeStream,
  joinStream,
  leaveStream,
} from '../api/streamApi'
import type { CreateStreamRequest } from '../types/stream'

export function useLiveStreams() {
  return useQuery({
    queryKey: ['live-streams'],
    queryFn: () => getLiveStreams(),
    refetchInterval: 10000, // Refresh every 10 seconds
  })
}

export function useStream(streamId: string) {
  return useQuery({
    queryKey: ['stream', streamId],
    queryFn: () => getStreamById(streamId),
    enabled: !!streamId,
    refetchInterval: 5000, // Refresh every 5 seconds for viewer count
  })
}

export function useCreateStream() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateStreamRequest) => createStream(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-streams'] })
    },
  })
}

export function useStartStream() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (streamId: string) => startStream({ stream_id: streamId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-streams'] })
    },
  })
}

export function useEndStream() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (streamId: string) => endStream({ stream_id: streamId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-streams'] })
    },
  })
}

export function useJoinStream(streamId: string) {
  return useMutation({
    mutationFn: () => joinStream(streamId),
  })
}

export function useLeaveStream(streamId: string) {
  return useMutation({
    mutationFn: () => leaveStream(streamId),
  })
}

export function useLikeStream(streamId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: () => likeStream(streamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stream', streamId] })
    },
  })
}


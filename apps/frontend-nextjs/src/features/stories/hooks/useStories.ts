/**
 * Custom hooks for Stories
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  getStoryChannels, 
  getChannelStories, 
  viewStory,
  uploadStory,
  makeHighlight,
  deleteStory 
} from '../api/storyApi'
import type { CreateStoryRequest } from '../types/story'

export function useStoryChannels() {
  return useQuery({
    queryKey: ['story-channels'],
    queryFn: getStoryChannels,
    refetchInterval: 30000, // Refresh every 30 seconds
  })
}

export function useChannelStories(authorId: string) {
  return useQuery({
    queryKey: ['channel-stories', authorId],
    queryFn: () => getChannelStories(authorId),
    enabled: !!authorId,
  })
}

export function useViewStory() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (storyId: string) => viewStory(storyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['story-channels'] })
    },
  })
}

export function useUploadStory() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ data, file }: { data: CreateStoryRequest; file: File }) =>
      uploadStory(data, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['story-channels'] })
    },
  })
}

export function useMakeHighlight() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: { story_id: string; name: string }) =>
      makeHighlight(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['story-channels'] })
    },
  })
}

export function useDeleteStory() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (storyId: string) => deleteStory(storyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['story-channels'] })
    },
  })
}


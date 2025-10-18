/**
 * Custom hook for video interactions (like, save, share)
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { likeVideo, unlikeVideo, saveVideo, unsaveVideo, shareVideo } from '../api/videoApi'
import { useState } from 'react'

export function useVideoInteractions(videoId: string, initialLiked = false, initialSaved = false) {
  const queryClient = useQueryClient()
  const [isLiked, setIsLiked] = useState(initialLiked)
  const [isSaved, setIsSaved] = useState(initialSaved)
  
  // Like/Unlike mutation
  const likeMutation = useMutation({
    mutationFn: () => isLiked ? unlikeVideo(videoId) : likeVideo(videoId),
    onMutate: () => {
      // Optimistic update
      setIsLiked(!isLiked)
    },
    onError: () => {
      // Revert on error
      setIsLiked(!isLiked)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-feed'] })
    },
  })
  
  // Save/Unsave mutation
  const saveMutation = useMutation({
    mutationFn: () => isSaved ? unsaveVideo(videoId) : saveVideo(videoId),
    onMutate: () => {
      // Optimistic update
      setIsSaved(!isSaved)
    },
    onError: () => {
      // Revert on error
      setIsSaved(!isSaved)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-feed'] })
    },
  })
  
  // Share mutation
  const shareMutation = useMutation({
    mutationFn: (platform: string) => shareVideo(videoId, platform),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-feed'] })
    },
  })
  
  return {
    isLiked,
    isSaved,
    toggleLike: likeMutation.mutate,
    toggleSave: saveMutation.mutate,
    share: shareMutation.mutate,
    isLiking: likeMutation.isPending,
    isSaving: saveMutation.isPending,
    isSharing: shareMutation.isPending,
  }
}


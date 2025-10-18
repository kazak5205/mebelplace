'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui/Input'
import { getVideoComments, createComment, deleteComment } from '../api/videoApi'
import { formatRelativeTime } from '@/lib/utils/format'
import type { Video, Comment } from '../types/video'

interface VideoCommentsProps {
  video: Video
  currentUser?: {
    id: string
    role: 'guest' | 'buyer' | 'master' | 'admin'
  }
  onClose: () => void
}

export function VideoComments({ video, currentUser, onClose }: VideoCommentsProps) {
  const [commentText, setCommentText] = useState('')
  const queryClient = useQueryClient()
  
  // Fetch comments
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['video-comments', video.id],
    queryFn: () => getVideoComments(video.id),
  })
  
  // Create comment mutation
  const createMutation = useMutation({
    mutationFn: (text: string) =>
      createComment({
        video_id: video.id,
        text,
      }),
    onSuccess: () => {
      setCommentText('')
      queryClient.invalidateQueries({ queryKey: ['video-comments', video.id] })
      queryClient.invalidateQueries({ queryKey: ['video-feed'] })
    },
  })
  
  // Delete comment mutation
  const deleteMutation = useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-comments', video.id] })
      queryClient.invalidateQueries({ queryKey: ['video-feed'] })
    },
  })
  
  // CRITICAL: Check if current user can comment on this video
  // Master can ONLY comment on their own videos!
  const canComment = useMemo(() => {
    if (!currentUser) return false
    if (currentUser.role === 'guest') return false
    
    // Master can ONLY comment on their own videos
    if (currentUser.role === 'master' && video.author_id !== currentUser.id) {
      return false
    }
    
    return video.allow_comments
  }, [currentUser, video])
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim() || !canComment) return
    createMutation.mutate(commentText)
  }
  
  return (
    <div className="fixed inset-x-0 bottom-0 top-1/3 bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold">
          {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
        </h3>
        <button onClick={onClose} className="text-2xl">✕</button>
      </div>
      
      {/* Comments list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No comments yet</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <img
                src={comment.user?.avatar_url || '/default-avatar.png'}
                alt={comment.user?.name}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{comment.user?.name}</span>
                  <span className="text-xs text-gray-500">
                    {formatRelativeTime(comment.created_at)}
                  </span>
                </div>
                <p className="text-sm mt-1">{comment.text}</p>
                
                {/* Delete button (if own comment or admin) */}
                {currentUser && (currentUser.id === comment.user_id || currentUser.role === 'admin') && (
                  <button
                    onClick={() => deleteMutation.mutate(comment.id)}
                    className="text-xs text-red-500 mt-1"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Comment input */}
      {canComment ? (
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <Input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              disabled={createMutation.isPending}
            />
            <Button
              type="submit"
              disabled={!commentText.trim() || createMutation.isPending}
              loading={createMutation.isPending}
            >
              Post
            </Button>
          </div>
        </form>
      ) : (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500">
          {currentUser?.role === 'master' && video.author_id !== currentUser.id ? (
            <p>Masters can only comment on their own videos</p>
          ) : !currentUser ? (
            <p>Login to comment</p>
          ) : !video.allow_comments ? (
            <p>Comments are disabled for this video</p>
          ) : (
            <p>You cannot comment on this video</p>
          )}
        </div>
      )}
    </div>
  )
}


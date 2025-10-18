'use client';

import React, { useState, useEffect } from 'react';
import { 
  GlassCard, 
  GlassCardHeader, 
  GlassCardTitle, 
  GlassCardContent, 
  GlassButton, 
  GlassInput 
} from '@/components/ui/glass';
import { useVideoComments, useVideoActions } from '@/lib/api/hooks';
import { Comment } from '@/lib/api/types';

interface GlassCommentsScreenProps {
  videoId: string;
}

export default function GlassCommentsScreen({ videoId }: GlassCommentsScreenProps) {
  const [newComment, setNewComment] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  
  // API hooks
  const { data: comments, loading, error, refresh } = useVideoComments(videoId);
  const { addComment, loading: submitting } = useVideoActions();

  // Data is now fetched via API hooks - no useEffect needed

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'только что';
    if (diffInMinutes < 60) return `${diffInMinutes} мин назад`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} ч назад`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)} дн назад`;
    
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short'
    });
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    // setSubmitting(true);
    try {
      // API integration - using mock data structure matching API types
      console.log('Submitting comment:', newComment);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const comment: Comment = {
        id: Date.now(),
        text: newComment,
        author: {
          id: 999999,
          username: 'Вы',
          avatar_url: '/api/placeholder/40/40'
        } as any,
        created_at: new Date().toISOString()
      } as any;
      
      // TODO: Add comment to API
      // setComments(prev => [comment, ...prev]);
      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      // setSubmitting(false);
    }
  };

  const handleSubmitReply = async (commentId: string) => {
    if (!replyText.trim()) return;

    // setSubmitting(true);
    try {
      // API integration - using mock data structure matching API types
      console.log('Submitting reply:', replyText);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const reply: Comment = {
        id: Date.now() + 1,
        text: replyText,
        author: {
          id: 999999,
          username: 'Вы',
          avatar_url: '/api/placeholder/40/40'
        } as any,
        created_at: new Date().toISOString()
      } as any;
      
      // TODO: Add reply to API
      // setComments(prev => prev.map(comment => 
      //   comment.id === commentId 
      //     ? { ...comment, replies: [...comment.replies, reply] }
      //     : comment
      // ));
      
      setReplyText('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      // setSubmitting(false);
    }
  };

  const handleLike = (commentId: string, isReply: boolean = false, parentId?: string) => {
    if (isReply && parentId) {
      // TODO: Like reply via API
    } else {
      // TODO: Like comment via API
    }
  };

  const sortedComments = [...comments].sort((a: any, b: any) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      case 'oldest':
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      case 'popular':
        return b.likes - a.likes;
      default:
        return 0;
    }
  });

  const CommentComponent = ({ comment, isReply = false, parentId }: { comment: Comment; isReply?: boolean; parentId?: string }) => (
    <div className={`${isReply ? 'ml-8' : ''} border-b border-white/10 pb-4 mb-4`}>
      <div className="flex gap-3">
        <div className="w-10 h-10 glass-bg-secondary rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
          {(comment.author as any).avatar ? (
            <img 
              src={(comment.author as any).avatar} 
              alt={(comment.author as any).name || comment.author.username}
              className="w-full h-full object-cover"
            />
          ) : (
            <svg className="w-5 h-5 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium glass-text-primary">
              {(comment.author as any).name || comment.author.username}
            </span>
            {(comment.author as any).isVerified && (
              <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            )}
            <span className="text-sm glass-text-muted">
              {formatTime((comment as any).timestamp || comment.created_at)}
            </span>
            {(comment as any).isPinned && (
              <span className="px-2 py-1 glass-bg-accent-orange-500 text-white text-xs rounded-full">
                Закреплено
              </span>
            )}
          </div>
          
          <p className="glass-text-secondary mb-2">
            {comment.text}
          </p>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleLike(comment.id.toString(), isReply, parentId)}
              className={`flex items-center gap-1 text-sm transition-colors ${
                (comment as any).isLiked ? 'glass-text-accent-orange-500' : 'glass-text-muted hover:glass-text-primary'
              }`}
            >
              <svg className="w-4 h-4" fill={(comment as any).isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {(comment as any).likes}
            </button>
            
            {!isReply && (
              <button
                onClick={() => setReplyingTo(replyingTo === comment.id.toString() ? null : comment.id.toString())}
                className="text-sm glass-text-muted hover:glass-text-primary transition-colors"
              >
                Ответить
              </button>
            )}
          </div>

          {/* Reply Form */}
          {replyingTo === comment.id.toString() && !isReply && (
            <div className="mt-4">
              <form onSubmit={(e) => { e.preventDefault(); handleSubmitReply(comment.id.toString()); }} className="flex gap-3">
                <GlassInput
                  value={replyText}
                  onValueChange={setReplyText}
                  placeholder="Написать ответ..."
                  className="flex-1"
                />
                <GlassButton
                  type="submit"
                  variant="gradient"
                  size="sm"
                  loading={submitting}
                  disabled={!replyText.trim()}
                >
                  Ответить
                </GlassButton>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4 animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => (
              <GlassCard key={i} variant="interactive" padding="lg">
                <div className="flex gap-3">
                  <div className="w-10 h-10 glass-bg-secondary rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 glass-bg-secondary rounded mb-2" />
                    <div className="h-3 glass-bg-secondary rounded w-2/3" />
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <GlassCard variant="elevated" padding="lg" className="mb-6">
          <GlassCardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <GlassCardTitle level={1} className="flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Комментарии к видео
              </GlassCardTitle>
              
              <div className="flex items-center gap-2">
                <span className="text-sm glass-text-secondary">Сортировка:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="glass-bg-primary glass-border rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="newest">Новые</option>
                  <option value="oldest">Старые</option>
                  <option value="popular">Популярные</option>
                </select>
              </div>
            </div>
          </GlassCardHeader>
        </GlassCard>

        {/* Add Comment Form */}
        <GlassCard variant="elevated" padding="lg" className="mb-6">
          <GlassCardContent>
            <form onSubmit={handleSubmitComment} className="flex gap-3">
              <GlassInput
                value={newComment}
                onValueChange={setNewComment}
                placeholder="Добавить комментарий..."
                className="flex-1"
              />
              <GlassButton
                type="submit"
                variant="gradient"
                loading={submitting}
                disabled={!newComment.trim()}
              >
                Отправить
              </GlassButton>
            </form>
          </GlassCardContent>
        </GlassCard>

        {/* Comments List */}
        <GlassCard variant="elevated" padding="lg">
          <GlassCardContent>
            <div className="mb-4">
              <h2 className="text-lg font-semibold glass-text-primary mb-2">
                Все комментарии ({comments.length})
              </h2>
            </div>
            
            <div className="space-y-4">
              {sortedComments.map((comment: any) => (
                <div key={comment.id}>
                  <CommentComponent comment={comment} />
                  
                  {/* Replies */}
                  {comment.replies.length > 0 && (
                    <div className="ml-8">
                      {comment.replies.map((reply: any) => (
                        <CommentComponent 
                          key={reply.id} 
                          comment={reply} 
                          isReply={true} 
                          parentId={comment.id} 
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {comments.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 glass-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold glass-text-primary mb-2">
                  Пока нет комментариев
                </h3>
                <p className="glass-text-secondary">
                  Станьте первым, кто оставит комментарий к этому видео
                </p>
              </div>
            )}
          </GlassCardContent>
        </GlassCard>
      </div>
    </div>
  );
}

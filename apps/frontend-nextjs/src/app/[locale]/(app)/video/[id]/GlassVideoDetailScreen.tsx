'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  GlassCard, 
  GlassCardHeader, 
  GlassCardTitle, 
  GlassCardContent, 
  GlassButton, 
  GlassInput 
} from '@/components/ui/glass';
import { useVideoComments, useVideoActions } from '@/lib/api/hooks';
import { Video, Comment } from '@/lib/api/types';

// Using types from API

interface GlassVideoDetailScreenProps {
  videoId: string;
}

export default function GlassVideoDetailScreen({ videoId }: GlassVideoDetailScreenProps) {
  const router = useRouter();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  
  // API hooks
  const { data: comments, loading: commentsLoading, refresh: refetchComments } = useVideoComments(videoId);
  const { likeVideo, unlikeVideo, addComment, loading: actionsLoading } = useVideoActions();

  // Data is fetched via API hooks

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleLike = () => {
    if (!video) return;
    setVideo(prev => prev ? {
      ...prev,
      isLiked: !(prev as any).isLiked,
      isDisliked: false,
      likes: (prev as any).isLiked ? (prev as any).likes - 1 : (prev as any).likes + 1,
      dislikes: (prev as any).isDisliked ? (prev as any).dislikes - 1 : (prev as any).dislikes
    } : null);
  };

  const handleDislike = () => {
    if (!video) return;
    setVideo(prev => prev ? {
      ...prev,
      isDisliked: !(prev as any).isDisliked,
      isLiked: false,
      dislikes: (prev as any).isDisliked ? (prev as any).dislikes - 1 : (prev as any).dislikes + 1,
      likes: (prev as any).isLiked ? (prev as any).likes - 1 : (prev as any).likes
    } : null);
  };

  const handleSubscribe = () => {
    if (!video) return;
    setVideo(prev => prev ? {
      ...prev,
      author: {
        ...prev.author,
        isSubscribed: !(prev.author as any).isSubscribed,
        subscribers: (prev.author as any).isSubscribed 
          ? (prev.author as any).subscribers - 1 
          : (prev.author as any).subscribers + 1
      }
    } : null);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      // API integration - using mock data structure matching API types
      console.log('Submitting comment:', commentText);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Add comment to state
      const newComment: Comment = {
        id: Date.now(),
        author: {
          id: 999999,
          username: 'Вы',
          avatar_url: '/api/placeholder/40/40'
        } as any,
        text: commentText,
        created_at: new Date().toISOString()
      } as any;
      
      // TODO: Add comment to API
      // setComments(prev => [newComment, ...prev]);
      setCommentText('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="aspect-video glass-bg-secondary rounded-xl mb-6" />
            <div className="h-8 glass-bg-secondary rounded mb-4" />
            <div className="h-4 glass-bg-secondary rounded w-2/3 mb-6" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 glass-bg-secondary rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
        <div className="max-w-6xl mx-auto">
          <GlassCard variant="elevated" padding="xl" className="text-center">
            <GlassCardContent>
              <div className="w-16 h-16 glass-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold glass-text-primary mb-2">
                Видео не найдено
              </h3>
              <p className="glass-text-secondary mb-4">
                Возможно, видео было удалено или ссылка неверна
              </p>
              <GlassButton variant="gradient" onClick={() => router.push('/feed')}>
                Вернуться к ленте
              </GlassButton>
            </GlassCardContent>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
      <div className="max-w-6xl mx-auto">
        {/* Video Player */}
        <GlassCard variant="elevated" padding="none" className="mb-6">
          <div className="aspect-video relative">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-blue-500/20 flex items-center justify-center">
              <div className="w-20 h-20 glass-bg-primary rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
            
            {/* Duration */}
            <div className="absolute bottom-4 right-4 glass-bg-primary glass-border rounded px-3 py-1">
              <span className="text-sm font-medium text-white">{(video as any).duration || '0:00'}</span>
            </div>
          </div>
        </GlassCard>

        {/* Video Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Stats */}
            <GlassCard variant="elevated" padding="lg">
              <GlassCardHeader>
                <GlassCardTitle level={1} className="text-xl mb-4">
                  {video.title}
                </GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4 text-sm glass-text-secondary">
                    <span>{formatViews((video as any).views || 0)} просмотров</span>
                    <span>•</span>
                    <span>{formatDate((video as any).createdAt || new Date().toISOString())}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <GlassButton
                      variant={(video as any).isLiked ? 'gradient' : 'secondary'}
                      size="sm"
                      onClick={handleLike}
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {formatViews((video as any).likes || 0)}
                    </GlassButton>
                    
                    <GlassButton
                      variant={(video as any).isDisliked ? 'danger' : 'secondary'}
                      size="sm"
                      onClick={handleDislike}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 13l3 3 7-7" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7 7-7" />
                      </svg>
                    </GlassButton>
                    
                    <GlassButton variant="secondary" size="sm">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                      Поделиться
                    </GlassButton>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {((video as any).tags || []).map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 glass-bg-accent-blue-500 text-white rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                
                <p className="glass-text-secondary leading-relaxed">
                  {video.description}
                </p>
              </GlassCardContent>
            </GlassCard>

            {/* Comments */}
            <GlassCard variant="elevated" padding="lg">
              <GlassCardHeader>
                <GlassCardTitle level={2} className="text-lg">
                  Комментарии ({comments.length})
                </GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                {/* Add Comment Form */}
                <form onSubmit={handleCommentSubmit} className="mb-6">
                  <div className="flex gap-3">
                    <GlassInput
                      name="comment"
                      type="text"
                      placeholder="Добавить комментарий..."
                      value={commentText}
                      onValueChange={setCommentText}
                      className="flex-1"
                    />
                    <GlassButton
                      type="submit"
                      variant="gradient"
                      loading={submittingComment}
                      disabled={!commentText.trim()}
                    >
                      Отправить
                    </GlassButton>
                  </div>
                </form>

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.map((comment: any) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="w-10 h-10 glass-bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                        {comment.author.avatar ? (
                          <img 
                            src={comment.author.avatar} 
                            alt={comment.author.name}
                            className="w-full h-full object-cover rounded-full"
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
                            {comment.author.name}
                          </span>
                          <span className="text-sm glass-text-muted">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="glass-text-secondary mb-2">
                          {comment.text}
                        </p>
                        <div className="flex items-center gap-4">
                          <GlassButton
                            variant={comment.isLiked ? 'gradient' : 'ghost'}
                            size="sm"
                            className="text-xs"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            {comment.likes}
                          </GlassButton>
                          <button className="text-xs glass-text-secondary hover:glass-text-primary">
                            Ответить
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCardContent>
            </GlassCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Author Info */}
            <GlassCard variant="elevated" padding="lg">
              <GlassCardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 glass-bg-secondary rounded-full flex items-center justify-center overflow-hidden">
                    {(video.author as any).avatar ? (
                      <img 
                        src={(video.author as any).avatar} 
                        alt={(video.author as any).name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className="w-8 h-8 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <GlassCardTitle level={3} className="text-lg mb-1">
                      {(video.author as any).name || video.author.username}
                    </GlassCardTitle>
                    <p className="text-sm glass-text-secondary">
                      {formatViews((video.author as any).subscribers || 0)} подписчиков
                    </p>
                  </div>
                </div>
              </GlassCardHeader>
              <GlassCardContent>
                <GlassButton
                  variant={(video.author as any).isSubscribed ? 'secondary' : 'gradient'}
                  size="md"
                  className="w-full"
                  onClick={handleSubscribe}
                >
                  {(video.author as any).isSubscribed ? 'Подписка оформлена' : 'Подписаться'}
                </GlassButton>
              </GlassCardContent>
            </GlassCard>

            {/* Related Videos */}
            <GlassCard variant="elevated" padding="lg">
              <GlassCardHeader>
                <GlassCardTitle level={3}>
                  Похожие видео
                </GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-3 cursor-pointer hover:glass-bg-secondary/20 p-2 rounded-lg transition-colors">
                      <div className="w-24 h-16 glass-bg-secondary rounded-lg flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium glass-text-primary line-clamp-2 mb-1">
                          Похожее видео {i + 1}
                        </h4>
                        <p className="text-xs glass-text-secondary mb-1">
                          Автор {i + 1}
                        </p>
                        <div className="flex items-center gap-2 text-xs glass-text-muted">
                          <span>{Math.floor(Math.random() * 1000)} просмотров</span>
                          <span>•</span>
                          <span>{Math.floor(Math.random() * 30)}д назад</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCardContent>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}

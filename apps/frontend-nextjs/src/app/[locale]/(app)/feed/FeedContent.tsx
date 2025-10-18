/**
 * FeedContent - Client component for feed with infinite scroll
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { videoKeys, type Video, type VideoFeedResponse, useShareVideo, useSaveVideo } from '@/lib/api/hooks/useVideos';
import { apiClient } from '@/lib/api/client';
import { VideoCard } from '@/components/VideoCard';
import { VerticalVideoFeed } from '@/components/feed/VerticalVideoFeed';
import { FeedSkeleton } from '@/components/feed/VideoFeedSkeleton';
import { Button } from '@/components/ui';
import { useTranslations } from 'next-intl';
import { AlertCircle, Grid3x3, Rows } from 'lucide-react';
import { StoriesBar } from '@/components/stories/StoriesBar';
import AidaVideoCard from '@/components/feed/AidaVideoCard';
import { CreateStoryModal } from '@/components/stories/CreateStoryModal';
import { useStoryChannels } from '@/features/stories/hooks/useStories';

type FeedType = 'all' | 'following' | 'ai';
type ViewMode = 'grid' | 'vertical';

export function FeedContent() {
  const t = useTranslations('feed');
  const [feedType, setFeedType] = useState<FeedType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('vertical'); // Default to TikTok-style
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [videoLikes, setVideoLikes] = useState<Record<number, { isLiked: boolean; count: number }>>({});
  const [showCreateStory, setShowCreateStory] = useState(false);
  
  // Use real API hooks instead of mock data
  const { data: storyChannels = [], isLoading: storiesLoading, error: storiesError } = useStoryChannels();
  const { mutate: shareVideo } = useShareVideo();
  const { mutate: saveVideo } = useSaveVideo();
  
  // Handlers for AidaVideoCard
  const handleLike = async (videoId: number) => {
    const video = videos.find(v => v.id === videoId);
    if (!video) return;
    
    const currentState = videoLikes[videoId] || { isLiked: video.is_liked, count: video.likes_count };
    const wasLiked = currentState.isLiked;
    
    // Optimistic update
    setVideoLikes(prev => ({
      ...prev,
      [videoId]: {
        isLiked: !wasLiked,
        count: wasLiked ? currentState.count - 1 : currentState.count + 1
      }
    }));
    
    try {
      if (wasLiked) {
        await apiClient.post(`/videos/${videoId}/unlike`);
      } else {
        await apiClient.post(`/videos/${videoId}/like`);
      }
    } catch {
      setVideoLikes(prev => ({
        ...prev,
        [videoId]: currentState
      }));
    }
  };
  
  const handleComment = (videoId: number) => {
    window.location.href = `/video/${videoId}#comments`;
  };
  
  const handleShare = async (videoId: number) => {
    try {
      shareVideo(videoId);
      if (navigator.share) {
        await navigator.share({
          title: 'Видео на MebelPlace',
          url: `${window.location.origin}/video/${videoId}`,
        });
      }
    } catch {}
  };
  
  const handleSave = async (videoId: number) => {
    try {
      saveVideo(videoId);
    } catch {}
  };
  
  const handleOrder = (videoId: number) => {
    window.location.href = `/video/${videoId}`;
  };

  // Infinite query for feed
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery<VideoFeedResponse>({
    queryKey: videoKeys.feed({ type: feedType, limit: 20 }),
    queryFn: async ({ pageParam = 0 }) => {
      const params = new URLSearchParams({
        limit: '20',
        offset: String(pageParam),
      });

      if (feedType === 'following') {
        params.set('subscriptions', 'true');
      } else if (feedType === 'ai') {
        params.set('ai', 'true');
      }

      const response = await apiClient.get('/videos/feed', {
        params: {
          page: Math.floor(Number(pageParam) / 20) + 1,
          limit: 20
        }
      });
      return response.data as VideoFeedResponse;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.has_more) return undefined;
      return allPages.length * 20;
    },
    initialPageParam: 0,
  });

  // Stories are now loaded via useStoryChannels hook

  // Keyboard navigation hint
  useEffect(() => {
    if (viewMode === 'vertical') {
      document.body.setAttribute('data-vertical-feed', 'true');
    } else {
      document.body.removeAttribute('data-vertical-feed');
    }
    return () => document.body.removeAttribute('data-vertical-feed');
  }, [viewMode]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Mark every 5th video as ad if not already marked
  const rawVideos = data?.pages.flatMap((page) => page.data) || [];
  const videos = rawVideos.map((video, index) => {
    // Every 5th position (4, 9, 14, 19...) mark as ad
    if ((index + 1) % 5 === 0 && !video.is_ad) {
      return { ...video, is_ad: true };
    }
    return video;
  });

  // Loading state
  if (isLoading) {
    return <FeedSkeleton />;
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[var(--color-surface)] rounded-2xl p-8 text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-[var(--color-error)]" />
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
            {t('errorTitle')}
          </h2>
          <p className="text-[var(--color-text-secondary)] mb-6">
            {error instanceof Error ? error.message : t('errorMessage')}
          </p>
          <Button onClick={() => refetch()} variant="primary">
            {t('tryAgain')}
          </Button>
        </div>
      </div>
    );
  }

  // If vertical mode, use VerticalVideoFeed
  if (viewMode === 'vertical' && videos.length > 0) {
    return (
      <div className="relative">
        {/* View mode toggle (floating) */}
        <button
          onClick={() => setViewMode('grid')}
          className="fixed top-4 right-4 z-50 bg-black/50 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black/70 transition-all"
          aria-label="Switch to grid view"
        >
          <Grid3x3 className="w-5 h-5" />
        </button>

        <VerticalVideoFeed 
          videos={videos}
          onLoadMore={() => hasNextPage && fetchNextPage()}
          hasMore={hasNextPage}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Skip to content link for accessibility */}
      <a
        href="#main-feed-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-[var(--color-accent)] focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg"
      >
        Перейти к ленте видео
      </a>

      {/* Header with Feed Type Tabs */}
      <div className="sticky top-0 z-10 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-2 py-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFeedType('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  feedType === 'all'
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)]'
                }`}
              >
                {t('tabs.all')}
              </button>
              <button
                onClick={() => setFeedType('following')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  feedType === 'following'
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)]'
                }`}
              >
                {t('tabs.following')}
              </button>
              <button
                onClick={() => setFeedType('ai')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  feedType === 'ai'
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)]'
                }`}
              >
                {t('tabs.recommended')}
              </button>
            </div>

            {/* View Mode Toggle */}
            <button
              onClick={() => setViewMode('vertical')}
              className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)] transition-all"
              aria-label="Switch to vertical view"
              title="Вертикальная лента (TikTok)"
            >
              <Rows className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Stories Bar */}
      {storyChannels.length > 0 && (
        <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)]">
          <div className="max-w-7xl mx-auto py-4">
            <StoriesBar 
              channels={storyChannels}
              onCreateStory={() => setShowCreateStory(true)}
            />
          </div>
        </div>
      )}

      {/* Video Grid */}
      <div id="main-feed-content" className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        {videos.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📹</div>
            <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
              {t('emptyState.title')}
            </h3>
            <p className="text-[var(--color-text-secondary)]">
              {t('emptyState.description')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {videos.filter(video => video && video.id).map((video: Video) => {
              if (video.is_ad) {
                const likeState = videoLikes[video.id] || { isLiked: video.is_liked, count: video.likes_count };
                const videoWithLikes = { ...video, is_liked: likeState.isLiked, likes_count: likeState.count };
                
                return (
                  <div key={video.id} className="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-4">
                    <AidaVideoCard
                      video={videoWithLikes}
                      onLike={() => handleLike(video.id)}
                      onComment={() => handleComment(video.id)}
                      onShare={() => handleShare(video.id)}
                      onSave={() => handleSave(video.id)}
                      onOrder={() => handleOrder(video.id)}
                    />
                  </div>
                );
              }
              return <VideoCard key={video.id} video={video} />;
            })}
          </div>
        )}

        {/* Load More Trigger */}
        <div ref={loadMoreRef} className="py-8 text-center">
          {isFetchingNextPage && <FeedSkeleton />}
          {!hasNextPage && videos.length > 0 && (
            <p className="text-[var(--color-text-secondary)]">
              {t('endOfFeed')}
            </p>
          )}
        </div>
      </div>

      {/* Create Story Modal */}
      {showCreateStory && (
        <CreateStoryModal
          isOpen={showCreateStory}
          onClose={() => setShowCreateStory(false)}
          onSuccess={() => {
            // Stories are refreshed automatically via useStoryChannels hook
          }}
        />
      )}
    </div>
  );
}






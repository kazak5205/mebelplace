'use client'

import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { VideoPlayer } from './VideoPlayer'
import { useVideoFeed } from '../hooks/useVideoFeed'

export function VideoFeed() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useVideoFeed()
  
  const { ref: loadMoreRef, inView } = useInView()
  
  // Load more when scroll to bottom
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load feed</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }
  
  const videos = data?.pages.flatMap((page) => page.videos) || []
  
  if (videos.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">No videos yet</p>
      </div>
    )
  }
  
  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth">
      {videos.map((video) => (
        <VideoPlayer key={video.id} video={video} />
      ))}
      
      {/* Load more trigger */}
      {hasNextPage && (
        <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
          {isFetchingNextPage && (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          )}
        </div>
      )}
    </div>
  )
}


/**
 * Custom hook for video feed with infinite scroll
 */

import { useInfiniteQuery } from '@tanstack/react-query'
import { getVideoFeed } from '../api/videoApi'

export function useVideoFeed() {
  return useInfiniteQuery({
    queryKey: ['video-feed'],
    queryFn: ({ pageParam }) => getVideoFeed(pageParam),
    getNextPageParam: (lastPage) => lastPage.next_cursor,
    initialPageParam: undefined as string | undefined,
  })
}


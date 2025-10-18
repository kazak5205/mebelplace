'use client'

import { useState, useEffect, useRef, useMemo } from 'react'

interface VirtualizedListProps<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  overscan?: number
  onEndReached?: () => void
  endReachedThreshold?: number
  className?: string
  loading?: boolean
  loadingComponent?: React.ReactNode
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 3,
  onEndReached,
  endReachedThreshold = 0.8,
  className = '',
  loading = false,
  loadingComponent
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const isScrollingRef = useRef(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout>()

  const totalHeight = items.length * itemHeight
  const visibleCount = Math.ceil(containerHeight / itemHeight)
  
  const { startIndex, endIndex, visibleItems } = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const end = Math.min(items.length - 1, start + visibleCount + overscan * 2)
    
    return {
      startIndex: start,
      endIndex: end,
      visibleItems: items.slice(start, end + 1)
    }
  }, [scrollTop, itemHeight, items, overscan, visibleCount])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop
    setScrollTop(scrollTop)
    
    isScrollingRef.current = true
    
    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }
    
    // Set scrolling to false after scroll ends
    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current = false
    }, 100)
    
    // Check if we're near the end
    const { scrollHeight, clientHeight } = e.currentTarget
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight
    
    if (scrollPercentage >= endReachedThreshold && onEndReached) {
      onEndReached()
    }
  }

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${startIndex * itemHeight}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{ height: itemHeight }}
              className="flex-shrink-0"
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
      
      {loading && (
        <div className="flex items-center justify-center py-4">
          {loadingComponent || (
            <div className="flex items-center space-x-2">
              <div className="loading-spinner w-4 h-4"></div>
              <span className="text-gray-400">Загрузка...</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Specialized virtualized list for chat messages
export function VirtualizedChatList<T>({
  messages,
  renderMessage,
  className = '',
  onLoadMore
}: {
  messages: T[]
  renderMessage: (message: T, index: number) => React.ReactNode
  className?: string
  onLoadMore?: () => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100
    setIsAtBottom(isNearBottom)
    
    // Load more messages when scrolled to top
    if (scrollTop === 0 && onLoadMore) {
      onLoadMore()
    }
  }

  // Auto-scroll to bottom when new messages arrive (if user is at bottom)
  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom()
    }
  }, [messages.length, isAtBottom])

  return (
    <div className={`relative ${className}`}>
      <div
        ref={containerRef}
        className="h-full overflow-y-auto"
        onScroll={handleScroll}
      >
        <div className="space-y-2 p-4">
          {messages.map((message, index) => (
            <div key={index}>
              {renderMessage(message, index)}
            </div>
          ))}
        </div>
      </div>
      
      {/* Scroll to bottom button */}
      {!isAtBottom && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-4 right-4 w-10 h-10 bg-[#FF6600] hover:bg-[#E55A00] rounded-full flex items-center justify-center shadow-lg transition-colors"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      )}
    </div>
  )
}

// Optimized grid virtualization for video thumbnails
export function VirtualizedGrid<T>({
  items,
  itemWidth,
  itemHeight,
  columnsCount,
  containerHeight,
  renderItem,
  gap = 8,
  className = ''
}: {
  items: T[]
  itemWidth: number
  itemHeight: number
  columnsCount: number
  containerHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  gap?: number
  className?: string
}) {
  const [scrollTop, setScrollTop] = useState(0)
  
  const rowHeight = itemHeight + gap
  const rowsCount = Math.ceil(items.length / columnsCount)
  const totalHeight = rowsCount * rowHeight
  const visibleRowsCount = Math.ceil(containerHeight / rowHeight)
  
  const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - 1)
  const endRow = Math.min(rowsCount - 1, startRow + visibleRowsCount + 2)
  
  const visibleItems = []
  for (let row = startRow; row <= endRow; row++) {
    for (let col = 0; col < columnsCount; col++) {
      const index = row * columnsCount + col
      if (index < items.length) {
        visibleItems.push({
          item: items[index],
          index,
          row,
          col
        })
      }
    }
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }

  return (
    <div
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index, row, col }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: row * rowHeight,
              left: col * (itemWidth + gap),
              width: itemWidth,
              height: itemHeight
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'

interface UseInViewOptions {
  threshold?: number | number[]
  root?: Element | null
  rootMargin?: string
  freezeOnceVisible?: boolean
}

export function useInView({
  threshold = 0,
  root = null,
  rootMargin = '0%',
  freezeOnceVisible = false
}: UseInViewOptions = {}) {
  const [inView, setInView] = useState(false)
  const [entry, setEntry] = useState<IntersectionObserverEntry>()
  const [node, setNode] = useState<Element | null>(null)

  const frozen = entry?.isIntersecting && freezeOnceVisible

  useEffect(() => {
    if (!node || frozen) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setEntry(entry)
        setInView(entry.isIntersecting)
      },
      { threshold, root, rootMargin }
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [node, threshold, root, rootMargin, frozen])

  const refCallback = (element: Element | null) => {
    setNode(element)
  }

  return { ref: refCallback, inView, entry }
}

// Optimized hook for video intersection
export function useVideoInView(
  options: UseInViewOptions & {
    onEnterView?: () => void
    onExitView?: () => void
  } = {}
) {
  const { onEnterView, onExitView, ...intersectionOptions } = options
  const { ref, inView, entry } = useInView({
    threshold: 0.5, // Video should be 50% visible
    ...intersectionOptions
  })
  
  const prevInView = useRef(inView)

  useEffect(() => {
    if (inView && !prevInView.current) {
      onEnterView?.()
    } else if (!inView && prevInView.current) {
      onExitView?.()
    }
    prevInView.current = inView
  }, [inView, onEnterView, onExitView])

  return { ref, inView, entry }
}

// Hook for preloading content before it becomes visible
export function usePreloadInView(
  preloadDistance = '100px'
) {
  return useInView({
    rootMargin: preloadDistance,
    threshold: 0
  })
}
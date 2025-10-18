/**
 * useMediaQuery - React hook for responsive media queries
 */

'use client';

import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const getMatches = () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  };

  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Update matches immediately (this runs on every render if mock changes)
    setMatches(media.matches);

    // Create listener for real changes
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener
    media.addEventListener('change', listener);

    // Cleanup
    return () => media.removeEventListener('change', listener);
  }, [query, getMatches]); // Add getMatches to deps to catch mock changes

  return matches;
}

// Predefined breakpoint hooks
export function useIsMobile() {
  return useMediaQuery('(max-width: 767px)');
}

export function useIsTablet() {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
}

export function useIsDesktop() {
  return useMediaQuery('(min-width: 1024px)');
}

export function useIsWidescreen() {
  return useMediaQuery('(min-width: 1440px)');
}


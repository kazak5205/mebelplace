'use client'

import { useState, useEffect } from 'react'
import { logger } from '@/lib/logger'

export function useOffline() {
  const [isOnline, setIsOnline] = useState(true)
  const [offlineData, setOfflineData] = useState<{
    videos: any[]
    requests: any[]
    chats: any[]
  }>({
    videos: [],
    requests: [],
    chats: []
  })

  useEffect(() => {
    // Check initial online status (only in browser)
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine)
    }

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true)
      // Sync offline data when coming back online
      syncOfflineData()
    }

    const handleOffline = () => {
      setIsOnline(false)
      // Load cached data when going offline
      loadCachedData()
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Load cached data on mount
    loadCachedData()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const loadCachedData = () => {
    try {
      const cachedVideos = localStorage.getItem('offline_videos')
      const cachedRequests = localStorage.getItem('offline_requests')
      const cachedChats = localStorage.getItem('offline_chats')

      setOfflineData({
        videos: cachedVideos ? JSON.parse(cachedVideos) : [],
        requests: cachedRequests ? JSON.parse(cachedRequests) : [],
        chats: cachedChats ? JSON.parse(cachedChats) : []
      })
    } catch (error) {
      logger.error('Error loading cached data', error instanceof Error ? error : new Error(String(error)))
    }
  }

  const cacheData = (key: string, data: any) => {
    try {
      localStorage.setItem(`offline_${key}`, JSON.stringify(data))
    } catch (error) {
      logger.error('Error caching data', error instanceof Error ? error : new Error(String(error)))
    }
  }

  const syncOfflineData = async () => {
    try {
      // Sync offline actions when coming back online
      const offlineActions = localStorage.getItem('offline_actions')
      if (offlineActions) {
        const actions = JSON.parse(offlineActions)
        
        // Process each offline action
        for (const action of actions) {
          try {
            await fetch(action.url, {
              method: action.method,
              headers: action.headers,
              body: action.body
            })
          } catch (error) {
            console.error('Error syncing offline action:', error)
          }
        }
        
        // Clear offline actions after sync
        localStorage.removeItem('offline_actions')
      }
    } catch (error) {
      console.error('Error syncing offline data:', error)
    }
  }

  const addOfflineAction = (action: {
    url: string
    method: string
    headers: any
    body?: string
  }) => {
    try {
      const existingActions = localStorage.getItem('offline_actions')
      const actions = existingActions ? JSON.parse(existingActions) : []
      
      actions.push({
        ...action,
        timestamp: Date.now()
      })
      
      localStorage.setItem('offline_actions', JSON.stringify(actions))
    } catch (error) {
      console.error('Error adding offline action:', error)
    }
  }

  const getOfflineData = (key: keyof typeof offlineData) => {
    return offlineData[key]
  }

  const updateOfflineData = (key: keyof typeof offlineData, data: any) => {
    setOfflineData(prev => ({
      ...prev,
      [key]: data
    }))
    cacheData(key, data)
  }

  return {
    isOnline,
    isOffline: !isOnline,
    offlineData,
    getOfflineData,
    updateOfflineData,
    addOfflineAction,
    cacheData
  }
}

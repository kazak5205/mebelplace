'use client'

export interface AnalyticsEvent {
  event: string
  properties?: Record<string, any>
  user_id?: string
  session_id: string
  timestamp: number
}

class Analytics {
  private static instance: Analytics
  private sessionId: string
  private userId?: string
  private eventQueue: AnalyticsEvent[] = []
  private isOnline = true

  private constructor() {
    this.sessionId = this.generateSessionId()
    this.setupEventListeners()
  }

  public static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics()
    }
    return Analytics.instance
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private setupEventListeners() {
    // Track page views
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        this.track('page_view', {
          page: window.location.pathname,
          referrer: document.referrer,
          user_agent: navigator.userAgent
        })
      })

      // Track online/offline status
      window.addEventListener('online', () => {
        this.isOnline = true
        this.flushEventQueue()
      })

      window.addEventListener('offline', () => {
        this.isOnline = false
      })

      // Track visibility changes
      document.addEventListener('visibilitychange', () => {
        this.track('visibility_change', {
          hidden: document.hidden
        })
      })
    }
  }

  public setUserId(userId: string) {
    this.userId = userId
  }

  public track(event: string, properties?: Record<string, any>) {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        page: window.location.pathname,
        url: window.location.href,
        ...properties, // properties после, чтобы не перезаписывать page
      },
      user_id: this.userId,
      session_id: this.sessionId,
      timestamp: Date.now()
    }

    this.eventQueue.push(analyticsEvent)

    // Send immediately if online
    if (this.isOnline) {
      this.sendEvent(analyticsEvent)
    }

    // Keep only last 100 events in memory
    if (this.eventQueue.length > 100) {
      this.eventQueue = this.eventQueue.slice(-100)
    }
  }

  private async sendEvent(event: AnalyticsEvent) {
    try {
      // Проверяем, не заблокирован ли запрос
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event)
      })
      
      if (!response.ok) {
        console.warn('Analytics request failed:', response.status)
      }
    } catch (error) {
      // Проверяем, не заблокирован ли запрос блокировщиками
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.warn('Analytics blocked by client (likely ad blocker)')
      } else {
        console.warn('Analytics error:', error)
      }
    }
  }

  private async flushEventQueue() {
    if (!this.isOnline || this.eventQueue.length === 0) return

    const eventsToSend = [...this.eventQueue]
    this.eventQueue = []

    for (const event of eventsToSend) {
      await this.sendEvent(event)
    }
  }

  // Specific tracking methods
  public trackVideoView(videoId: number, videoTitle: string) {
    this.track('video_view', {
      video_id: videoId,
      video_title: videoTitle
    })
  }

  public trackVideoLike(videoId: number, liked: boolean) {
    this.track('video_like', {
      video_id: videoId,
      liked
    })
  }

  public trackVideoShare(videoId: number, platform: string) {
    this.track('video_share', {
      video_id: videoId,
      platform
    })
  }

  public trackSearch(query: string, resultsCount: number) {
    this.track('search', {
      query,
      results_count: resultsCount
    })
  }

  public trackRequestCreate(requestId: number, category: string) {
    this.track('request_create', {
      request_id: requestId,
      category
    })
  }

  public trackUserRegistration(method: string) {
    this.track('user_registration', {
      method
    })
  }

  public trackUserLogin(method: string) {
    this.track('user_login', {
      method
    })
  }

  public trackStreamStart() {
    this.track('stream_start')
  }

  public trackVoiceMessage(duration: number) {
    this.track('voice_message', {
      duration
    })
  }
}

// Export singleton instance
export const analytics = Analytics.getInstance()

// Convenience functions
export const trackEvent = (event: string, properties?: Record<string, any>) => {
  analytics.track(event, properties)
}

export const trackVideoView = (videoId: number, videoTitle: string) => {
  analytics.trackVideoView(videoId, videoTitle)
}

export const trackVideoLike = (videoId: number, liked: boolean) => {
  analytics.trackVideoLike(videoId, liked)
}

export const trackSearch = (query: string, resultsCount: number) => {
  analytics.trackSearch(query, resultsCount)
}

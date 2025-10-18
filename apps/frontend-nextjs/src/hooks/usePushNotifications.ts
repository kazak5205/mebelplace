'use client'

import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'

interface PushNotificationState {
  permission: NotificationPermission
  supported: boolean
}

export function usePushNotifications() {
  const { user, isAuthenticated } = useAuth()
  const [permission, setPermission] = useState<PushNotificationState>({
    permission: 'default',
    supported: false
  })

  useEffect(() => {
    // Check if notifications are supported
    if ('Notification' in window) {
      setPermission({
        permission: Notification.permission,
        supported: true
      })
    }
  }, [])

  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission === 'denied') {
      console.warn('Notification permission denied')
      return false
    }

    try {
      const result = await Notification.requestPermission()
      setPermission({
        permission: result,
        supported: true
      })
      return result === 'granted'
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return false
    }
  }

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      })

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close()
      }, 5000)

      // Handle click
      notification.onclick = () => {
        window.focus()
        notification.close()
        
        // Navigate to relevant page based on notification
        if (options?.data?.url) {
          window.location.href = options.data.url
        }
      }

      return notification
    }
  }

  const subscribeToPushNotifications = async (): Promise<boolean> => {
    if (!isAuthenticated || !user) {
      console.warn('User must be authenticated to subscribe to push notifications')
      return false
    }

    const hasPermission = await requestPermission()
    if (!hasPermission) {
      return false
    }

    try {
      // Register service worker
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/sw.js')
        console.log('Service Worker registered:', registration)

        // Subscribe to push notifications
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        })

        // Send subscription to server
        const token = localStorage.getItem('access_token')
        const response = await fetch('/api/v2/notifications/subscribe', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            subscription: subscription.toJSON()
          })
        })

        if (response.ok) {
          console.log('Successfully subscribed to push notifications')
          return true
        } else {
          console.error('Failed to subscribe to push notifications')
          return false
        }
      } else {
        console.warn('Service Worker not supported')
        return false
      }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
      return false
    }
  }

  const unsubscribeFromPushNotifications = async (): Promise<boolean> => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration()
        
        if (registration) {
          const subscription = await registration.pushManager.getSubscription()
          
          if (subscription) {
            await subscription.unsubscribe()
            
            // Notify server
            const token = localStorage.getItem('access_token')
            await fetch('/api/v2/notifications/unsubscribe', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                subscription: subscription.toJSON()
              })
            })
            
            console.log('Successfully unsubscribed from push notifications')
            return true
          }
        }
      }
      return false
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error)
      return false
    }
  }

  // Show notification for different events
  const showChatNotification = (message: string, sender: string, chatId: number) => {
    showNotification(`Новое сообщение от ${sender}`, {
      body: message,
      tag: `chat-${chatId}`,
      data: { url: `/chats?chat=${chatId}` }
    })
  }

  const showRequestNotification = (title: string, description: string, requestId: number) => {
    showNotification(`Новая заявка: ${title}`, {
      body: description,
      tag: `request-${requestId}`,
      data: { url: `/requests/${requestId}` }
    })
  }

  const showLikeNotification = (videoTitle: string, liker: string) => {
    showNotification(`${liker} поставил лайк`, {
      body: videoTitle,
      tag: `like-${Date.now()}`,
      data: { url: '/profile' }
    })
  }

  return {
    permission,
    requestPermission,
    showNotification,
    subscribeToPushNotifications,
    unsubscribeFromPushNotifications,
    showChatNotification,
    showRequestNotification,
    showLikeNotification
  }
}

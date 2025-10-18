'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiService } from '@/services/api'

import toast from 'react-hot-toast'

interface SearchResult {
  id: number
  type: 'video' | 'channel' | 'user'
  title: string
  description?: string
  thumbnail?: string
  author?: string
  views?: number
  followers?: number
}

interface UseApiOptions {
  immediate?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
  showToast?: boolean
}

export function useApi<T = any>(
  apiCall: () => Promise<T>,
  options: UseApiOptions = {}
) {
  const { immediate = false, onSuccess, onError, showToast = true } = options
  
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>(null)

  const execute = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiCall()
      setData(result)
      onSuccess?.(result)
      return result
    } catch (err) {
      setError(err)
      onError?.(err)
      if (showToast) {
        toast.error(err instanceof Error ? err.message : 'Произошла ошибка')
      }
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiCall, onSuccess, onError, showToast])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [immediate, execute])

  return {
    data,
    loading,
    error,
    execute,
    refetch: execute,
  }
}

// Хуки для конкретных API вызовов
export function useVideos(params?: {
  page?: number
  limit?: number
  search?: string
  channel_id?: number
}) {
  return useApi(() => apiService.getVideos(params), { immediate: true })
}

export function useVideo(id: number) {
  return useApi(() => apiService.getVideo(id), { immediate: !!id })
}

export function useRequests() {
  return useApi(() => apiService.getRequests(), { immediate: true })
}

export function useOrders() {
  return useApi(() => apiService.getOrders(), { immediate: true })
}

export function useSubscriptions() {
  return useApi(() => apiService.getSubscriptions(), { immediate: true })
}

export function useGroupChats() {
  return useApi(() => apiService.getGroupChats(), { immediate: true })
}

export function useNotifications() {
  return useApi(() => apiService.getNotifications(), { immediate: true })
}

export function useUserStats() {
  return useApi(() => apiService.getUserStats(), { immediate: true })
}

export function useAchievements() {
  return useApi(() => apiService.getAchievements(), { immediate: true })
}

export function useLeaderboard() {
  return useApi(() => apiService.getLeaderboard(), { immediate: true })
}

export function useRegions() {
  return useApi(() => apiService.getRegions(), { immediate: true })
}

export function usePublicAds() {
  return useApi(() => apiService.getPublicAds(), { immediate: true })
}

// Хуки для мутаций (создание, обновление, удаление)
export function useCreateRequest() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>(null)

  const createRequest = useCallback(async (data: {
    title: string
    description: string
    category: string
    budget?: number
    timeline?: string
    location?: string
  }) => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiService.createRequest(data)
      toast.success('Заявка создана успешно')
      return result
    } catch (err) {
      setError(err)
      toast.error('Ошибка создания заявки')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { createRequest, loading, error }
}

export function useCreateOrder() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>(null)

  const createOrder = useCallback(async (data: any) => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiService.createOrder(data)
      toast.success('Заказ создан успешно')
      return result
    } catch (err) {
      setError(err)
      toast.error('Ошибка создания заказа')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { createOrder, loading, error }
}

export function useLikeVideo() {
  const [loading, setLoading] = useState(false)

  const likeVideo = useCallback(async (id: number) => {
    try {
      setLoading(true)
      await apiService.likeVideo(id)
      toast.success('Видео добавлено в лайки')
    } catch (err) {
      toast.error('Ошибка добавления в лайки')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const unlikeVideo = useCallback(async (id: number) => {
    try {
      setLoading(true)
      await apiService.unlikeVideo(id)
      toast.success('Видео убрано из лайков')
    } catch (err) {
      toast.error('Ошибка удаления из лайков')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { likeVideo, unlikeVideo, loading }
}

export function useFavoriteVideo() {
  const [loading, setLoading] = useState(false)

  const favoriteVideo = useCallback(async (id: number) => {
    try {
      setLoading(true)
      await apiService.favoriteVideo(id)
      toast.success('Видео добавлено в избранное')
    } catch (err) {
      toast.error('Ошибка добавления в избранное')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const unfavoriteVideo = useCallback(async (id: number) => {
    try {
      setLoading(true)
      await apiService.unfavoriteVideo(id)
      toast.success('Видео убрано из избранного')
    } catch (err) {
      toast.error('Ошибка удаления из избранного')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { favoriteVideo, unfavoriteVideo, loading }
}

export function useSubscribe() {
  const [loading, setLoading] = useState(false)

  const subscribe = useCallback(async (masterId: number) => {
    try {
      setLoading(true)
      await apiService.subscribe(masterId)
      toast.success('Подписка оформлена')
    } catch (err) {
      toast.error('Ошибка оформления подписки')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const unsubscribe = useCallback(async (masterId: number) => {
    try {
      setLoading(true)
      await apiService.unsubscribe(masterId)
      toast.success('Подписка отменена')
    } catch (err) {
      toast.error('Ошибка отмены подписки')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { subscribe, unsubscribe, loading }
}

export function useSendMessage() {
  const [loading, setLoading] = useState(false)

  const sendMessage = useCallback(async (chatId: number, content: string) => {
    try {
      setLoading(true)
      const result = await apiService.sendMessage(chatId, content)
      return result
    } catch (err) {
      toast.error('Ошибка отправки сообщения')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { sendMessage, loading }
}

export function useSearch() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])

  const search = useCallback(async (query: string, type: 'videos' | 'channels' | 'users') => {
    if (!query.trim()) {
      setResults([])
      return
    }

    try {
      setLoading(true)
      let result
      
      switch (type) {
        case 'videos':
          result = await apiService.searchVideos(query)
          break
        case 'channels':
          result = await apiService.searchChannels(query)
          break
        case 'users':
          result = await apiService.searchUsers(query)
          break
        default:
          throw new Error('Неизвестный тип поиска')
      }
      
      setResults(result.data || result)
    } catch (err) {
      toast.error('Ошибка поиска')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  return { search, results, loading }
}

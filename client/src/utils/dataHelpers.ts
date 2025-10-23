import { Video, Order, User } from '../types'

/**
 * Форматировать размер файла
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Форматировать длительность видео
 */
export const formatVideoDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
}

/**
 * Обрезать текст до определенной длины
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Генерировать инициалы пользователя
 */
export const getUserInitials = (user: User | null): string => {
  if (!user) return 'U'
  
  const firstName = (user as any).first_name || user.name || ''
  const lastName = (user as any).last_name || ''
  
  if (firstName && lastName) {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase()
  } else if (firstName) {
    return firstName.charAt(0).toUpperCase()
  } else if ((user as any).username) {
    return (user as any).username.charAt(0).toUpperCase()
  }
  
  return 'U'
}

/**
 * Получить аватар пользователя или placeholder
 */
export const getUserAvatar = (user: User | null): string => {
  if (user?.avatar) {
    return user.avatar
  }
  
  // Генерируем цветной placeholder на основе имени
  const initials = getUserInitials(user)
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
  ]
  
  const colorIndex = (user?.id?.charCodeAt(0) || 0) % colors.length
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" fill="${colors[colorIndex].replace('bg-', '#')}"/>
      <text x="20" y="26" text-anchor="middle" fill="white" font-family="Arial" font-size="16" font-weight="bold">
        ${initials}
      </text>
    </svg>
  `)}`
}

/**
 * Сортировать видео по дате
 */
export const sortVideosByDate = (videos: Video[], ascending: boolean = false): Video[] => {
  return [...videos].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime()
    const dateB = new Date(b.createdAt).getTime()
    return ascending ? dateA - dateB : dateB - dateA
  })
}

/**
 * Сортировать заказы по приоритету
 */
export const sortOrdersByPriority = (orders: Order[]): Order[] => {
  return [...orders].sort((a, b) => {
    // Сначала по статусу
    const statusPriority = {
      'pending': 1,
      'accepted': 2,
      'in_progress': 3,
      'completed': 4,
      'cancelled': 5
    }
    
    const aPriority = statusPriority[a.status as keyof typeof statusPriority] || 999
    const bPriority = statusPriority[b.status as keyof typeof statusPriority] || 999
    
    if (aPriority !== bPriority) {
      return aPriority - bPriority
    }
    
    // Затем по дате создания (новые сверху)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

/**
 * Фильтровать видео по категории
 */
export const filterVideosByCategory = (videos: Video[], category: string): Video[] => {
  if (!category || category === 'all') return videos
  return videos.filter(video => (video as any).category === category)
}

/**
 * Поиск по видео
 */
export const searchVideos = (videos: Video[], query: string): Video[] => {
  if (!query.trim()) return videos
  
  const lowercaseQuery = query.toLowerCase()
  return videos.filter(video => 
    video.title.toLowerCase().includes(lowercaseQuery) ||
    video.description.toLowerCase().includes(lowercaseQuery) ||
    (video as any).author_name?.toLowerCase().includes(lowercaseQuery)
  )
}

/**
 * Поиск по заказам
 */
export const searchOrders = (orders: Order[], query: string): Order[] => {
  if (!query.trim()) return orders
  
  const lowercaseQuery = query.toLowerCase()
  return orders.filter(order => 
    order.title.toLowerCase().includes(lowercaseQuery) ||
    order.description.toLowerCase().includes(lowercaseQuery) ||
    (order as any).category?.toLowerCase().includes(lowercaseQuery) ||
    (order as any).client_name?.toLowerCase().includes(lowercaseQuery)
  )
}

/**
 * Группировать заказы по статусу
 */
export const groupOrdersByStatus = (orders: Order[]): Record<string, Order[]> => {
  return orders.reduce((groups, order) => {
    const status = order.status
    if (!groups[status]) {
      groups[status] = []
    }
    groups[status].push(order)
    return groups
  }, {} as Record<string, Order[]>)
}

/**
 * Получить статистику заказов
 */
export const getOrderStats = (orders: Order[]) => {
  const stats = {
    total: orders.length,
    pending: 0,
    accepted: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0
  }
  
  orders.forEach(order => {
    stats[order.status as keyof typeof stats]++
  })
  
  return stats
}

/**
 * Валидировать номер телефона
 */
export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^(\+7|8)[\d\s\-\(\)]{10,}$/
  return phoneRegex.test(phone)
}

/**
 * Форматировать номер телефона
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.startsWith('8')) {
    return `+7${cleaned.substring(1)}`
  } else if (cleaned.startsWith('7')) {
    return `+${cleaned}`
  }
  
  return phone
}

/**
 * Генерировать уникальный ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9)
}

/**
 * Дебаунс функция
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: any
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Проверить, является ли устройство мобильным
 */
export const isMobile = (): boolean => {
  return window.innerWidth <= 768
}

/**
 * Получить размер экрана
 */
export const getScreenSize = (): 'mobile' | 'tablet' | 'desktop' => {
  const width = window.innerWidth
  
  if (width <= 768) return 'mobile'
  if (width <= 1024) return 'tablet'
  return 'desktop'
}

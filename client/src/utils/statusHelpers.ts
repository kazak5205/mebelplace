import { ORDER_STATUSES, OrderStatus, ORDER_STATUS_LABELS, CLIENT_ORDER_STATUS_LABELS } from './constants'

/**
 * Получить цвет статуса заказа
 */
export const getOrderStatusColor = (status: OrderStatus): string => {
  const colors = {
    [ORDER_STATUSES.PENDING]: 'bg-yellow-500',
    [ORDER_STATUSES.ACCEPTED]: 'bg-blue-500',
    [ORDER_STATUSES.IN_PROGRESS]: 'bg-orange-500',
    [ORDER_STATUSES.COMPLETED]: 'bg-green-500',
    [ORDER_STATUSES.CANCELLED]: 'bg-red-500'
  }
  
  return colors[status] || 'bg-gray-500'
}

/**
 * Получить текст статуса заказа
 */
export const getOrderStatusText = (status: OrderStatus, userRole: 'client' | 'master' | 'admin'): string => {
  if (userRole === 'client') {
    return CLIENT_ORDER_STATUS_LABELS[status] || status
  }
  
  return ORDER_STATUS_LABELS[status] || status
}

/**
 * Проверить, можно ли отменить заказ
 */
export const canCancelOrder = (status: OrderStatus): boolean => {
  return [ORDER_STATUSES.PENDING, ORDER_STATUSES.ACCEPTED].includes(status as any)
}

/**
 * Проверить, можно ли принять заказ
 */
export const canAcceptOrder = (status: OrderStatus): boolean => {
  return status === ORDER_STATUSES.PENDING
}

/**
 * Проверить, можно ли завершить заказ
 */
export const canCompleteOrder = (status: OrderStatus): boolean => {
  return status === ORDER_STATUSES.IN_PROGRESS
}

/**
 * Проверить, можно ли откликнуться на заказ
 */
export const canRespondToOrder = (status: OrderStatus): boolean => {
  return status === ORDER_STATUSES.PENDING
}

/**
 * Получить следующий статус заказа
 */
export const getNextOrderStatus = (currentStatus: OrderStatus): OrderStatus | null => {
  const statusFlow: Record<string, OrderStatus> = {
    [ORDER_STATUSES.PENDING]: ORDER_STATUSES.ACCEPTED,
    [ORDER_STATUSES.ACCEPTED]: ORDER_STATUSES.IN_PROGRESS,
    [ORDER_STATUSES.IN_PROGRESS]: ORDER_STATUSES.COMPLETED
  }
  
  return statusFlow[currentStatus] || null
}

/**
 * Получить иконку статуса заказа
 */
export const getOrderStatusIcon = (status: OrderStatus): string => {
  const icons = {
    [ORDER_STATUSES.PENDING]: '⏳',
    [ORDER_STATUSES.ACCEPTED]: '✅',
    [ORDER_STATUSES.IN_PROGRESS]: '🔄',
    [ORDER_STATUSES.COMPLETED]: '🎉',
    [ORDER_STATUSES.CANCELLED]: '❌'
  }
  
  return icons[status] || '❓'
}

/**
 * Проверить, активен ли заказ
 */
export const isOrderActive = (status: OrderStatus): boolean => {
  return [ORDER_STATUSES.PENDING, ORDER_STATUSES.ACCEPTED, ORDER_STATUSES.IN_PROGRESS].includes(status as any)
}

/**
 * Получить приоритет статуса для сортировки
 */
export const getOrderStatusPriority = (status: OrderStatus): number => {
  const priorities = {
    [ORDER_STATUSES.PENDING]: 1,
    [ORDER_STATUSES.ACCEPTED]: 2,
    [ORDER_STATUSES.IN_PROGRESS]: 3,
    [ORDER_STATUSES.COMPLETED]: 4,
    [ORDER_STATUSES.CANCELLED]: 5
  }
  
  return priorities[status] || 999
}

/**
 * Форматировать дату создания заказа
 */
export const formatOrderDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) {
    return 'Только что'
  } else if (diffInHours < 24) {
    return `${diffInHours} ч. назад`
  } else if (diffInHours < 48) {
    return 'Вчера'
  } else {
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }
}

import { pluralizeResponses } from './pluralize'

/**
 * Получить статус заказа по количеству откликов
 */
export const getOrderStatusByResponses = (responsesCount: number, hasAcceptedResponse: boolean): string => {
  if (hasAcceptedResponse) {
    return 'Принят'
  }
  return pluralizeResponses(responsesCount || 0)
}

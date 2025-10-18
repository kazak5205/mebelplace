'use client'

import { useState } from 'react'
import { Order, ordersApi } from '../api/ordersApi'

interface OrderActionsProps {
  order: Order
  userRole: 'user' | 'master'
  onUpdate: () => void
}

export const OrderActions: React.FC<OrderActionsProps> = ({ order, userRole, onUpdate }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleAction = async (action: () => Promise<any>, successMsg: string) => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      await action()
      setSuccess(successMsg)
      setTimeout(() => onUpdate(), 1000)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Произошла ошибка')
    } finally {
      setLoading(false)
    }
  }

  const renderUserActions = () => {
    if (order.status === 'pending') {
      return (
        <>
          <button
            onClick={() => handleAction(() => ordersApi.payOrder(order.id), 'Заказ оплачен! Средства в эскроу.')}
            disabled={loading}
            className="flex-1 py-3 px-6 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            💳 Оплатить заказ
          </button>
          <button
            onClick={() => handleAction(() => ordersApi.cancelOrder(order.id), 'Заказ отменён')}
            disabled={loading}
            className="flex-1 py-3 px-6 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
          >
            ✗ Отменить
          </button>
        </>
      )
    }

    if (order.status === 'paid') {
      return (
        <button
          onClick={() => handleAction(() => ordersApi.cancelOrder(order.id), 'Заказ отменён, средства возвращены')}
          disabled={loading}
          className="flex-1 py-3 px-6 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          ✗ Отменить и вернуть деньги
        </button>
      )
    }

    if (order.status === 'review') {
      return (
        <>
          <button
            onClick={() => handleAction(() => ordersApi.approveOrder(order.id), 'Работа одобрена! Деньги переведены мастеру.')}
            disabled={loading}
            className="flex-1 py-3 px-6 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            ✓ Одобрить и завершить
          </button>
          <button
            onClick={() => handleAction(() => ordersApi.openDispute(order.id), 'Спор открыт. Администратор свяжется с вами.')}
            disabled={loading}
            className="flex-1 py-3 px-6 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            ⚠️ Открыть спор
          </button>
        </>
      )
    }

    if (order.status === 'in_progress') {
      return (
        <button
          onClick={() => handleAction(() => ordersApi.openDispute(order.id), 'Спор открыт')}
          disabled={loading}
          className="flex-1 py-3 px-6 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          ⚠️ Открыть спор
        </button>
      )
    }

    return null
  }

  const renderMasterActions = () => {
    if (order.status === 'paid') {
      return (
        <button
          onClick={() => handleAction(() => ordersApi.acceptOrder(order.id), 'Заказ принят!')}
          disabled={loading}
          className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          ✓ Принять заказ
        </button>
      )
    }

    if (order.status === 'accepted') {
      return (
        <button
          onClick={() => handleAction(() => ordersApi.startWork(order.id), 'Работа начата!')}
          disabled={loading}
          className="flex-1 py-3 px-6 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          🚀 Начать работу
        </button>
      )
    }

    if (order.status === 'in_progress') {
      return (
        <>
          <button
            onClick={() => handleAction(() => ordersApi.completeOrder(order.id), 'Работа завершена! Ожидайте проверки клиента.')}
            disabled={loading}
            className="flex-1 py-3 px-6 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            ✓ Завершить работу
          </button>
          <button
            onClick={() => handleAction(() => ordersApi.openDispute(order.id), 'Спор открыт')}
            disabled={loading}
            className="flex-1 py-3 px-6 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            ⚠️ Открыть спор
          </button>
        </>
      )
    }

    return null
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {success}
        </div>
      )}

      <div className="flex gap-3">
        {userRole === 'user' ? renderUserActions() : renderMasterActions()}
      </div>

      {loading && (
        <div className="text-center text-gray-500">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2">Обработка...</p>
        </div>
      )}
    </div>
  )
}


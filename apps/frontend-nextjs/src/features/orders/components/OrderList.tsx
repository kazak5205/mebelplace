'use client'

import Link from 'next/link'
import { Order } from '../api/ordersApi'

interface OrderListProps {
  orders: Order[]
}

const statusLabels: Record<Order['status'], string> = {
  pending: 'Ожидает оплаты',
  paid: 'Оплачен (эскроу)',
  accepted: 'Принят мастером',
  in_progress: 'В работе',
  review: 'На проверке',
  completed: 'Завершён',
  cancelled: 'Отменён',
  dispute: 'Спор',
}

const statusColors: Record<Order['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  paid: 'bg-blue-100 text-blue-800 border-blue-200',
  accepted: 'bg-green-100 text-green-800 border-green-200',
  in_progress: 'bg-purple-100 text-purple-800 border-purple-200',
  review: 'bg-orange-100 text-orange-800 border-orange-200',
  completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
  dispute: 'bg-red-100 text-red-800 border-red-200',
}

export const OrderList: React.FC<OrderListProps> = ({ orders }) => {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">У вас пока нет заказов</p>
        <p className="text-gray-400 mt-2">Заказы создаются после принятия предложения</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/orders/${order.id}`}
          className="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100"
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {Number(order.price).toLocaleString('ru-RU')} ₸
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Заказ #{order.id.slice(0, 8)}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${statusColors[order.status]}`}>
              {statusLabels[order.status]}
            </span>
          </div>

          {/* Description */}
          <p className="text-gray-700 mb-4 line-clamp-2">{order.description}</p>

          {/* Info row */}
          <div className="flex flex-wrap gap-3 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-lg">⏰</span>
              <span>До: {new Date(order.deadline).toLocaleDateString('ru-RU')}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-lg">📅</span>
              <span>Создан: {new Date(order.created_at).toLocaleDateString('ru-RU')}</span>
            </div>
            {order.completed_at && (
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-lg">✅</span>
                <span>Завершён: {new Date(order.completed_at).toLocaleDateString('ru-RU')}</span>
              </div>
            )}
          </div>

          {/* Escrow indicator */}
          {(order.status === 'paid' || 
            order.status === 'accepted' || 
            order.status === 'in_progress' || 
            order.status === 'review' ||
            order.status === 'dispute') && (
            <div className="mt-4 flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-lg">🔒</span>
              <span className="text-sm text-blue-800 font-medium">
                Средства в эскроу (защищены)
              </span>
            </div>
          )}
        </Link>
      ))}
    </div>
  )
}


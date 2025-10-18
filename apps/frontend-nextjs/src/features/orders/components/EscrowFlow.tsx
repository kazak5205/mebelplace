'use client'

import { Order } from '../api/ordersApi'

interface EscrowFlowProps {
  order: Order
}

const steps = [
  { status: 'pending', label: 'Создан', icon: '📝' },
  { status: 'paid', label: 'Оплачен (эскроу)', icon: '💰' },
  { status: 'accepted', label: 'Принят мастером', icon: '✓' },
  { status: 'in_progress', label: 'В работе', icon: '🔨' },
  { status: 'review', label: 'На проверке', icon: '👁️' },
  { status: 'completed', label: 'Завершён', icon: '🎉' },
]

export const EscrowFlow: React.FC<EscrowFlowProps> = ({ order }) => {
  const getCurrentStepIndex = () => {
    if (order.status === 'cancelled') return -1
    if (order.status === 'dispute') return -1
    return steps.findIndex(s => s.status === order.status)
  }

  const currentStepIndex = getCurrentStepIndex()

  if (order.status === 'cancelled') {
    return (
      <div className="p-6 bg-gray-50 rounded-xl border-2 border-gray-200">
        <div className="text-center">
          <span className="text-4xl">🚫</span>
          <p className="mt-2 text-lg font-semibold text-gray-700">Заказ отменён</p>
          <p className="mt-1 text-sm text-gray-500">Средства возвращены (если были в эскроу)</p>
        </div>
      </div>
    )
  }

  if (order.status === 'dispute') {
    return (
      <div className="p-6 bg-orange-50 rounded-xl border-2 border-orange-200">
        <div className="text-center">
          <span className="text-4xl">⚠️</span>
          <p className="mt-2 text-lg font-semibold text-orange-700">Открыт спор</p>
          <p className="mt-1 text-sm text-orange-600">
            Средства в эскроу. Администратор рассмотрит ситуацию.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200">
      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
        🔒 Escrow Flow - Защита сделки
      </h3>

      <div className="relative">
        {/* Progress line */}
        <div className="absolute top-6 left-6 right-6 h-1 bg-gray-200 rounded-full">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = index < currentStepIndex
            const isCurrent = index === currentStepIndex
            const isFuture = index > currentStepIndex

            return (
              <div key={step.status} className="flex flex-col items-center flex-1">
                {/* Icon */}
                <div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center text-xl
                    transition-all duration-300 z-10
                    ${isCompleted ? 'bg-green-500 shadow-lg scale-110' : ''}
                    ${isCurrent ? 'bg-blue-500 shadow-xl scale-125 animate-pulse' : ''}
                    ${isFuture ? 'bg-gray-200' : ''}
                  `}
                >
                  {isCompleted ? '✓' : step.icon}
                </div>

                {/* Label */}
                <p
                  className={`
                    mt-3 text-xs text-center font-medium
                    ${isCompleted ? 'text-green-700' : ''}
                    ${isCurrent ? 'text-blue-700 font-bold' : ''}
                    ${isFuture ? 'text-gray-400' : ''}
                  `}
                >
                  {step.label}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Escrow info */}
      {(order.status === 'paid' || 
        order.status === 'accepted' || 
        order.status === 'in_progress' || 
        order.status === 'review') && (
        <div className="mt-6 p-4 bg-white rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🛡️</span>
            <div>
              <p className="font-semibold text-gray-900">Средства защищены</p>
              <p className="text-sm text-gray-600 mt-1">
                {Number(order.price).toLocaleString('ru-RU')} ₸ находятся в эскроу до завершения работы
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


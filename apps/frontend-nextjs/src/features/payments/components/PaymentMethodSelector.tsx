'use client'

import { useState } from 'react'
import Image from 'next/image'

interface PaymentMethodSelectorProps {
  amount: string
  walletBalance?: string
  onSelectMethod: (method: 'kaspi' | 'paybox' | 'wallet') => void
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  amount,
  walletBalance = '0',
  onSelectMethod,
}) => {
  const [selected, setSelected] = useState<'kaspi' | 'paybox' | 'wallet'>('kaspi')

  const methods = [
    {
      id: 'kaspi' as const,
      name: 'Kaspi.kz',
      description: 'Оплата через Kaspi',
      icon: '🏦',
      available: true,
    },
    {
      id: 'paybox' as const,
      name: 'Paybox',
      description: 'Банковские карты',
      icon: '💳',
      available: true,
    },
    {
      id: 'wallet' as const,
      name: 'Мой кошелёк',
      description: `Баланс: ${Number(walletBalance).toLocaleString('ru-RU')} ₸`,
      icon: '👛',
      available: Number(walletBalance) >= Number(amount),
    },
  ]

  const handleSelect = (methodId: typeof selected) => {
    setSelected(methodId)
    onSelectMethod(methodId)
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900">Выберите способ оплаты</h3>
      
      {methods.map((method) => (
        <button
          key={method.id}
          onClick={() => handleSelect(method.id)}
          disabled={!method.available}
          className={`
            w-full p-4 rounded-xl border-2 text-left transition-all
            ${selected === method.id
              ? 'border-blue-500 bg-blue-50 shadow-md'
              : 'border-gray-200 hover:border-gray-300'
            }
            ${!method.available
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer hover:shadow-sm'
            }
          `}
        >
          <div className="flex items-center gap-4">
            <div className="text-4xl">{method.icon}</div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900">{method.name}</div>
              <div className="text-sm text-gray-600">{method.description}</div>
            </div>
            {selected === method.id && (
              <div className="text-blue-500 text-2xl">✓</div>
            )}
            {!method.available && (
              <div className="text-red-500 text-sm">Недостаточно средств</div>
            )}
          </div>
        </button>
      ))}

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center text-lg">
          <span className="font-medium text-gray-700">К оплате:</span>
          <span className="font-bold text-gray-900">
            {Number(amount).toLocaleString('ru-RU')} ₸
          </span>
        </div>
      </div>
    </div>
  )
}


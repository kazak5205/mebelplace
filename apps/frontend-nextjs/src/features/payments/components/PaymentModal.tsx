'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { paymentsApi, CreatePaymentDTO } from '../api/paymentsApi'
import { PaymentMethodSelector } from './PaymentMethodSelector'
import { useWalletBalance } from '../hooks/useWallet'
// import { div className="glass-card" } from '@/components/ui/div className="glass-card"'

interface PaymentModalProps {
  amount: string
  orderId?: string
  onSuccess: () => void
  onClose: () => void
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  amount,
  orderId,
  onSuccess,
  onClose,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'kaspi' | 'paybox' | 'wallet'>('kaspi')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { formatted: walletBalance, isLoading: walletLoading } = useWalletBalance()

  const handlePay = async () => {
    setLoading(true)
    setError(null)

    try {
      const dto: CreatePaymentDTO = {
        provider: selectedMethod,
        amount,
        order_id: orderId,
      }

      const payment = await paymentsApi.createPayment(dto)

      if (selectedMethod === 'wallet') {
        // Direct wallet payment - completed immediately
        onSuccess()
      } else if (payment.payment_url) {
        // Redirect to payment provider
        window.location.href = payment.payment_url
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка при создании платежа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Оплата заказа</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <PaymentMethodSelector
          amount={amount}
          walletBalance={walletLoading ? 'Загрузка...' : walletBalance}
          onSelectMethod={setSelectedMethod}
        />

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-6 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handlePay}
            disabled={loading}
            className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Обработка...' : 'Оплатить'}
          </button>
        </div>

        <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
          🔒 Безопасная оплата через проверенных провайдеров
        </div>
      </div>
    </div>
  )
}


'use client'

import { Transaction } from '../api/paymentsApi'

interface TransactionListProps {
  transactions: Transaction[]
}

const typeLabels: Record<Transaction['type'], string> = {
  deposit: 'Пополнение',
  withdraw: 'Вывод средств',
  escrow_lock: 'Эскроу (блокировка)',
  escrow_release: 'Эскроу (выплата)',
  escrow_refund: 'Эскроу (возврат)',
}

const typeIcons: Record<Transaction['type'], string> = {
  deposit: '💰',
  withdraw: '📤',
  escrow_lock: '🔒',
  escrow_release: '✅',
  escrow_refund: '↩️',
}

const typeColors: Record<Transaction['type'], string> = {
  deposit: 'text-green-600',
  withdraw: 'text-red-600',
  escrow_lock: 'text-blue-600',
  escrow_release: 'text-green-600',
  escrow_refund: 'text-orange-600',
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Нет транзакций</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">История транзакций</h3>
      
      {transactions.map((tx) => (
        <div
          key={tx.id}
          className="p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="text-2xl">{typeIcons[tx.type]}</div>
              <div>
                <p className="font-medium text-gray-900">{typeLabels[tx.type]}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(tx.created_at).toLocaleString('ru-RU')}
                </p>
                {tx.order_id && (
                  <p className="text-xs text-blue-600 mt-1">
                    Заказ #{tx.order_id.slice(0, 8)}
                  </p>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <p className={`text-lg font-bold ${typeColors[tx.type]}`}>
                {tx.type === 'withdraw' ? '-' : '+'}
                {Number(tx.amount).toLocaleString('ru-RU')} ₸
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}


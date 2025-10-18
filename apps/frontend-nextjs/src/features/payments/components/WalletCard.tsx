'use client'

import { Wallet } from '../api/paymentsApi'

interface WalletCardProps {
  wallet: Wallet
}

export const WalletCard: React.FC<WalletCardProps> = ({ wallet }) => {
  const totalBalance = Number(wallet.balance) + Number(wallet.escrow_balance)

  return (
    <div className="p-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg text-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-blue-100 text-sm mb-1">Доступный баланс</p>
          <p className="text-4xl font-bold">
            {Number(wallet.balance).toLocaleString('ru-RU')} ₸
          </p>
        </div>
        <div className="text-5xl">👛</div>
      </div>

      <div className="pt-4 border-t border-white/20">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-blue-100 text-xs mb-1">В эскроу</p>
            <p className="text-lg font-semibold">
              {Number(wallet.escrow_balance).toLocaleString('ru-RU')} ₸
            </p>
          </div>
          <div className="text-right">
            <p className="text-blue-100 text-xs mb-1">Всего</p>
            <p className="text-lg font-semibold">
              {totalBalance.toLocaleString('ru-RU')} ₸
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button className="flex-1 py-2 bg-white/20 backdrop-blur rounded-lg font-medium hover:bg-white/30 transition-colors">
          + Пополнить
        </button>
        <button className="flex-1 py-2 bg-white/20 backdrop-blur rounded-lg font-medium hover:bg-white/30 transition-colors">
          ↓ Вывести
        </button>
      </div>
    </div>
  )
}


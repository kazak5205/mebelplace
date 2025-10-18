import { apiClient } from '@/lib/api/client'

export interface Payment {
  id: string
  user_id: string
  order_id?: string
  provider: 'kaspi' | 'paybox' | 'wallet'
  amount: string
  currency: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
  provider_payment_id?: string
  payment_url?: string
  created_at: string
  updated_at: string
  completed_at?: string
}

export interface Wallet {
  id: string
  user_id: string
  balance: string
  escrow_balance: string
  currency: string
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  wallet_id: string
  type: 'deposit' | 'withdraw' | 'escrow_lock' | 'escrow_release' | 'escrow_refund'
  amount: string
  order_id?: string
  payment_id?: string
  created_at: string
}

export interface CreatePaymentDTO {
  provider: 'kaspi' | 'paybox' | 'wallet'
  amount: string
  order_id?: string
}

export const paymentsApi = {
  // Payments
  createPayment: async (data: CreatePaymentDTO): Promise<Payment> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    const result = await response.json()
    return result.data
  },

  getMyPayments: async (): Promise<Payment[]> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/payments/my`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json()
    return data.data
  },

  // Wallet
  getWallet: async (): Promise<Wallet> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/wallet`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json()
    return data.data
  },

  getTransactions: async (): Promise<Transaction[]> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/wallet/transactions`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json()
    return data.data
  },
}


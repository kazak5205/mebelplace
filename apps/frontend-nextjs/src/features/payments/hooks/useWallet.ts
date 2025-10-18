/**
 * useWallet - Hook for wallet balance and transactions
 */

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'

interface WalletBalance {
  balance: number
  currency: string
  formatted: string
}

interface Transaction {
  id: string
  type: 'deposit' | 'withdrawal' | 'payment' | 'refund' | 'earning'
  amount: number
  balance_after: number
  description: string
  created_at: string
}

interface WalletData {
  balance: WalletBalance
  transactions: Transaction[]
}

async function fetchWallet(): Promise<WalletData> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/wallet`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'Content-Type': 'application/json',
    },
  })
  const data = await response.json()
  return data.data
}

export function useWallet() {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: fetchWallet,
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 15000, // Consider data stale after 15 seconds
  })
}

export function useWalletBalance() {
  const { data, ...rest } = useWallet()
  return {
    balance: data?.balance?.balance ?? 0,
    formatted: data?.balance?.formatted ?? '0 ₸',
    currency: data?.balance?.currency ?? '₸',
    ...rest,
  }
}


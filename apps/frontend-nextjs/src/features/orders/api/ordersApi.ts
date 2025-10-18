import { apiClient } from '@/lib/api/client'

export interface Order {
  id: string
  request_id: string
  proposal_id: string
  user_id: string
  master_id: string
  price: string
  deadline: string
  status: 'pending' | 'paid' | 'accepted' | 'in_progress' | 'review' | 'completed' | 'cancelled' | 'dispute'
  description: string
  created_at: string
  updated_at: string
  completed_at?: string
}

export const ordersApi = {
  // Get orders
  getMyOrders: async (): Promise<Order[]> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/orders/my`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json()
    return data.data
  },

  getOrder: async (id: string): Promise<Order> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/orders/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json()
    return data.data
  },

  // User actions
  payOrder: async (id: string): Promise<{ message: string; order: Order }> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/orders/${id}/pay`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json()
    return data.data
  },

  approveOrder: async (id: string): Promise<{ message: string; order: Order }> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/orders/${id}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json()
    return data.data
  },

  cancelOrder: async (id: string): Promise<{ message: string; order: Order }> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/orders/${id}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json()
    return data.data
  },

  // Master actions
  acceptOrder: async (id: string): Promise<Order> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/orders/${id}/accept`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json()
    return data.data
  },

  startWork: async (id: string): Promise<Order> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/orders/${id}/start`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json()
    return data.data
  },

  completeOrder: async (id: string): Promise<{ message: string; order: Order }> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/orders/${id}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json()
    return data.data
  },

  // Both can open dispute
  openDispute: async (id: string): Promise<{ message: string; order: Order }> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/orders/${id}/dispute`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json()
    return data.data
  },
}


import { apiClient } from '@/lib/api/client'

export interface Request {
  id: string
  user_id: string
  title: string
  description: string
  category: string
  region: string
  photos: string[]
  status: 'pending' | 'active' | 'accepted' | 'closed'
  created_at: string
  updated_at: string
}

export interface Proposal {
  id: string
  request_id: string
  master_id: string
  price: string
  deadline: string
  description: string
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
  created_at: string
  updated_at: string
}

export interface CreateRequestDTO {
  title: string
  description: string
  category: string
  region: string
  photos: string[]
}

export interface CreateProposalDTO {
  price: string
  deadline: string
  description: string
}

export const requestsApi = {
  // User operations (NO PRICE!)
  createRequest: async (data: CreateRequestDTO): Promise<Request> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/requests`, {
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

  getMyRequests: async (): Promise<Request[]> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/requests/my`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json()
    return data.data
  },

  getRequest: async (id: string): Promise<Request> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/requests/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json()
    return data.data
  },

  updateRequest: async (id: string, data: Partial<CreateRequestDTO>): Promise<Request> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/requests/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    const result = await response.json()
    return result.data
  },

  closeRequest: async (id: string): Promise<Request> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/requests/${id}/close`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json()
    return data.data
  },

  // Master operations
  getRequestsByRegion: async (region: string, status?: string): Promise<Request[]> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/requests/region/${region}?status=${status || 'pending'}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json()
    return data.data
  },

  createProposal: async (requestId: string, data: CreateProposalDTO): Promise<Proposal> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/requests/${requestId}/proposals`, {
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

  getProposals: async (requestId: string): Promise<Proposal[]> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/requests/${requestId}/proposals`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json()
    return data.data
  },

  // User accepts/rejects proposals
  acceptProposal: async (proposalId: string): Promise<{ message: string; proposal: Proposal }> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/proposals/${proposalId}/accept`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json()
    return data.data
  },

  rejectProposal: async (proposalId: string): Promise<{ message: string }> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/proposals/${proposalId}/reject`, {
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


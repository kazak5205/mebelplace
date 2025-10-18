'use client'

import { useState, useEffect } from 'react'
// import { useTranslations } from 'next-intl'

interface Request {
  id: number
  title: string
  region: string
  status: string
  created_at: string
  creator_id: number
}

export default function AdminRequests() {
  // const t = useTranslations('admin')
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/v2/admin/requests', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setRequests(data.data || data.requests || [])
      } else {
        setError('Ошибка загрузки заявок')
      }
    } catch (error) {
      setError('Ошибка сети')
    } finally {
      setLoading(false)
    }
  }

  const updateRequestStatus = async (requestId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/v2/admin/requests/${requestId}/status`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setRequests(requests.map(request => 
          request.id === requestId 
            ? { ...request, status: newStatus }
            : request
        ))
        alert('Статус заявки обновлен')
      } else {
        alert('Ошибка при обновлении статуса заявки')
      }
    } catch (error) {
      alert('Ошибка сети')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new': return 'Новая'
      case 'in_progress': return 'В работе'
      case 'completed': return 'Выполнена'
      case 'cancelled': return 'Отменена'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Загрузка заявок...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Управление заявками</h1>
        <button
          onClick={fetchRequests}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Обновить
        </button>
      </div>

      {requests.length > 0 ? (
        <div className="grid gap-6">
          {requests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                  {getStatusText(request.status)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Creator ID</p>
                  <p className="font-medium">{request.creator_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Регион</p>
                  <p className="font-medium">{request.region || 'Не указан'}</p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  Создана: {new Date(request.created_at).toLocaleDateString()}
                </p>
                <div className="flex space-x-2">
                  <select
                    value={request.status}
                    onChange={(e) => updateRequestStatus(request.id, e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="new">Новая</option>
                    <option value="in_progress">В работе</option>
                    <option value="completed">Выполнена</option>
                    <option value="cancelled">Отменена</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">Заявки не найдены</p>
        </div>
      )}
    </div>
  )
}
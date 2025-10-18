'use client'

import { useState, useEffect } from 'react'
// import { useTranslations } from 'next-intl' // Removed for admin simplicity

interface SupportTicket {
  id: number
  subject: string
  message: string
  status: string
  priority: string
  created_at: string
  updated_at: string
  user: {
    username: string
    email: string
  }
  replies: SupportReply[]
}

interface SupportReply {
  id: number
  message: string
  is_admin: boolean
  created_at: string
}

export default function AdminSupport() {
  // const t = useTranslations('admin.support') // Hardcoded text below
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [replyMessage, setReplyMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [replying, setReplying] = useState(false)

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/v2/admin/support/tickets', {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setTickets(data)
      }
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateTicketStatus = async (ticketId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/v2/admin/support/tickets/${ticketId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        setTickets(tickets.map(ticket => 
          ticket.id === ticketId 
            ? { ...ticket, status: newStatus }
            : ticket
        ))
        if (selectedTicket && selectedTicket.id === ticketId) {
          setSelectedTicket({ ...selectedTicket, status: newStatus })
        }
      }
    } catch (error) {
      alert('Ошибка при обновлении статуса')
    }
  }

  const sendReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return

    setReplying(true)
    try {
      const response = await fetch(`/api/v2/admin/support/tickets/${selectedTicket.id}/reply`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: replyMessage })
      })

      if (response.ok) {
        const newReply = await response.json()
        setSelectedTicket({
          ...selectedTicket,
          replies: [...selectedTicket.replies, newReply]
        })
        setReplyMessage('')
        alert('Ответ отправлен')
      } else {
        alert('Ошибка при отправке ответа')
      }
    } catch (error) {
      alert('Ошибка сети')
    } finally {
      setReplying(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Открыто'
      case 'in_progress': return 'В работе'
      case 'resolved': return 'Решено'
      case 'closed': return 'Закрыто'
      default: return status
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'urgent': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'low': return 'Низкий'
      case 'medium': return 'Средний'
      case 'high': return 'Высокий'
      case 'urgent': return 'Срочный'
      default: return priority
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Обращения в поддержку</h1>
        <div className="text-sm text-gray-500">
          Всего обращений: {tickets.length}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Список обращений */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Список обращений</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedTicket?.id === ticket.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {ticket.subject}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {ticket.user.username || 'Без имени'} • {ticket.user.email}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(ticket.created_at).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                        {getPriorityText(ticket.priority)}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {getStatusText(ticket.status)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Детали обращения */}
        <div className="bg-white shadow sm:rounded-md">
          {selectedTicket ? (
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">{selectedTicket.subject}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    От: {selectedTicket.user.username || 'Без имени'} ({selectedTicket.user.email})
                  </p>
                  <p className="text-sm text-gray-500">
                    Создано: {new Date(selectedTicket.created_at).toLocaleDateString('ru-RU')}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                    {getPriorityText(selectedTicket.priority)}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedTicket.status)}`}>
                    {getStatusText(selectedTicket.status)}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Сообщение:</h3>
                <div className="bg-gray-50 rounded-md p-3">
                  <p className="text-sm text-gray-700">{selectedTicket.message}</p>
                </div>
              </div>

              {/* История ответов */}
              {selectedTicket.replies && selectedTicket.replies.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">История ответов:</h3>
                  <div className="space-y-3 max-h-40 overflow-y-auto">
                    {selectedTicket.replies.map((reply) => (
                      <div key={reply.id} className={`p-3 rounded-md ${
                        reply.is_admin ? 'bg-blue-50 border-l-4 border-blue-400' : 'bg-gray-50'
                      }`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-gray-600">
                            {reply.is_admin ? 'Администратор' : 'Пользователь'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(reply.created_at).toLocaleDateString('ru-RU')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{reply.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Управление статусом */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Статус обращения:
                </label>
                <select
                  value={selectedTicket.status}
                  onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="open">Открыто</option>
                  <option value="in_progress">В работе</option>
                  <option value="resolved">Решено</option>
                  <option value="closed">Закрыто</option>
                </select>
              </div>

              {/* Ответ */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ответ пользователю:
                </label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Введите ваш ответ..."
                />
              </div>

              <button
                onClick={sendReply}
                disabled={replying || !replyMessage.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                {replying ? 'Отправка...' : 'Отправить ответ'}
              </button>
            </div>
          ) : (
            <div className="px-4 py-5 sm:p-6 text-center">
              <p className="text-gray-500">Выберите обращение для просмотра</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

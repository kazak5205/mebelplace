'use client'

import Link from 'next/link'
import { Request } from '../api/requestsApi'

interface RequestListProps {
  requests: Request[]
}

const statusLabels: Record<Request['status'], string> = {
  pending: 'Ожидает предложений',
  active: 'Есть предложения',
  accepted: 'Принято',
  closed: 'Закрыто',
}

const statusColors: Record<Request['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  active: 'bg-green-100 text-green-800',
  accepted: 'bg-blue-100 text-blue-800',
  closed: 'bg-gray-100 text-gray-800',
}

export const RequestList: React.FC<RequestListProps> = ({ requests }) => {
  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">У вас пока нет заявок</p>
        <p className="text-gray-400 mt-2">Создайте первую заявку, и мастера предложат цену</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <Link
          key={request.id}
          href={`/requests/${request.id}`}
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-semibold">{request.title}</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[request.status]}`}>
              {statusLabels[request.status]}
            </span>
          </div>
          
          <p className="text-gray-600 mb-4 line-clamp-2">{request.description}</p>
          
          <div className="flex flex-wrap gap-2 text-sm text-gray-500">
            <span className="px-3 py-1 bg-gray-100 rounded-full">
              📂 {request.category}
            </span>
            <span className="px-3 py-1 bg-gray-100 rounded-full">
              📍 {request.region}
            </span>
            <span className="px-3 py-1 bg-gray-100 rounded-full">
              📅 {new Date(request.created_at).toLocaleDateString('ru-RU')}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}


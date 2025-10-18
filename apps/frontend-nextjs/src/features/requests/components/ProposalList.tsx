'use client'

import { useState } from 'react'
import { Proposal } from '../api/requestsApi'

interface ProposalListProps {
  proposals: Proposal[]
  onAccept: (proposalId: string) => Promise<void>
  onReject: (proposalId: string) => Promise<void>
  canManage?: boolean
}

export const ProposalList: React.FC<ProposalListProps> = ({
  proposals,
  onAccept,
  onReject,
  canManage = true,
}) => {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleAccept = async (proposalId: string) => {
    setLoadingId(proposalId)
    try {
      await onAccept(proposalId)
    } finally {
      setLoadingId(null)
    }
  }

  const handleReject = async (proposalId: string) => {
    setLoadingId(proposalId)
    try {
      await onReject(proposalId)
    } finally {
      setLoadingId(null)
    }
  }

  if (proposals.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-500 text-lg">Пока нет предложений</p>
        <p className="text-gray-400 mt-2">Мастера скоро откликнутся на вашу заявку</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">
        Предложения от мастеров ({proposals.length})
      </h3>

      {proposals.map((proposal) => (
        <div key={proposal.id} className="p-6 bg-white rounded-lg shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-2xl font-bold text-green-600">
                {Number(proposal.price).toLocaleString('ru-RU')} ₸
              </p>
              <p className="text-sm text-gray-500">
                Срок: {new Date(proposal.deadline).toLocaleDateString('ru-RU')}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                proposal.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : proposal.status === 'accepted'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {proposal.status === 'pending'
                ? 'Ожидает ответа'
                : proposal.status === 'accepted'
                ? 'Принято'
                : proposal.status === 'rejected'
                ? 'Отклонено'
                : 'Отозвано'}
            </span>
          </div>

          <p className="text-gray-700 mb-4">{proposal.description}</p>

          {canManage && proposal.status === 'pending' && (
            <div className="flex gap-3">
              <button
                onClick={() => handleAccept(proposal.id)}
                disabled={loadingId === proposal.id}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loadingId === proposal.id ? 'Обработка...' : '✓ Принять'}
              </button>
              <button
                onClick={() => handleReject(proposal.id)}
                disabled={loadingId === proposal.id}
                className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              >
                {loadingId === proposal.id ? 'Обработка...' : '✗ Отклонить'}
              </button>
            </div>
          )}

          <div className="mt-3 text-xs text-gray-400">
            Предложено {new Date(proposal.created_at).toLocaleString('ru-RU')}
          </div>
        </div>
      ))}
    </div>
  )
}


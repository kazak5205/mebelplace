'use client'

import { useState } from 'react'
import { requestsApi, CreateProposalDTO } from '../api/requestsApi'

interface CreateProposalFormProps {
  requestId: string
  onSuccess?: () => void
}

export const CreateProposalForm: React.FC<CreateProposalFormProps> = ({
  requestId,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<CreateProposalDTO>({
    price: '',
    deadline: '',
    description: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      setError(null)

      // Master provides price and deadline!
      await requestsApi.createProposal(requestId, formData)

      // Reset form
      setFormData({
        price: '',
        deadline: '',
        description: '',
      })

      onSuccess?.()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Не удалось создать предложение')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white rounded-lg shadow">
      <h3 className="text-xl font-bold mb-4">Создать предложение</h3>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Цена (₸) *
        </label>
        <input
          type="number"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          required
          min="1"
          step="0.01"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Например: 150000"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Срок выполнения *
        </label>
        <input
          type="datetime-local"
          value={formData.deadline}
          onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
          required
          min={new Date().toISOString().slice(0, 16)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Описание вашего предложения *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          minLength={10}
          maxLength={1000}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Расскажите о вашем опыте, материалах, гарантии..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Отправка...' : 'Отправить предложение'}
      </button>
    </form>
  )
}


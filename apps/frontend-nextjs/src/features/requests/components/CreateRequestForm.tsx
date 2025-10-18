'use client'

import { useState } from 'react'
import { requestsApi, CreateRequestDTO } from '../api/requestsApi'
import { ImageUpload } from '@/components/upload/ImageUpload'

interface CreateRequestFormProps {
  onSuccess?: () => void
}

export const CreateRequestForm: React.FC<CreateRequestFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<CreateRequestDTO>({
    title: '',
    description: '',
    category: '',
    region: '',
    photos: [],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      setError(null)
      
      // ❌ NO PRICE! User doesn't provide price
      // ❌ NO DEADLINE! User doesn't provide deadline
      // Master will propose them!
      
      await requestsApi.createRequest(formData)
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        region: '',
        photos: [],
      })
      
      onSuccess?.()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Не удалось создать заявку')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    'Мебель для дома',
    'Офисная мебель',
    'Кухонная мебель',
    'Встроенные шкафы',
    'Двери',
    'Ремонт мебели',
    'Другое',
  ]

  const regions = [
    'Алматы',
    'Нур-Султан',
    'Шымкент',
    'Караганда',
    'Актобе',
    'Тараз',
    'Павлодар',
    'Другой',
  ]

  return (
    <div className="glass-card p-6 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Создать заявку</h2>
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Название *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          minLength={3}
          maxLength={200}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Например: Нужен кухонный гарнитур"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Описание *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          minLength={10}
          maxLength={2000}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Опишите что вам нужно..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Категория *
        </label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Выберите категорию</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Регион *
        </label>
        <select
          value={formData.region}
          onChange={(e) => setFormData({ ...formData, region: e.target.value })}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Выберите регион</option>
          {regions.map((reg) => (
            <option key={reg} value={reg}>
              {reg}
            </option>
          ))}
        </select>
      </div>

      {/* Photo upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Фотографии (до 10)
        </label>
        <ImageUpload
          maxFiles={10}
          maxSizeMB={10}
          value={formData.photos}
          onChange={(urls) => setFormData({ ...formData, photos: urls })}
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Создание...' : 'Создать заявку'}
      </button>

        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          ℹ️ Вы не указываете цену! Мастера сами предложат цену и срок выполнения.
        </p>
      </form>
    </div>
  )
}


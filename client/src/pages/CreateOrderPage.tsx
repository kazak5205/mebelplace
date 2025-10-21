import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload, MapPin, DollarSign, Calendar, Tag } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import { orderService } from '../services/orderService'
import { useAuth } from '@shared/contexts/AuthContext'

const CreateOrderPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [regions, setRegions] = useState<string[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    city: '',
    region: '',
    address: '',
    images: [] as string[]
  })

  useEffect(() => {
    orderService.getRegions()
      .then(setRegions)
      .catch(() => setRegions([]))
  }, [])

  const categories = [
    'Мебель',
    'Ремонт',
    'Дизайн интерьера',
    'Сантехника',
    'Электрика',
    'Отделка',
    'Другое'
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    try {
      const uploadPromises = Array.from(files).map(file => {
        const formData = new FormData()
        formData.append('file', file)
        return orderService.uploadOrderImages(formData)
      })

      const results = await Promise.all(uploadPromises)
      const newImages = results.flat() as string[]
      setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }))
    } catch (error) {
      console.error('Failed to upload images:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    // Read from DOM directly for better compatibility with testing
    const form = e.currentTarget as HTMLFormElement
    const formDataDOM = new FormData(form)
    
    const title = formDataDOM.get('title') as string || formData.title
    const description = formDataDOM.get('description') as string || formData.description
    const category = formDataDOM.get('category') as string || formData.category
    const region = formDataDOM.get('region') as string || formData.region
    const city = formDataDOM.get('city') as string || formData.city
    const address = formDataDOM.get('address') as string || formData.address

    try {
      setLoading(true)
      await orderService.createOrder({
        title,
        description,
        category,
        location: {
          city,
          region,
          address
        },
        images: formData.images
      })
      navigate('/orders')
    } catch (error) {
      console.error('Failed to create order:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center space-x-4"
      >
        <button
          onClick={() => navigate('/orders')}
          className="glass-button p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold gradient-text">Создать заявку</h1>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Основная информация</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Название заявки *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="glass-input w-full"
                placeholder="Например: Изготовление кухонного гарнитура"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Описание *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="glass-input w-full resize-none"
                placeholder="Подробно опишите, что вам нужно..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Категория *
                </label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="glass-input w-full pl-12"
                  >
                    <option value="">Выберите категорию</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Местоположение</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Регион *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                  <select
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    required
                    className="glass-input w-full pl-12"
                  >
                    <option value="">Выберите регион</option>
                    {regions.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Город *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="glass-input w-full pl-12"
                    placeholder="Алматы"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Адрес
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="glass-input w-full"
                  placeholder="Улица, дом, квартира"
                />
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Фотографии</h2>
          
          <div className="space-y-4">
            <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
              <Upload className="w-12 h-12 text-white/60 mx-auto mb-4" />
              <p className="text-white/70 mb-4">
                Загрузите фотографии для лучшего понимания задачи
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="glass-button cursor-pointer inline-block"
              >
                Выбрать файлы
              </label>
            </div>

            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="aspect-square bg-white/10 rounded-lg overflow-hidden">
                    <img
                      src={image}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </GlassCard>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-end space-x-4"
        >
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className="glass-button"
          >
            Отмена
          </button>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
            className="glass-button bg-gradient-to-r from-blue-500 to-purple-500 disabled:opacity-50"
          >
            {loading ? 'Создание...' : 'Создать заявку'}
          </motion.button>
        </motion.div>
      </motion.form>
    </div>
  )
}

export default CreateOrderPage

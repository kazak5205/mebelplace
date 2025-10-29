import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload, MapPin, FileText } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import { orderService } from '../services/orderService'
import { useAuth } from '../contexts/AuthContext'

const CreateOrderPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [_error, setError] = useState('')
  const [regions, setRegions] = useState<string[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    region: '',
    images: [] as File[]
  })

  useEffect(() => {
    // Загружаем регионы
    orderService.getRegions()
      .then(setRegions)
      .catch(() => setRegions([]))
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    // Сохраняем File объекты для отправки на сервер
    const newFiles = Array.from(files)
    setFormData(prev => ({ ...prev, images: [...prev.images, ...newFiles] }))
  }

  const handleLabelClick = (e: React.MouseEvent) => {
    e.preventDefault()
    const input = document.getElementById('image-upload') as HTMLInputElement
    if (input) {
      input.click()
    }
  }

  const handleSubmit = async (e: React.MouseEvent | React.FormEvent) => {
    console.log('handleSubmit called!', e)
    e.preventDefault()
    if (!user) return

    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Пожалуйста, заполните название и описание заявки')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      // Создаем FormData для отправки с файлами
      const submitData = new FormData()
      submitData.append('title', formData.title)
      submitData.append('description', formData.description)
      submitData.append('city', formData.location)
      submitData.append('region', formData.region)
      
      // Добавляем изображения
      formData.images.forEach((file) => {
        submitData.append('images', file)
      })
      
      console.log('Creating order with data:', {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        region: formData.region,
        imagesCount: formData.images.length
      })
      
      await orderService.createOrder(submitData)
      navigate('/user/orders')
    } catch (error: any) {
      console.error('Failed to create order:', error)
      setError(error?.response?.data?.message || error?.message || 'Не удалось создать заявку. Попробуйте ещё раз.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6 px-4 sm:px-0 pb-32 sm:pb-56">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center space-x-3 sm:space-x-4"
      >
        <button
          onClick={() => navigate('/orders')}
          className="glass-button p-2"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold gradient-text">Создать заявку</h1>
      </motion.div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GlassCard className="p-4 sm:p-6">
          <div className="flex items-start space-x-3 sm:space-x-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-base sm:text-lg font-bold text-white mb-2">
                Как создать заявку
              </h2>
              <ol className="text-white/70 text-xs sm:text-sm leading-relaxed space-y-1.5 sm:space-y-2 list-decimal list-inside">
                <li>Прикрепите фото мебели (из интернета или своё).</li>
                <li>В описании укажите размеры, цвет и другие параметры.</li>
                <li>Отправьте заявку — её увидят все мебельные компании.</li>
                <li>В «Мессенджере» вы получите ответы с ценой и сроками установки.</li>
                <li>После этого вы сможете обсудить с компаниями все детали напрямую в чате.</li>
              </ol>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onSubmit={handleSubmit}
        className="space-y-4 sm:space-y-6"
      >
        <GlassCard className="p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Основная информация</h2>
          
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-white/70 mb-2">
                Название заявки *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="glass-input w-full text-sm sm:text-base"
                placeholder="Например: Изготовление кухонного гарнитура"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-white/70 mb-2">
                Описание *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="glass-input w-full resize-none text-sm sm:text-base"
                placeholder="Подробно опишите, что вам нужно..."
              />
            </div>

          </div>
        </GlassCard>

        <GlassCard className="p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Местоположение</h2>
          
          <div className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-white/70 mb-2">
                  Регион *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-white/60" />
                  <select
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    required
                    className="glass-input w-full pl-10 sm:pl-12 text-sm sm:text-base"
                  >
                    <option value="">Выберите регион</option>
                    {regions.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-white/70 mb-2">
                  Город *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-white/60" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="glass-input w-full pl-10 sm:pl-12 text-sm sm:text-base"
                    placeholder="Алматы"
                  />
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Фотографии</h2>
          
          <div className="space-y-3 sm:space-y-4">
            <div className="border-2 border-dashed border-white/20 rounded-lg p-4 sm:p-6 text-center">
              <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-white/60 mx-auto mb-3 sm:mb-4" />
              <p className="text-white/70 mb-3 sm:mb-4 text-xs sm:text-base">
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
              <button
                type="button"
                onClick={handleLabelClick}
                className="glass-button cursor-pointer relative z-[60] text-sm sm:text-base"
              >
                Выбрать файлы
              </button>
            </div>

            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {formData.images.map((file, index) => (
                  <div key={index} className="aspect-square bg-white/10 rounded-lg overflow-hidden">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </GlassCard>

        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 sm:pt-6">
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className="glass-button text-sm sm:text-base w-full sm:w-auto"
          >
            Отмена
          </button>
          <motion.button
            type="button"
            onClick={handleSubmit}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
            className="glass-button bg-gradient-to-r from-orange-500 to-orange-600 disabled:opacity-50 text-sm sm:text-base w-full sm:w-auto"
          >
            {loading ? 'Создание...' : 'Создать заявку'}
          </motion.button>
        </div>
      </motion.form>
    </div>
  )
}

export default CreateOrderPage

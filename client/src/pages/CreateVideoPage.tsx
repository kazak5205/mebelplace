import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload, X, Video, FileVideo, Tag } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import { videoService } from '../services/videoService'
import { useAuth } from '../contexts/AuthContext'

const categories = [
  { value: 'general', label: 'Общее' },
  { value: 'furniture', label: 'Мебель' },
  { value: 'design', label: 'Дизайн' },
  { value: 'tutorial', label: 'Обучение' },
  { value: 'repair', label: 'Ремонт' },
  { value: 'restoration', label: 'Реставрация' },
  { value: 'custom', label: 'На заказ' }
]

const CreateVideoPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'furniture',
    tags: '',
    furniturePrice: ''
  })
  const [error, setError] = useState<string | null>(null)

  const validateVideoFile = (file: File): string | null => {
    if (!file.type.startsWith('video/')) {
      return 'Можно загружать только видео файлы'
    }
    if (file.size > 200 * 1024 * 1024) { // 200MB
      return 'Размер файла не должен превышать 200 МБ'
    }
    return null
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validationError = validateVideoFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setVideoFile(file)
    setVideoPreview(URL.createObjectURL(file))
  }

  const handleRemoveVideo = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview)
    }
    setVideoFile(null)
    setVideoPreview(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!videoFile) {
      setError('Выберите видео файл')
      return
    }

    if (!user || user.role !== 'master') {
      setError('Только мастера могут загружать видео')
      return
    }

    try {
      setUploading(true)
      setError(null)

      const submitData = new FormData()
      submitData.append('video', videoFile)
      submitData.append('title', formData.title)
      submitData.append('description', formData.description)
      submitData.append('category', formData.category)
      submitData.append('tags', formData.tags)
      if (formData.furniturePrice) {
        submitData.append('furniturePrice', formData.furniturePrice)
      }

      await videoService.uploadVideo(submitData)

      // Успех - переходим в профиль или на главную
      navigate('/profile')
    } catch (error: any) {
      console.error('Failed to upload video:', error)
      setError(error.response?.data?.message || 'Ошибка загрузки видео. Попробуйте снова.')
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center space-x-4"
      >
        <button
          onClick={() => navigate('/')}
          className="glass-button p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold gradient-text">Создать видеорекламу</h1>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Video className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white mb-2">
                  Как делать видео, которое продаёт мебель
                </h2>
                <ol className="text-white/70 text-sm leading-relaxed space-y-2 list-decimal list-inside">
                  <li>Снимайте с чётким звуком и озвучкой, без фона музыки.</li>
                  <li>Уточняйте в видео и описании: размеры, материал и стоимость.</li>
                  <li>Демонстрируйте особенности и преимущества конструкции.</li>
                  <li>Завершайте призывом к действию: «Нажмите кнопку "Заказать" под видео и укажите ваши размеры и пожелания — мы свяжемся с вами!»</li>
                </ol>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Video Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Загрузка видео</h2>
            
            <div className="space-y-4">
              {!videoPreview ? (
                <label className="block">
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-12 text-center cursor-pointer hover:border-white/40 transition-colors">
                    <Upload className="w-16 h-16 text-white/60 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">
                      Выберите видео файл
                    </h3>
                    <p className="text-white/60 text-sm mb-4">
                      Нажмите или перетащите файл сюда
                    </p>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div className="inline-block glass-button bg-gradient-to-r from-blue-500 to-purple-500">
                      Выбрать файл
                    </div>
                  </div>
                </label>
              ) : (
                <div className="space-y-4">
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    <video
                      src={videoPreview}
                      controls
                      className="w-full max-h-96 object-contain"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveVideo}
                      className="absolute top-4 right-4 glass-button p-2 bg-red-500/80 hover:bg-red-600/80"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {videoFile && (
                    <div className="flex items-center justify-between text-sm text-white/70">
                      <div className="flex items-center space-x-2">
                        <FileVideo className="w-4 h-4" />
                        <span>{videoFile.name}</span>
                      </div>
                      <span>{formatFileSize(videoFile.size)}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-300 mb-2">💡 Рекомендации</h4>
                <ul className="text-xs text-white/70 space-y-1">
                  <li>• Формат: MP4, MOV, AVI, WebM</li>
                  <li>• Максимальный размер: 200 МБ</li>
                  <li>• Рекомендуемая длина: 30-60 секунд</li>
                  <li>• Снимайте в хорошем освещении</li>
                  <li>• Покажите процесс работы и результат</li>
                </ul>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Video Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Информация о видео</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Название видео *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="glass-input w-full"
                  placeholder="Например: Кухонный гарнитур из массива дуба"
                />
                <p className="text-xs text-white/50 mt-1">
                  Используйте краткое и понятное название
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Описание
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="glass-input w-full resize-none"
                  placeholder="Расскажите о вашей работе: какие материалы использовали, сколько времени заняло изготовление, какие особенности..."
                />
                <p className="text-xs text-white/50 mt-1">
                  Подробное описание поможет клиентам лучше понять вашу работу
                </p>
              </div>

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
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Цена мебели (₸)
                </label>
                <input
                  type="number"
                  name="furniturePrice"
                  value={formData.furniturePrice}
                  onChange={handleInputChange}
                  className="glass-input w-full"
                  placeholder="Например: 150000"
                  min="0"
                  step="1"
                />
                <p className="text-xs text-white/50 mt-1">
                  Укажите стоимость изделия (не обязательно)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Теги (через запятую)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="glass-input w-full"
                  placeholder="мебель, кухня, дуб, на заказ, ручная работа"
                />
                <p className="text-xs text-white/50 mt-1">
                  Теги помогут клиентам найти ваше видео
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
          >
            <p className="text-red-300 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-end space-x-4"
        >
          <button
            type="button"
            onClick={() => navigate('/')}
            className="glass-button px-6 py-3"
            disabled={uploading}
          >
            Отмена
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={uploading || !videoFile}
            className="glass-button bg-gradient-to-r from-blue-500 to-purple-500 px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {uploading ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Загрузка...</span>
              </div>
            ) : (
              'Опубликовать видео'
            )}
          </motion.button>
        </motion.div>
      </form>
    </div>
  )
}

export default CreateVideoPage


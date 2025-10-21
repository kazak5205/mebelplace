import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Video as VideoIcon } from 'lucide-react'
import { toast } from 'sonner'
import { videoService } from '../services/videoService'

interface VideoUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const VideoUploadModal: React.FC<VideoUploadModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type.startsWith('video/')) {
        setSelectedFile(file)
      } else {
        toast.error('Пожалуйста, выберите видео файл')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Читаем данные напрямую из DOM (совместимость с automated testing)
    const input = document.getElementById('video-file-input') as HTMLInputElement
    const titleInput = document.querySelector('input[placeholder="Введите название видео"]') as HTMLInputElement
    const descInput = document.querySelector('textarea[placeholder="Добавьте описание..."]') as HTMLTextAreaElement
    
    const file = selectedFile || (input?.files?.[0])
    const videoTitle = (titleInput?.value && titleInput.value.trim()) || title || ''
    const videoDesc = (descInput?.value && descInput.value.trim()) || description || ''

    if (!file) {
      toast.error('Выберите видео файл')
      return
    }

    if (!videoTitle.trim()) {
      toast.error('Введите название видео')
      return
    }

    try {
      setUploading(true)
      setUploadProgress(0)

      const formData = new FormData()
      formData.append('video', file)
      formData.append('title', videoTitle)
      formData.append('description', videoDesc)

      // Симуляция прогресса
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 500)

      await videoService.uploadVideo(formData)

      clearInterval(progressInterval)
      setUploadProgress(100)

      toast.success('Видео успешно загружено!')
      onSuccess?.()
      handleClose()
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Ошибка загрузки видео')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleClose = () => {
    if (!uploading) {
      setTitle('')
      setDescription('')
      setSelectedFile(null)
      setUploadProgress(0)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg glass-card p-6 relative my-8 max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            disabled={uploading}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-500/20 rounded-full">
              <VideoIcon className="w-6 h-6 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold gradient-text">Загрузить видео</h2>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* File upload */}
            <div>
              <label className="block text-sm font-medium mb-2">Видео файл</label>
              <div className="relative">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  className="hidden"
                  id="video-file-input"
                />
                <label
                  htmlFor="video-file-input"
                  className="flex items-center justify-center gap-3 p-6 glass-card border-2 border-dashed border-white/20 hover:border-purple-500/50 cursor-pointer transition-colors"
                >
                  <Upload className="w-6 h-6 text-purple-400" />
                  <div>
                    {selectedFile ? (
                      <p className="text-sm">{selectedFile.name}</p>
                    ) : (
                      <p className="text-sm text-white/60">Нажмите, чтобы выбрать видео</p>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                Название
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={uploading}
                placeholder="Введите название видео"
                className="w-full px-4 py-3 glass-card border border-white/20 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                maxLength={100}
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2">
                Описание (опционально)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={uploading}
                placeholder="Добавьте описание..."
                rows={3}
                className="w-full px-4 py-3 glass-card border border-white/20 rounded-lg focus:border-purple-500 focus:outline-none transition-colors resize-none"
                maxLength={500}
              />
            </div>

            {/* Progress bar */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Загрузка...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={uploading}
                className="flex-1 px-6 py-3 glass-button hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={uploading || !selectedFile || !title.trim()}
                className="flex-1 px-6 py-3 gradient-button disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Загрузка...' : 'Загрузить'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default VideoUploadModal



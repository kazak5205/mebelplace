/**
 * PremiumRequestWizard - Beautiful 3-step request creation
 * Per TZ: Attention Map - Z pattern, glassmorphism, smooth animations
 * Steps: 1) Photos → 2) Details → 3) Preview & Send
 */

'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Check, Upload, FileText, Eye, Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui'
import { ImageUpload } from '@/components/upload/ImageUpload'

interface RequestData {
  photos: string[]
  title: string
  description: string
  category: string
  region: string
}

interface PremiumRequestWizardProps {
  onComplete: (data: RequestData) => void
  onCancel: () => void
}

export function PremiumRequestWizard({ onComplete, onCancel }: PremiumRequestWizardProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<RequestData>({
    photos: [],
    title: '',
    description: '',
    category: '',
    region: '',
  })

  const steps = [
    { id: 1, title: 'Фотографии', icon: Upload, description: 'Загрузите фото примера или помещения' },
    { id: 2, title: 'Детали', icon: FileText, description: 'Опишите что вам нужно' },
    { id: 3, title: 'Проверка', icon: Eye, description: 'Проверьте и отправьте заявку' },
  ]

  const currentStep = steps[step - 1]
  const canGoNext = () => {
    if (step === 1) return formData.photos.length > 0
    if (step === 2) return formData.title && formData.description && formData.category && formData.region
    return true
  }

  const handleNext = () => {
    if (step < steps.length && canGoNext()) {
      setStep(prev => prev + 1)
    } else if (step === steps.length) {
      onComplete(formData)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(prev => prev - 1)
    } else {
      onCancel()
    }
  }

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-2xl bg-gradient-to-br from-orange-50/50 via-pink-50/50 to-purple-50/50 dark:from-gray-900/50 dark:via-gray-800/50 dark:to-gray-900/50 overflow-y-auto">
      <div className="min-h-full flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-3xl">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="glass-card p-6 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20">
              <div className="flex items-center justify-between">
                {steps.map((s, idx) => {
                  const Icon = s.icon
                  const isActive = step === s.id
                  const isCompleted = step > s.id

                  return (
                    <div key={s.id} className="flex items-center flex-1">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                            isCompleted
                              ? 'bg-green-500 shadow-lg shadow-green-500/50'
                              : isActive
                              ? 'bg-gradient-to-br from-orange-500 to-orange-600 shadow-2xl shadow-orange-500/50 scale-110'
                              : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        >
                          {isCompleted ? (
                            <Check className="w-6 h-6 text-white" />
                          ) : (
                            <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                          )}
                        </div>

                        <div className={`hidden sm:block ${isActive ? '' : 'opacity-60'}`}>
                          <p className={`font-semibold text-sm ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                            {s.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            Шаг {s.id} из {steps.length}
                          </p>
                        </div>
                      </div>

                      {idx < steps.length - 1 && (
                        <div className={`flex-1 h-1 mx-3 rounded-full transition-all duration-500 ${
                          step > s.id ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                        }`} />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className="glass-card p-8 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 min-h-[500px]">
            {/* Step title */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                <Sparkles className="w-7 h-7 text-orange-500" />
                {currentStep.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {currentStep.description}
              </p>
            </div>

            {/* Step 1: Photos */}
            {step === 1 && (
              <div className="space-y-4">
                <ImageUpload
                  maxFiles={10}
                  maxSizeMB={10}
                  value={formData.photos}
                  onChange={(urls) => setFormData(prev => ({ ...prev, photos: urls }))}
                />
                
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <p className="text-blue-800 dark:text-blue-300 text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Совет: загрузите фото примера мебели или фото помещения для точной оценки</span>
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Details */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Название заявки *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Например: Кухонный гарнитур в стиле минимализм"
                    className="w-full p-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-black/20 text-gray-900 dark:text-white placeholder-gray-500 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Подробное описание *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Опишите размеры, материалы, стиль, особенности..."
                    rows={5}
                    className="w-full p-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-black/20 text-gray-900 dark:text-white placeholder-gray-500 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all outline-none resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Категория *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full p-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-black/20 text-gray-900 dark:text-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all outline-none"
                      required
                    >
                      <option value="">Выберите...</option>
                      <option value="kitchen">Кухни</option>
                      <option value="bedroom">Спальни</option>
                      <option value="living_room">Гостиные</option>
                      <option value="office">Офисная мебель</option>
                      <option value="custom">Индивидуальный заказ</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Регион *
                    </label>
                    <select
                      value={formData.region}
                      onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                      className="w-full p-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-black/20 text-gray-900 dark:text-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all outline-none"
                      required
                    >
                      <option value="">Выберите...</option>
                      <option value="Алматы">Алматы</option>
                      <option value="Астана">Астана</option>
                      <option value="Шымкент">Шымкент</option>
                      <option value="Караганда">Караганда</option>
                      <option value="Актобе">Актобе</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Preview */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Ваша заявка готова! 🎉
                  </h3>

                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Название:</span>
                      <p className="font-semibold text-gray-900 dark:text-white">{formData.title}</p>
                    </div>

                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Описание:</span>
                      <p className="text-gray-900 dark:text-white">{formData.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Категория:</span>
                        <p className="font-medium text-gray-900 dark:text-white">{formData.category}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Регион:</span>
                        <p className="font-medium text-gray-900 dark:text-white">{formData.region}</p>
                      </div>
                    </div>

                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Фото:</span>
                      <p className="font-medium text-gray-900 dark:text-white">{formData.photos.length} шт.</p>
                    </div>
                  </div>
                </div>

                {/* Photo preview grid */}
                {formData.photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {formData.photos.slice(0, 6).map((photo, idx) => (
                      <div key={idx} className="aspect-square rounded-xl overflow-hidden">
                        <img src={photo} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
                  <p className="text-purple-800 dark:text-purple-300 text-sm">
                    ℹ️ Мастера получат push-уведомление и смогут отправить вам предложения с ценой и сроками
                  </p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="secondary"
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" />
                {step === 1 ? 'Отмена' : 'Назад'}
              </Button>

              <Button
                onClick={handleNext}
                disabled={!canGoNext()}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
              >
                {step === steps.length ? (
                  <>
                    <Check className="w-5 h-5" />
                    Отправить заявку
                  </>
                ) : (
                  <>
                    Далее
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


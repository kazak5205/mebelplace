'use client'

/**
 * Request Wizard - 3-step wizard for creating requests (per TZ)
 * Step 1: Photo upload
 * Step 2: Details (size, region, budget)
 * Step 3: Preview & Send
 */

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Upload, Check } from 'lucide-react'
import { Button } from '@/components/ui'

interface RequestData {
  photos: File[]
  title: string
  description: string
  category: string
  region: string
  budget?: number
}

interface RequestWizardProps {
  onSubmit: (data: RequestData) => void
  onCancel: () => void
}

export function RequestWizard({ onSubmit, onCancel }: RequestWizardProps) {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<Partial<RequestData>>({
    photos: [],
  })

  const isStep1Valid = (data.photos?.length ?? 0) > 0
  const isStep2Valid = data.title && data.description && data.category && data.region

  const handleNext = () => {
    if (step < 3) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = () => {
    if (isStep2Valid) {
      onSubmit(data as RequestData)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  i === step
                    ? 'bg-primary text-white scale-110'
                    : i < step
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {i < step ? <Check className="w-6 h-6" /> : i}
              </div>
              {i < 3 && (
                <div
                  className={`w-20 h-1 mx-2 ${
                    i < step ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="text-center text-sm text-gray-600">
          Шаг {step} из 3
        </div>
      </div>

      {/* Step content */}
      <div className="min-h-[400px]">
        {step === 1 && (
          <div className="space-y-4">
            <div className="text-left">
              <h2 className="text-2xl font-bold mb-2">Загрузите фото</h2>
              <p className="text-gray-600">
                Добавьте фотографии (до 10), чтобы мастера лучше поняли вашу задачу
              </p>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer">
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-2">
                Нажмите или перетащите фото сюда
              </p>
              <p className="text-sm text-gray-400">PNG, JPG до 10MB</p>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files || [])
                  setData({ ...data, photos: files })
                }}
              />
            </div>

            {(data.photos?.length ?? 0) > 0 && (
              <div className="text-center text-green-600">
                ✓ {data.photos?.length} фото выбрано
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="text-left">
              <h2 className="text-2xl font-bold mb-2">Опишите задачу</h2>
              <p className="text-gray-600">
                Укажите детали, чтобы получить точные предложения
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Название *
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg focus-ring"
                placeholder="Например: Изготовить кухонный гарнитур"
                value={data.title || ''}
                onChange={(e) => setData({ ...data, title: e.target.value })}
                aria-label="Название заявки"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Описание *
              </label>
              <textarea
                className="w-full px-4 py-2 border rounded-lg focus-ring"
                rows={4}
                placeholder="Опишите подробно, что нужно сделать..."
                value={data.description || ''}
                onChange={(e) => setData({ ...data, description: e.target.value })}
                aria-label="Описание заявки"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Категория *
                </label>
                <select
                  className="w-full px-4 py-2 border rounded-lg focus-ring"
                  value={data.category || ''}
                  onChange={(e) => setData({ ...data, category: e.target.value })}
                  aria-label="Категория"
                >
                  <option value="">Выберите</option>
                  <option value="furniture">Мебель</option>
                  <option value="repair">Ремонт</option>
                  <option value="design">Дизайн</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Регион *
                </label>
                <select
                  className="w-full px-4 py-2 border rounded-lg focus-ring"
                  value={data.region || ''}
                  onChange={(e) => setData({ ...data, region: e.target.value })}
                  aria-label="Регион"
                >
                  <option value="">Выберите</option>
                  <option value="almaty">Алматы</option>
                  <option value="astana">Астана</option>
                  <option value="shymkent">Шымкент</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="text-left">
              <h2 className="text-2xl font-bold mb-2">Проверьте и отправьте</h2>
              <p className="text-gray-600">
                Мастера получат уведомление и смогут предложить свои услуги
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600">Фотографии:</p>
                <p className="font-medium">{data.photos?.length} фото</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Название:</p>
                <p className="font-medium">{data.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Описание:</p>
                <p className="font-medium">{data.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Категория:</p>
                  <p className="font-medium">{data.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Регион:</p>
                  <p className="font-medium">{data.region}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                💡 После отправки мастера смогут предложить свою цену и сроки
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t">
        <button
          onClick={step === 1 ? onCancel : handleBack}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900"
          aria-label={step === 1 ? 'Отмена' : 'Назад'}
        >
          <ChevronLeft className="w-5 h-5" />
          {step === 1 ? 'Отмена' : 'Назад'}
        </button>

        {step < 3 ? (
          <Button
            aria-label="Далее"
            onClick={handleNext}
            disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
            variant="primary"
          >
            Далее
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        ) : (
          <Button
            aria-label="Отправить заявку"
            onClick={handleSubmit}
            variant="primary"
          >
            <Check className="w-5 h-5 mr-2" />
            Отправить заявку
          </Button>
        )}
      </div>
    </div>
  )
}



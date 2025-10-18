'use client'

import { useState } from 'react'

interface DevelopmentPlaceholderProps {
  feature: string
  description: string
  expectedDate?: string
  icon?: string
  onNotify?: () => void
}

export function DevelopmentPlaceholder({
  feature,
  description,
  expectedDate,
  icon = '🚧',
  onNotify
}: DevelopmentPlaceholderProps) {
  const [isNotified, setIsNotified] = useState(false)

  const handleNotify = () => {
    setIsNotified(true)
    onNotify?.()
    
    // Reset notification state after 3 seconds
    setTimeout(() => setIsNotified(false), 3000)
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 text-center">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{feature}</h3>
      <p className="text-gray-400 mb-4">{description}</p>
      
      {expectedDate && (
        <div className="bg-gray-800 rounded-lg p-3 mb-4">
          <p className="text-sm text-gray-300">
            <span className="text-[#FF6600] font-semibold">Ожидаемая дата:</span> {expectedDate}
          </p>
        </div>
      )}
      
      <button
        onClick={handleNotify}
        disabled={isNotified}
        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
          isNotified
            ? 'bg-green-600 text-white cursor-not-allowed'
            : 'bg-[#FF6600] hover:bg-[#E55A00] text-white'
        }`}
      >
        {isNotified ? '✅ Уведомление отправлено!' : '🔔 Уведомить о готовности'}
      </button>
      
      <p className="text-xs text-gray-500 mt-3">
        Мы работаем над этой функцией. Следите за обновлениями!
      </p>
    </div>
  )
}

export function ComingSoonCard({
  title,
  description,
  icon = '⏳',
  features = []
}: {
  title: string
  description: string
  icon?: string
  features?: string[]
}) {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6">
      <div className="text-center mb-4">
        <div className="text-3xl mb-2">{icon}</div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>
      
      {features.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-[#FF6600] mb-2">Планируемые возможности:</h4>
          <ul className="space-y-1">
            {features.map((feature, index) => (
              <li key={index} className="text-xs text-gray-400 flex items-center">
                <span className="w-1 h-1 bg-[#FF6600] rounded-full mr-2"></span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
          <span>В разработке</span>
        </div>
      </div>
    </div>
  )
}

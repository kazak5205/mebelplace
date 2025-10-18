'use client'

import { useState } from 'react'
// import { useTranslations } from 'next-intl' // Removed for admin

export default function AdminSettings() {
  // const t = useTranslations('admin.settings')
  const [settings, setSettings] = useState({
    siteName: 'MebelPlace',
    siteDescription: 'Платформа для заказа мебели',
    maintenanceMode: false,
    registrationEnabled: true,
    videoUploadEnabled: true,
    smsEnabled: true,
    emailNotifications: true,
    maxVideoSize: 100,
    maxVideoDuration: 300,
    allowedVideoFormats: ['mp4', 'mov', 'avi'],
    smsProvider: 'mobizon',
    emailProvider: 'smtp',
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/v2/admin/settings', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        alert('Настройки сохранены')
      } else {
        alert('Ошибка сохранения')
      }
    } catch (error) {
      alert('Ошибка сети')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Настройки системы</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Основные настройки</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Название сайта
            </label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => handleChange('siteName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Описание сайта
            </label>
            <input
              type="text"
              value={settings.siteDescription}
              onChange={(e) => handleChange('siteDescription', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Режим работы</h2>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="maintenanceMode"
              checked={settings.maintenanceMode}
              onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-900">
              Режим обслуживания
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="registrationEnabled"
              checked={settings.registrationEnabled}
              onChange={(e) => handleChange('registrationEnabled', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="registrationEnabled" className="ml-2 block text-sm text-gray-900">
              Разрешить регистрацию
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="videoUploadEnabled"
              checked={settings.videoUploadEnabled}
              onChange={(e) => handleChange('videoUploadEnabled', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="videoUploadEnabled" className="ml-2 block text-sm text-gray-900">
              Разрешить загрузку видео
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Настройки видео</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Максимальный размер (МБ)
            </label>
            <input
              type="number"
              value={settings.maxVideoSize}
              onChange={(e) => handleChange('maxVideoSize', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Максимальная длительность (сек)
            </label>
            <input
              type="number"
              value={settings.maxVideoDuration}
              onChange={(e) => handleChange('maxVideoDuration', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Уведомления</h2>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="smsEnabled"
              checked={settings.smsEnabled}
              onChange={(e) => handleChange('smsEnabled', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="smsEnabled" className="ml-2 block text-sm text-gray-900">
              SMS уведомления
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="emailNotifications"
              checked={settings.emailNotifications}
              onChange={(e) => handleChange('emailNotifications', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-900">
              Email уведомления
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
        >
          {saving ? 'Сохранение...' : 'Сохранить настройки'}
        </button>
      </div>
    </div>
  )
}
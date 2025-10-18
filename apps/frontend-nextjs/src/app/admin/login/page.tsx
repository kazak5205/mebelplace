'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Используем v2 login endpoint с проверкой роли
      const response = await fetch('/api/v2/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.username,
          password: credentials.password,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        // Проверяем что пользователь - админ
        if (result.user?.role !== 'admin') {
          setError('Доступ запрещен: требуется роль администратора')
          return
        }
        localStorage.setItem('admin_token', result.token)
        localStorage.setItem('access_token', result.token) // Также сохраняем для API
        router.push('/admin/dashboard')
      } else {
        setError('Неверные учетные данные')
      }
    } catch (error) {
      setError('Ошибка входа в систему')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Вход в админ панель
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            MebelPlace Admin Panel
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Имя пользователя
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Имя пользователя"
                value={credentials.username}
                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Пароль
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Пароль"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </div>

          <div className="text-center">
            <a
              href="/"
              className="text-blue-600 hover:text-blue-500 text-sm"
            >
              Вернуться на сайт
            </a>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
            <strong>Учётные данные:</strong><br />
            Email: <code>admin@mebelplace.com.kz</code><br />
            Пароль: <code>Admin123</code>
          </div>
        </form>
      </div>
    </div>
  )
}

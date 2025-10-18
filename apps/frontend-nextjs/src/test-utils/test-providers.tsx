import { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { NextIntlClientProvider } from 'next-intl'
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/store/slices/authSlice'
import uiReducer from '@/store/slices/uiSlice'

// Create a test store matching production store structure
export function createTestStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      ui: uiReducer,
    },
    preloadedState: {
      auth: {
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      },
      ui: {
        theme: 'light' as 'light' | 'dark',
        sidebarOpen: false,
        loading: false,
        notifications: [],
      },
    },
  })
}

// Test messages for next-intl
const testMessages = {
  common: {
    search: 'Поиск',
    notifications: 'Уведомления',
    profile: 'Профиль',
    settings: 'Настройки',
    logout: 'Выйти',
  },
  navigation: {
    feed: 'Лента',
    search: 'Поиск',
    requests: 'Заявки',
    chats: 'Чаты',
    profile: 'Профиль',
  },
  nav: {
    feed: 'Лента',
    search: 'Поиск',
    requests: 'Заявки',
    chats: 'Чаты',
    profile: 'Профиль',
    settings: 'Настройки',
    logout: 'Выйти',
  },
}

interface AllProvidersProps {
  children: ReactNode
  locale?: string
  messages?: any
  store?: ReturnType<typeof createTestStore>
}

export function AllProviders({
  children,
  locale = 'ru',
  messages = testMessages,
  store,
}: AllProvidersProps) {
  const testStore = store || createTestStore()

  return (
    <Provider store={testStore}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </Provider>
  )
}

export { testMessages }


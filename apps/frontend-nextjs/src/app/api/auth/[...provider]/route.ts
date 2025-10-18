// API Route для социальной авторизации
// Production OAuth интеграция

import { NextRequest, NextResponse } from 'next/server'
import { faker } from '@faker-js/faker'

// OAuth провайдеры конфигурация
const OAUTH_PROVIDERS = {
  google: {
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    scope: 'openid email profile'
  },
  apple: {
    client_id: process.env.APPLE_CLIENT_ID,
    client_secret: process.env.APPLE_CLIENT_SECRET,
    redirect_uri: process.env.APPLE_REDIRECT_URI,
    scope: 'name email'
  },
  facebook: {
    client_id: process.env.FACEBOOK_CLIENT_ID,
    client_secret: process.env.FACEBOOK_CLIENT_SECRET,
    redirect_uri: process.env.FACEBOOK_REDIRECT_URI,
    scope: 'email public_profile'
  }
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url)
  const provider = url.pathname.split('/').pop() as keyof typeof OAUTH_PROVIDERS
  
  const body = await request.json()
  const { provider: providerParam, redirect_uri, code, state } = body

  try {
    // Валидация провайдера
    if (!OAUTH_PROVIDERS[provider] || providerParam !== provider) {
      return NextResponse.json({
        status: 'error',
        message: 'Неподдерживаемый провайдер авторизации'
      }, { status: 400 })
    }

    // В production здесь будет реальный OAuth flow
    // Пока используем mock данные для демонстрации
    const mockUser = {
      id: faker.number.int({ min: 1000, max: 9999 }),
      username: `user_${provider}_${faker.string.alphanumeric(8)}`,
      name: faker.person.fullName(),
      email: faker.internet.email(),
      avatar: faker.image.avatar(),
      role: 'buyer',
      region: 'Алматы',
      subscribers_count: 0,
      is_verified: true,
      created_at: new Date().toISOString(),
      phone: faker.phone.number(),
      rating: 0,
      completed_orders: 0,
      provider: provider,
      provider_id: faker.string.alphanumeric(16)
    }

    const token = `oauth_${provider}_${Date.now()}_${faker.string.alphanumeric(32)}`

    return NextResponse.json({
      status: 'success',
      message: `Авторизация через ${provider} успешна`,
      user: mockUser,
      token,
      expires_in: 3600,
      refresh_token: `refresh_${provider}_${Date.now()}_${faker.string.alphanumeric(32)}`
    })

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Ошибка при авторизации'
    }, { status: 500 })
  }
}

// GET метод для OAuth callback
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const provider = url.pathname.split('/').pop() as keyof typeof OAUTH_PROVIDERS
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const error = url.searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL(`/auth/login?error=${error}`, request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/auth/login?error=no_code', request.url))
  }

  // В production здесь будет обработка OAuth callback
  // Пока редиректим на главную с успехом
  return NextResponse.redirect(new URL('/?oauth_success=true', request.url))
}


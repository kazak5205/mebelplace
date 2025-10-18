import { NextResponse } from 'next/server'

export function middleware(request) {
  // Генерируем nonce для CSP (Edge Runtime compatible)
  const nonce = crypto.randomUUID()
  
  // Создаем response
  const response = NextResponse.next()
  
  // Устанавливаем nonce в заголовки
  response.headers.set('x-nonce', nonce)
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}


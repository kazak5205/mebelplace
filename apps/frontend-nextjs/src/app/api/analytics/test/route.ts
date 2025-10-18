import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'Analytics test endpoint',
    timestamp: new Date().toISOString()
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Логируем аналитическое событие
    // Logging disabled in production('Analytics event received:', body)
    
    return NextResponse.json({ 
      status: 'success', 
      message: 'Event logged',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({ 
      status: 'error', 
      message: 'Invalid request body'
    }, { status: 400 })
  }
}


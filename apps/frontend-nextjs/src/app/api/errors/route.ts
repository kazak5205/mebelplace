import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    error: 'Not Found',
    message: 'Error endpoint not implemented',
    status: 404
  }, { status: 404 })
}

export async function POST() {
  return NextResponse.json({
    error: 'Not Found', 
    message: 'Error endpoint not implemented',
    status: 404
  }, { status: 404 })
}

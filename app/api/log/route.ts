import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    console.log('[Performance Log]:', data)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Performance Log Error]:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
} 
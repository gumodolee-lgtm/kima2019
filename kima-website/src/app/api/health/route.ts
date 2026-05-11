import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    await prisma.user.count()
    return NextResponse.json({ status: 'ok', db: 'connected' })
  } catch (error) {
    return NextResponse.json(
      { status: 'error', db: 'disconnected', message: 'DB 연결 실패' },
      { status: 503 }
    )
  }
}

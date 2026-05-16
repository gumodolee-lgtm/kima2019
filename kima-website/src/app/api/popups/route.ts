import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const now = new Date()
    const popups = await prisma.popup.findMany({
      where: {
        isActive: true,
        startAt: { lte: now },
        endAt: { gte: now },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ popups })
  } catch {
    return NextResponse.json({ popups: [] })
  }
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 공개 이벤트 목록 (로그인 없이 접근 가능, Zoom URL은 로그인 회원에게만)
export async function GET() {
  try {
    const events = await prisma.event.findMany({
      where: { scheduledAt: { gte: new Date() } },
      include: { _count: { select: { attendees: true } } },
      orderBy: { scheduledAt: 'asc' },
    })

    return NextResponse.json({ events })
  } catch {
    return NextResponse.json({ error: '일정 조회 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

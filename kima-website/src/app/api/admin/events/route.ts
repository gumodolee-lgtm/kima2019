import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod/v4'

const eventSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(200),
  description: z.string().max(1000).optional(),
  type: z.enum(['LISTENING_CALL', 'FORUM']),
  scheduledAt: z.string().datetime(),
  zoomUrl: z.string().url().optional(),
  maxAttendees: z.number().int().positive().optional(),
})

export async function GET() {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
    }
    const events = await prisma.event.findMany({
      include: { _count: { select: { attendees: true } } },
      orderBy: { scheduledAt: 'desc' },
    })
    return NextResponse.json({ events })
  } catch {
    return NextResponse.json({ error: '일정 조회 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = eventSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: '입력값이 올바르지 않습니다.', details: parsed.error.format() }, { status: 400 })
    }

    const event = await prisma.event.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        type: parsed.data.type,
        scheduledAt: new Date(parsed.data.scheduledAt),
        zoomUrl: parsed.data.zoomUrl ?? null,
        maxAttendees: parsed.data.maxAttendees ?? null,
      },
    })
    return NextResponse.json({ event }, { status: 201 })
  } catch {
    return NextResponse.json({ error: '일정 등록 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

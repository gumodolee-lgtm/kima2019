import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, eventReminderEmailHtml } from '@/lib/email'

// 매일 KST 09:00 (UTC 00:00) 실행
// 3일 후 예정된 행사의 신청자에게 리마인더 발송
export async function GET(request: NextRequest) {
  const secret = request.headers.get('authorization')?.replace('Bearer ', '')
  // CRON_SECRET 미설정 시 누구나 호출 가능한 버그 방지 — 환경변수 필수
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: '인증 실패' }, { status: 401 })
  }

  try {
    const now = new Date()
    // 3일 후 당일 범위 (KST 기준 오전 00:00 ~ 23:59)
    const in3Days = new Date(now)
    in3Days.setDate(in3Days.getDate() + 3)
    const dayStart = new Date(in3Days)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(in3Days)
    dayEnd.setHours(23, 59, 59, 999)

    const events = await prisma.event.findMany({
      where: { scheduledAt: { gte: dayStart, lte: dayEnd } },
      include: { attendees: { select: { name: true, email: true } } },
    })

    let sent = 0
    await Promise.allSettled(
      events.flatMap((event) =>
        event.attendees.map(async (attendee) => {
          await sendEmail(
            attendee.email,
            `[KIMA] ${event.title} — 3일 전 리마인더`,
            eventReminderEmailHtml(event.title, event.scheduledAt, event.zoomUrl)
          )
          sent++
        })
      )
    )

    return NextResponse.json({ ok: true, events: events.length, sent })
  } catch (err) {
    console.error('[cron/event-reminders]', err)
    return NextResponse.json({ error: '처리 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

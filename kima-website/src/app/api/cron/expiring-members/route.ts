import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, premiumExpiringEmailHtml } from '@/lib/email'

// Cloudflare Workers Cron 또는 Vercel Cron에서 GET 요청으로 트리거
// 매일 KST 09:00 (UTC 00:00) 실행
// Authorization 헤더로 CRON_SECRET 검증
export async function GET(request: NextRequest) {
  const secret = request.headers.get('authorization')?.replace('Bearer ', '')
  // CRON_SECRET 미설정 시 누구나 호출 가능한 버그 방지 — 환경변수 필수
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: '인증 실패' }, { status: 401 })
  }

  try {
    const now = new Date()
    const in30Days = new Date(now)
    in30Days.setDate(in30Days.getDate() + 30)

    // 1. 이미 만료된 정회원 → MEMBER로 다운그레이드
    const expired = await prisma.user.findMany({
      where: {
        role: 'PREMIUM',
        expiresAt: { lt: now },
      },
      select: { id: true },
    })

    if (expired.length > 0) {
      await prisma.user.updateMany({
        where: { id: { in: expired.map((u) => u.id) } },
        data: { role: 'MEMBER' },
      })
    }

    // 2. 만료일이 오늘 ~ 30일 이내인 정회원 → 갱신 안내 이메일
    const expiring = await prisma.user.findMany({
      where: {
        role: 'PREMIUM',
        expiresAt: {
          gte: now,
          lte: in30Days,
        },
      },
      select: { id: true, name: true, email: true, expiresAt: true },
    })

    let sent = 0
    await Promise.allSettled(
      expiring.map(async (user) => {
        if (!user.email || !user.expiresAt) return
        await sendEmail(
          user.email,
          '[KIMA] 정회원 갱신 안내 — 만료 30일 전',
          premiumExpiringEmailHtml(user.name ?? '회원', user.expiresAt)
        )
        sent++
      })
    )

    return NextResponse.json({
      ok: true,
      downgraded: expired.length,
      checked: expiring.length,
      sent,
    })
  } catch (err) {
    console.error('[cron/expiring-members]', err)
    return NextResponse.json({ error: '처리 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

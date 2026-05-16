import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod/v4'

const schema = z.object({
  depositorName: z.string().min(1, '입금자명을 입력해 주세요.').max(50),
  amount: z.coerce.number().int().min(0).max(10_000_000).optional().default(50000),
  depositedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '입금일 형식이 올바르지 않습니다.'),
  memo: z.string().max(200).optional().default(''),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, premiumNote: true },
    })
    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 })
    }
    if (user.role === 'PREMIUM' || user.role === 'OFFICER' || user.role === 'ADMIN') {
      return NextResponse.json({ error: '이미 정회원 이상입니다.' }, { status: 400 })
    }
    if (user.premiumNote?.startsWith('[신청]')) {
      return NextResponse.json({ error: '이미 신청이 접수되어 있습니다. 관리자 승인을 기다려 주세요.' }, { status: 400 })
    }

    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? '입력값이 올바르지 않습니다.'
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    const { depositorName, amount, depositedAt, memo } = parsed.data
    const noteStr = `[신청] 입금자:${depositorName} 금액:${amount.toLocaleString()}원 입금일:${depositedAt}${memo ? ` 메모:${memo}` : ''}`

    await prisma.user.update({
      where: { id: session.user.id },
      data: { premiumNote: noteStr },
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

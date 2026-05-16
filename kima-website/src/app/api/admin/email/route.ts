import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { z } from 'zod/v4'
import type { UserRole } from '@prisma/client'

const bodySchema = z.object({
  target: z.enum(['ALL', 'MEMBER', 'PREMIUM', 'OFFICER', 'ADMIN']),
  subject: z.string().min(1, '제목을 입력해주세요.').max(200),
  html: z.string().min(1, '내용을 입력해주세요.'),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: '입력값이 올바르지 않습니다.', details: parsed.error.format() }, { status: 400 })
    }

    const { target, subject, html } = parsed.data

    // 수신 대상 조회
    const whereRole: UserRole[] =
      target === 'ALL'
        ? ['MEMBER', 'PREMIUM', 'OFFICER', 'ADMIN']
        : [target as UserRole]

    const users = await prisma.user.findMany({
      where: { role: { in: whereRole } },
      select: { email: true, name: true },
    })

    const recipients = users.filter((u) => !!u.email)

    if (recipients.length === 0) {
      return NextResponse.json({ ok: true, total: 0, sent: 0, failed: 0 })
    }

    // 50명씩 배치 발송 (SMTP 타임아웃 방지)
    const BATCH_SIZE = 50
    let sent = 0
    let failed = 0

    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const batch = recipients.slice(i, i + BATCH_SIZE)
      const results = await Promise.allSettled(
        batch.map((user) =>
          sendEmail(user.email!, subject, personalizeHtml(html, user.name))
        )
      )
      results.forEach((r) => {
        if (r.status === 'fulfilled') sent++
        else failed++
      })
    }

    return NextResponse.json({ ok: true, total: recipients.length, sent, failed })
  } catch (err) {
    console.error('[admin/email]', err)
    return NextResponse.json({ error: '메일 발송 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

// 수신자 이름 치환: 본문 안의 {{이름}} → 실제 이름
function personalizeHtml(html: string, name: string | null): string {
  return html.replace(/\{\{이름\}\}/g, name ?? '회원')
}

// 발송 대상 회원 수 미리보기 (GET)
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const target = searchParams.get('target') ?? 'ALL'

    const whereRole: UserRole[] =
      target === 'ALL'
        ? ['MEMBER', 'PREMIUM', 'OFFICER', 'ADMIN']
        : ([target] as UserRole[])

    const count = await prisma.user.count({
      where: { role: { in: whereRole } },
    })

    return NextResponse.json({ count })
  } catch {
    return NextResponse.json({ error: '조회 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

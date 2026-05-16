import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail, welcomeEmailHtml } from '@/lib/email'
import bcrypt from 'bcryptjs'
import { z } from 'zod/v4'

const memberSchema = z.object({
  name: z.string().min(1).max(50),
  email: z.string().email(),
  organization: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  region: z.string().max(50).optional(),
})

const bodySchema = z.object({
  members: z.array(memberSchema).min(1).max(500),
  initialPassword: z.string().min(8, '초기 비밀번호는 8자 이상이어야 합니다.'),
  sendWelcomeEmail: z.boolean().default(true),
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

    const { members, initialPassword, sendWelcomeEmail } = parsed.data

    const hashedPassword = await bcrypt.hash(initialPassword, 12)

    const results = {
      created: 0,
      skipped: 0,  // 이미 존재하는 이메일
      failed: 0,
      details: [] as { email: string; status: 'created' | 'skipped' | 'failed'; reason?: string }[],
    }

    for (const member of members) {
      try {
        // 이메일 중복 확인
        const existing = await prisma.user.findUnique({
          where: { email: member.email },
          select: { id: true },
        })

        if (existing) {
          results.skipped++
          results.details.push({ email: member.email, status: 'skipped', reason: '이미 가입된 이메일' })
          continue
        }

        // 회원 생성
        const user = await prisma.user.create({
          data: {
            name: member.name,
            email: member.email,
            organization: member.organization,
            phone: member.phone,
            region: member.region,
            role: 'MEMBER',
            accounts: {
              create: {
                type: 'credentials',
                provider: 'credentials',
                providerAccountId: member.email,
                access_token: hashedPassword,
              },
            },
          },
        })

        results.created++
        results.details.push({ email: member.email, status: 'created' })

        // 환영 이메일 발송
        if (sendWelcomeEmail) {
          sendEmail(
            user.email!,
            '[KIMA] 회원 가입을 환영합니다',
            welcomeEmailHtml(user.name ?? '회원')
          ).catch(() => {})
        }
      } catch {
        results.failed++
        results.details.push({ email: member.email, status: 'failed', reason: '등록 중 오류' })
      }
    }

    return NextResponse.json({ ok: true, ...results })
  } catch (err) {
    console.error('[admin/bulk-register]', err)
    return NextResponse.json({ error: '회원 일괄 등록 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

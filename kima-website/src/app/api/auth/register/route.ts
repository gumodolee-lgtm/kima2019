import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { registerSchema } from '@/schemas/auth.schema'
import { sendEmail, welcomeEmailHtml } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { message: '입력값이 올바르지 않습니다', errors: parsed.error.format() },
        { status: 400 }
      )
    }

    const { name, email, password, organization } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { message: '이미 사용 중인 이메일입니다' },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: { name, email, organization, role: 'MEMBER' },
    })

    // credentials provider용 Account에 해시된 비밀번호 저장
    await prisma.account.create({
      data: {
        userId: user.id,
        type: 'credentials',
        provider: 'credentials',
        providerAccountId: user.id,
        access_token: hashedPassword,
      },
    })

    // 환영 이메일 (실패해도 가입은 완료)
    sendEmail(email, 'KIMA 가입을 환영합니다', welcomeEmailHtml(name)).catch(() => {})

    return NextResponse.json({ message: '가입이 완료되었습니다' }, { status: 201 })
  } catch {
    return NextResponse.json({ message: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}

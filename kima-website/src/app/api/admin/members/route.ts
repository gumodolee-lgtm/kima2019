import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod/v4'
import type { UserRole } from '@prisma/client'

const createSchema = z.object({
  email:        z.string().email('올바른 이메일을 입력해주세요'),
  password:     z.string().min(8, '비밀번호는 8자 이상이어야 합니다').optional(),
  name:         z.string().min(1, '이름을 입력해주세요').max(50).optional(),
  role:         z.enum(['MEMBER', 'PREMIUM', 'OFFICER', 'ADMIN']).default('MEMBER'),
  organization: z.string().max(100).nullable().optional(),
  position:     z.string().max(50).nullable().optional(),
  phone:        z.string().max(30).nullable().optional(),
  address:      z.string().max(200).nullable().optional(),
  denomination: z.string().max(100).nullable().optional(),
  region:       z.string().max(50).nullable().optional(),
  expiresAt:    z.string().datetime().nullable().optional(),
})

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? '입력값이 올바르지 않습니다.'
      return NextResponse.json({ error: firstError }, { status: 400 })
    }

    const { email, password, name, role, organization, position, phone,
            address, denomination, region, expiresAt } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: '이미 사용 중인 이메일입니다.' }, { status: 409 })
    }

    const tempPassword = password ?? generateTempPassword()
    const hashedPassword = await bcrypt.hash(tempPassword, 12)

    const updateData: Record<string, unknown> = {
      name, email, organization, position, phone,
      address, denomination, region,
      role: role as UserRole,
    }
    if (role === 'PREMIUM') {
      updateData.approvedAt = new Date()
      if (expiresAt) {
        updateData.expiresAt = new Date(expiresAt)
      } else {
        const exp = new Date()
        exp.setFullYear(exp.getFullYear() + 1)
        updateData.expiresAt = exp
      }
    }

    const user = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({ data: updateData as Parameters<typeof tx.user.create>[0]['data'] })
      await tx.account.create({
        data: {
          userId: u.id,
          type: 'credentials',
          provider: 'credentials',
          providerAccountId: u.id,
          access_token: hashedPassword,
        },
      })
      return u
    })

    return NextResponse.json({
      user,
      tempPassword: password ? null : tempPassword,
    }, { status: 201 })
  } catch {
    return NextResponse.json({ error: '회원 생성 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const session = await auth()
  const role = session?.user?.role
  if (role !== 'ADMIN' && role !== 'OFFICER') {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
  }

  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''

  const users = await prisma.user.findMany({
    where: q ? {
      OR: [
        { name:         { contains: q, mode: 'insensitive' } },
        { email:        { contains: q, mode: 'insensitive' } },
        { organization: { contains: q, mode: 'insensitive' } },
      ],
    } : undefined,
    select: {
      id: true, name: true, email: true,
      organization: true, position: true, phone: true,
    },
    orderBy: { name: 'asc' },
    take: 20,
  })

  return NextResponse.json({ users })
}

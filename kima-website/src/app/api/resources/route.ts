import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { resourceSchema } from '@/schemas/resource.schema'
import type { UserRole, AccessLevel } from '@prisma/client'

const ROLE_WEIGHT: Record<UserRole, number> = { MEMBER: 1, PREMIUM: 2, OFFICER: 3, ADMIN: 4 }

function getAllowedLevels(role?: UserRole): AccessLevel[] {
  const weight = role ? (ROLE_WEIGHT[role] ?? 0) : 0
  if (weight >= 2) return ['PUBLIC', 'MEMBER', 'PREMIUM']
  if (weight >= 1) return ['PUBLIC', 'MEMBER']
  return ['PUBLIC']
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    const role = session?.user?.role as UserRole | undefined
    const allowedLevels = getAllowedLevels(role)

    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')

    const resources = await prisma.resource.findMany({
      where: {
        accessLevel: { in: allowedLevels },
        ...(categoryId ? { categoryId } : {}),
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ resources })
  } catch {
    return NextResponse.json({ error: '자료를 불러오는 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }
    const role = session.user.role as UserRole
    if (ROLE_WEIGHT[role] < 3) {
      return NextResponse.json({ error: '자료 등록 권한이 없습니다. (임원·위원장 이상)' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = resourceSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: '입력값이 올바르지 않습니다.', details: parsed.error.format() }, { status: 400 })
    }

    const resource = await prisma.resource.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        driveUrl: parsed.data.driveUrl,
        fileType: parsed.data.fileType ?? null,
        accessLevel: parsed.data.accessLevel,
        categoryId: parsed.data.categoryId ?? null,
        uploadedById: session.user.id,
      },
    })

    return NextResponse.json({ resource }, { status: 201 })
  } catch {
    return NextResponse.json({ error: '자료 등록 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

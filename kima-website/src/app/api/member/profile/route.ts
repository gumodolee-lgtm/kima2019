import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateSchema = z.object({
  organization: z.string().max(100).nullable().optional(),
  region: z.string().max(50).nullable().optional(),
})

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: '입력값이 올바르지 않습니다' }, { status: 400 })
  }

  const { organization, region } = parsed.data

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(organization !== undefined && { organization }),
        ...(region !== undefined && { region }),
      },
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: '저장에 실패했습니다' }, { status: 500 })
  }
}

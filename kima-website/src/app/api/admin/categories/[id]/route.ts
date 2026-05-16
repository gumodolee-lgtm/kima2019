import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod/v4'

const patchSchema = z.object({
  officerName: z.string().max(100).nullable().optional(),
  officerPhone: z.string().max(20).nullable().optional(),
  officerEmail: z.string().max(200).nullable().optional(),
  officerSns: z.string().max(200).nullable().optional(),
  officerQr: z.string().max(500).nullable().optional(),
})

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: '입력값이 올바르지 않습니다.' }, { status: 400 })
    }

    const category = await prisma.category.update({
      where: { id },
      data: parsed.data,
    })
    return NextResponse.json({ category })
  } catch {
    return NextResponse.json({ error: '카테고리 수정 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

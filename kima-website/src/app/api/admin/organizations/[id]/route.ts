import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod/v4'

const patchSchema = z.object({
  action: z.enum(['approve', 'reject']),
  rejectReason: z.string().max(500).optional(),
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

    if (parsed.data.action === 'approve') {
      const org = await prisma.organization.update({
        where: { id },
        data: { isPublic: true },
      })
      return NextResponse.json({ org })
    }

    // reject: delete the organization record
    await prisma.organization.delete({ where: { id } })
    return NextResponse.json({ message: '반려 처리되었습니다.' })
  } catch {
    return NextResponse.json({ error: '처리 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

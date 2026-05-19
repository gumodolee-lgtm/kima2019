import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod/v4'

const patchSchema = z.object({
  group:    z.enum(['ADVISOR', 'EXECUTIVE', 'LANGUAGE_CHAIR', 'REGION_CHAIR', 'DENOMINATION_REP', 'NETWORK_CHAIR']).optional(),
  title:    z.string().min(1).max(50).optional(),
  name:     z.string().min(1).max(30).optional(),
  org:      z.string().max(100).nullable().optional(),
  position: z.string().max(50).nullable().optional(),
  phone:    z.string().max(30).nullable().optional(),
  email:    z.string().max(100).nullable().optional(),
  nations:  z.string().max(200).nullable().optional(),
  mission:  z.string().max(200).nullable().optional(),
  order:    z.number().int().optional(),
  isActive: z.boolean().optional(),
})

function requireOfficer(role?: string | null) {
  return role === 'ADMIN' || role === 'OFFICER'
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!requireOfficer(session?.user?.role)) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }
    const { id } = await params
    const body = await req.json()
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: '입력값이 올바르지 않습니다.' }, { status: 400 })
    }
    const leader = await prisma.leader.update({ where: { id }, data: parsed.data })
    return NextResponse.json({ leader })
  } catch {
    return NextResponse.json({ error: '수정 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!requireOfficer(session?.user?.role)) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }
    const { id } = await params
    await prisma.leader.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: '삭제 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

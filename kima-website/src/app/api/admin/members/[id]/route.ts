import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail, premiumApprovedEmailHtml } from '@/lib/email'
import { z } from 'zod/v4'
import type { UserRole } from '@prisma/client'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
    }

    const { id } = await params

    // Prevent self-deletion
    if (id === session.user.id) {
      return NextResponse.json({ error: '자기 자신은 삭제할 수 없습니다.' }, { status: 400 })
    }

    await prisma.user.delete({ where: { id } })
    return NextResponse.json({ message: '회원이 삭제되었습니다.' })
  } catch {
    return NextResponse.json({ error: '회원 삭제 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

const patchSchema = z.object({
  role: z.enum(['MEMBER', 'PREMIUM', 'OFFICER', 'ADMIN']).optional(),
  premiumNote: z.string().max(500).nullable().optional(),
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

    const current = await prisma.user.findUnique({ where: { id }, select: { premiumNote: true } })

    const updateData: Record<string, unknown> = {}
    if (parsed.data.role !== undefined) {
      updateData.role = parsed.data.role as UserRole
      if (parsed.data.role === 'PREMIUM') {
        updateData.approvedAt = new Date()
        const expires = new Date()
        expires.setFullYear(expires.getFullYear() + 1)
        updateData.expiresAt = expires
        // [신청] 접수 내역을 [승인됨]으로 변경해 이력 보존
        if (current?.premiumNote?.startsWith('[신청]')) {
          updateData.premiumNote = current.premiumNote.replace('[신청]', '[승인됨]')
        }
      }
    }
    if ('premiumNote' in parsed.data) {
      updateData.premiumNote = parsed.data.premiumNote
    }

    const user = await prisma.user.update({ where: { id }, data: updateData })

    // 정회원 승급 시 승인 이메일 발송
    if (parsed.data.role === 'PREMIUM' && user.email) {
      sendEmail(
        user.email,
        '[KIMA] 정회원 승인이 완료되었습니다',
        premiumApprovedEmailHtml(user.name ?? '회원')
      ).catch(() => {})
    }

    return NextResponse.json({ user })
  } catch {
    return NextResponse.json({ error: '회원 정보 수정 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

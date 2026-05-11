import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function canWrite(role?: string) {
  return role === 'ADMIN' || role === 'OFFICER'
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const story = await prisma.story.findUnique({
      where: { id },
      include: { author: { select: { name: true } } },
    })
    if (!story || !story.isPublished) {
      return NextResponse.json({ error: '스토리를 찾을 수 없습니다.' }, { status: 404 })
    }
    return NextResponse.json({ story })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: '조회 중 오류가 발생했습니다.', detail: msg }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!canWrite(session?.user?.role)) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }
    const { id } = await params
    await prisma.story.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: '삭제 중 오류가 발생했습니다.', detail: msg }, { status: 500 })
  }
}

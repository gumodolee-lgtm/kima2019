import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod/v4'

function canWrite(role?: string) {
  return role === 'ADMIN' || role === 'OFFICER'
}

const patchSchema = z.object({
  type: z.enum(['NEWS', 'FIELD_STORY', 'EVENT_MEDIA', 'EVENT_PROMO', 'PRAYER_REQUEST']).optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  isPublished: z.boolean().optional(),
  isAnswered: z.boolean().optional(),
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().max(300).nullable().optional(),
  linkUrl: z.string().nullable().optional(),
  source: z.string().max(100).nullable().optional(),
  publishedAt: z.string().nullable().optional(),
  eventLocation: z.string().max(100).nullable().optional(),
  ministryLocation: z.string().max(100).nullable().optional(),
  videoUrls: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!canWrite(session?.user?.role)) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }
    const { id } = await params
    const body = await req.json()
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: '입력값이 올바르지 않습니다.' }, { status: 400 })
    }
    const d = parsed.data
    const story = await prisma.story.update({
      where: { id },
      data: {
        ...(d.type !== undefined ? { type: d.type } : {}),
        ...(d.status !== undefined ? { status: d.status } : {}),
        ...(d.isPublished !== undefined ? { isPublished: d.isPublished } : {}),
        ...(d.isAnswered !== undefined ? { isAnswered: d.isAnswered } : {}),
        ...(d.title !== undefined ? { title: d.title } : {}),
        ...(d.content !== undefined ? { content: d.content } : {}),
        ...(d.excerpt !== undefined ? { excerpt: d.excerpt } : {}),
        ...(d.linkUrl !== undefined ? { linkUrl: d.linkUrl } : {}),
        ...(d.source !== undefined ? { source: d.source } : {}),
        ...(d.publishedAt !== undefined ? { publishedAt: d.publishedAt ? new Date(d.publishedAt) : null } : {}),
        ...(d.eventLocation !== undefined ? { eventLocation: d.eventLocation } : {}),
        ...(d.ministryLocation !== undefined ? { ministryLocation: d.ministryLocation } : {}),
        ...(d.videoUrls !== undefined ? { videoUrls: d.videoUrls } : {}),
        ...(d.tags !== undefined ? { tags: d.tags } : {}),
      },
    })
    return NextResponse.json({ story })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: '수정 중 오류가 발생했습니다.', detail: msg }, { status: 500 })
  }
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

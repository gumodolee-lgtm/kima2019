import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod/v4'

const storySchema = z.object({
  title:       z.string().min(1, '제목을 입력해주세요').max(200),
  content:     z.string().min(1, '내용을 입력해주세요'),
  type:        z.enum(['TEXT', 'VIDEO']),
  videoUrl:    z.preprocess(
    (v) => (v === '' || v == null ? undefined : v),
    z.string().url('올바른 URL을 입력해주세요').optional(),
  ),
  thumbnail:   z.preprocess(
    (v) => (v === '' || v == null ? undefined : v),
    z.string().url().optional(),
  ),
  isPublished: z.boolean().optional(),
})

function canWrite(role?: string) {
  return role === 'ADMIN' || role === 'OFFICER'
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    const stories = await prisma.story.findMany({
      where: {
        isPublished: true,
        ...(type === 'TEXT' || type === 'VIDEO' ? { type } : {}),
      },
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ stories })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: '스토리 조회 중 오류가 발생했습니다.', detail: msg }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!canWrite(session?.user?.role)) {
      return NextResponse.json({ error: '임원 이상만 작성할 수 있습니다.' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = storySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: '입력값이 올바르지 않습니다.', details: parsed.error.format() }, { status: 400 })
    }

    if (parsed.data.type === 'VIDEO' && !parsed.data.videoUrl) {
      return NextResponse.json({ error: '영상자료는 영상 URL이 필요합니다.' }, { status: 400 })
    }

    const story = await prisma.story.create({
      data: {
        title:       parsed.data.title,
        content:     parsed.data.content,
        type:        parsed.data.type,
        videoUrl:    parsed.data.videoUrl ?? null,
        thumbnail:   parsed.data.thumbnail ?? null,
        isPublished: parsed.data.isPublished ?? true,
        authorId:    session!.user!.id,
      },
    })
    return NextResponse.json({ story }, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: '스토리 등록 중 오류가 발생했습니다.', detail: msg }, { status: 500 })
  }
}

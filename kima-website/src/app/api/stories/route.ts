import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod/v4'

const OFFICER_TYPES = ['NEWS', 'EVENT_MEDIA'] as const
const MEMBER_TYPES  = ['FIELD_STORY', 'PRAYER_REQUEST'] as const
const ALL_TYPES     = [...OFFICER_TYPES, ...MEMBER_TYPES] as const

const storySchema = z.object({
  type:             z.enum(ALL_TYPES),
  title:            z.string().min(1, '제목을 입력해주세요').max(200),
  content:          z.string().min(1, '내용을 입력해주세요'),
  excerpt:          z.string().max(300).optional().nullable(),
  thumbnail:        z.string().url().optional().nullable(),
  images:           z.array(z.string()).optional(),
  videoUrls:        z.array(z.string()).optional(),
  tags:             z.array(z.string()).optional(),
  isPublished:      z.boolean().optional(),
  status:           z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  // NEWS
  linkUrl:          z.string().url().optional().nullable(),
  source:           z.string().max(100).optional().nullable(),
  publishedAt:      z.string().datetime().optional().nullable(),
  // FIELD_STORY
  authorName:       z.string().max(50).optional().nullable(),
  ministryLocation: z.string().max(100).optional().nullable(),
  // PRAYER_REQUEST
  urgency:          z.enum(['URGENT', 'NORMAL']).optional().nullable(),
  visibility:       z.enum(['PUBLIC', 'MEMBER', 'PRAYER_TEAM']).optional(),
  requesterName:    z.string().max(50).optional().nullable(),
})

function isOfficer(role?: string) {
  return role === 'ADMIN' || role === 'OFFICER'
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    const validType = ALL_TYPES.includes(type as typeof ALL_TYPES[number])
      ? (type as typeof ALL_TYPES[number])
      : undefined

    const stories = await prisma.story.findMany({
      where: {
        isPublished: true,
        status: 'APPROVED',
        ...(validType ? { type: validType } : {}),
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
    const body = await request.json()
    const parsed = storySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: '입력값이 올바르지 않습니다.', details: parsed.error.format() }, { status: 400 })
    }

    const { type } = parsed.data

    // NEWS and EVENT_MEDIA require officer role
    if ((OFFICER_TYPES as readonly string[]).includes(type) && !isOfficer(session?.user?.role)) {
      return NextResponse.json({ error: '임원 이상만 작성할 수 있습니다.' }, { status: 403 })
    }

    // FIELD_STORY requires login (prayer requests allow anonymous)
    if (type === 'FIELD_STORY' && !session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const isOfficerUser = isOfficer(session?.user?.role)

    const story = await prisma.story.create({
      data: {
        type,
        title:            parsed.data.title,
        content:          parsed.data.content,
        excerpt:          parsed.data.excerpt ?? null,
        thumbnail:        parsed.data.thumbnail ?? null,
        images:           parsed.data.images ?? [],
        videoUrls:        parsed.data.videoUrls ?? [],
        tags:             parsed.data.tags ?? [],
        isPublished:      parsed.data.isPublished ?? (isOfficerUser ? true : false),
        status:           parsed.data.status ?? (isOfficerUser ? 'APPROVED' : 'PENDING'),
        linkUrl:          parsed.data.linkUrl ?? null,
        source:           parsed.data.source ?? null,
        publishedAt:      parsed.data.publishedAt ? new Date(parsed.data.publishedAt) : null,
        authorName:       parsed.data.authorName ?? null,
        ministryLocation: parsed.data.ministryLocation ?? null,
        urgency:          parsed.data.urgency ?? null,
        visibility:       parsed.data.visibility ?? 'PUBLIC',
        requesterName:    parsed.data.requesterName ?? null,
        authorId:         session?.user?.id ?? null,
      },
    })
    return NextResponse.json({ story }, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: '스토리 등록 중 오류가 발생했습니다.', detail: msg }, { status: 500 })
  }
}

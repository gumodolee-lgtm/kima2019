import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const FALLBACK_IMAGES = [
  '/images/church_1.jpg',
  '/images/church_2.jpg',
  '/images/church_3.jpg',
  '/images/church_4.jpg',
]

export async function POST(_req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'OFFICER') {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
  }

  // 이미지가 없는 단체를 gmfsnsId 오름차순, createdAt 오름차순으로 정렬
  const orgs = await prisma.organization.findMany({
    where: { image: null },
    orderBy: [{ gmfsnsId: 'asc' }, { createdAt: 'asc' }],
    select: { id: true },
  })

  if (orgs.length === 0) {
    return NextResponse.json({ assigned: 0, message: '이미지가 없는 단체가 없습니다.' })
  }

  let assigned = 0
  for (let i = 0; i < orgs.length; i++) {
    const imageUrl = FALLBACK_IMAGES[i % FALLBACK_IMAGES.length]
    await prisma.organization.update({
      where: { id: orgs[i].id },
      data: { image: imageUrl },
    })
    assigned++
  }

  return NextResponse.json({
    assigned,
    message: `${assigned}개 단체에 기본 이미지를 할당했습니다.`,
  })
}

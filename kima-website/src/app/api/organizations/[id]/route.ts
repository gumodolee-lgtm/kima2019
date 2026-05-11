import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const org = await prisma.organization.findUnique({
      where: { id, isPublic: true },
    })

    if (!org) {
      return NextResponse.json({ error: '단체를 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json({ organization: org })
  } catch {
    return NextResponse.json({ error: '데이터를 불러오는 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { organizationSchema } from '@/schemas/organization.schema'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const region = searchParams.get('region')
    const language = searchParams.get('language')
    const target = searchParams.get('target')
    const type = searchParams.get('type')

    const orgs = await prisma.organization.findMany({
      where: {
        isPublic: true,
        ...(region ? { region } : {}),
        ...(language ? { languages: { has: language } } : {}),
        ...(target ? { targets: { has: target } } : {}),
        ...(type ? { type } : {}),
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ organizations: orgs })
  } catch {
    return NextResponse.json({ error: '데이터를 불러오는 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = organizationSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: '입력값이 올바르지 않습니다.', details: parsed.error.format() }, { status: 400 })
    }

    const data = parsed.data
    const org = await prisma.organization.create({
      data: {
        name: data.name,
        nameEn: data.nameEn || null,
        description: data.description || null,
        region: data.region,
        languages: data.languages as string[],
        targets: data.targets as string[],
        type: data.type || null,
        address: data.address || null,
        phone: data.phone || null,
        email: data.email || null,
        website: data.website || null,
        isPublic: true,
      },
    })

    return NextResponse.json({ organization: org }, { status: 201 })
  } catch {
    return NextResponse.json({ error: '단체 등록 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

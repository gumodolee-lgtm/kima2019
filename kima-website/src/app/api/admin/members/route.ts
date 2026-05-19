import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await auth()
  const role = session?.user?.role
  if (role !== 'ADMIN' && role !== 'OFFICER') {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
  }

  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''

  const users = await prisma.user.findMany({
    where: q ? {
      OR: [
        { name:         { contains: q, mode: 'insensitive' } },
        { email:        { contains: q, mode: 'insensitive' } },
        { organization: { contains: q, mode: 'insensitive' } },
      ],
    } : undefined,
    select: {
      id: true, name: true, email: true,
      organization: true, position: true, phone: true,
    },
    orderBy: { name: 'asc' },
    take: 20,
  })

  return NextResponse.json({ users })
}

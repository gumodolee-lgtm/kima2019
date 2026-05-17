import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { geocodeAddress } from '@/lib/kakaoGeocoding'

// 최대 처리 건수 (Kakao 무료 일 30만 건 기준 여유 있음)
const BATCH_LIMIT = 100

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
    }

    const { force } = await request.json().catch(() => ({ force: false })) as { force?: boolean }

    // 좌표가 없는 (또는 force=true 시 전체) 단체 조회
    const orgs = await prisma.organization.findMany({
      where: force ? { address: { not: null } } : { address: { not: null }, lat: null },
      select: { id: true, address: true, name: true },
      take: BATCH_LIMIT,
    })

    const results = { total: orgs.length, success: 0, failed: 0, skipped: 0, errors: [] as string[] }

    for (const org of orgs) {
      if (!org.address) { results.skipped++; continue }

      const geo = await geocodeAddress(org.address)
      if (geo) {
        await prisma.organization.update({
          where: { id: org.id },
          data: { lat: geo.lat, lng: geo.lng },
        })
        results.success++
      } else {
        results.failed++
        results.errors.push(`${org.name}: ${org.address}`)
      }

      // Kakao API 권장 간격 (분당 요청 초과 방지)
      await new Promise((r) => setTimeout(r, 200))
    }

    return NextResponse.json(results)
  } catch {
    return NextResponse.json({ error: '처리 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

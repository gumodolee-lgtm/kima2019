import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { geocodeAddress } from '@/lib/kakaoGeocoding'

export async function POST() {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
    }

    // 주소는 있지만 좌표가 없는 단체 조회
    const orgs = await prisma.organization.findMany({
      where: { address: { not: null }, lat: null },
      select: { id: true, address: true, name: true },
    })

    const results = { success: 0, failed: 0, total: orgs.length }

    for (const org of orgs) {
      if (!org.address) continue

      const coords = await geocodeAddress(org.address)
      if (coords) {
        await prisma.organization.update({
          where: { id: org.id },
          data: { lat: coords.lat, lng: coords.lng },
        })
        results.success++
      } else {
        results.failed++
      }

      // Nominatim 이용 정책: 요청 간 1초 간격
      await new Promise((r) => setTimeout(r, 1100))
    }

    return NextResponse.json(results)
  } catch {
    return NextResponse.json({ error: '처리 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { normalizeKoreanAddress } from '@/lib/normalizeKoreanAddress'

/**
 * POST /api/admin/normalize-addresses
 * 기존 단체 주소를 읽어 region 값을 재정규화합니다.
 * ADMIN 전용.
 *
 * 응답: { updated, skipped, failed, total }
 */
export async function POST() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
  }

  try {
    const orgs = await prisma.organization.findMany({
      select: { id: true, address: true, region: true },
    })

    let updated = 0
    let skipped = 0
    let failed = 0

    for (const org of orgs) {
      // 주소가 없으면 건너뜀
      if (!org.address) {
        skipped++
        continue
      }

      const result = normalizeKoreanAddress(org.address)

      // 지역을 판별할 수 없으면 건너뜀
      if (!result.kimaRegion || result.confidence === 'low') {
        skipped++
        continue
      }

      // 이미 올바른 값이면 건너뜀
      if (org.region === result.kimaRegion) {
        skipped++
        continue
      }

      try {
        await prisma.organization.update({
          where: { id: org.id },
          data: { region: result.kimaRegion },
        })
        updated++
      } catch {
        failed++
      }
    }

    return NextResponse.json({ updated, skipped, failed, total: orgs.length })
  } catch {
    return NextResponse.json({ error: '처리 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { normalizeKoreanAddress } from '@/lib/normalizeKoreanAddress'
import { ORG_REGIONS } from '@/schemas/organization.schema'

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

    // 유효한 KIMA 지역 목록 (organization.schema의 ORG_REGIONS 기준)
    const VALID_REGIONS = new Set<string>(ORG_REGIONS)

    let updated = 0
    let skipped = 0
    let failed = 0

    for (const org of orgs) {
      // 주소가 있으면 정규화 시도
      if (org.address) {
        const result = normalizeKoreanAddress(org.address)

        if (result.kimaRegion && result.confidence !== 'low') {
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
            continue
          } catch (e) {
            console.error(`[normalize-addresses] org ${org.id} update failed:`, e)
            failed++
            continue
          }
        }
      }

      // 주소 없거나 정규화 실패: 레거시 통합값이면 '기타'로 변경
      if (!VALID_REGIONS.has(org.region ?? '')) {
        try {
          await prisma.organization.update({
            where: { id: org.id },
            data: { region: '기타' },
          })
          updated++
        } catch (e) {
          console.error(`[normalize-addresses] org ${org.id} fallback update failed:`, e)
          failed++
        }
        continue
      }

      skipped++
    }

    return NextResponse.json({ updated, skipped, failed, total: orgs.length })
  } catch (e) {
    console.error('[normalize-addresses] unexpected error:', e)
    return NextResponse.json({ error: '처리 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

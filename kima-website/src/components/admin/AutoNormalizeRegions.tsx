'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const VALID_REGIONS = new Set([
  '서울', '경기', '인천',
  '부산경남', '대구경북', '광주전라', '대전충청', '강원제주', '기타',
])

interface Props {
  /** 현재 페이지에 로드된 단체들의 region 값 */
  regions: (string | null)[]
}

/**
 * 레거시 region 값(서울경기인천 등)이 있으면 /api/admin/normalize-addresses 를
 * 자동으로 호출하고 페이지를 새로 고침합니다.
 * 이미 정규화된 경우에는 아무 동작도 하지 않습니다.
 */
export function AutoNormalizeRegions({ regions }: Props) {
  const router = useRouter()

  useEffect(() => {
    const hasLegacy = regions.some((r) => r !== null && !VALID_REGIONS.has(r))
    if (!hasLegacy) return

    fetch('/api/admin/normalize-addresses', { method: 'POST' })
      .then((res) => res.json())
      .then((data) => {
        if (data.updated > 0) router.refresh()
      })
      .catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

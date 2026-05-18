import {
  type Province,
  PROVINCE_ALIASES,
  PROVINCE_TO_KIMA_REGION,
  ALL_PROVINCES,
  KOREA_CITIES,
  AMBIGUOUS_CITY_NAMES,
} from '@/constants/koreaRegions'

export interface NormalizedAddressResult {
  province?: Province
  city?: string
  kimaRegion?: string
  confidence: 'high' | 'medium' | 'low'
}

// Sorted province full-names (longest first to avoid prefix collision)
const SORTED_PROVINCES = [...ALL_PROVINCES].sort((a, b) => b.length - a.length)

// Sorted province alias entries (longest first)
const SORTED_ALIASES = Object.entries(PROVINCE_ALIASES).sort(([a], [b]) => b.length - a.length)

// Unambiguous city/alias → {province, canonicalCity} lookup
type CityEntry = { province: Province; canonicalCity: string }
const CITY_LOOKUP = new Map<string, CityEntry>()
for (const entry of KOREA_CITIES) {
  if (!AMBIGUOUS_CITY_NAMES.has(entry.city)) {
    CITY_LOOKUP.set(entry.city, { province: entry.province, canonicalCity: entry.city })
  }
  for (const alias of entry.aliases ?? []) {
    if (!AMBIGUOUS_CITY_NAMES.has(alias)) {
      CITY_LOOKUP.set(alias, { province: entry.province, canonicalCity: entry.city })
    }
  }
}
// Sorted by key length descending so longer names match first
const SORTED_CITIES = [...CITY_LOOKUP.entries()].sort(([a], [b]) => b.length - a.length)

/**
 * 한국 주소 문자열에서 시도·KIMA 지역을 추출합니다.
 *
 * confidence:
 *   'high'   — 주소 앞부분에서 시도명(전체/약칭)을 확인한 경우
 *   'medium' — 고유 시·군 이름으로 시도를 추론한 경우
 *   'low'    — 시도를 판별할 수 없는 경우
 */
export function normalizeKoreanAddress(raw: string): NormalizedAddressResult {
  if (!raw?.trim()) return { confidence: 'low' }
  const addr = raw.trim()

  // ── Step 1: 주소 앞부분 시도명 감지 (high confidence) ──────────────────
  for (const province of SORTED_PROVINCES) {
    if (addr.startsWith(province)) {
      return {
        province,
        kimaRegion: PROVINCE_TO_KIMA_REGION[province],
        confidence: 'high',
      }
    }
  }

  // Province alias: "서울", "경기", "강원도" 등
  // Only match when followed by whitespace, end of string, or standard suffix
  for (const [alias, province] of SORTED_ALIASES) {
    const after = addr.slice(alias.length)
    if (addr.startsWith(alias) && (after === '' || after[0] === ' ')) {
      return {
        province,
        kimaRegion: PROVINCE_TO_KIMA_REGION[province],
        confidence: 'high',
      }
    }
  }

  // ── Step 2: 고유 시·군 이름 탐색 (medium confidence) ───────────────────
  for (const [key, { province, canonicalCity }] of SORTED_CITIES) {
    if (addr.includes(key)) {
      return {
        province,
        city: canonicalCity,
        kimaRegion: PROVINCE_TO_KIMA_REGION[province],
        confidence: 'medium',
      }
    }
  }

  return { confidence: 'low' }
}

/**
 * 주소에서 KIMA 지역값을 반환합니다.
 * 판별 실패 시 fallback 값(기본값 '기타')을 반환합니다.
 */
export function addressToKimaRegion(address: string | null | undefined, fallback = '기타'): string {
  if (!address) return fallback
  const result = normalizeKoreanAddress(address)
  return result.kimaRegion ?? fallback
}

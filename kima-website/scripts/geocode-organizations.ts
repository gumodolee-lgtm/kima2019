/**
 * DB에 등록된 단체 중 좌표(lat/lng)가 없는 단체를 일괄 geocoding
 * 실행: npx tsx scripts/geocode-organizations.ts
 */

import path from 'path'
import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

config({ path: path.join(process.cwd(), '.env.local') })

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL!, max: 1 })
const prisma = new PrismaClient({ adapter } as any)

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  const key = process.env.KAKAO_REST_API_KEY
  if (!key) throw new Error('KAKAO_REST_API_KEY 환경변수가 없습니다')

  // 건물 층수 등 제거
  const cleaned = address.replace(/,?\s*(B?\d+F|\d+층|\d+호|\d+동).*$/i, '').trim()

  try {
    const url = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(cleaned)}`
    const res = await fetch(url, {
      headers: { Authorization: `KakaoAK ${key}` },
    })
    const data = await res.json() as any
    const doc = data?.documents?.[0]
    if (!doc) return null
    return { lat: parseFloat(doc.y), lng: parseFloat(doc.x) }
  } catch {
    return null
  }
}

async function main() {
  const orgs = await prisma.organization.findMany({
    where: { lat: null, address: { not: null } },
    select: { id: true, name: true, address: true },
  })

  console.log(`📍 좌표 없는 단체: ${orgs.length}개`)

  let success = 0
  let failed = 0

  for (const org of orgs) {
    if (!org.address) { failed++; continue }

    const coords = await geocodeAddress(org.address)
    if (coords) {
      await prisma.organization.update({
        where: { id: org.id },
        data: { lat: coords.lat, lng: coords.lng },
      })
      console.log(`  ✅ ${org.name}: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`)
      success++
    } else {
      console.log(`  ❌ ${org.name}: 좌표 변환 실패 (${org.address?.slice(0, 30)})`)
      failed++
    }

    // API 속도 제한 방지
    await new Promise((r) => setTimeout(r, 200))
  }

  console.log('\n─────────────────────────────────────')
  console.log(`✅ 성공: ${success}개`)
  console.log(`❌ 실패: ${failed}개`)
  console.log('─────────────────────────────────────')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

/**
 * KIMA 정회원 130개 단체를 DB에 일괄 등록하는 스크립트
 * 실행: npx tsx scripts/seed-organizations.ts
 *
 * - isPublic: true (관리자 승인 없이 바로 공개)
 * - 이미 존재하는 단체명은 건너뜀 (중복 방지)
 * - 등록 후 좌표가 없는 단체는 admin 패널에서 '좌표 일괄 설정' 버튼으로 geocoding 필요
 */

import fs from 'fs'
import path from 'path'
import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

// .env.local 로드
config({ path: path.join(process.cwd(), '.env.local') })

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL!, max: 1 })
const prisma = new PrismaClient({ adapter } as any)

interface OrgData {
  name: string
  address?: string
  region: string
  languages: string[]
  targets: string[]
  type?: string
  phone?: string
  email?: string
  description?: string
  isPublic: boolean
}

async function main() {
  const jsonPath = path.join(process.cwd(), 'public', 'orgs_data.json')
  const raw = fs.readFileSync(jsonPath, 'utf-8')
  const { organizations }: { organizations: OrgData[] } = JSON.parse(raw)

  console.log(`📋 총 ${organizations.length}개 단체 등록 시작...`)

  let created = 0
  let skipped = 0
  let errors = 0

  for (const org of organizations) {
    try {
      const existing = await prisma.organization.findFirst({
        where: { name: org.name },
      })

      if (existing) {
        console.log(`  ⏭️  이미 존재: ${org.name}`)
        skipped++
        continue
      }

      await prisma.organization.create({
        data: {
          name: org.name,
          address: org.address ?? null,
          region: org.region,
          languages: org.languages,
          targets: org.targets,
          type: org.type ?? null,
          phone: org.phone ?? null,
          email: org.email ?? null,
          description: org.description ?? null,
          isPublic: org.isPublic,
        },
      })

      console.log(`  ✅ 등록: ${org.name} (${org.region})`)
      created++
    } catch (err) {
      console.error(`  ❌ 오류: ${org.name}`, err)
      errors++
    }
  }

  console.log('\n─────────────────────────────────────')
  console.log(`✅ 등록 완료: ${created}개`)
  console.log(`⏭️  이미 존재: ${skipped}개`)
  console.log(`❌ 오류: ${errors}개`)
  console.log('─────────────────────────────────────')
  console.log('📍 다음 단계: 관리자 패널 → "좌표 없는 단체 일괄 설정" 버튼 클릭')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

import { PrismaClient, CategoryType } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const CATEGORIES: Array<{ type: CategoryType; name: string; slug: string; order: number }> = [
  // 지역별
  { type: 'REGION', name: '서울경기인천', slug: 'seoul', order: 1 },
  { type: 'REGION', name: '부산경남', slug: 'busan', order: 2 },
  { type: 'REGION', name: '대구경북', slug: 'daegu', order: 3 },
  { type: 'REGION', name: '광주전라', slug: 'gwangju', order: 4 },
  { type: 'REGION', name: '대전충청', slug: 'daejeon', order: 5 },
  { type: 'REGION', name: '강원제주', slug: 'gangwon', order: 6 },
  // 언어권별
  { type: 'LANGUAGE', name: '베트남', slug: 'vietnam', order: 1 },
  { type: 'LANGUAGE', name: '네팔', slug: 'nepal', order: 2 },
  { type: 'LANGUAGE', name: '몽골', slug: 'mongolia', order: 3 },
  { type: 'LANGUAGE', name: '인도네시아', slug: 'indonesia', order: 4 },
  { type: 'LANGUAGE', name: '필리핀', slug: 'philippines', order: 5 },
  { type: 'LANGUAGE', name: '러시아', slug: 'russia', order: 6 },
  { type: 'LANGUAGE', name: '중국', slug: 'china', order: 7 },
  { type: 'LANGUAGE', name: '태국', slug: 'thailand', order: 8 },
  { type: 'LANGUAGE', name: '기타', slug: 'others', order: 9 },
  // 사역대상별
  { type: 'TARGET', name: '이주노동자', slug: 'worker', order: 1 },
  { type: 'TARGET', name: '유학생', slug: 'student', order: 2 },
  { type: 'TARGET', name: '결혼이민자', slug: 'marriage', order: 3 },
  { type: 'TARGET', name: '다문화자녀', slug: 'children', order: 4 },
  { type: 'TARGET', name: '난민미등록', slug: 'refugee', order: 5 },
  { type: 'TARGET', name: '귀국이주민', slug: 'returnee', order: 6 },
]

async function main() {
  console.log('Seeding categories...')

  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, type: cat.type, order: cat.order },
      create: cat,
    })
  }

  console.log(`Seeded ${CATEGORIES.length} categories.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

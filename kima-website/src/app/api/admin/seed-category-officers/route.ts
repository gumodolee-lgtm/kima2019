import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// KIMA 4기 조직도 (2026.5.7) 기준 카테고리별 담당 위원장 데이터
const OFFICERS: Array<{ slug: string; name: string; phone: string; title: string }> = [
  // 지역별
  { slug: 'seoul', name: '홍광표', phone: '010-5460-2930', title: '사무총장 (새생명태국인교회)' },
  { slug: 'busan', name: '손승호', phone: '010-4426-6221', title: '울산·경남세계선교협의회 사무총장' },
  { slug: 'gwangju', name: '김창식', phone: '010-4680-7767', title: '호남지역위원장 (하나되는교회)' },
  { slug: 'daejeon', name: '권정현', phone: '010-2102-9855', title: '충청지역위원장 (싼티팝코리아태국인교회)' },
  { slug: 'gangwon', name: '노인국', phone: '010-3230-1322', title: '강원지역위원장 (영월서머나교회)' },
  // 언어권별
  { slug: 'vietnam', name: '안정호', phone: '010-2779-0436', title: '공동대표 (송우벗사랑베트남교회)' },
  { slug: 'nepal', name: '유병설', phone: '010-9002-0033', title: '네팔위원장 (광탄열방교회)' },
  { slug: 'mongolia', name: '이해동', phone: '010-5630-9264', title: '몽골위원장 (다하나국제교회)' },
  { slug: 'indonesia', name: '렌디', phone: '010-9184-9033', title: '인도네시아위원장 (AIC수원지부)' },
  { slug: 'philippines', name: '최경식', phone: '010-8893-3859', title: '필리핀위원장' },
  { slug: 'russia', name: '한예승', phone: '010-5068-5778', title: '러시아권위원장 (인천하늘영광교회)' },
  { slug: 'china', name: '강철민', phone: '010-2728-6069', title: '중국위원장 (KMAC상임총무)' },
  { slug: 'thailand', name: '윤윤경', phone: '010-9375-0282', title: '태국위원장 (인천태국인교회)' },
  // 사역대상별
  { slug: 'student', name: '정재훈', phone: '010-2760-2067', title: '유학생위원장 (영락교회)' },
]

export async function POST() {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
    }

    let updated = 0
    for (const officer of OFFICERS) {
      const result = await prisma.category.updateMany({
        where: { slug: officer.slug },
        data: {
          officerName: officer.name,
          officerPhone: officer.phone,
          officerSns: officer.title,
        },
      })
      updated += result.count
    }

    return NextResponse.json({ ok: true, updated })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: '시드 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import path from 'path'
import fs from 'fs'

// Province → KIMA region label
const PROVINCE_TO_REGION: Record<string, string> = {
  서울: '서울',
  경기: '경기',
  인천: '인천',
  부산: '부산경남',
  경남: '부산경남',
  대구: '대구경북',
  경북: '대구경북',
  광주: '광주전라',
  전남: '광주전라',
  전북: '광주전라',
  대전: '대전충청',
  충남: '대전충청',
  충북: '대전충청',
  세종: '대전충청',
  강원: '강원제주',
  제주: '강원제주',
  울산: '부산경남',
}

// Province → center lat/lng (with slight random jitter applied per-record at runtime)
const PROVINCE_LATLON: Record<string, [number, number]> = {
  서울: [37.5665, 126.978],
  경기: [37.4138, 127.5183],
  인천: [37.4563, 126.7052],
  부산: [35.1796, 129.0756],
  경남: [35.4606, 128.2132],
  대구: [35.8714, 128.6014],
  경북: [36.4919, 128.8889],
  광주: [35.1595, 126.8526],
  전남: [34.8679, 126.991],
  전북: [35.7175, 127.153],
  대전: [36.3504, 127.3845],
  충남: [36.5184, 126.8],
  충북: [36.6357, 127.4914],
  세종: [36.48, 127.289],
  강원: [37.8228, 128.1555],
  제주: [33.4996, 126.5312],
  울산: [35.5384, 129.3114],
}

// 사역구분 keywords → targets array
function parseTargets(raw: string): string[] {
  const val = (raw ?? '').toLowerCase()
  const result: string[] = []
  if (val.includes('노동자') || val.includes('이주노동')) result.push('이주노동자')
  if (val.includes('유학생')) result.push('유학생')
  if (val.includes('이주 가정') || val.includes('결혼') || val.includes('다문화가정')) result.push('결혼이민자')
  if (val.includes('자녀') || val.includes('다음세대') || val.includes('2세')) result.push('다문화자녀')
  if (val.includes('난민') || val.includes('미등록')) result.push('난민미등록')
  if (val.includes('귀국') || val.includes('탈북') || val.includes('동포')) result.push('귀국이주민')
  return result.length > 0 ? result : ['이주노동자']
}

// 사역대상국가 → languages array
function parseLanguages(raw: string): string[] {
  const val = (raw ?? '').toLowerCase()
  const result: string[] = []
  if (val.includes('베트남')) result.push('베트남')
  if (val.includes('네팔')) result.push('네팔')
  if (val.includes('몽골')) result.push('몽골')
  if (val.includes('인도네시아')) result.push('인도네시아')
  if (val.includes('필리핀')) result.push('필리핀')
  if (val.includes('러시아') || val.includes('중앙아')) result.push('러시아')
  if (val.includes('중국') || val.includes('대만') || val.includes('화교')) result.push('중국')
  if (val.includes('태국')) result.push('태국')
  if (val.includes('스리랑카') || val.includes('캄보디아') || val.includes('미얀마') ||
      val.includes('아랍') || val.includes('무슬림') || val.includes('파키스탄') ||
      val.includes('우즈벡') || val.includes('방글라') || val.includes('다국적') ||
      val.includes('다문화') || val.includes('한국') || val.includes('국내') ||
      val.includes('미정') || val.includes('아프') || val.includes('사우디')) {
    result.push('기타')
  }
  return result.length > 0 ? result : ['기타']
}

function extractProvince(address: string): string | null {
  const m = address.trim().match(
    /^(서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)/
  )
  return m ? m[1] : null
}

function jitter(base: number, range: number): number {
  return base + (Math.random() - 0.5) * 2 * range
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
  }

  try {
    // JSON 변환 파일에서 로드 (Excel 파일은 gitignore 대상)
    const filePath = path.join(process.cwd(), 'public', 'orgs_data.json')
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'orgs_data.json 파일을 찾을 수 없습니다. Excel을 JSON으로 변환 후 public/orgs_data.json에 저장하세요.' }, { status: 404 })
    }

    interface OrgRow { name: string; address?: string; email?: string; phone?: string; nationRaw?: string; missionRaw?: string }
    const dataRows: OrgRow[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

    let created = 0
    let skipped = 0

    for (const row of dataRows) {
      const name = String(row.name ?? '').trim()
      const address = String(row.address ?? '').trim()
      const email = String(row.email ?? '').trim()
      const phone = String(row.phone ?? '').trim()
      const nationRaw = String(row.nationRaw ?? '').trim()
      const missionRaw = String(row.missionRaw ?? '').trim()

      if (!name) { skipped++; continue }

      const province = extractProvince(address)
      const region = province ? (PROVINCE_TO_REGION[province] ?? '기타') : '기타'
      const languages = parseLanguages(nationRaw)
      const targets = parseTargets(missionRaw)

      let lat: number | null = null
      let lng: number | null = null
      if (province && PROVINCE_LATLON[province]) {
        const [baseLat, baseLng] = PROVINCE_LATLON[province]
        lat = jitter(baseLat, 0.15)
        lng = jitter(baseLng, 0.25)
      }

      // Upsert by name to avoid duplicates on re-run
      const existing = await prisma.organization.findFirst({ where: { name } })
      if (existing) { skipped++; continue }

      await prisma.organization.create({
        data: {
          name,
          region,
          languages,
          targets,
          address: address || null,
          email: email.includes('@') ? email : null,
          phone: phone || null,
          lat,
          lng,
          isPublic: true,
        },
      })
      created++
    }

    return NextResponse.json({ ok: true, created, skipped, total: dataRows.length })
  } catch (err) {
    console.error('[seed-members]', err)
    return NextResponse.json({ error: '처리 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[()（）[\]【】]/g, '')
    .replace(/교회$/, '')
    .replace(/church$/, '')
}

export async function GET() {
  const session = await auth()
  const role = session?.user?.role
  if (role !== 'ADMIN' && role !== 'OFFICER') {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
  }

  const orgs = await prisma.organization.findMany({
    select: {
      id: true,
      name: true,
      nameEn: true,
      region: true,
      type: true,
      address: true,
      phone: true,
      email: true,
      website: true,
      isPublic: true,
      gmfsnsId: true,
      source: true,
      createdAt: true,
    },
    orderBy: { name: 'asc' },
  })

  type OrgRow = (typeof orgs)[number]
  const groups: Array<{ reason: string; key: string; orgs: OrgRow[] }> = []
  const coveredIds = new Set<string>()

  const addGroup = (reason: string, key: string, group: OrgRow[]) => {
    const ids = group.map((o) => o.id)
    groups.push({ reason, key, orgs: group })
    ids.forEach((id) => coveredIds.add(id))
  }

  // 1. 이름 중복
  const byName = new Map<string, OrgRow[]>()
  for (const org of orgs) {
    const key = normalizeName(org.name)
    if (!byName.has(key)) byName.set(key, [])
    byName.get(key)!.push(org)
  }
  for (const [key, group] of byName) {
    if (group.length >= 2) addGroup('단체명 중복', group[0].name, group)
  }

  // 2. 전화번호 중복
  const byPhone = new Map<string, OrgRow[]>()
  for (const org of orgs) {
    if (!org.phone) continue
    const key = org.phone.replace(/[\s\-().]/g, '')
    if (key.length < 5) continue
    if (!byPhone.has(key)) byPhone.set(key, [])
    byPhone.get(key)!.push(org)
  }
  for (const [key, group] of byPhone) {
    if (group.length < 2) continue
    const ids = group.map((o) => o.id)
    if (ids.every((id) => coveredIds.has(id))) continue
    addGroup('전화번호 중복', key, group)
  }

  // 3. 이메일 중복
  const byEmail = new Map<string, OrgRow[]>()
  for (const org of orgs) {
    if (!org.email) continue
    const key = org.email.toLowerCase().trim()
    if (!byEmail.has(key)) byEmail.set(key, [])
    byEmail.get(key)!.push(org)
  }
  for (const [key, group] of byEmail) {
    if (group.length < 2) continue
    const ids = group.map((o) => o.id)
    if (ids.every((id) => coveredIds.has(id))) continue
    addGroup('이메일 중복', key, group)
  }

  const totalDuplicateOrgs = new Set(groups.flatMap((g) => g.orgs.map((o) => o.id))).size

  return NextResponse.json({ groups, totalDuplicateOrgs })
}

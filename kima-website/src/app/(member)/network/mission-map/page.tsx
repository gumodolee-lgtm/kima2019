import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'
import { MissionMapClient } from './MissionMapClient'
import type { GmfsnsOrg } from './MissionMapClient'
import orgsData from '@/data/gmfsns_orgs.json'

export const metadata: Metadata = {
  title: '유형별 단체 현황 | KIMA',
  description: '전국 이주민 선교 단체 현황',
}

// Supabase 편집 오버라이드를 JSON 데이터에 병합
async function getOrgsWithOverrides(): Promise<GmfsnsOrg[]> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
    const { data: edits } = await supabase
      .from('gmfsns_org_edits')
      .select('org_id, type, targets, languages, address, phone, email, website, image_url, intro_lines, contact_items')

    const base = (orgsData as any[]).map((o: any) => ({
      ...o,
      key: `json-${o.id}`,
      source: 'json' as const,
    }))

    if (!edits || edits.length === 0) return base

    const editMap = new Map(edits.map((e: any) => [e.org_id, e]))

    return base.map((org: any) => {
      const edit = editMap.get(org.id)
      if (!edit) return org
      return {
        ...org,
        type:         edit.type          ?? org.type,
        targets:      edit.targets?.length     ? edit.targets      : org.targets,
        languages:    edit.languages?.length   ? edit.languages    : org.languages,
        address:      edit.address       ?? org.address,
        phone:        edit.phone         ?? org.phone,
        email:        edit.email         ?? org.email,
        website:      edit.website       ?? org.website,
        image:        edit.image_url     ?? org.image,
        introLines:   edit.intro_lines?.length ? edit.intro_lines  : org.introLines,
        contactItems: edit.contact_items?.length ? edit.contact_items : org.contactItems,
      }
    })
  } catch {
    return (orgsData as any[]).map((o: any) => ({
      ...o,
      key: `json-${o.id}`,
      source: 'json' as const,
    }))
  }
}

// Prisma DB에서 승인된 단체를 가져와 GmfsnsOrg 형태로 변환
async function getDbOrgs(): Promise<GmfsnsOrg[]> {
  try {
    const orgs = await prisma.organization.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: 'desc' },
    })
    return orgs.map((o) => ({
      key: `db-${o.id}`,
      id: o.id,
      source: 'db' as const,
      name: o.name,
      type: o.type || '기타',
      languages: o.languages,
      targets: o.targets,
      address: o.address,
      phone: o.phone,
      email: o.email,
      website: o.website,
      description: o.description,
      introLines: undefined,
      contactItems: undefined,
      image: null,
      date: null,
      lat: o.lat,
      lng: o.lng,
    }))
  } catch {
    return []
  }
}

export default async function MissionMapPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/auth/login?callbackUrl=/network/mission-map')
  }

  const [jsonOrgs, dbOrgs] = await Promise.all([
    getOrgsWithOverrides(),
    getDbOrgs(),
  ])

  // JSON 데이터 우선: 같은 이름의 DB 단체는 중복 제외
  const jsonNames = new Set(jsonOrgs.map((o) => o.name))
  const newDbOrgs = dbOrgs.filter((o) => !jsonNames.has(o.name))

  const allOrgs = [...jsonOrgs, ...newDbOrgs]
  return <MissionMapClient orgs={allOrgs} />
}

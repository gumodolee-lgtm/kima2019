import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { MissionMapClient } from './MissionMapClient'
import orgsData from '@/data/gmfsns_orgs.json'

export const metadata: Metadata = {
  title: '이주민 단체 지도 | KIMA',
  description: '전국 이주민 선교 단체 현황',
}

// Supabase 편집 오버라이드를 JSON 데이터에 병합
async function getOrgsWithOverrides() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
    const { data: edits } = await supabase
      .from('gmfsns_org_edits')
      .select('org_id, type, targets, languages, address, phone, email, website, image_url, intro_lines, contact_items')

    if (!edits || edits.length === 0) return orgsData as any[]

    const editMap = new Map(edits.map((e: any) => [e.org_id, e]))

    return (orgsData as any[]).map((org) => {
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
    // Supabase 연결 실패 시 기본 JSON 반환
    return orgsData as any[]
  }
}

export default async function MissionMapPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/auth/login?callbackUrl=/network/mission-map')
  }

  const orgs = await getOrgsWithOverrides()
  return <MissionMapClient orgs={orgs} />
}

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { MissionMapClient } from './MissionMapClient'
import type { GmfsnsOrg } from './MissionMapClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '유형별 단체 현황 | KIMA',
  description: '전국 이주민 선교 단체 현황',
}

async function getAllOrgs(): Promise<GmfsnsOrg[]> {
  const orgs = await prisma.organization.findMany({
    where: { isPublic: true },
    orderBy: { createdAt: 'asc' },
  })

  return orgs.map((o) => ({
    key: o.id,
    id: o.gmfsnsId ?? o.id,
    source: (o.source === 'gmfsns' ? 'json' : 'db') as 'json' | 'db',
    prismaId: o.id,
    name: o.name,
    type: o.type ?? '기타',
    languages: o.languages,
    targets: o.targets,
    address: o.address,
    phone: o.phone,
    email: o.email,
    website: o.website,
    description: o.description,
    introLines: o.introLines,
    contactItems: o.contactItems,
    image: o.image,
    date: null,
    lat: o.lat,
    lng: o.lng,
  }))
}

export default async function MissionMapPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/auth/login?callbackUrl=/network/mission-map')
  }

  const orgs = await getAllOrgs()
  return <MissionMapClient orgs={orgs} />
}

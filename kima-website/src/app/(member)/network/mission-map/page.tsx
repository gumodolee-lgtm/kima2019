import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { MissionMapClient } from './MissionMapClient'
import orgsData from '@/data/gmfsns_orgs.json'

export const metadata: Metadata = {
  title: '이주민 단체 지도 | KIMA',
  description: '전국 이주민 선교 단체 현황',
}

export default async function MissionMapPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/auth/login?callbackUrl=/network/mission-map')
  }

  return <MissionMapClient orgs={orgsData as any} />
}

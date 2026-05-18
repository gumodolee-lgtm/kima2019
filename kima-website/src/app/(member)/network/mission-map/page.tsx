import type { Metadata } from 'next'
import { MissionMapClient } from './MissionMapClient'
import orgsData from '@/data/gmfsns_orgs.json'

export const metadata: Metadata = {
  title: '이주민 단체 지도 | KIMA',
  description: '전국 이주민 선교 단체 지도 — GMFSNS 데이터 기반',
}

export default function MissionMapPage() {
  return <MissionMapClient orgs={orgsData} />
}

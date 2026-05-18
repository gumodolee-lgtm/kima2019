import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import orgsData from '@/data/gmfsns_orgs.json'
import { OrgEditClient } from '../OrgEditClient'

const orgs = orgsData as any[]

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const org = orgs.find((o) => String(o.id) === id)
  return { title: org ? `${org.name} 정보 수정 | KIMA` : '단체 정보 수정 | KIMA' }
}

export default async function OrgEditPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) {
    redirect('/auth/login?callbackUrl=/network/mission-map')
  }

  const { id } = await params
  const org = orgs.find((o) => String(o.id) === id)
  if (!org) notFound()

  // Fetch saved overrides from Supabase (graceful fallback if table not yet created)
  let override: Record<string, any> | null = null
  try {
    const res = await fetch(
      `${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/api/member/gmfsns-orgs/${id}`,
      { cache: 'no-store', headers: { cookie: '' } },
    )
    if (res.ok) {
      const json = await res.json()
      override = json.data
    }
  } catch { /* ignore */ }

  const initial = {
    type: override?.type ?? org.type ?? '',
    targets: override?.targets ?? org.targets ?? [],
    languages: override?.languages ?? org.languages ?? [],
    address: override?.address ?? org.address ?? '',
    phone: override?.phone ?? org.phone ?? '',
    email: override?.email ?? org.email ?? '',
    website: override?.website ?? org.website ?? '',
    introLines: override?.intro_lines ?? org.introLines ?? [],
    contactItems: override?.contact_items ?? org.contactItems ?? [],
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-100 px-4 py-3">
        <div className="max-w-3xl mx-auto text-xs text-gray-400 flex items-center gap-1.5 flex-wrap">
          <Link href="/network/mission-map" className="hover:text-[#1B3A6B]">이주민 단체 지도</Link>
          <span>/</span>
          <Link href={`/network/mission-map/${id}`} className="hover:text-[#1B3A6B] truncate max-w-[200px]">{org.name}</Link>
          <span>/</span>
          <span className="text-gray-600 font-medium">정보 수정</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-lg font-bold text-gray-900">{org.name}</h1>
          <p className="text-sm text-gray-500 mt-1">단체 정보를 수정하고 저장해주세요. 수정한 내용은 즉시 반영됩니다.</p>
        </div>

        <OrgEditClient orgId={org.id} initial={initial} />
      </div>
    </div>
  )
}
